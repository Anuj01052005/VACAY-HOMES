import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from '@/content';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { WaterRippleImage } from './ui/water-ripple-image';
import { TextShimmer } from './ui/text-shimmer';
import { PropertiesPage } from './properties-page';
import { Navigation } from './navigation';
import { VinylScrollSection } from './vinyl-scroll-section';
import '@/styles/vinyl-tour.css';
import { InquiryDialog } from './inquiry-dialog';
import { SiteFooter } from './site-footer';
import { RulesDialog } from './rules-dialog';
import { DiningPage } from './dining-page';
import { usePageNavigation } from '@/hooks/use-page-navigation';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});

export function App(){
 const lenis=useSmoothScroll();
 const {route,locationKey,navigate,back,transitionRef}=usePageNavigation(lenis);
 const query=new URL(route,location.origin).searchParams;
 const propertiesPage=query.get('page')==='properties';
 const diningPage=query.get('page')==='dining';
 const innerPage=propertiesPage||diningPage;
 const scene=useRef<HTMLElement>(null);const photo=useRef<HTMLDivElement>(null);const title=useRef<HTMLHeadingElement>(null);const cue=useRef<HTMLButtonElement>(null);const navigation=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();const [notice,setNotice]=useState('');const [inquiryOpen,setInquiryOpen]=useState(false);
 const [footerActive,setFooterActive]=useState(false);
 const [rulesOpen,setRulesOpen]=useState(false);
 useEffect(()=>{
  setFooterActive(false);
  const footer=document.querySelector('.vacay-footer');
  if(!footer)return;
  let hiddenUntilTop=false;
  const updateNavigation=()=>{
   if(window.scrollY<=2){
    if(hiddenUntilTop){hiddenUntilTop=false;setFooterActive(false);}
   }else if(!hiddenUntilTop&&footer.getBoundingClientRect().top<=window.innerHeight*.5){
    hiddenUntilTop=true;setFooterActive(true);
   }
  };
  updateNavigation();
  window.addEventListener('scroll',updateNavigation,{passive:true});
  window.addEventListener('resize',updateNavigation);
  return()=>{window.removeEventListener('scroll',updateNavigation);window.removeEventListener('resize',updateNavigation);};
 },[route,locationKey]);
 useEffect(()=>{document.title=diningPage?'Buffet Menu — Vacay Homes':propertiesPage?(new URLSearchParams(location.search).get('property')==='002'?'Farm':'Properties — Vacay Homes'):'Vacay Homes — Farm';},[route,propertiesPage]);
 const titlePairs=[['V','H'],['A','O'],['C','M'],['A','E'],['Y','S']];
 useLayoutEffect(()=>{
  if(innerPage){gsap.killTweensOf(navigation.current);gsap.set(navigation.current,{autoAlpha:1,y:0});return;}
  const context=gsap.context(()=>{
   const pairs=gsap.utils.toArray<HTMLElement>('.letter-pair',title.current);
   const intro=gsap.timeline({defaults:{ease:'power3.out'}});
   if(reduced){
    intro.fromTo(title.current,{opacity:0},{opacity:1,duration:.15})
     .fromTo(navigation.current,{opacity:0},{opacity:1,duration:.15},'<');
   }else{
    intro.set(navigation.current,{autoAlpha:0})
     .fromTo(pairs,{autoAlpha:0,y:-72},{autoAlpha:1,y:0,duration:.62,stagger:.14},0)
     .fromTo(navigation.current,{autoAlpha:0,y:-8},{autoAlpha:1,y:0,duration:.42},'>-.12')
    const loop=gsap.timeline({repeat:-1,repeatDelay:.4,defaults:{ease:'power2.inOut'}});
    loop.set('.hero-cue-arrow',{autoAlpha:0,y:-8})
      .to('.hero-cue-text',{y:12,autoAlpha:0,duration:.52},1.15)
      .set('.hero-cue-text',{y:-12})
      .to('.hero-cue-arrow',{y:0,autoAlpha:1,duration:.36})
      .to('.hero-cue-arrow',{y:10,autoAlpha:0,duration:.36},'+=.5')
      .to('.hero-cue-text',{y:0,autoAlpha:1,duration:.52});
    ScrollTrigger.create({trigger:scene.current,start:'top bottom',end:'bottom top',onToggle:self=>{if(self.isActive)loop.resume();else loop.pause();}});
   }
  },scene);
  return()=>context.revert();
 },[reduced,innerPage,route]);
 useEffect(()=>{
  if(reduced||innerPage)return;
  const context=gsap.context(()=>{
   gsap.timeline({scrollTrigger:{trigger:scene.current,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}})
    .to(photo.current,{yPercent:-2,scale:1.045,ease:'none',duration:1},0)
    .to(photo.current,{opacity:0,ease:'none',duration:.35},.65)
    .to(title.current,{y:()=>window.innerHeight*.26,opacity:0,ease:'none',duration:.85},0)
    .to(cue.current,{opacity:0,ease:'none',duration:.3},0)
  },scene);
  void document.fonts.ready.then(()=>ScrollTrigger.refresh());
  return()=>context.revert();
 },[reduced,innerPage,route]);
 const go=(target:number)=>{if(lenis.current)lenis.current.scrollTo(target);else window.scrollTo({top:target,behavior:'instant'});};
 return <>
  <a className="skip-link" href="#home">Skip to the villa</a>
  <Navigation ref={navigation} hidden={footerActive} opaque={innerPage} onBack={back} onRules={()=>setRulesOpen(true)} onHome={()=>{void navigate('./#home');}} onNavigate={navigate} onInquire={()=>setInquiryOpen(true)} onNotice={setNotice}/>
  {innerPage&&<div className="nav-clearance" aria-hidden="true"/>}
  <div key={route} className="page-surface">{diningPage?<DiningPage/>:propertiesPage?<PropertiesPage/>:<main><section id="home" ref={scene} className="hero-scene" aria-label="VACAY HOMES FARM">
   <div className="hero-viewport">
    <div className="hero-photo" ref={photo}><WaterRippleImage src={content.heroImage} alt={content.imageAlt} {...content.ripple}/></div>
    <div className="hero-shade"/>
    <div className="title-mask"><h1 ref={title} aria-label={content.brand}><TextShimmer className="title-stack" textLength={10}>{titlePairs.map(([top,bottom],index)=><span className="letter-pair" key={`${top}-${bottom}-${index}`} aria-hidden="true"><span className="title-letter text-shimmer">{top}</span><span className="title-letter text-shimmer">{bottom}</span></span>)}</TextShimmer></h1></div>
    <button ref={cue} className="hero-discover-cue" aria-label="Scroll to Discover" onClick={()=>go(window.innerHeight*1.65)}><span className="hero-cue-text" aria-hidden="true">Scroll to Discover</span><span className="hero-cue-arrow" aria-hidden="true">↓</span></button>
   </div>
  </section><VinylScrollSection/></main>}<div className="footer-join" aria-hidden="true"/><SiteFooter onNotice={setNotice} onRules={()=>setRulesOpen(true)}/></div>
  <div ref={transitionRef} className="page-transition" aria-hidden="true"/>
  <InquiryDialog open={inquiryOpen} onClose={()=>setInquiryOpen(false)}/>
  <RulesDialog open={rulesOpen} onClose={()=>setRulesOpen(false)}/>
  {notice&&<div className="notice glass" role="status"><p>{notice}</p><button className="glass glass-action" onClick={()=>setNotice('')} aria-label="Dismiss message">Close</button></div>}
 </>;
}


