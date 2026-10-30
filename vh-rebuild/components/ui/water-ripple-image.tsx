'use client';
// Adapted from rahil1202's 21st WaterRippleImage supplied by the user.
// Correct cover mapping, full-image ripple, static fallback and complete cleanup.
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export type WaterRippleImageProps = {src:string;alt:string;className?:string;paused?:boolean;speed?:number;scale?:number;illumination?:number;surfaceDistortion?:number;waterDistortion?:number};
const VERT=`attribute vec2 a_position; varying vec2 vUv; void main(){vUv=.5*(a_position+1.);gl_Position=vec4(a_position,0.,1.);}`;
const FRAG=`precision mediump float;
varying vec2 vUv;
uniform sampler2D u_image;
uniform float u_time,u_ratio,u_img_ratio,u_scale,u_light,u_surface,u_water;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
 const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
 vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
 vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
 vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
 vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
 vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
 vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
 m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
 vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);
}
float surfaceNoise(vec2 uv,float t,float scale){
 vec2 n=vec2(.1),N=vec2(.1);mat2 m=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));
 for(int j=0;j<10;j++){uv*=m;n*=m;vec2 q=uv*scale+float(j)+n+(.5+.5*float(j))*(mod(float(j),2.)-1.)*t;n+=sin(q);N+=cos(q)/scale;scale*=1.2;}return N.x+N.y+.1;
}
void main(){
 vec2 uv=vec2(vUv.x,1.-vUv.y);uv.x*=u_ratio;
 float noise=snoise((.3+.1*sin(u_time))*uv+vec2(0.,.2*u_time));
 float surf=surfaceNoise(2.*uv+noise*.2,u_time,u_scale);
 surf*=pow(max(uv.y,0.001),.3);surf*=surf;
 vec2 cover=vec2(1.);
 if(u_ratio>u_img_ratio){cover.y=u_img_ratio/u_ratio;}else{cover.x=u_ratio/u_img_ratio;}
 vec2 imgUV=(vec2(vUv.x,1.-vUv.y)-.5)*cover+.5;
 // Apply the original flowing distortion throughout the photo. Cover-space
 // scaling keeps its visible strength consistent on portrait phone screens.
 vec2 offset=vec2(u_water*noise+u_surface*surf)*cover;
 vec4 color=texture2D(u_image,clamp(imgUV+offset,0.001,.999));
 color.rgb*=1.+u_light*surf;
 // Restore the pale reflected-light edge from the 21st shader.
 // This follows the moving ripple crests, rather than outlining the photo.
 color.rgb+=u_light*vec3(.92,.97,1.)*surf;
 gl_FragColor=color;
}`;

export function WaterRippleImage({src,alt,className='',paused=false,speed=.45,scale=7,illumination=.04,surfaceDistortion=.018,waterDistortion=.012}:WaterRippleImageProps){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const pausedRef=useRef(paused);pausedRef.current=paused;
 const reduced=useReducedMotion();const [ready,setReady]=useState(false);const [contextVersion,setContextVersion]=useState(0);
 useEffect(()=>{
  setReady(false);if(reduced)return;
  const canvas=canvasRef.current!;const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
  let disposed=false,loaded=false,inView=true,lost=false,time=0,lastDraw=0;
  const shaders:WebGLShader[]=[];let program:WebGLProgram|null=null;let buffer:WebGLBuffer|null=null;let texture:WebGLTexture|null=null;
  const uniforms:Record<string,WebGLUniformLocation|null>={};
  try{
   const compile=(source:string,type:number)=>{const shader=gl.createShader(type)!;shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return shader;};
   program=gl.createProgram()!;gl.attachShader(program,compile(VERT,gl.VERTEX_SHADER));gl.attachShader(program,compile(FRAG,gl.FRAGMENT_SHADER));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed');gl.useProgram(program);
   for(const key of ['image','time','ratio','img_ratio','scale','light','surface','water'])uniforms[key]=gl.getUniformLocation(program,'u_'+key);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
   gl.uniform1f(uniforms.scale,scale);gl.uniform1f(uniforms.light,illumination);gl.uniform1f(uniforms.surface,surfaceDistortion);gl.uniform1f(uniforms.water,waterDistortion);
  }catch{shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);return;}
  const draw=()=>{if(!loaded||lost)return;gl.uniform1f(uniforms.time,time);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
  const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<768?1.25:1.5);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(uniforms.ratio,canvas.width/canvas.height);draw();};
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const visibility=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;});visibility.observe(canvas);
  const img=new Image();img.onload=()=>{if(disposed||lost)return;try{texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1i(uniforms.image,0);gl.uniform1f(uniforms.img_ratio,img.naturalWidth/img.naturalHeight);loaded=true;resize();setReady(true);}catch{setReady(false);}};img.src=src;
  const tick=(now:number,delta:number)=>{if(document.hidden||pausedRef.current||!inView||!loaded||lost)return;time+=Math.min(delta,64)*.002*speed;if(now-lastDraw<1/30)return;lastDraw=now;draw();};gsap.ticker.add(tick);
  const onLost=(event:Event)=>{event.preventDefault();lost=true;setReady(false);};
  const onRestored=()=>{if(!disposed)setContextVersion(value=>value+1);};
  canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
  return()=>{disposed=true;img.onload=null;observer.disconnect();visibility.disconnect();gsap.ticker.remove(tick);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);};
 },[src,reduced,speed,scale,illumination,surfaceDistortion,waterDistortion,contextVersion]);
 return <div className={`ripple-image ${className}`}><img src={src} alt={alt} fetchPriority="high"/><canvas ref={canvasRef} aria-hidden="true" className={ready?'is-ready':''}/></div>;
}
export default WaterRippleImage;

