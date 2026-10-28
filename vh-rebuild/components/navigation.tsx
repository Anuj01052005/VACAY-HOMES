import { forwardRef, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { content } from '@/content';
import { SilverTrace } from './ui/silver-trace';

export const Navigation = forwardRef<HTMLElement, {hidden?:boolean; opaque?: boolean; onHome?: () => void; onNavigate: (href:string) => void; onInquire: () => void; onNotice: (message: string) => void; onRules:()=>void}>(function Navigation({hidden, opaque, onHome, onNavigate, onInquire, onNotice, onRules}, ref) {
  const [open, setOpen] = useState(false);
  return <header ref={ref} className="navigation glass silver-trace" data-footer-hidden={hidden||undefined} inert={hidden||undefined} aria-hidden={hidden||undefined} data-tone={opaque?'opaque':undefined} aria-label="Main navigation">
    {opaque?<button className="menu-trigger" onClick={()=>{if(history.state?.vacay||history.length>1)history.back();else onNavigate("./#home");}} aria-label="Go back">Back</button>:<Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
      <Dropdown.Trigger className="menu-trigger" aria-label="Menu"><span className="menu-icon" aria-hidden="true"><i/><i/></span><span>Menu</span></Dropdown.Trigger>
      <Dropdown.Portal><Dropdown.Content className="dropdown glass" data-tone={opaque?'opaque':undefined} align="start" sideOffset={16} collisionPadding={12}>
        {content.menu.map(item => <Dropdown.Item key={item.label} className="menu-item glass silver-trace" onSelect={() => {if(item.href)onNavigate(item.href);else onNotice(`${item.label} is being prepared.`);}}>{item.label}<SilverTrace/></Dropdown.Item>)}
        <Dropdown.Item className="menu-item glass silver-trace" onSelect={onRules}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"/></svg>Rules<SilverTrace/></Dropdown.Item>
      </Dropdown.Content></Dropdown.Portal>
    </Dropdown.Root>}
    <a className="nav-brand" href="./#home" onClick={onHome ? event => {event.preventDefault(); onHome();} : undefined}>{content.brand.toUpperCase()}</a>
    <button className="inquire" onClick={onInquire} aria-label="Inquire"><span>Inquire</span>{!opaque&&<svg className="inquire-handset" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 3 3 5-2 2c2 3 3 4 6 6l2-2 5 3c-1 5-5 4-10 0S1 7 7 3Z"/></svg>}</button>
    <SilverTrace/>
  </header>;
});

