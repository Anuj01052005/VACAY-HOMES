'use client';
// Adapted from the user-supplied 21st Image Stack Carousel by ayushmxxn.
// Any directional gesture over the stack advances one image; no previous direction.
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface SwipeCardItem {
  id: string; img: string; smallImg?: string; alt: string; label: string; position?: string; tag?: string;
}
function StackCard({card,depth,reduced,onNext}: {card:SwipeCardItem;depth:number;reduced:boolean;onNext:()=>void}) {
  const x=useMotionValue(0),y=useMotionValue(0);
  const rotateY=useTransform(x,[-180,180],[-9,9]);
  const rotateX=useTransform(y,[-180,180],[7,-7]);
  const dragged=useRef(false);
  const front=depth===0,backDepth=Math.min(depth,3);
  const onDragEnd=(_:MouseEvent|TouchEvent|PointerEvent,info:PanInfo)=>{
    if(Math.hypot(info.offset.x,info.offset.y)>55)onNext();
    x.set(0);y.set(0);
  };
  return <motion.div className="stack-card" data-front={front} aria-hidden={!front}
    role={front?'button':undefined} tabIndex={front?0:-1}
    aria-label={front?`Next photo. ${card.alt}`:undefined}
    style={{zIndex:10-depth,x:front?x:0,y:front?y:0,rotateY:front&&!reduced?rotateY:0,rotateX:front&&!reduced?rotateX:0}}
    drag={front&&!reduced} dragConstraints={{left:0,right:0,top:0,bottom:0}} dragElastic={.45} dragMomentum={false}
    onPointerDown={()=>{dragged.current=false;}} onDragStart={()=>{dragged.current=true;}} onDragEnd={onDragEnd}
    onClick={()=>{if(front&&!dragged.current)onNext();}}
    onKeyDown={event=>{if(front&&['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();onNext();}}}
    initial={false} animate={{rotateZ:reduced?0:backDepth*3.5,scale:1-backDepth*.035,opacity:depth<4?1:0}}
    transition={reduced?{duration:.15}:{type:'spring',stiffness:260,damping:28}}>
    <img src={card.img} srcSet={card.smallImg?`${card.smallImg} 600w, ${card.img} 1600w`:undefined}
      sizes="(max-width: 767px) 84vw, 440px" alt={front?card.alt:''} style={{objectPosition:card.position||'center'}} loading="lazy" decoding="async" draggable={false}/>
    <span className="photo-tag glass">{card.tag||'Farm'}</span>
  </motion.div>;
}
export function SwipeCards({cards}:{cards:SwipeCardItem[]}) {
  const [index,setIndex]=useState(0);
  const reduced=useReducedMotion();
  const container=useRef<HTMLDivElement>(null);
  const restoreFocus=useRef(false);
  const lastAdvance=useRef(0);
  const wheelGesture=useRef({time:0,amount:0,advanced:false});
  const next=()=>{
    const now=performance.now();
    if(now-lastAdvance.current<380)return;
    lastAdvance.current=now;
    if(container.current?.contains(document.activeElement)){
      restoreFocus.current=true;
      container.current.focus({preventScroll:true});
    }
    setIndex(i=>(i+1)%cards.length);
  };
  useLayoutEffect(()=>{
    if(!restoreFocus.current)return;
    container.current?.querySelector<HTMLElement>('[data-front="true"]')?.focus({preventScroll:true});
    restoreFocus.current=false;
  },[index]);
  const nextRef=useRef(next);nextRef.current=next;
  useEffect(()=>{
    const element=container.current;if(!element)return;
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey)return;
      event.preventDefault();
      const now=performance.now(),gesture=wheelGesture.current;
      if(now-gesture.time>180){gesture.amount=0;gesture.advanced=false;}
      gesture.time=now;
      const unit=event.deltaMode===1?16:event.deltaMode===2?element.clientHeight:1;
      gesture.amount+=Math.max(Math.abs(event.deltaX),Math.abs(event.deltaY))*unit;
      if(!gesture.advanced&&gesture.amount>45){gesture.advanced=true;nextRef.current();}
    };
    element.addEventListener('wheel',wheel,{passive:false});
    return()=>element.removeEventListener('wheel',wheel);
  },[]);
  if(!cards.length)return null;
  const ordered=[...cards.slice(index),...cards.slice(0,index)];
  return <div className="photo-carousel" role="region" aria-roledescription="carousel" aria-label="Around VACAY HOMES FARM">
    <div ref={container} className="stack-stage" tabIndex={-1} data-lenis-prevent-wheel>
      {ordered.map((card,depth)=><StackCard key={card.id} card={card} depth={depth} reduced={reduced} onNext={next}/>)}
    </div>
    <span className="sr-only" role="status" aria-live="polite">{cards[index].label}</span>
  </div>;
}

