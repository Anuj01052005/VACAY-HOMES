import { useEffect, useRef } from 'react';
import { content } from '@/content';
import { GlassButton } from './ui/glass-action';

export function InquiryDialog({open,onClose}:{open:boolean;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    if(open&&!dialog.current?.open){
      dialog.current?.showModal();
      dialog.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
    }
    if(!open&&dialog.current?.open)dialog.current?.close();
  },[open]);
  const number=content.whatsappNumber.replace(/\D/g,'');
  const href=`https://wa.me/${number}?text=${encodeURIComponent(content.inquiryMessage)}`;
  return <dialog ref={dialog} className="inquiry-dialog glass" aria-labelledby="inquiry-title" onCancel={onClose} onClose={onClose}>
    <form onSubmit={event=>{event.preventDefault();if(number){window.open(href,'_blank','noopener,noreferrer');onClose();}}}>
      <h2 id="inquiry-title">Inquire on WhatsApp</h2>
      <p className="inquiry-draft">{content.inquiryMessage}</p>
      <p className="inquiry-number">+{number}</p>
      <div className="inquiry-actions"><GlassButton type="button" onClick={onClose}>Cancel</GlassButton><GlassButton type="submit" disabled={!number}>OK</GlassButton></div>
    </form>
  </dialog>;
}
