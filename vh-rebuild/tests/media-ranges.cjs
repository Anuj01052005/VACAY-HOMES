const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('functions/assets/films/[file].ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const sandbox={exports:{},Request,Response,Headers,crypto:require('node:crypto').webcrypto};
vm.runInNewContext(code,sandbox);
const bytes=Uint8Array.from({length:32},(_,i)=>i);
async function serve(headers={},method='GET',file='tour-smooth-720.mp4'){
  return sandbox.exports.onRequest({request:new Request(`https://example.com/assets/films/${file}`,{headers,method}),params:{file},next:async()=>new Response('pass'),env:{ASSETS:{fetch:async request=>{
    assert.equal(request.headers.get('Range'),null);
    assert.equal(request.headers.get('If-None-Match'),null);
    return new Response(bytes,{headers:{'Content-Type':'video/mp4','Content-Length':'32','ETag':'W/"old"','Last-Modified':'Tue, 27 Oct 2026 00:00:00 GMT'}});
  }}}});
}
(async()=>{
  const first=await serve({Range:'bytes=0-1'});
  assert.equal(first.status,206);assert.equal(first.headers.get('Content-Range'),'bytes 0-1/32');
  assert.equal(first.headers.get('Content-Length'),'2');assert.deepEqual([...new Uint8Array(await first.arrayBuffer())],[0,1]);
  const etag=first.headers.get('ETag');assert.ok(/^"[a-f0-9]{64}"$/.test(etag));
  for(const [range,content] of [['bytes=30-','30-31'],['bytes=-2','30-31'],['bytes=28-999','28-31']]){
    const r=await serve({Range:range});assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),`bytes ${content}/32`);
  }
  for(const range of ['bytes=32-','bytes=7-4','bytes=-0','bytes=999999999999999999999-'])assert.equal((await serve({Range:range})).status,416);
  assert.equal((await serve({Range:'bytes=0-1','If-Range':etag})).status,206);
  assert.equal((await serve({Range:'bytes=0-1','If-Range':'"different"'})).status,200);
  assert.equal((await serve({'If-None-Match':etag})).status,304);
  for(const range of ['bytes=0-1,4-5','invalid','bytes=-'])assert.equal((await serve({Range:range})).status,200);
  const head=await serve({Range:'bytes=0-1'},'HEAD');assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
  assert.equal((await serve({},'POST')).status,405);
  assert.equal(await (await serve({},'GET','poster.jpg')).text(),'pass');
  const full=await serve();assert.equal(full.status,200);assert.equal(full.headers.get('Accept-Ranges'),'bytes');assert.equal(full.headers.get('X-Content-Type-Options'),'nosniff');
  console.log('Media ranges passed: prefix, suffix, open-ended, bounds, validators, HEAD and non-video pass-through.');
})().catch(e=>{console.error(e);process.exitCode=1;});
