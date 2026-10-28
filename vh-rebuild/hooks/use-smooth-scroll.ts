import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {useReducedMotion} from './use-reduced-motion';

/** One shared scroll owner for every route; visual effects remain page-specific. */
export function useSmoothScroll(route:string){
 const instance=useRef<Lenis|null>(null);
 const reduced=useReducedMotion();
 useEffect(()=>{
  // Use the Dining settings everywhere. Touch keeps its native momentum.
  if(reduced||!window.matchMedia('(pointer:fine)').matches)return;
  const scroll=new Lenis({duration:.9,smoothWheel:true,syncTouch:false,prevent:node=>Boolean(node.closest('dialog[open]'))});
  instance.current=scroll;
  const tick=(time:number)=>scroll.raf(time*1000);
  scroll.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(tick);
  return()=>{gsap.ticker.remove(tick);scroll.off('scroll',ScrollTrigger.update);scroll.destroy();instance.current=null;};
 },[route,reduced]);
 return instance;
}
