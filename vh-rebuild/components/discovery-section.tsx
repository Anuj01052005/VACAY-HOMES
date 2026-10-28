import { content } from '@/content';
import { useEffect } from 'react';
import { SwipeCards } from './ui/image-stack-carousel';
import { GlassLink } from './ui/glass-action';

export function DiscoverySection({paused}: {paused: boolean}) {
  useEffect(() => {
    if (window.location.hash !== '#discover') return;
    const frame = requestAnimationFrame(() => document.getElementById('discover')?.scrollIntoView({block:'start',behavior:'instant'}));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <section id="discover" className="discovery-section" aria-labelledby="discovery-title" data-motion-paused={paused}>
    <div className="discovery-sky" aria-hidden="true"/>
    <div className="discovery-inner">
      <SwipeCards cards={content.gallery}/>
      <div className="discovery-copy">
        <h2 id="discovery-title">“A little away,<br/>a lot together.”</h2>
        <GlassLink arrow className="properties-link" href="?page=properties">{content.propertiesButton}</GlassLink>
      </div>
    </div>
  </section>;
}
