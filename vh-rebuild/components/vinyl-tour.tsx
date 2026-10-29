import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { content } from '@/content';
import { GlassLink } from './ui/glass-action';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

type Phase = 'idle' | 'loading' | 'playing' | 'closing';

export function VinylTour() {
  const root=useRef<HTMLElement>(null);
  const scene=useRef<SVGSVGElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const video=useRef<HTMLVideoElement>(null);
  const spin=useRef<gsap.core.Tween|null>(null);
  const sequence=useRef<gsap.core.Timeline|null>(null);
  const playback=useRef<Promise<void>|null>(null);
  const entryTimer=useRef<number|undefined>(undefined);
  const [phase,setPhase]=useState<Phase>('idle');
  const [videoReady,setVideoReady]=useState(false);
  const [playbackError,setPlaybackError]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const reduced=useReducedMotion();
  const id=useId().replaceAll(':','');
  const film=content.fullTour;

  useLayoutEffect(()=>{
    const ctx=gsap.context(()=>{
      gsap.set('.turntable-body',{autoAlpha:0,y:48,scale:.94,transformOrigin:'400px 290px'});
      gsap.set('.tonearm',{autoAlpha:0,rotation:-29,svgOrigin:'595 153'});
      gsap.set('.status-glow',{opacity:0});
      gsap.set('.record-move',{scale:1.35,svgOrigin:'400 260'});
      spin.current=gsap.to('.record-spin',{rotation:360,duration:24,repeat:-1,ease:'none',svgOrigin:'400 260',paused:reduced});
    },root);
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&!document.hidden&&!reduced)spin.current?.resume();
      else spin.current?.pause();
    });
    if(root.current)observer.observe(root.current);
    const visibility=()=>{if(document.hidden)spin.current?.pause();else if(!reduced)spin.current?.resume();};
    document.addEventListener('visibilitychange',visibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.clearTimeout(entryTimer.current);playback.current=null;sequence.current?.kill();ctx.revert();};
  },[reduced]);

  useEffect(()=>{
    if(phase!=='loading'&&phase!=='playing')return;
    const element=video.current;
    if(!element)return;
    let cancelled=false;
    // A decoded first frame is enough; canplaythrough is not reliable for mobile streaming.
    const ready=()=>{if(!cancelled)setVideoReady(true);};
    const failed=()=>{if(!cancelled)setPlaybackError(true);};
    element.addEventListener('loadeddata',ready);
    element.addEventListener('canplay',ready);
    element.addEventListener('error',failed);
    element.preload='auto';
    if(element.networkState===HTMLMediaElement.NETWORK_EMPTY)element.load();
    if(element.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA)ready();
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')reset();};
    let resumeOnReturn=false;
    const visibility=()=>{
      if(document.hidden){resumeOnReturn=!element.paused;element.pause();}
      else if(resumeOnReturn)void element.play().catch(()=>{});
    };
    document.addEventListener('keydown',escape);
    document.addEventListener('visibilitychange',visibility);
    return()=>{cancelled=true;element.pause();element.removeEventListener('loadeddata',ready);element.removeEventListener('canplay',ready);element.removeEventListener('error',failed);document.removeEventListener('keydown',escape);document.removeEventListener('visibilitychange',visibility);};
  },[phase==='loading'||phase==='playing']);

  useEffect(()=>{
    if(phase==='playing'&&videoReady){
      const element=video.current;
      if(!element)return;
      let cancelled=false;
      let fade:gsap.core.Timeline|undefined;
      let timeout:number|undefined;
      let revealed=false;
      const reveal=()=>{
        if(cancelled||revealed)return;
        revealed=true;window.clearTimeout(timeout);
        // Crossfade only after play succeeds. Hidden-video frame callbacks can stall indefinitely.
        fade=gsap.timeline({defaults:{ease:'power1.inOut'}})
          .to(root.current?.querySelector('.vinyl-player')??null,{opacity:1,duration:reduced?.15:1.2},0)
          .to(scene.current,{opacity:0,duration:reduced?.15:1.2},0);
        element.focus({preventScroll:true});
      };
      const showFromStart=()=>{
        if(cancelled)return;
        if(element.currentTime>.25){
          element.addEventListener('seeked',reveal,{once:true});
          element.currentTime=0;
          timeout=window.setTimeout(()=>{if(!cancelled&&!element.paused)reveal();},1500);
        }else reveal();
      };
      void (playback.current??element.play()).then(()=>{
        if(cancelled)return;
        showFromStart();
      }).catch(()=>{if(!cancelled)setPlaybackError(true);});
      return()=>{cancelled=true;fade?.kill();window.clearTimeout(timeout);element.removeEventListener('seeked',reveal);};
    }
  },[phase,videoReady,reduced,attempt]);

  // iPhone WebViews may require play() inside the original tap, not an animation callback.
  const playFromTap=()=>{
    const element=video.current;if(!element)return;
    element.muted=true;element.defaultMuted=true;element.playsInline=true;
    const source=window.matchMedia('(min-width:768px)').matches?film.desktop:film.mobile;
    if(element.getAttribute('src')!==source||element.error){element.src=source;element.load();}
    element.preload='auto';
    const request=element.play();playback.current=request;
    void request.then(()=>{if(playback.current===request){setVideoReady(true);setPlaybackError(false);}})
      .catch(()=>{if(playback.current===request)setPlaybackError(true);});
  };

  const start=()=>{
    if(phase!=='idle')return;
    setVideoReady(false);
    setPlaybackError(false);
    playFromTap();
    setPhase('loading');
    spin.current?.pause();
    const enter=()=>{window.clearTimeout(entryTimer.current);spin.current?.pause();setPhase('playing');};
    if(reduced){enter();return;}
    const q=gsap.utils.selector(root);
    const tl=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:enter});
    sequence.current=tl;
    tl.to(q('.record-move'),{y:-36,scale:1.42,duration:.45},0)
      .to(q('.turntable-body'),{autoAlpha:1,y:0,scale:1,duration:.8},.15)
      .to(q('.record-move'),{x:-90,y:5,scale:1,rotation:0,duration:1.1},.65)
      .to(q('.record-contact-shadow'),{opacity:.65,duration:.4},1.4)
      .to(q('.tonearm'),{autoAlpha:1,duration:.25},1.5)
      .to(q('.tonearm'),{rotation:0,duration:.85,ease:'power2.inOut'},1.65)
      .to(q('.status-glow'),{opacity:1,duration:.35},2.2);
    // A throttled iPhone animation clock must not hold a ready video indefinitely.
    entryTimer.current=window.setTimeout(()=>{if(sequence.current===tl)tl.progress(1);},3500);
  };
  const reset=()=>{
    if(phase==='closing')return;
    window.clearTimeout(entryTimer.current);
    playback.current=null;
    video.current?.pause();spin.current?.pause();
    setPhase('closing');
    const finish=()=>{
      setPhase('idle');
      if(!reduced)spin.current?.resume();
      requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));
    };
    const player=root.current?.querySelector('.vinyl-player');
    if(!player){finish();return;}
    gsap.to(player,{opacity:0,duration:reduced?.15:.35,ease:'power2.out',onComplete:()=>{
      gsap.set(scene.current,{opacity:1,y:0});
      if(reduced||!sequence.current){gsap.set(scene.current,{opacity:1,y:0});finish();return;}
      sequence.current.eventCallback('onReverseComplete',finish).timeScale(1.25).reverse();
    }});
  };

  return <section ref={root} className="vinyl-tour" data-tour-active={phase==='playing'||undefined} aria-labelledby={`${id}-title`}>
    <div className="vinyl-aurora" aria-hidden="true"/>
    <div className="vinyl-intro"><h2 id={`${id}-title`} className="vinyl-title">Your stay.<br/><em>On the record.</em></h2>
      <button className="vinyl-invitation glass silver-trace" onClick={start} disabled={phase!=='idle'}>Click on the record for a tour of your stay<span className="vinyl-invitation-light" aria-hidden="true"/></button>
    </div>
    <div className="vinyl-stage" data-phase={phase}>
      <button ref={trigger} className="vinyl-trigger" onClick={start} disabled={phase!=='idle'} aria-label="Play the Farm villa tour" aria-busy={phase==='loading'}>
        <svg ref={scene} viewBox="0 0 800 560" className="vinyl-art" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a5734d"/><stop offset=".3" stopColor="#70452e"/><stop offset=".6" stopColor="#8c5938"/><stop offset="1" stopColor="#3d261d"/></linearGradient>
            <linearGradient id={`${id}-metal`}><stop stopColor="#746e65"/><stop offset=".3" stopColor="#f0e1c7"/><stop offset=".55" stopColor="#918a7b"/><stop offset=".8" stopColor="#d2c3a9"/><stop offset="1" stopColor="#544c42"/></linearGradient>
            <radialGradient id={`${id}-disc`}><stop stopColor="#24232a"/><stop offset=".35" stopColor="#101116"/><stop offset=".75" stopColor="#191b22"/><stop offset="1" stopColor="#07090e"/></radialGradient>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a5b5da" stopOpacity=".03"/><stop offset=".24" stopColor="#e9e7f5" stopOpacity=".27"/><stop offset=".36" stopColor="#bda1c2" stopOpacity="0"/><stop offset=".71" stopColor="#89a1b5" stopOpacity=".02"/><stop offset=".8" stopColor="#d1c6c3" stopOpacity=".19"/><stop offset="1" stopColor="#b4a7cd" stopOpacity="0"/></linearGradient>
            <radialGradient id={`${id}-label`}><stop stopColor="#bba486"/><stop offset="1" stopColor="#736354"/></radialGradient>
            <pattern id={`${id}-grain`} width="180" height="12" patternUnits="userSpaceOnUse"><path d="M0 2Q50 8 105 2T210 4M-20 9Q40 4 110 10T220 7" fill="none" stroke="#25170f" strokeOpacity=".17" strokeWidth="1"/></pattern>
            <pattern id={`${id}-mesh`} width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#1d1713"/></pattern>
            <path id={`${id}-arc`} d="M309 260a91 91 0 0 1 182 0"/>
            <mask id={`${id}-hole`}><circle cx="400" cy="260" r="148" fill="white"/><circle cx="400" cy="260" r="7" fill="black"/></mask>
          </defs>
          <ellipse className="record-contact-shadow" cx="310" cy="279" rx="151" ry="145" fill="#000" opacity="0"/>
          <g className="turntable-body">
            <rect x="67" y="105" width="666" height="405" rx="29" fill="#000" opacity=".3"/>
            <rect x="60" y="85" width="680" height="405" rx="26" fill={`url(#${id}-wood)`}/>
            <rect x="60" y="85" width="680" height="405" rx="26" fill={`url(#${id}-grain)`}/>
            <rect x="70" y="95" width="660" height="329" rx="18" fill="#110e0c" stroke="#c69868" strokeOpacity=".4"/>
            <path d="M83 105H717" stroke="#fff0d3" strokeOpacity=".14"/>
            <circle cx="310" cy="265" r="157" fill="#08090c" stroke="#9e8d73" strokeWidth="4"/>
            {[139,128,117,106].map(r=><circle key={r} cx="310" cy="265" r={r} fill="none" stroke="#77746a" strokeOpacity=".12"/>)}
            <circle cx="310" cy="265" r="6" fill={`url(#${id}-metal)`}/>
            <rect x="92" y="442" width="160" height="23" rx="6" fill="#49372a"/>
            <rect x="92" y="442" width="160" height="23" rx="6" fill={`url(#${id}-mesh)`}/>
            <rect x="548" y="442" width="160" height="23" rx="6" fill="#49372a"/>
            <rect x="548" y="442" width="160" height="23" rx="6" fill={`url(#${id}-mesh)`}/>
            <circle cx="375" cy="453" r="13" fill={`url(#${id}-metal)`}/><circle cx="425" cy="453" r="13" fill={`url(#${id}-metal)`}/>
            <path d="M375 445v8m50-8v8" stroke="#35281d" strokeWidth="2"/>
            <circle cx="653" cy="365" r="20" fill={`url(#${id}-metal)`}/><circle cx="653" cy="365" r="13" fill="#252320"/>
            <path d="M653 352v8" stroke="#e6d9bb" strokeWidth="2"/>
            <circle cx="555" cy="370" r="3" fill="#686956"/><circle className="status-glow" cx="555" cy="370" r="4" fill="#e3f4d2"/>

          </g>
          <g className="record-move"><g className="record-spin" mask={`url(#${id}-hole)`}>
            <circle cx="400" cy="260" r="148" fill={`url(#${id}-disc)`} stroke="#a3abbf" strokeOpacity=".3"/>
            {Array.from({length:26},(_,i)=><circle key={i} cx="400" cy="260" r={57+i*3.25} fill="none" stroke="#bbc0d1" strokeWidth=".65" strokeOpacity={i%3===0?.17:.07}/>)}
            <circle cx="400" cy="260" r="140" fill="none" stroke="#455268" strokeWidth=".7" strokeOpacity=".35"/>
            <circle cx="400" cy="260" r="48" fill={`url(#${id}-label)`}/>
            <circle cx="400" cy="260" r="146" fill={`url(#${id}-sheen)`}/>

            <circle cx="400" cy="260" r="42" fill="none" stroke="#eee3cf" strokeOpacity=".3"/>
            <circle cx="400" cy="260" r="10" fill="#14151b"/>
          </g></g>
            <g className="tonearm"><circle cx="595" cy="153" r="23" fill="#292825" stroke="#c3b494" strokeWidth="3"/>
              <path d="M595 146v108q0 20-19 27l-145 51" fill="none" stroke="#050505" strokeWidth="15" opacity=".4" transform="translate(4 7)"/>
              <path d="M595 146v108q0 20-19 27l-145 51" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="9" strokeLinecap="round"/>
              <rect x="586" y="124" width="18" height="35" rx="5" fill={`url(#${id}-metal)`}/>
              <path d="m423 323 25-10 9 20-25 11z" fill="#d4c5aa"/><path d="m427 336 6 7" stroke="#1d1b18" strokeWidth="3"/>
            </g>
        </svg>
      </button>
      {<div className="vinyl-player" aria-hidden={phase!=='playing'} inert={phase!=='playing'} data-visible={phase==='playing'&&videoReady||undefined} role="region" aria-label="Farm video tour">
        <div className="vinyl-video-frame"><video ref={video} muted loop playsInline preload="none" poster={film.poster} tabIndex={0} aria-label="Full Farm villa tour"><source src={film.desktop} media="(min-width:768px)" type="video/mp4"/><source src={film.mobile} type="video/mp4"/></video></div>
        <div className="vinyl-player-controls"><button className="vinyl-invitation glass silver-trace" onClick={reset} disabled={phase==='closing'}>Close Tour<span className="vinyl-invitation-light" aria-hidden="true"/></button></div>
      </div>}
    </div>
    <div className="vinyl-signature"><span className="vinyl-stars" aria-label="Five decorative stars">★★★★★</span><div className="vinyl-properties-action"><GlassLink className="vinyl-invitation" href="./?page=properties">Properties<span className="vinyl-invitation-light" aria-hidden="true"/></GlassLink></div><p className="vinyl-tagline">“A little away, a lot together.”</p></div>
    {(phase==='loading'||phase==='playing'&&(!videoReady||playbackError))&&<div className="vinyl-status" role="status">
      <p>{playbackError?'The tour could not start. Please try again.':phase==='loading'?'Setting the needle…':'Preparing your tour…'}</p>
      {playbackError&&<button className="vinyl-invitation glass" onClick={()=>{setPlaybackError(false);playFromTap();setAttempt(value=>value+1);}}>Play tour</button>}
      <button className="vinyl-invitation glass" onClick={reset}>Close Tour</button>
    </div>}
  </section>;
}

