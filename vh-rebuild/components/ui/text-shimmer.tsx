// Adapted from ibelick's Text Shimmer (21st component 1169).
// Keep its layered text gradient; use our existing GSAP clock, one pass and reduced-motion support.
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
export function TextShimmer({children,textLength,className,duration=2.4,delay=1.75,spread=2}:{children:ReactNode;textLength:number;className?:string;duration?:number;delay?:number;spread?:number}){
 const ref=useRef<HTMLSpanElement>(null);const reduced=useReducedMotion();
 useEffect(()=>{if(reduced)return;const letters=ref.current?.querySelectorAll('.title-letter');const tween=gsap.fromTo(letters??[],{backgroundPosition:'100% center'},{backgroundPosition:'0% center',duration,delay,ease:'none',stagger:.06});return()=>{tween.revert();};},[reduced,duration,delay]);
 return <span ref={ref} className={cn('shimmer-group',className)} style={{'--spread':`${textLength*spread}px`} as CSSProperties}>{children}</span>;
}
