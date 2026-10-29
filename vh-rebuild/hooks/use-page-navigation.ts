import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { useReducedMotion } from './use-reduced-motion';

type Entry = { key:string; index:number; y:number };
const newEntry = (index:number):Entry => ({key:crypto.randomUUID(),index,y:0});
const frame = () => new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
function targetPosition(url:URL) {
 let id=url.hash.slice(1);
 try { id=decodeURIComponent(id); } catch { /* Invalid escapes remain literal IDs. */ }
 const target=id?document.getElementById(id):null;
 if(!target||id==='home')return 0;
 const nav=document.querySelector('.navigation');
 const clearance=(nav?.getBoundingClientRect().bottom??92)+20;
 return Math.max(0,target.getBoundingClientRect().top+window.scrollY-clearance);
}
/** Keep route changes and browser history in sync with the single scroll owner. */
export function usePageNavigation(scroll:RefObject<Lenis|null>) {
 const [view,setView]=useState(()=>({route:location.pathname+location.search,key:0}));
 const transitionRef=useRef<HTMLDivElement>(null);
 const active=useRef<Entry>(history.state?.vacay??newEntry(0));
 const positions=useRef(new Map<string,number>());
 const busy=useRef(false);
 const pending=useRef<{href:string;push:boolean}|null>(null);
 const arrivalRef=useRef<boolean|null>(null);
 const reduced=useReducedMotion();
 const position=useCallback((y:number)=>{
  scroll.current?.resize();
  if(scroll.current)scroll.current.scrollTo(y,{immediate:true,force:true});
  else window.scrollTo(0,y);
 },[scroll]);
 useLayoutEffect(()=>{
  if(arrivalRef.current===null){
   arrivalRef.current=false;
   try{arrivalRef.current=sessionStorage.getItem('vacay:arrival')==='1';sessionStorage.removeItem('vacay:arrival');}catch{/* Storage may be disabled in private browsers. */}
  }
  const arrival=arrivalRef.current;
  const saved=history.state?.vacay?.y??0;
  if(!arrival&&!saved&&(!location.hash||location.hash==='#home'))return;
  let alive=true;
  const veil=transitionRef.current;
  if(arrival&&veil){busy.current=true;veil.dataset.active='true';gsap.set(veil,{autoAlpha:1});}
  void document.fonts.ready.then(async()=>{
   await frame();await frame();if(!alive)return;
   ScrollTrigger.refresh();
   position(arrival?targetPosition(new URL(location.href)):saved||targetPosition(new URL(location.href)));
   arrivalRef.current=false;
   if(arrival&&veil){await gsap.to(veil,{autoAlpha:0,duration:reduced?.12:.42,ease:'power2.inOut'}).then();delete veil.dataset.active;busy.current=false;}
  });
  return()=>{alive=false;};
 },[position,reduced]);
 const navigateFooter=useCallback(async(url:URL)=>{
  if(busy.current)return;
  busy.current=true;
  const outgoing={...active.current,y:window.scrollY};
  history.replaceState({...history.state,vacay:outgoing},'');
  const veil=transitionRef.current;
  if(veil){veil.dataset.active='true';await gsap.to(veil,{autoAlpha:1,duration:reduced?.08:.24,ease:'power1.inOut'}).then();}
  try{sessionStorage.setItem('vacay:arrival','1');}catch{/* Navigation still works without storage. */}
  // A new document gives iPhone browsers a fresh native viewport, not the old footer offset.
  history.pushState({...history.state,vacay:newEntry(outgoing.index+1)},'',url);
  location.reload();
 },[reduced]);
 const navigate=useCallback(async(href:string,push=true)=>{
  const url=new URL(href,location.href);
  if(url.origin!==location.origin)return;
  if(busy.current){pending.current={href:url.href,push};return;}
  busy.current=true;
  const outgoing={...active.current,y:window.scrollY};
  positions.current.set(outgoing.key,outgoing.y);
  // popstate has already selected the incoming history entry.
  if(push)history.replaceState({...history.state,vacay:outgoing},'');
  const incoming:Entry=push?newEntry(outgoing.index+1):(history.state?.vacay??newEntry(0));
  scroll.current?.stop();
  const veil=transitionRef.current;
  if(veil){veil.dataset.active='true';await gsap.to(veil,{autoAlpha:1,duration:reduced?.08:.24,ease:'power1.inOut'}).then();}
  try {
   // Mount at the top, so reveal effects cannot inherit the outgoing footer position.
   position(0);
   if(push)history.pushState({...history.state,vacay:incoming},'',url);
   active.current=incoming;
   flushSync(()=>setView(previous=>({route:url.pathname+url.search,key:previous.key+1})));
   await frame();await frame();
   ScrollTrigger.refresh();
   const destination=push?targetPosition(url):(positions.current.get(incoming.key)??incoming.y);
   position(destination);
   ScrollTrigger.update();
   const main=document.querySelector<HTMLElement>('main');
   if(main){main.tabIndex=-1;main.focus({preventScroll:true});}
   await frame();
  } finally {
   if(veil){await gsap.to(veil,{autoAlpha:0,duration:reduced?.12:.42,ease:'power2.inOut'}).then();delete veil.dataset.active;}
   scroll.current?.start();busy.current=false;
   const queued=pending.current;pending.current=null;
   if(queued)void navigate(queued.href,queued.push);
  }
 },[position,reduced,scroll]);
 const back=useCallback(()=>{
  if(busy.current)return;
  if(active.current.index>0)history.back();else void navigate('./#home');
 },[navigate]);
 useEffect(()=>{
  const restoration=history.scrollRestoration;
  history.scrollRestoration='manual';
  history.replaceState({...history.state,vacay:active.current},'');
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
   const anchor=(event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
   if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
   const url=new URL(anchor.href,location.href);if(url.origin!==location.origin)return;
   event.preventDefault();
   if(anchor.closest('.vacay-footer')&&matchMedia('(hover:none) and (pointer:coarse)').matches)void navigateFooter(url);
   else void navigate(url.href);
  };
  const pop=()=>{void navigate(location.href,false);};
  const show=(event:PageTransitionEvent)=>{
   if(!event.persisted)return;
   busy.current=false;pending.current=null;
   const veil=transitionRef.current;if(veil){gsap.set(veil,{autoAlpha:0});delete veil.dataset.active;}
   position(history.state?.vacay?.y??0);
  };
  document.addEventListener('click',click);window.addEventListener('popstate',pop);
  window.addEventListener('pageshow',show);
  return()=>{history.scrollRestoration=restoration;document.removeEventListener('click',click);window.removeEventListener('popstate',pop);window.removeEventListener('pageshow',show);};
 },[navigate,navigateFooter,position]);
 return {route:view.route,locationKey:view.key,navigate,back,transitionRef};
}
