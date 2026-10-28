import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { SilverTrace } from './ui/silver-trace';
gsap.registerPlugin(ScrollTrigger);

export interface PropertyFilm {
  id: string; label: string; mobile: string; desktop: string; poster: string;
}

export function FeatureVideo({film}: {film: PropertyFilm}) {
  const video=useRef<HTMLVideoElement>(null);
  const section=useRef<HTMLElement>(null);
  const entrance=useRef<HTMLDivElement>(null);
  const surface=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  useLayoutEffect(()=>{
    if(reduced)return;
    const context=gsap.context(()=>{
      gsap.fromTo(entrance.current,{x:()=>window.innerWidth<768?-36:-70,autoAlpha:0},{x:0,autoAlpha:1,ease:'none',scrollTrigger:{trigger:section.current,start:'top 94%',end:'top 50%',scrub:.55,invalidateOnRefresh:true}});
      gsap.fromTo(surface.current,{opacity:1},{opacity:0,ease:'none',scrollTrigger:{trigger:section.current,start:'top 125px',end:'bottom 105px',scrub:.4,invalidateOnRefresh:true}});
    },section);
    void document.fonts.ready.then(()=>ScrollTrigger.refresh());
    return()=>context.revert();
  },[reduced]);
  useEffect(()=>{
    const element=video.current;if(!element)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&!reduced)void element.play().catch(()=>{});
      else element.pause();
    },{threshold:.25});
    observer.observe(element);
    return()=>{observer.disconnect();element.pause();};
  },[reduced]);
  return <section ref={section} id={film.id} className="property-film" aria-labelledby={`${film.id}-title`}><div ref={entrance} className="film-reveal"><div ref={surface}>
    <div className="feature-video-heading glass silver-trace"><h3 id={`${film.id}-title`}>{film.label}</h3><span>Farm</span><SilverTrace/></div>
    <video ref={video} muted playsInline loop disablePictureInPicture preload="none" poster={film.poster} aria-label={`${film.label} at VACAY HOMES FARM`}>
      <source src={film.desktop} media="(min-width: 768px)" type="video/mp4"/>
      <source src={film.mobile} type="video/mp4"/>
      Your browser does not support this video.
    </video>
  </div></div></section>;
}

