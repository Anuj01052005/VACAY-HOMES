import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

type Photo = { url: string; alt: string };
type Direction = -1 | 1;
const gesturePause = 160;

export function FlipGallery({ photos, label }: { photos: readonly Photo[]; label: string }) {
  const [index, setIndex] = useState(0);
  const frame = useRef<HTMLButtonElement>(null);
  const flap = useRef<HTMLSpanElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const current = useRef(0);
  const reduced = useReducedMotion();
  const last = photos.length - 1;

  const turn = useCallback((next: number, direction: Direction) => {
    const stage = frame.current;
    const hinge = flap.current;
    const from = current.current;
    if (!stage || !hinge || animation.current || next === from || !photos[next]) return;

    const source = (position: number) => `url("${photos[position].url}")`;
    const finish = () => {
      stage.style.setProperty('--flip-top', source(next));
      stage.style.setProperty('--flip-bottom', source(next));
      delete stage.dataset.turn;
      hinge.style.visibility = 'hidden';
      current.current = next;
      setIndex(next);
      animation.current = null;
    };

    if (reduced) {
      finish();
      return;
    }

    const forward = direction === 1;
    stage.style.setProperty('--flip-top', source(forward ? next : from));
    stage.style.setProperty('--flip-bottom', source(forward ? from : next));
    stage.style.setProperty('--flip-front', source(from));
    stage.style.setProperty('--flip-back', source(next));
    stage.dataset.turn = forward ? 'forward' : 'backward';
    const perspective = Number.parseFloat(getComputedStyle(stage).getPropertyValue('--flip-depth'));
    gsap.set(hinge, { rotationX: 0, transformPerspective: perspective, visibility: 'visible' });
    animation.current = gsap.to(hinge, {
      rotationX: forward ? -180 : 180,
      duration: .68,
      ease: 'power2.inOut',
      onComplete: finish,
    });
  }, [photos, reduced]);

  const step = useCallback((direction: Direction) => {
    turn(Math.max(0, Math.min(last, current.current + direction)), direction);
  }, [last, turn]);

  useEffect(() => {
    for (const { url } of photos) {
      const image = new Image();
      image.src = url;
      void image.decode().catch(() => {});
    }
    return () => { animation.current?.kill(); animation.current = null; };
  }, [photos]);

  useEffect(() => {
    if (last < 1) return;
    let wheelAt = -Infinity;
    let heldWheel = false;
    let wheelTurned = false;
    let wheelDelta = 0;
    let touch: { y: number; handled: boolean } | undefined;

    const atTop = () => window.scrollY <= 2;
    const canBrowse = (target: EventTarget | null) =>
      atTop() && !document.querySelector('dialog[open], [role="dialog"][data-state="open"]') &&
      !(target instanceof Element && target.closest('input, textarea, select, [contenteditable], [role="menu"]'));
    const consume = (event: Event) => {
      if (!event.cancelable) return false;
      event.preventDefault();
      // Lenis also listens on the window. Keep this gesture with the gallery.
      event.stopImmediatePropagation();
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.deltaY || event.ctrlKey || event.metaKey || !canBrowse(event.target)) return;
      const now = performance.now();
      if (now - wheelAt > gesturePause) {
        heldWheel = false;
        wheelTurned = false;
        wheelDelta = 0;
      }
      wheelAt = now;
      if (event.deltaY > 0 && current.current === last && !animation.current && !heldWheel) return;
      if (!consume(event)) return;
      wheelDelta += event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (!wheelTurned && Math.abs(wheelDelta) >= 12) {
        step(wheelDelta > 0 ? 1 : -1);
        wheelTurned = true;
      }
      heldWheel = true;
    };

    const onTouchStart = (event: TouchEvent) => {
      touch = event.touches.length === 1 && canBrowse(event.target)
        ? { y: event.touches[0].clientY, handled: false } : undefined;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const distance = touch.y - event.touches[0].clientY;
      if (!touch.handled && distance > 0 && current.current === last && !animation.current) {
        touch = undefined;
        return;
      }
      if (consume(event) && !touch.handled && Math.abs(distance) >= 28) {
        touch.handled = true;
        step(distance > 0 ? 1 : -1);
      }
    };
    const resetTouch = () => { touch = undefined; };

    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !canBrowse(event.target)) return;
      const forward = event.key === 'ArrowDown' || event.key === 'PageDown' ||
        (event.key === ' ' && !event.shiftKey && !(event.target instanceof HTMLElement && event.target.closest('button, a')));
      const backward = event.key === 'ArrowUp' || event.key === 'PageUp';
      if (!forward && !backward) return;
      if (forward && current.current === last && !animation.current && !event.repeat) return;
      event.preventDefault();
      if (!event.repeat) step(forward ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', resetTouch, true);
    window.addEventListener('touchcancel', resetTouch, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('touchend', resetTouch, true);
      window.removeEventListener('touchcancel', resetTouch, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [last, step]);

  const selected = photos[index];
  if (!selected) return null;

  return (
    <section className="flip-track" aria-label={label}>
      <button
        className="flip-frame"
        ref={frame}
        aria-label={`Current photo: ${selected.alt}`}
        type="button"
        onClick={() => turn(current.current === last ? 0 : current.current + 1, 1)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          step(event.key === 'ArrowRight' ? 1 : -1);
        }}
        style={{ backgroundImage: `url("${photos[0].url}")` }}
      >
        <span aria-hidden="true" className="flip-stage">
          <span className="flip-face flip-top" />
          <span className="flip-face flip-bottom" />
          <span className="flip-hinge" ref={flap}>
            <span className="flip-face flip-front" />
            <span className="flip-face flip-back" />
          </span>
        </span>
      </button>
    </section>
  );
}
