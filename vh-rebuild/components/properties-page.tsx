import { content } from '@/content';
import { SwipeCards } from './ui/image-stack-carousel';
import { GlassLink } from './ui/glass-action';
import { SilverTrace } from './ui/silver-trace';
import { FeatureVideo } from './feature-video';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FlipGallery } from './ui/flip-gallery';
import { terraceCover, terracePhotos } from '@/terrace-photos';
import '@/styles/flip-gallery.css';
gsap.registerPlugin(ScrollTrigger);

export function PropertiesPage() {
  const property = new URLSearchParams(window.location.search).get('property');
  return property === '003' ? <TerracePage /> : <PropertyOverview dedicated={property === '002'} />;
}

function TerracePage() {
  return (
    <main id="home" className="property-page terrace-gallery-page">
      <div className="terrace-gallery-stage">
        <header className="terrace-preview-heading">
          <h1>Terrace</h1>
        </header>
        <FlipGallery photos={terracePhotos} label="Terrace photos" />
      </div>
      <TerraceFeatures />
    </main>
  );
}

function TerraceFeatures() {
  return (
    <ul className="property-confirmed-features" aria-label="Terrace features">
      {content.property003Features.map(feature => (
        <li key={feature}><span className="glass glass-action silver-trace">{feature}<SilverTrace /></span></li>
      ))}
    </ul>
  );
}

function PropertyOverview({ dedicated }: { dedicated: boolean }) {
  const opening=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  useLayoutEffect(()=>{
    if(!dedicated||reduced)return;
    const context=gsap.context(()=>{
      gsap.fromTo(opening.current,{opacity:1,y:0},{opacity:0,y:-16,ease:'none',scrollTrigger:{trigger:opening.current,start:'bottom 45%',end:'bottom 105px',scrub:.25,invalidateOnRefresh:true}});
    },opening);
    void document.fonts.ready.then(()=>ScrollTrigger.refresh());
    return()=>context.revert();
  },[dedicated,reduced]);
  return <main id="home" className={`property-page${dedicated?' property-page-dedicated':''}`}>
    <div ref={opening} className="property-opening">
    <header className="property-page-header">{dedicated&&<p>Properties</p>}<h1>{dedicated?<strong className="property-heading-code">Farm</strong>:'Properties'}</h1></header>
    {dedicated&&<div className="property-introduction">
      <div className="property-cover dedicated-cover"><img src={content.gallery[0].img} alt={content.gallery[0].alt}/><span className="property-id-badge glass">Farm</span></div>
      <div className="property-detail-glass glass"><FeatureLinks dedicated/></div>
      <a className="property-location" href={content.property002Location} target="_blank" rel="noreferrer" aria-label="Location of Farm"><span>Location</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></a>
    </div>}</div>
    {dedicated?<div className="property-feature-gallery">{content.property002Films.map(film=><FeatureVideo film={film} key={film.id}/>)}</div>:<div className="property-grid">
      <article className="property-entry">
        <div className="property-carousel"><SwipeCards cards={content.gallery.map(card=>({...card,tag:"Farm"}))}/></div>
        <FeatureLinks/>
      </article>
      <article id="vacay003" className="property-entry property-terrace">
        <a className="property-cover terrace-cover" href={content.terraceHref} aria-label="View Terrace gallery">
          <img src={terraceCover.url} alt={terraceCover.alt} loading="lazy" />
          <span className="property-id-badge glass">Terrace</span>
        </a>
        <TerraceFeatures />
      </article>
    </div>}
  </main>;
}
function FeatureLinks({dedicated=false}:{dedicated?:boolean}) {
  return <nav className="feature-navigation" aria-label="Explore Farm features">{content.property002Films.map(film=><GlassLink key={film.id} href={`${dedicated?'':'?page=properties&property=002'}#${film.id}`}>{film.label}</GlassLink>)}</nav>;
}


