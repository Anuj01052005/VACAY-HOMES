type MediaContext={
  request:Request;
  params:Record<string,string|string[]>;
  env:{ASSETS:{fetch:(request:Request)=>Promise<Response>}};
  next:()=>Promise<Response>;
};

/** Pages static hosting ignores Range. Safari needs real partial MP4 responses. */
export async function onRequest({request,params,env,next}:MediaContext):Promise<Response>{
  if(typeof params.file!=='string'||!/^[\w.-]+\.mp4$/i.test(params.file))return next();
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  const upstreamHeaders=new Headers(request.headers);
  for(const name of ['Range','If-Range','If-None-Match','If-Modified-Since'])upstreamHeaders.delete(name);
  upstreamHeaders.set('Accept-Encoding','identity');
  const asset=await env.ASSETS.fetch(new Request(request.url,{method:'GET',headers:upstreamHeaders}));
  if(asset.status!==200||!asset.headers.get('Content-Type')?.includes('video/mp4'))return asset;
  const body=await asset.arrayBuffer();
  const size=body.byteLength;
  const digest=await crypto.subtle.digest('SHA-256',body);
  const etag=`"${Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('')}"`;
  const headers=new Headers(asset.headers);
  headers.delete('Content-Encoding');headers.delete('Content-Range');
  headers.set('Content-Type','video/mp4');headers.set('Content-Length',String(size));
  headers.set('Accept-Ranges','bytes');headers.set('ETag',etag);
  headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','DENY');
  headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
  if(request.headers.get('If-None-Match')?.split(',').map(value=>value.trim()).some(value=>value===etag||value==='*')){
    headers.delete('Content-Length');return new Response(null,{status:304,headers});
  }
  if(request.method==='HEAD'){headers.delete('Content-Length');return new Response(null,{headers});}
  const range=request.headers.get('Range');
  const validator=request.headers.get('If-Range');
  const lastModified=Date.parse(headers.get('Last-Modified')??'');
  const validatorMatches=!validator||validator===etag||(!validator.startsWith('"')&&!validator.startsWith('W/')&&Number.isFinite(lastModified)&&Date.parse(validator)>=lastModified);
  const match=range&&validatorMatches?/^bytes=(\d*)-(\d*)$/.exec(range):null;
  // Ignoring malformed/multipart ranges is permitted; never send a fake partial response.
  if(!match||!match[1]&&!match[2])return new Response(body,{headers});
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
  if(!size||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start||!match[1]&&Number(match[2])===0){
    headers.set('Content-Range',`bytes */${size}`);headers.set('Content-Length','0');
    return new Response(null,{status:416,headers});
  }
  headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
  headers.set('Content-Length',String(end-start+1));
  return new Response(body.slice(start,end+1),{status:206,headers});
}
