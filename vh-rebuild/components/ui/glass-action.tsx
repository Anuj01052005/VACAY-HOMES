import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { SilverTrace } from './silver-trace';

export function NavigationArrow() {
  return <span className="navigation-arrow" aria-hidden="true">↗</span>;
}

function Label({children,arrow=false}: {children: ReactNode;arrow?:boolean}) {
  return <><span className="quoted-label">{children}</span>{arrow&&<NavigationArrow/>}</>;
}

export function GlassLink({children, arrow=false, className = '', ...props}: AnchorHTMLAttributes<HTMLAnchorElement>&{arrow?:boolean}) {
  return <a className={`glass glass-action silver-trace ${className}`} {...props}><Label arrow={arrow}>{children}</Label><SilverTrace/></a>;
}

export function GlassButton({children, className = '', ...props}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`glass glass-action silver-trace ${className}`} {...props}><Label>{children}</Label><SilverTrace/></button>;
}
