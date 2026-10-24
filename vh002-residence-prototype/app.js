(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const config = window.VACAY_CONTENT;
  if (!config) return;
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = matchMedia('(max-width: 767px)');
  const forcedReduce = new URLSearchParams(location.search).get('reduce') === '1';
  let chosenReduce = false;
  try { chosenReduce = sessionStorage.getItem('vh002-reduce') === 'true'; } catch {}
  let reduced = forcedReduce || reduceQuery.matches || chosenReduce;
  let activeScene = 0, progress = 0, cinematic = false, context, tourTimeline;
  let filmPaused = false, eveningPaused = false, tourVisible = true, eveningVisible = false;
  const mobileAllowed = new Set();
  const videos = $$('video[data-video]');
  const scenes = $$('.scene');
  const visibleScenes = new Set();
  const header = $('#header');

  $$('[data-copy]').forEach(el => { if (typeof config[el.dataset.copy] === 'string') el.textContent = config[el.dataset.copy]; });
  document.title = config.propertyName + ' — A little closer together';
  $$('[data-image]').forEach(img => {
    const item = config.images[img.dataset.image];
    if (!item) return;
    img.src = item.src; img.alt = item.alt;
    img.srcset = `${item.mobile} 800w, ${item.src} 1600w`;
    img.sizes = img.closest('.room') ? '(max-width: 767px) 90vw, 55vw' : '100vw';
  });
  scenes.forEach((scene,i) => {
    const data = config.scenes[i]; if (!data) return;
    $('.scene-label',scene).textContent=data.label;
    $('h2',scene).textContent=data.heading;
    $('.scene-description',scene).textContent=data.text;
  });
  if (config.seasonal.enabled && config.seasonal.message.trim()) {
    $('.seasonal').textContent = config.seasonal.message; $('.seasonal').hidden = false;
  }

  // Empty means empty: no dummy number, no broken wa.me destination, no submission.
  const rawNumber = String(config.whatsappNumber || '').trim();
  const digits = rawNumber.replace(/[\s()+-]/g,'');
  const validNumber = /^\d{8,15}$/.test(digits);
  const contactDialog = $('#contact-dialog');
  $$('[data-inquiry]').forEach(link => {
    if (validNumber) {
      link.href = `https://wa.me/${digits}?text=${encodeURIComponent(config.whatsappMessage)}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
    } else {
      link.href = '#inquire'; link.setAttribute('aria-haspopup','dialog');
      link.addEventListener('click', event => { event.preventDefault(); closeMenu(); contactDialog.showModal(); });
    }
  });
  $('.contact-status').textContent = validNumber ? 'A conversation to plan your visit. No online booking required.' : 'WhatsApp inquiries will be available here soon.';
  $('.dialog-done').addEventListener('click',()=>contactDialog.close());
  $$('dialog').forEach(dialog=>{
    $('.dialog-close',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
    });
  });
  const photoDialog = $('#photo-dialog');
  $$('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{
    const item=config.images[button.dataset.lightbox];
    $('img',photoDialog).src=item.src; $('img',photoDialog).alt=item.alt;
    $('p',photoDialog).textContent=item.alt; photoDialog.showModal();
  }));
  const menu = $('#mobile-menu'), menuButton = $('.menu-button');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');}
  menuButton.addEventListener('click',()=>{
    const open=menuButton.getAttribute('aria-expanded')!=='true';menu.hidden=!open;
    menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  $$('a',menu).forEach(link=>link.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu()});

  function loadVideo(video) {
    const key = mobileQuery.matches ? 'mobile' : 'desktop';
    const src = config.videos[video.dataset.video]?.[key];
    if (!src || video.dataset.loadedSource === src) return;
    video.pause();video.classList.remove('is-playing');
    video.src=src;video.dataset.loadedSource=src;video.load();
  }
  videos.forEach(video=>{
    video.addEventListener('playing',()=>{ video.classList.add('is-playing'); video.dataset.failed='false'; });
    video.addEventListener('ended',updateControls);
    video.addEventListener('error',()=>{video.classList.remove('is-playing');video.dataset.failed='true';updateControls()});
  });
  function setPlay(video,wanted) {
    if(!wanted){video.pause();return;}
    loadVideo(video);
    if(video.ended)return;
    if(video.paused && video.dataset.starting!=='true') {
      video.dataset.starting='true';
      const promise=video.play();
      if(promise) promise.catch(()=>{video.classList.remove('is-playing')}).finally(()=>{video.dataset.starting='false'});
      else video.dataset.starting='false';
    }
  }
  function updateVideos(){
    videos.forEach(video=>{
      const name=video.dataset.video;
      const eligible=!reduced&&!document.hidden;
      let wanted=false;
      if(name==='gazebo') wanted=eveningVisible&&!eveningPaused;
      else if(cinematic)wanted=tourVisible&&((name==='arrival'&&activeScene===0)||(name==='pool'&&activeScene===2))&&!filmPaused;
      else wanted=visibleScenes.has(Number(video.closest('[data-scene]').dataset.scene))&&!filmPaused;
      if(mobileQuery.matches)wanted=wanted&&mobileAllowed.has(name);
      setPlay(video,eligible&&wanted);
    });
    updateControls();
  }
  function updateControls(){
    const currentVideo=$('video',scenes[activeScene]);
    const label=currentVideo?.ended?'Replay film':filmPaused?'Play film':'Pause film';
    $('.film-toggle-text').textContent=activeScene===1?'Still photograph':label;
    $('.film-toggle').disabled=activeScene===1;
    $('.film-toggle').setAttribute('aria-label',activeScene===1?'Entrance is a still photograph':label);
    $('.play-symbol').textContent=filmPaused||currentVideo?.ended?'▷':'Ⅱ';
    $('.evening-toggle').innerHTML=`<span aria-hidden="true">${eveningPaused||mobileQuery.matches&&!mobileAllowed.has('gazebo')?'▷':'Ⅱ'}</span> ${eveningPaused||mobileQuery.matches&&!mobileAllowed.has('gazebo')?'Play film':'Pause film'}`;
    $$('.mobile-film-play').forEach(button=>{
      const name=button.dataset.targetVideo;
      const video=$(`video[data-video="${name}"]`);
      button.textContent=video?.ended?'▷ Replay film':mobileAllowed.has(name)&&!filmPaused?'Ⅱ Pause film':'▷ Play film';
      button.hidden=reduced;
    });
  }
  $('.film-toggle').addEventListener('click',()=>{const video=$('video',scenes[activeScene]);if(video?.ended){video.currentTime=0;filmPaused=false;}else filmPaused=!filmPaused;updateVideos()});
  $('.evening-toggle').addEventListener('click',()=>{
    if(mobileQuery.matches&&!mobileAllowed.has('gazebo')){mobileAllowed.add('gazebo');eveningPaused=false;}
    else eveningPaused=!eveningPaused;
    updateVideos();
  });
  scenes.forEach(scene=>{
    const video=$('video',scene);if(!video)return;
    const button=document.createElement('button');button.className='mobile-film-play';button.dataset.targetVideo=video.dataset.video;button.textContent='▷ Play film';scene.append(button);
    button.addEventListener('click',()=>{const name=video.dataset.video;if(video.ended){video.currentTime=0;mobileAllowed.add(name);filmPaused=false;}else if(mobileAllowed.has(name)&&!filmPaused)mobileAllowed.delete(name);else {mobileAllowed.add(name);filmPaused=false;}updateVideos()});
  });
  const sceneObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{const i=Number(e.target.dataset.scene);if(e.isIntersecting)visibleScenes.add(i);else visibleScenes.delete(i)});if(!cinematic)updateVideos()},{threshold:.18});
  scenes.forEach(scene=>sceneObserver.observe(scene));
  const viewportObserver=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.target.id==='gather')eveningVisible=e.isIntersecting;else tourVisible=e.isIntersecting});updateVideos();
  },{threshold:.05});
  viewportObserver.observe($('.tour-stage'));viewportObserver.observe($('#gather'));
  document.addEventListener('visibilitychange',updateVideos);

  function setActiveScene(index){
    const changed=activeScene!==index;activeScene=index;
    scenes.forEach((scene,i)=>{
      scene.inert=cinematic&&i!==index;
      if(cinematic&&i!==index)scene.setAttribute('aria-hidden','true');else scene.removeAttribute('aria-hidden');
    });
    $$('[data-chapter]').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
    if(changed)updateVideos();
  }
  function applyProgress(value){
    progress=value;
    const index=value<.37?0:value<.68?1:2;
    setActiveScene(index);
    $('.hero-copy').inert=value>.14;
    $('.hero-foot').inert=value>.14;
    $('.chapter-nav').inert=value<.19;
    header.classList.toggle('on-film',value>.17&&tourVisible);
    document.body.dataset.tourScene=String(index);
    document.body.dataset.tourProgress=value.toFixed(3);
  }
  function createMotion(){
    if(context){context.revert();context=null;}
    tourTimeline=null;
    cinematic=!!window.gsap&&!!window.ScrollTrigger&&!mobileQuery.matches&&!reduced;
    document.body.classList.toggle('cinematic',cinematic);
    document.body.classList.toggle('motion-reduced',reduced);
    document.documentElement.style.scrollBehavior=reduced?'auto':'';
    scenes.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden')});
    $('.hero-copy').inert=false;$('.hero-foot').inert=false;
    header.classList.remove('on-film');
    $('.chapter-nav').inert=!cinematic;
    $$('.motion-toggle,.footer-motion').forEach(b=>{b.textContent=forcedReduce||reduceQuery.matches?'Reduced motion enabled':reduced?'Full experience':'Less motion';b.disabled=forcedReduce||reduceQuery.matches});
    if(window.gsap&&window.ScrollTrigger&&!reduced){
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ignoreMobileResize:true});
      context=gsap.context(()=>{
        if(cinematic){
          const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'arrival-tour',trigger:'.tour',start:'top top',end:()=>'+='+Math.round(innerHeight*2.7),pin:'.tour-stage',scrub:.65,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>applyProgress(self.progress),onLeave:()=>header.classList.remove('on-film'),onEnterBack:()=>applyProgress(progress)}});
          tl.addLabel('from-above',0).to('.film-frame',{clipPath:'inset(0% 0% 0% 0% round 0px 0px 0px 0px)',duration:.26,ease:'power1.inOut'},0)
            .to('.hero-copy',{autoAlpha:0,y:-35,duration:.15},.01)
            .to('.hero-foot',{autoAlpha:0,duration:.12},.015)
            .to('.film-controls',{right:'5%',bottom:'16%',duration:.2},.04)
            .to('.scene-aerial .scene-copy',{autoAlpha:1,y:0,duration:.09},.19)
            .to('.chapter-nav',{autoAlpha:1,duration:.07},.2)
            .to('.scene-aerial .scene-copy',{autoAlpha:0,y:-20,duration:.07},.31)
            .addLabel('entrance',.37)
            .to('.scene-entrance',{autoAlpha:1,duration:.12},.34)
            .fromTo('.scene-entrance .scene-photo',{scale:1.01},{scale:1.085,duration:.34},.34)
            .fromTo('.scene-entrance .scene-copy',{y:25,autoAlpha:0},{y:0,autoAlpha:1,duration:.1},.4)
            .to('.scene-entrance .scene-copy',{autoAlpha:0,y:-20,duration:.07},.61)
            .to('.photo-note',{autoAlpha:0,duration:.05},.62)
            .addLabel('outdoors',.68)
            .to('.scene-pool',{autoAlpha:1,duration:.01},.65)
            .to('.scene-pool',{clipPath:'inset(0% 0% 0% 0%)',duration:.14,ease:'power1.inOut'},.65)
            .fromTo('.scene-pool .scene-copy',{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:.1},.75)
            .to('.scene-pool .scene-copy',{y:-8,duration:.15},.85);
          tourTimeline=tl;
          applyProgress(tl.scrollTrigger.progress);
        }
        // Short natural-scroll motion after the tour; no repeated pinned sections.
        gsap.fromTo('.intro-mark',{rotation:-12,autoAlpha:.5},{rotation:0,autoAlpha:1,scrollTrigger:{trigger:'.introduction',start:'top 85%',end:'top 45%',scrub:.7}});
        gsap.fromTo('.room-bedroom',{y:mobileQuery.matches?25:65},{y:0,ease:'none',scrollTrigger:{trigger:'.room-pair',start:'top 85%',end:'bottom 85%',scrub:.7}});
        gsap.fromTo('.evening-media',{scale:1.1},{scale:1,ease:'none',scrollTrigger:{trigger:'.gather',start:'top bottom',end:'bottom top',scrub:.7}});
        gsap.fromTo('.evening-copy',{y:mobileQuery.matches?18:45},{y:0,ease:'none',scrollTrigger:{trigger:'.gather',start:'top 65%',end:'top 5%',scrub:.7}});
      });
    }
    updateVideos();
    if(window.ScrollTrigger)requestAnimationFrame(()=>ScrollTrigger.refresh());
  }
  function toggleMotion(){
    const wasTour=cinematic&&tourVisible;const current=activeScene;
    chosenReduce=!reduced;
    try{sessionStorage.setItem('vh002-reduce',String(chosenReduce))}catch{}
    reduced=forcedReduce||reduceQuery.matches||chosenReduce;
    createMotion();
    if(wasTour)scenes[current].scrollIntoView({behavior:'instant',block:'start'});
  }
  $$('.motion-toggle,.footer-motion').forEach(button=>button.addEventListener('click',toggleMotion));
  reduceQuery.addEventListener('change',()=>{reduced=forcedReduce||reduceQuery.matches||chosenReduce;createMotion()});
  mobileQuery.addEventListener('change',()=>{closeMenu();createMotion()});
  function goToProgress(p){
    if(cinematic&&tourTimeline){const st=tourTimeline.scrollTrigger;window.scrollTo({top:st.start+(st.end-st.start)*p,behavior:reduced?'instant':'smooth'});}
    else scenes[p<.35?0:p<.65?1:2].scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
  }
  $$('[data-tour-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();goToProgress(Number(link.dataset.tourLink))}));
  $$('[data-chapter]').forEach(button=>button.addEventListener('click',()=>goToProgress([.25,.49,.86][Number(button.dataset.chapter)])));
  // Keep keyboard access direct even while the tour is pinned.
  $$('a[href^="#"]').filter(a=>!a.hasAttribute('data-tour-link')&&!a.hasAttribute('data-inquiry')).forEach(link=>link.addEventListener('click',()=>closeMenu()));
  createMotion();
  document.fonts.ready.then(()=>{if(window.ScrollTrigger)ScrollTrigger.refresh()});
  addEventListener('load',()=>{if(window.ScrollTrigger)ScrollTrigger.refresh()});
  window.__VH002 = {config,get progress(){return progress},get activeScene(){return activeScene},get cinematic(){return cinematic},get reduced(){return reduced},get timeline(){return tourTimeline},goToProgress};
  window.__VH002_READY__=true;
})();
