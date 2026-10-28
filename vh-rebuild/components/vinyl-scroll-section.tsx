import {useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {VinylTour} from './vinyl-tour';
import {useReducedMotion} from '@/hooks/use-reduced-motion';

gsap.registerPlugin(ScrollTrigger);
export function VinylScrollSection(){
  const root=useRef<HTMLElement>(null);
  const reduced=useReducedMotion();
  useLayoutEffect(()=>{
    if(reduced)return;
    const ctx=gsap.context(()=>{
      gsap.set('.vinyl-signature',{clearProps:'opacity,transform'});
      // One scroll threshold starts the whole timed sequence, even after scrolling stops.
      const signature=gsap.timeline({paused:true,defaults:{ease:'power2.out',duration:.4}})
        .fromTo('.vinyl-stars',{y:-20,opacity:0},{y:0,opacity:1},0)
        .fromTo('.vinyl-properties-action',{y:-20,opacity:0},{y:0,opacity:1},.48)
        .fromTo('.vinyl-tagline',{y:-20,opacity:0},{y:0,opacity:1},.96);
      const tl=gsap.timeline({defaults:{ease:'power2.out'},scrollTrigger:{trigger:root.current,start:'top 75%',end:'clamp(bottom bottom)',scrub:true,invalidateOnRefresh:true,onUpdate:self=>{
        if(self.progress>=1.08/1.38)signature.play();
        else signature.reverse();
      }}});
      // Distinct, non-overlapping scroll intervals; target only the tour invitation.
      tl.fromTo('.vinyl-title',{y:-45,opacity:0},{y:0,opacity:1,duration:.3},0)
        .fromTo('.vinyl-intro > .vinyl-invitation',{y:-35,opacity:0},{y:0,opacity:1,duration:.3},.36)
        .fromTo('.vinyl-trigger',{y:-65,opacity:0},{y:0,opacity:1,duration:.3},.72)
        .to({},{duration:.3},1.08);
    },root);
    void document.fonts.ready.then(()=>ScrollTrigger.refresh());
    return()=>ctx.revert();
  },[reduced]);
  return <section ref={root} id="discover" className="vinyl-scroll-scene"><div className="vinyl-scroll-sticky"><VinylTour/></div></section>;
}
