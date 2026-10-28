import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {useReducedMotion} from '@/hooks/use-reduced-motion';
import {GlassButton} from './ui/glass-action';

const rules=[
 ['Guest ID','Send every guest’s photo ID 24 hours before check-in; passports for foreigners and NRIs.'],
 ['Vegetarian only','No non-vegetarian food on the property.'],
 ['Guest limit','Up to 35 guests; extra charges above 16.'],
 ['Prohibited activity fines','Prostitution ₹2,00,000 · narcotics ₹1,50,000 · hookah ₹1,00,000 · crackers ₹75,000.'],
 ['Quiet hours','From 10 PM; music below 55 dB, only in the gazebo, never near the pool.'],
 ['Events','Host approval is required for events.'],
 ['Paid extras','Projector, sports package and campfire cost extra.'],
 ['Safety','No smoke or carbon monoxide alarms. Take care around the BBQ, fire, pool and bar.'],
 ['Check-in','Check in with the building staff.'],
 ['Security deposit','₹10,000; refunded after checkout inspection.'],
 ['Payments','Verify the UPI ID and account name before paying.'],
];
export function RulesDialog({open,onClose}:{open:boolean;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);const reduced=useReducedMotion();
 useEffect(()=>{
  const dialog=ref.current;if(!dialog)return;
  if(open){
   if(!dialog.open)dialog.showModal();
   const list=dialog.querySelector('.rules-list');if(list)list.scrollTop=0;
   const ctx=gsap.context(()=>{
    gsap.fromTo(dialog,{opacity:0,y:reduced?0:12},{opacity:1,y:0,duration:reduced?.15:.35,ease:'power2.out'});
    gsap.fromTo('.rules-list li',{opacity:0,y:reduced?0:8},{opacity:1,y:0,duration:reduced?.15:.35,stagger:reduced?0:.045,ease:'power2.out'});
   },dialog);
   return()=>ctx.revert();
  }
  if(dialog.open)dialog.close();
 },[open,reduced]);
 const close=()=>{gsap.to(ref.current,{opacity:0,y:reduced?0:8,duration:.2,onComplete:onClose});};
 return <dialog ref={ref} className="rules-dialog glass" aria-labelledby="rules-title" onCancel={e=>{e.preventDefault();close();}}>
  <header><div><h2 id="rules-title">Farm</h2><p>House rules</p></div><GlassButton onClick={close} autoFocus aria-label="Close house rules">Close</GlassButton></header>
  <ul className="rules-list" data-lenis-prevent>{rules.map(([title,text])=><li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ul>
 </dialog>;
}

