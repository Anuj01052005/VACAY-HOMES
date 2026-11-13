import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

gsap.registerPlugin(ScrollTrigger);

type Photo = { url: string; alt: string };
type Direction = -1 | 1;
const scrollStep = 152;

export function FlipGallery({ photos, label }: { photos: readonly Photo[]; label: string }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLButtonElement>(null);
  const topFlap = useRef<HTMLSpanElement>(null);
  const bottomFlap = useRef<HTMLSpanElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const current = useRef(0);
  const target = useRef(0);
  const direction = useRef<Direction>(1);
  const reduced = useReducedMotion();

  const animateToTarget = useCallback(function advance() {
    const stage = frame.current;
    const top = topFlap.current;
    const bottom = bottomFlap.current;
    if (!stage || !top || !bottom || timeline.current || current.current === target.current) return;

    const from = current.current;
    const to = target.current;
    const photo = (position: number) => `url("${photos[position].url}")`;
    const setFace = (side: string, position: number) => {
      stage.style.setProperty(`--flip-${side}`, photo(position));
    };
    const finish = () => {
      setFace('top', to);
      setFace('bottom', to);
      current.current = to;
      setIndex(to);
    };

    if (reduced) {
      finish();
      return;
    }

    const forward = direction.current === 1;
    const outgoing = forward ? top : bottom;
    const incoming = forward ? bottom : top;
    setFace('top', forward ? to : from);
    setFace('bottom', forward ? from : to);
    setFace('top-flap', forward ? from : to);
    setFace('bottom-flap', forward ? to : from);

    gsap.set(outgoing, { rotationX: 0, autoAlpha: 1, force3D: true });
    gsap.set(incoming, { rotationX: forward ? 90 : -90, autoAlpha: 0, force3D: true });

    timeline.current = gsap.timeline({
      defaults: { duration: 0.32 },
      onComplete: () => {
        finish();
        gsap.set([top, bottom], { autoAlpha: 0 });
        timeline.current = null;
        advance();
      },
    })
      .to(outgoing, { rotationX: forward ? -90 : 90, ease: 'sine.in' })
      .set(outgoing, { autoAlpha: 0 })
      .set(incoming, { autoAlpha: 1 })
      .to(incoming, { rotationX: 0, ease: 'sine.out' });
  }, [photos, reduced]);

  const move = useCallback((offset: number) => {
    if (photos.length < 2 || !offset) return;
    direction.current = offset > 0 ? 1 : -1;
    target.current = ((target.current + offset) % photos.length + photos.length) % photos.length;
    animateToTarget();
  }, [animateToTarget, photos.length]);

  useEffect(() => {
    const preload = photos.map(({ url }) => {
      const image = new Image();
      image.src = url;
      void image.decode().catch(() => {});
      return image;
    });
    return () => { preload.length = 0; };
  }, [photos]);

  useLayoutEffect(() => {
    const section = track.current;
    const sticky = dock.current;
    if (!section || !sticky || photos.length < 2) return;
    let step = 0;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: () => `top top+=${Number.parseFloat(getComputedStyle(sticky).top)}`,
      end: () => `+=${section.offsetHeight - sticky.offsetHeight}`,
      onRefresh: (self) => { step = Math.floor(self.progress * (photos.length - 1) + .001); },
      onUpdate: (self) => {
        const next = Math.floor(self.progress * (photos.length - 1) + .001);
        const delta = next - step;
        step = next;
        move(delta);
      },
    });

    return () => {
      trigger.kill();
      timeline.current?.kill();
      timeline.current = null;
      if (frame.current) {
        const source = `url("${photos[current.current].url}")`;
        frame.current.style.setProperty('--flip-top', source);
        frame.current.style.setProperty('--flip-bottom', source);
      }
      gsap.set([topFlap.current, bottomFlap.current].filter(Boolean), { autoAlpha: 0 });
      target.current = current.current;
    };
  }, [move, photos]);

  if (!photos.length) return null;
  const selected = photos[index];

  return (
    <section
      ref={track}
      className="flip-track"
      aria-label={label}
      style={{ paddingBottom: Math.max(0, photos.length - 1) * scrollStep }}
    >
      <div ref={dock} className="flip-dock">
        <button
          className="flip-frame"
          ref={frame}
          aria-label={`Next photo. Current photo: ${selected.alt}`}
          type="button"
          onClick={() => move(1)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }}
          style={{ backgroundImage: `url("${photos[0].url}")` }}
        >
          <span aria-hidden="true" className="flip-face flip-top" />
          <span aria-hidden="true" className="flip-face flip-bottom" />
          <span aria-hidden="true" className="flip-face flip-top flip-top-flap" ref={topFlap} />
          <span aria-hidden="true" className="flip-face flip-bottom flip-bottom-flap" ref={bottomFlap} />
        </button>
      </div>
    </section>
  );
}
