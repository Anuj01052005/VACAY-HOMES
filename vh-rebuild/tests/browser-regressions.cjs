/* Run with Playwright installed, or set PLAYWRIGHT_MODULE_PATH to its package.
 * BASE_URL selects the live site or local preview. These tests use normal motion.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const engines = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const engine=process.env.BROWSER_ENGINE||'chromium';
const base = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');
const results = [];
const cases = (process.env.CASES || '').split(',').filter(Boolean);
const sleep = (p, ms = 1100) => p.waitForTimeout(ms);
async function scroll(p,delta){
  if(engine==='webkit'&&p.viewportSize().width<768)await p.evaluate(y=>window.scrollBy(0,y),delta);
  else await p.mouse.wheel(0,delta);
}

async function footer(p) {
  await p.locator('.vacay-footer').waitFor({state:'attached'});
  await p.evaluate(()=>document.fonts.ready);
  await sleep(p,200);
  await scroll(p, 100000);
  await p.waitForFunction(() => document.querySelector('.vacay-footer').getBoundingClientRect().top < innerHeight * .45);
  await sleep(p, 200);
}
async function footerLink(p, label) {
  const link=p.getByRole('navigation', {name:'Our page', exact:true}).getByRole('link', {name:label, exact:true});
  if(p.viewportSize().width<768)await link.tap();else await link.click();
  await sleep(p);
  await p.waitForFunction(()=>!document.querySelector('.page-transition')?.dataset.active);
}

(async () => {
  const browser = await engines[engine].launch({headless:true, executablePath:engine==='chromium'?process.env.BROWSER_PATH || undefined:undefined});
  async function check(name, width, run) {
    if(cases.length && !cases.includes(name)) return;
    const p = await browser.newPage({viewport:{width,height:900},hasTouch:width<768,isMobile:width<768});
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    try {
      await run(p);
      assert.deepEqual(errors, [], 'Unexpected page error');
      results.push({name,width,passed:true});
    } catch(e) {
      const media=name.startsWith('tour-')?await p.evaluate(()=>{
        const v=document.querySelector('video');return v?{phase:document.querySelector('.vinyl-stage')?.dataset.phase,ready:v.readyState,network:v.networkState,time:v.currentTime,paused:v.paused,error:v.error?.message,source:v.currentSrc}:null;
      }).catch(()=>null):undefined;
      results.push({name,width,passed:false,error:e.message,...(media?{media}:{})});
      await p.screenshot({path:`qa/regression-${name}-${width}.png`}).catch(()=>{});
    } finally { await p.close(); }
    console.log(JSON.stringify(results.at(-1)));
    fs.writeFileSync('qa/browser-regressions.json', JSON.stringify(results,null,2));
  }
  try {
    for(const width of (process.env.WIDTHS||'390,1440').split(',').map(Number)) {
      await check('theme-contact',width,async p=>{
        await p.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
        await p.goto(`${base}/`,{waitUntil:'domcontentloaded'});
        await p.locator('.nav-brand').waitFor();await p.evaluate(()=>document.fonts.ready);await sleep(p,400);
        assert.equal(await p.locator('meta[name="color-scheme"]').getAttribute('content'),'only dark');
        const palette=()=>p.evaluate(()=>['body','.nav-brand','.title-letter'].map(selector=>{const s=getComputedStyle(document.querySelector(selector));return {color:s.color,fill:s.webkitTextFillColor,background:s.backgroundColor};}));
        const light=await palette();
        await p.emulateMedia({colorScheme:'dark'});await sleep(p,150);
        assert.deepEqual(await palette(),light,'System appearance must not change the site palette');
        if(engine==='chromium'){
          const before=await p.screenshot({animations:'disabled'});
          const session=await p.context().newCDPSession(p);
          await session.send('Emulation.setAutoDarkModeOverride',{enabled:true});await sleep(p,150);
          assert.ok(before.equals(await p.screenshot({animations:'disabled'})),'Browser automatic darkening must preserve the hero pixels');
        }
        assert.equal(await p.getByRole('link',{name:/^Call \+/}).getAttribute('href'),'tel:+919180119721');
        assert.ok((await p.getByRole('link',{name:'WhatsApp',exact:true}).getAttribute('href')).startsWith('https://wa.me/919180119721'));
        await p.getByRole('button',{name:'Inquire',exact:true}).click();
        assert.equal((await p.locator('.inquiry-number').innerText()).trim(),'+919180119721');
      });
      await check('tour-recovery',width,async p=>{
        await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return new Promise(()=>{});};});
        await p.goto(`${base}/vinyl-preview.html`,{waitUntil:'domcontentloaded'});
        const record=p.getByRole('button',{name:'Play the Farm villa tour',exact:true});
        if(width<768)await record.tap();else await record.click();
        await p.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.vinyl-player')).opacity)>.95,null,{timeout:8000});
        assert.ok(await p.getByRole('button',{name:'Play tour',exact:true}).isVisible(),'A blocked video must have an accessible tap-to-play recovery');
        const direct=p.getByRole('link',{name:'Open video directly',exact:true});
        assert.ok(await direct.isVisible());
        const response=await p.request.head(await direct.getAttribute('href').then(href=>new URL(href,base).href));
        assert.equal(response.status(),200);
        await p.getByRole('region',{name:'Farm video tour',exact:true}).getByRole('button',{name:'Close Tour',exact:true}).click();
        await p.waitForFunction(()=>document.querySelector('.vinyl-stage').dataset.phase==='idle');
      });
      for(const gate of ['canplaythrough','frame-callback','tap-permission']) {
        await check(`tour-${gate}`,width,async p => {
          await p.addInitScript(gate => {
            if(gate==='canplaythrough') document.addEventListener('canplaythrough',e=>e.stopImmediatePropagation(),true);
            else if(gate==='frame-callback') {
              HTMLVideoElement.prototype.requestVideoFrameCallback = () => 1;
              HTMLVideoElement.prototype.cancelVideoFrameCallback = () => {};
            }else{
              let directTap=false;
              document.addEventListener('click',()=>{directTap=true;setTimeout(()=>{directTap=false;},0);},true);
              const play=HTMLMediaElement.prototype.play;
              const unlocked=new WeakSet();
              HTMLMediaElement.prototype.play=function(){
                if(directTap)unlocked.add(this);
                if(!unlocked.has(this))return Promise.reject(new DOMException('A direct tap is required','NotAllowedError'));
                return play.call(this);
              };
            }
          },gate);
          await p.goto(`${base}/vinyl-preview.html`,{waitUntil:'domcontentloaded'});
          const record=p.getByRole('button',{name:'Play the Farm villa tour',exact:true});
          if(width<768)await record.tap();else await record.click();
          await p.waitForFunction(() => {
            const player=document.querySelector('.vinyl-player'),video=document.querySelector('video');
            return video&&!video.paused&&video.currentTime>.1&&Number(getComputedStyle(player).opacity)>.95;
          },null,{timeout:12000});
          await p.getByRole('button',{name:'Close Tour',exact:true}).click();
          await p.waitForFunction(()=>document.querySelector('.vinyl-stage').dataset.phase==='idle');
        });
      }
      await check('footer-home-back',width,async p => {
        await p.goto(`${base}/?page=dining`,{waitUntil:'domcontentloaded'});
        await footer(p);
        const from=await p.evaluate(()=>scrollY);
        await scroll(p,90);
        await footerLink(p,'Home');
        assert.equal(new URL(p.url()).search,'');
        assert.ok(await p.evaluate(()=>scrollY<8),'Home must arrive at the top on the first click');
        await p.goBack(); await sleep(p);
        await p.waitForFunction(()=>!document.querySelector('.page-transition')?.dataset.active);
        assert.equal(new URL(p.url()).search,'?page=dining');
        const returned=await p.evaluate(()=>scrollY);
        assert.ok(Math.abs(returned-from)<140,`Back must restore the footer, not the top: ${returned} vs ${from}`);
      });
      if(width<768)await check('footer-late-viewport',width,async p=>{
        await p.addInitScript(()=>{
          const push=history.pushState.bind(history);
          history.pushState=function(state,title,url){
            const previous=history.state?.vacay?.y||0;
            push(state,title,url);
            // Simulate an embedded browser restoring its old native viewport after an SPA update.
            if(previous>0){const restore=()=>{if(document.querySelector('.page-transition')?.dataset.active)setTimeout(restore,50);else window.scrollTo(0,previous);};setTimeout(restore,250);}
          };
        });
        await p.goto(`${base}/?page=dining`,{waitUntil:'domcontentloaded'});
        await footer(p);
        const origin=await p.evaluate(()=>performance.timeOrigin);
        await footerLink(p,'Farm');await sleep(p,600);
        assert.notEqual(await p.evaluate(()=>performance.timeOrigin),origin,'Phone footer links must use a fresh document');
        assert.ok(await p.evaluate(()=>scrollY<8),'A late native viewport restoration must not leave the new page at the footer');
      });
      for(const label of ['Farm','Dining','Terrace']) {
        await check(`footer-${label.toLowerCase()}`,width,async p => {
          await p.goto(`${base}/${label==='Dining'?'':'?page=dining'}`,{waitUntil:'domcontentloaded'});
          await footer(p); await scroll(p,90); await footerLink(p,label);
          if(label==='Terrace') {
            const position=await p.evaluate(()=>({text:document.querySelector('.reveal-property').getBoundingClientRect().top,nav:document.querySelector('.navigation').getBoundingClientRect().bottom}));
            assert.ok(position.text>position.nav+4,`Terrace heading is beneath navigation: ${JSON.stringify(position)}`);
          } else {
            assert.ok(await p.evaluate(()=>scrollY<8),`${label} must arrive at the top, not the footer`);
            assert.equal(await p.locator('h1').innerText(),label==='Farm'?'Farm':'Buffet\nMenu');
            if(label==='Dining')assert.ok(await p.locator('.meal-brush-art .brush-reveal').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).strokeDashoffset)>.95)),'Arriving from the footer must not prepaint the menu');
            if(label==='Farm'){
              await p.getByRole('button',{name:'Go back',exact:true}).click();await sleep(p);
              await p.waitForFunction(()=>!document.querySelector('.page-transition')?.dataset.active);
              assert.equal(new URL(p.url()).search,'?page=dining');
              assert.ok(await p.evaluate(()=>document.querySelector('.vacay-footer').getBoundingClientRect().top<innerHeight*.5),'The navigation Back button must restore the originating footer');
            }
          }
        });
      }
      await check('footer-call-label',width,async p => {
        await p.goto(`${base}/?page=dining`,{waitUntil:'domcontentloaded'}); await footer(p);
        const call=p.getByRole('link',{name:/^Call \+/}); await call.hover(); await sleep(p,300);
        const overlaps=await call.locator('.bwf-tip').evaluate(e=>{
          const s=getComputedStyle(e);if(s.display==='none'||Number(s.opacity)<.1)return false;
          const a=e.getBoundingClientRect(),b=e.closest('.bwf-col').querySelector('.bwf-credits').getBoundingClientRect();
          return a.top<b.bottom&&a.bottom>b.top&&a.left<b.right&&a.right>b.left;
        });
        assert.equal(overlaps,false,'Call label covers the footer copy');
      });
      await check('dining-brush-entry',width,async p => {
        await p.goto(`${base}/?page=dining`,{waitUntil:'domcontentloaded'}); await sleep(p,350);
        const image=p.locator('.meal-brush-art').first();
        const initially=await image.locator('.brush-reveal').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).strokeDashoffset)));
        assert.ok(initially.every(x=>x>.95),'Food brush strokes must start unpainted');
        await image.evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.8,behavior:'instant'}));
        await scroll(p,220);await sleep(p,600);
        const painted=await image.locator('.brush-reveal').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).strokeDashoffset)));
        assert.ok(painted.some(x=>x<.9),'Food must paint as the user scrolls down');
      });
      await check('footer-scroll-stability',width,async p=>{
        for(const route of ['','?page=dining','?page=properties&property=002']){
          await p.goto(`${base}/${route}`,{waitUntil:'domcontentloaded'});
          await p.evaluate(()=>document.fonts.ready);await sleep(p,500);
          await p.evaluate(()=>window.scrollTo({top:Math.max(0,document.querySelector('.vacay-footer').getBoundingClientRect().top+scrollY-innerHeight),behavior:'instant'}));
          await sleep(p,350);
          await p.evaluate(()=>{
            window.scrollSamples=[];
            window.sampleFooter=true;
            const sample=()=>{if(!window.sampleFooter)return;window.scrollSamples.push({y:scrollY,height:document.documentElement.scrollHeight});requestAnimationFrame(sample);};sample();
          });
          for(let i=0;i<5;i++){await scroll(p,130);await sleep(p,220);}
          await sleep(p,900);
          const samples=await p.evaluate(()=>{window.sampleFooter=false;return window.scrollSamples;});
          assert.ok(samples.length>5,'Scroll sampling must run');
          assert.ok(samples.every((s,i)=>i===0||s.y>=samples[i-1].y-2),`Footer must not jump backward on ${route}`);
          assert.ok(Math.max(...samples.map(s=>s.height))-Math.min(...samples.map(s=>s.height))<3,`Footer must not resize during scrolling on ${route}`);
          assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
          await p.screenshot({path:`qa/footer-${route.includes('dining')?'dining':route?'farm':'home'}-${width}.png`});
        }
      });
    }
  } finally { await browser.close(); }
  if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
