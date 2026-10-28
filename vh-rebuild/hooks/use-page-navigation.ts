import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useReducedMotion } from './use-reduced-motion';

type ViewChange={finished:Promise<void>;skipTransition:()=>void};
type TransitionDocument=Document&{startViewTransition?:(callback:()=>void)=>ViewChange};

function scrollToLocation(url:URL,instant:boolean) {
  const target=url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;
  if(target){
    target.scrollIntoView({block:'start',behavior:instant?'instant':'smooth'});
    target.tabIndex=-1;target.focus({preventScroll:true});
  }
  else window.scrollTo({top:0,behavior:'instant'});
}

export function usePageNavigation() {
  const [route,setRoute]=useState(()=>location.pathname+location.search);
  const current=useRef(route);current.current=route;
  const change=useRef<ViewChange|null>(null);
  const reduced=useReducedMotion();
  const navigate=useCallback((href:string,push=true)=>{
    const url=new URL(href,location.href);
    if(url.origin!==location.origin)return;
    const next=url.pathname+url.search;
    if(next===current.current){
      if(push&&url.href!==location.href)history.pushState(null,'',url);
      scrollToLocation(url,reduced);return;
    }
    const commit=()=>{
      if(push)history.pushState(null,'',url);
      flushSync(()=>setRoute(next));
      window.scrollTo({top:0,behavior:'instant'});
      requestAnimationFrame(()=>{
        if(url.hash)scrollToLocation(url,true);
        const main=document.querySelector<HTMLElement>('main');
        if(main){main.tabIndex=-1;main.focus({preventScroll:true});}
      });
    };
    change.current?.skipTransition();
    const doc=document as TransitionDocument;
    if(doc.startViewTransition&&!reduced){
      document.documentElement.dataset.viewTransition='native';
      change.current=doc.startViewTransition(commit);
      void change.current.finished.catch(()=>{});
    }else{
      document.documentElement.dataset.viewTransition='fallback';commit();
    }
  },[reduced]);
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
      const anchor=(event.target as Element)?.closest<HTMLAnchorElement>('a[href]');
      if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
      const url=new URL(anchor.href,location.href);if(url.origin!==location.origin)return;
      event.preventDefault();navigate(url.href);
    };
    const pop=()=>navigate(location.href,false);
    document.addEventListener('click',click);window.addEventListener('popstate',pop);
    return()=>{document.removeEventListener('click',click);window.removeEventListener('popstate',pop);};
  },[navigate]);
  return {route,navigate};
}
