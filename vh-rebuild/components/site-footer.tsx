import BeamWordmarkFooter from './ui/beam-wordmark-footer';
import {content} from '@/content';
import '@/styles/footer.css';

const stroke={fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
export function SiteFooter({onNotice,onRules}:{onNotice:(message:string)=>void;onRules:()=>void}) {
  const number=content.whatsappNumber.replace(/\D/g,'');
  return <BeamWordmarkFooter className="vacay-footer" brand="VACAY HOMES" company="Vacay Homes" wordmark="VACAY HOMES"
    background="#08090f" ink="#f1ede6" muted="#bab7c7" accent="#a9a8dd" wordTop="#787395" wordFoot="#08090f"
    fontSans="var(--font-interface)" wordWeight={650} cut={.08}
    credits={[{label:'A villa outside Bengaluru.'},{label:'For stays, gatherings and time together.'}]}
    columns={[
      {title:'Our page',links:[{label:'Home',href:'./#home'},{label:'Villa tour',href:'./#discover'},{label:'Properties',href:'./?page=properties'},{label:'Farm',href:'./?page=properties&property=002'},{label:'Terrace',href:'./?page=properties#vacay003'},{label:'Dining',href:'./?page=dining'},{label:'Rules'}]},
      {title:'Explore Farm',links:[...content.property002Films.map(f=>({label:f.label,href:`./?page=properties&property=002#${f.id}`})),{label:'Location',href:content.property002Location}]},
    ]}
    onLinkClick={(label,href)=>{if(label==='Rules')onRules();else if(!href&&label==='Dining')onNotice('Dining is being prepared.')}}
    socials={[
      {label:'WhatsApp',href:`https://wa.me/${number}?text=${encodeURIComponent(content.inquiryMessage)}`,icon:<g {...stroke}><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-4.9a8.5 8.5 0 1 1 15.9-4.1Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 3-4 2-7-1s-5-6-2-8Z"/></g>},
      {label:content.footer.email?'Email':'Email — address coming soon',href:content.footer.email?`mailto:${content.footer.email}`:undefined,icon:<g {...stroke}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></g>},
      {label:'Call +91 8050659721',href:`tel:+${number}`,icon:<path {...stroke} d="m7 3 3 5-2 2c2 3 3 4 6 6l2-2 5 3c-1 5-5 4-10 0S1 7 7 3Z"/>},
      {label:content.footer.instagramUrl?'Instagram':'Instagram — profile coming soon',href:content.footer.instagramUrl||undefined,icon:'instagram'},
    ]}
  />;
}


