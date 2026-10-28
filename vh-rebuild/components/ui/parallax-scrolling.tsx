'use client';

import {useLayoutEffect,useRef,type ReactNode} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useReducedMotion} from '@/hooks/use-reduced-motion';

gsap.registerPlugin(ScrollTrigger);

/** Adapted from the user-supplied Osmo/21st Parallax Scrolling component.
 * Only marked content moves; unmarked background artwork remains stationary.
 */
export function ParallaxComponent({children,className='',resetKey=0}:{children:ReactNode;className?:string;resetKey?:string|number}){
 const root=useRef<HTMLDivElement>(null);
 const reduced=useReducedMotion();

 useLayoutEffect(()=>{
  if(reduced)return;
  let active=true;
  const rates:Record<string,number>={'1':.7,'2':.55,'3':.4,'4':.1};
  const context=gsap.context(()=>{
   root.current?.querySelectorAll<HTMLElement>('[data-parallax-layer]').forEach(element=>{
    const travel=()=>Math.min(window.innerHeight*.065,56)*(rates[element.dataset.parallaxLayer||'3']??.4);
    gsap.fromTo(element,{y:travel},{y:()=>-travel(),ease:'none',scrollTrigger:{trigger:element,start:'clamp(top bottom)',end:'clamp(bottom top)',scrub:true,invalidateOnRefresh:true}});
    if(element.hasAttribute('data-parallax-reveal')){
     gsap.fromTo(element,{opacity:.12},{opacity:1,ease:'none',scrollTrigger:{trigger:element,start:'top 96%',end:'top 72%',scrub:true,invalidateOnRefresh:true}});
    }
   });
  },root);
  void document.fonts.ready.then(()=>{if(active)ScrollTrigger.refresh();});
  return()=>{active=false;context.revert();};
 },[resetKey,reduced]);

 return <div ref={root} className={className} data-parallax-layers>{children}</div>;
}
