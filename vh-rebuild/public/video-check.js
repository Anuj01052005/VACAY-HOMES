(() => {
  const video=document.getElementById('video');
  const result=document.getElementById('result');
  const details={play:'Not started',media:'None',range:'Not checked',head:'Not checked'};
  const render=()=>{result.textContent=`Play: ${details.play}\nMedia error: ${details.media}\nRange: ${details.range}\nHEAD: ${details.head}\nReady state: ${video.readyState}\nVideo paused: ${video.paused}`;};
  video.addEventListener('error',()=>{details.media=`${video.error?.code||'unknown'} ${video.error?.message||''}`;render();});
  document.getElementById('start').addEventListener('click',()=>{
    video.muted=true;video.playsInline=true;
    details.play='Starting';render();
    // Keep play() in the tap handler to preserve iPhone user activation.
    try{Promise.resolve(video.play()).then(()=>{details.play='Playing';render();}).catch(e=>{details.play=`${e.name}: ${e.message}`;render();});}
    catch(e){details.play=`${e.name}: ${e.message}`;render();}
    fetch(video.src,{headers:{Range:'bytes=0-1'},cache:'no-store'}).then(r=>{details.range=`${r.status} ${r.headers.get('content-range')||'no Content-Range'}`;render();}).catch(e=>{details.range=`${e.name}: ${e.message}`;render();});
    fetch(video.src,{method:'HEAD',cache:'no-store'}).then(r=>{details.head=`${r.status} length=${r.headers.get('content-length')||'missing'}`;render();}).catch(e=>{details.head=`${e.name}: ${e.message}`;render();});
    setTimeout(()=>{if(details.play==='Starting')details.play='Still waiting';render();},8000);
  });
})();
