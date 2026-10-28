import {useLayoutEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {GlassButton} from './ui/glass-action';
import {ParallaxComponent} from './ui/parallax-scrolling';
import {DiningScrollSketch} from './dining-scroll-sketch';
import {useReducedMotion} from '@/hooks/use-reduced-motion';
import {buffetDays,diningContacts} from '@/dining-content';
import '@/styles/dining.css';
gsap.registerPlugin(ScrollTrigger);

export function DiningPage(){
 const [day,setDay]=useState(0);
 const root=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();
 useLayoutEffect(()=>{
  if(reduced)return;
  const context=gsap.context(()=>{
   root.current?.querySelectorAll('.vegetarian-note,.dining-contact-heading,.dining-contact-links a').forEach(element=>{
    gsap.fromTo(element,{opacity:.12,y:24},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:element,start:'clamp(top 96%)',end:'clamp(top 72%)',scrub:true,invalidateOnRefresh:true}});
   });
  },root);
  return()=>context.revert();
 },[day,reduced]);
 return <main ref={root} id="home" className="dining-page">
  <div className="dining-ambience" aria-hidden="true"/>
  <ParallaxComponent className="dining-menu-stage" resetKey={day}>
  <div className="dining-art" aria-hidden="true"><img src="./assets/dining/engraved-glass.webp" alt=""/><svg className="dining-small-art" viewBox="0 0 220 300" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M25 35 175 55 90 150Z M90 150 74 245 M44 245 104 251 74 236Z M18 39 174 58 M35 47 95 131 155 62"/><ellipse cx="76" cy="80" rx="14" ry="10"/><ellipse cx="111" cy="88" rx="14" ry="10"/><path d="m186 163-4 108m-14-114 3 34q12 14 23 0l6-33m-16 4-1 34"/></svg></div>
  <header className="dining-heading"><h1 data-parallax-layer="1">Buffet<br/><em>Menu</em></h1></header>
  <div className="dining-tabs" data-parallax-layer="4" role="tablist" aria-label="Buffet day">{buffetDays.map((entry,i)=><GlassButton className="dining-day-button" key={entry.day} role="tab" id={`day-tab-${i}`} aria-selected={day===i} aria-controls="buffet-panel" tabIndex={day===i?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-day;setDay(next);document.getElementById(`day-tab-${next}`)?.focus();}}} onClick={()=>setDay(i)}>{entry.day}</GlassButton>)}</div>
  <section id="buffet-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="buffet-panel" key={day}>
   {buffetDays[day].meals.map(meal=><article className="buffet-course" key={meal.title}><header><h2 data-parallax-layer="2" data-parallax-reveal>{meal.title}</h2><DiningScrollSketch kind="arrow"/></header>{'note' in meal&&<p className="course-note" data-parallax-layer="3" data-parallax-reveal>{meal.note}</p>}<ul>{meal.items.map(item=><li key={item} data-parallax-layer="3" data-parallax-reveal>{item}</li>)}</ul><div className="meal-brush-space"><DiningScrollSketch kind={meal.title==='Breakfast'?'breakfast':meal.title==='Lunch'?'naan':meal.title==='Hi-Tea'?'tea':'rice'}/></div></article>)}
  </section>
  </ParallaxComponent>
  <aside className="dining-details"><p className="vegetarian-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M20 4C9 2 3 8 5 15c7 4 15-1 15-11Z M4 21 15 10"/></svg>Pure vegetarian property</p><section className="dining-contact-card glass" aria-labelledby="dining-contact-title"><h2 className="dining-contact-heading" id="dining-contact-title">Dining contacts</h2><div className="dining-contact-links">{diningContacts.map(n=><a key={n} href={`tel:+${n}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m7 3 3 5-2 2c2 3 3 4 6 6l2-2 5 3c-1 5-5 4-10 0S1 7 7 3Z"/></svg>+{n.slice(0,2)} {n.slice(2)}</a>)}<div className="dining-cook"><h2 className="dining-contact-heading">Cook Rambharose</h2><a href="tel:+919994556614"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m7 3 3 5-2 2c2 3 3 4 6 6l2-2 5 3c-1 5-5 4-10 0S1 7 7 3Z"/></svg>+91 9994556614</a></div></div></section></aside>
 </main>;
}
