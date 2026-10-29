import {useId,useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useReducedMotion} from '@/hooks/use-reduced-motion';
gsap.registerPlugin(ScrollTrigger);
type Kind='arrow'|'breakfast'|'tea'|'naan'|'rice';
type Mark={trace:string;width:number;duration?:number};
const arrow='M102 25C172 6 221 82 190 123C168 152 112 140 112 108C112 74 158 86 169 120C185 171 139 219 64 212L91 198L64 212L94 236';
const arrowMarks:Mark[]=[{trace:arrow,width:18,duration:3.4}];
const foodMarks:Mark[]=[
 {trace:'M0 21Q140 9 300 24',width:60},
 {trace:'M300 62Q151 76 0 60',width:60},
 {trace:'M0 100Q139 86 300 105',width:60},
 {trace:'M300 143Q150 154 0 139',width:60},
 {trace:'M0 180Q143 168 300 185',width:60},
 {trace:'M300 222Q145 234 0 219',width:60},
 {trace:'M0 259Q148 248 300 264',width:60},
];
const sources={breakfast:'./assets/dining/food/breakfast-color.webp?v=breakfast-1',tea:'./assets/dining/food/tea-color.webp?v=colored-food-2',naan:'./assets/dining/food/naan-color.webp?v=colored-food-2',rice:'./assets/dining/food/rice-color.webp?v=colored-food-2'};
/** Brush masks reveal the cleaned supplied graphics without redrawing or recoloring them at runtime. */
export function DiningScrollSketch({kind}:{kind:Kind}){
 const root=useRef<SVGSVGElement>(null);
 const reduced=useReducedMotion();
 const uid=`brush-${useId().replaceAll(':','')}`;
 const marks=kind==='arrow'?arrowMarks:foodMarks;
 useLayoutEffect(()=>{
  const paths=root.current?.querySelectorAll<SVGPathElement>('.brush-reveal');
  if(!paths)return;
  if(reduced){gsap.set(paths,{strokeDasharray:1,strokeDashoffset:0});return;}
  const context=gsap.context(()=>{
   gsap.set(paths,{strokeDasharray:1,strokeDashoffset:1});
   // Fractional offsets are essential: pixel rounding would pop each brush pass on.
   const timeline=gsap.timeline({paused:true,defaults:{ease:'none',autoRound:false}});
   paths.forEach((path,index)=>timeline.fromTo(path,{strokeDashoffset:1},{strokeDashoffset:0,duration:marks[index].duration??1}));
   const trigger=kind==='arrow'?root.current?.closest('header'):root.current;
   if(!trigger)return;
   const distance=()=>Math.min(window.innerHeight*(kind==='arrow'?.4:.55),kind==='arrow'?300:420);
   let painted=0;
   const render=(value:number)=>{painted=Math.max(painted,gsap.utils.clamp(0,1,value));timeline.progress(painted);};
   // Paint with forward scroll; reversing holds the marks already drawn.
   ScrollTrigger.create({trigger,start:'top 95%',end:()=>`+=${distance()}`,invalidateOnRefresh:true,
    onUpdate:self=>{if(self.direction>0)render(self.progress);},
    onLeave:self=>{if(self.direction>0)render(1);},
   });
  },root);
  return()=>context.revert();
 },[kind,reduced]);
 return <svg ref={root} className={kind==='arrow'?'course-sketch-arrow':'meal-brush-art'} data-brush-kind={kind} viewBox={kind==='arrow'?'40 0 210 260':'0 0 300 270'} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  <defs>
   <filter id={`${uid}-edge`} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".12 .7" numOctaves="2" seed="7" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale="1.3" xChannelSelector="R" yChannelSelector="G"/></filter>
   <mask id={`${uid}-paint`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="320" height="290"><g filter={`url(#${uid}-edge)`}>{marks.map((mark,i)=><path key={i} className="brush-reveal" data-brush-stroke={i} pathLength="1" strokeDasharray="1 1" strokeDashoffset="1" d={mark.trace} stroke="white" strokeWidth={mark.width}/>)}</g></mask>
  </defs>
  {kind==='arrow'?<g mask={`url(#${uid}-paint)`} filter={`url(#${uid}-edge)`}>
   <path d={arrow} stroke="var(--brush-ink)" strokeWidth="6.5"/>
   <path d="M102 28C174 13 214 80 185 120C165 145 117 137 116 109C115 82 154 91 164 123C178 169 136 214 68 210L92 235" stroke="var(--brush-pale)" strokeWidth="1.1"/>
  </g>:<image href={sources[kind]} x="0" y="0" width="300" height="270" preserveAspectRatio="xMidYMid meet" mask={`url(#${uid}-paint)`}/>}
 </svg>;
}
