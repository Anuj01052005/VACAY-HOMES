(async () => {
  'use strict';
  const V = window.Vacay, e=V.escape, objectURLs=[];
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';
  const content = isPreview ? (V.getDraft() || window.VACAY_CONTENT) : window.VACAY_CONTENT;
  if(isPreview){
    try { for(const asset of await V.assets.all()){ const url=URL.createObjectURL(asset.blob);objectURLs.push(url); if(asset.id==='logo') content.brand.logo=url; else if(content.images[asset.id]) content.images[asset.id].src=url; } } catch { /* Content and default frames remain usable if browser storage is disabled. */ }
    const badge=document.createElement('div');badge.className='draft-badge';badge.textContent='LOCAL DRAFT PREVIEW';document.body.append(badge);
  }
  document.querySelectorAll('[data-content]').forEach(el=>{ const value=el.dataset.content.split('.').reduce((o,k)=>o?.[k],content);if(typeof value==='string')el.textContent=value; });
  document.querySelectorAll('[data-brand]').forEach(el=>{if(V.safeImage(content.brand.logo)){ const img=new Image();img.src=content.brand.logo;img.alt=content.brand.logoAlt;img.onerror=()=>{el.textContent=content.brand.name;};el.replaceChildren(img); }});
  document.querySelectorAll('[data-photo]').forEach(el=>{el.append(V.photo(content.images[el.dataset.photo]));});
  const sceneHost=document.querySelector('#story-scenes');
  content.story.forEach((s,i)=>{
    const section=document.createElement('section');section.className='story-scene'+(i===0?' is-active':'');section.dataset.scene=i;section.setAttribute('aria-labelledby',`scene-heading-${i}`);
    section.innerHTML=`<div class="story-copy"><p class="eyebrow">${e(s.label)}</p><${i===0?'h1':'h2'} id="scene-heading-${i}">${e(s.heading)}</${i===0?'h1':'h2'}><p class="story-description">${e(s.text)}</p><a class="button light" href="${e(s.href.startsWith('#')?s.href:'#stays')}">${e(s.cta)} <span aria-hidden="true">↗</span></a></div><div class="story-art"><div class="story-photo"></div><div class="story-caption"><span>${e(s.caption)}</span><span>${e(s.footnote)}</span></div></div>`;
    section.querySelector('.story-photo').append(V.photo(content.images[s.image],i===0));sceneHost.append(section);
    const step=document.createElement('button');step.className='story-step';step.textContent=s.number;step.setAttribute('aria-label',`Go to scene ${i+1}: ${s.label.toLowerCase()}`);step.dataset.index=i;document.querySelector('.story-steps').append(step);
  });
  const grid=document.querySelector('#stay-grid');
  content.stays.forEach(s=>{
    const article=document.createElement('article');article.className='stay-card';article.innerHTML=`<div class="stay-image"><span class="stay-number">VACAY ${e(s.id)}</span></div><div class="stay-body"><p class="stay-location">${e(s.location)}</p><div class="stay-name"><h3>${e(s.name)}</h3><span aria-hidden="true">↗</span></div><p class="stay-description">${e(s.description)}</p><ul class="stay-facts">${s.facts.map(f=>`<li>${e(f)}</li>`).join('')}</ul><button class="text-link" data-stay="${e(s.id)}">${e(s.cta)} <span aria-hidden="true">↗</span></button></div>`;article.querySelector('.stay-image').append(V.photo(content.images[s.image]));grid.append(article);
  });
  document.querySelector('#experience-features').innerHTML=content.experience.features.map((f,i)=>`<div class="feature"><span class="feature-number">0${i+1}</span><div><h3>${e(f.title)}</h3><p>${e(f.text)}</p></div></div>`).join('');
  document.querySelector('#moment-tags').innerHTML=content.moments.tags.map(t=>`<span>${e(t)}</span>`).join('');
  document.querySelector('#faq-list').innerHTML=content.faq.map(f=>`<details><summary>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('');
  const contact=document.querySelector('#contact-details');
  ['phone','email'].forEach(type=>{const value=content.contact[type],href=V.contactValue(type,value),block=document.createElement('div');block.className='contact-item';block.innerHTML=`<span class="contact-label">${type==='phone'?'GIVE US A CALL':'DROP US A NOTE'}</span>${href?`<a href="${e(href)}">${e(value)} <span aria-hidden="true">↗</span></a>`:`<span class="empty-contact">${type==='phone'?'Phone number':'Email address'} coming soon</span><small>Contact details will be added here.</small>`}`;contact.append(block);});
  const menu=document.querySelector('.menu-toggle'), mobileNav=document.querySelector('#mobile-nav');
  function closeMenu(){mobileNav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
  menu.addEventListener('click',()=>{const open=mobileNav.hidden;mobileNav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  mobileNav.addEventListener('click',ev=>{if(ev.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!mobileNav.hidden){closeMenu();menu.focus();}});
  const dialog=document.querySelector('#stay-dialog');let dialogTrigger;
  document.querySelectorAll('[data-stay]').forEach(btn=>btn.addEventListener('click',()=>{const s=content.stays.find(s=>s.id===btn.dataset.stay);dialogTrigger=btn;document.querySelector('#dialog-label').textContent='VACAY '+s.id+' · '+s.location;document.querySelector('#dialog-title').textContent=s.name;document.querySelector('#dialog-text').textContent=s.details;document.querySelector('#dialog-note').textContent=s.note;document.querySelector('#dialog-amenities').innerHTML=s.amenities.map(a=>`<li>${e(a)}</li>`).join('');dialog.showModal();document.body.classList.add('modal-open');}));
  document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialogTrigger?.focus({preventScroll:true});});
  document.querySelector('#dialog-contact').addEventListener('click',()=>{dialog.close();setTimeout(()=>document.querySelector('#contact-heading').scrollIntoView(),0);});
  // Native scroll, 4 viewport heights of active travel. Each scene owns a beat.
  // No frame sequence is loaded: these are deliberate still-image holds and transforms.
  const story=document.querySelector('.story'),stage=document.querySelector('.story-stage'),scenes=[...document.querySelectorAll('.story-scene')],steps=[...document.querySelectorAll('.story-step')];
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)'),smallHeightQuery=matchMedia('(max-height: 700px)');
  const starts=[0,1.45,2.9], hold=1.1, transition=.35,total=4;
  let raf=0,staticMode=false,startY=0,travel=1,lastActive=-1;
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));const smooth=x=>x*x*(3-2*x);
  function setStatic(){staticMode=motionQuery.matches||navigator.connection?.saveData===true||(navigator.deviceMemory>0&&navigator.deviceMemory<=2)||smallHeightQuery.matches;document.body.classList.toggle('static-story',staticMode);scenes.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');s.style.cssText='';});lastActive=-1;measure();}
  function measure(){startY=story.getBoundingClientRect().top+scrollY-document.querySelector('.site-header').offsetHeight;travel=Math.max(1,story.offsetHeight-stage.offsetHeight);requestTick();}
  function render(){raf=0;if(staticMode)return;const time=clamp((scrollY-startY)/travel)*total;let active=0;
    scenes.forEach((s,i)=>{const start=starts[i];let opacity=1,y=0;if(i>0&&time<start){const p=clamp((time-(start-transition))/transition);opacity=smooth(p);y=(1-p)*32;}else if(i<2&&time>start+hold){const p=clamp((time-start-hold)/transition);opacity=1-smooth(p);y=-p*24;}if(time<start-transition||time>start+hold+transition&&i<2)opacity=0;
      const local=clamp((time-start)/hold),isVisible=opacity>.001;const readable=opacity>=.55;
      s.style.opacity=String(opacity);s.style.visibility=isVisible?'visible':'hidden';s.style.pointerEvents=readable?'auto':'none';s.style.setProperty('--copy-opacity',String(smooth(clamp((opacity-.5)*2))));s.style.setProperty('--copy-y',`${y}px`);s.style.setProperty('--art-y',`${-y*.5}px`);s.style.setProperty('--art-scale',String(1+Math.min(local,.7)*.018));s.style.setProperty('--photo-scale',String(1.015+Math.min(local,.7)*.035));
      s.inert=!readable;s.setAttribute('aria-hidden',String(!readable));if(readable)active=i;
    });
    if(active!==lastActive){steps.forEach((s,i)=>{if(i===active)s.setAttribute('aria-current','step');else s.removeAttribute('aria-current');});lastActive=active;}
  }
  function requestTick(){if(!raf)raf=requestAnimationFrame(render);}
  steps.forEach((btn,i)=>btn.addEventListener('click',()=>window.scrollTo({top:startY+(starts[i]+.12)/total*travel,behavior:motionQuery.matches?'instant':'smooth'})));
  const onResize=()=>{if(innerWidth>700)closeMenu();measure();};
  window.addEventListener('scroll',requestTick,{passive:true});window.addEventListener('resize',onResize);motionQuery.addEventListener('change',setStatic);smallHeightQuery.addEventListener('change',setStatic);
  const ro=new ResizeObserver(measure);ro.observe(story);ro.observe(stage);setStatic();document.fonts.ready.then(measure);
  window.addEventListener('pageshow',requestTick);
  window.addEventListener('pagehide',ev=>{if(ev.persisted)return;cancelAnimationFrame(raf);ro.disconnect();window.removeEventListener('scroll',requestTick);window.removeEventListener('resize',onResize);motionQuery.removeEventListener('change',setStatic);smallHeightQuery.removeEventListener('change',setStatic);objectURLs.forEach(URL.revokeObjectURL);});
  window.__VACAY_READY__=true;
})();
