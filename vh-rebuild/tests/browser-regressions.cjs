/* Run with Playwright installed, or set PLAYWRIGHT_MODULE_PATH to its package.
 * BASE_URL selects the live site or local preview. These tests use normal motion.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/$/, '');
const results = [];
const cases = (process.env.CASES || '').split(',').filter(Boolean);
const sleep = (p, ms = 1100) => p.waitForTimeout(ms);

async function footer(p) {
  await p.mouse.wheel(0, 100000);
  await p.waitForFunction(() => document.querySelector('.vacay-footer').getBoundingClientRect().top < innerHeight * .45);
  await sleep(p, 200);
}
async function footerLink(p, label) {
  await p.getByRole('navigation', {name:'Our page', exact:true}).getByRole('link', {name:label, exact:true}).click({force:true});
  await sleep(p);
  await p.waitForFunction(()=>!document.querySelector('.page-transition')?.dataset.active);
}

(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH || undefined});
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
      results.push({name,width,passed:false,error:e.message});
      await p.screenshot({path:`qa/regression-${name}-${width}.png`}).catch(()=>{});
    } finally { await p.close(); }
    console.log(JSON.stringify(results.at(-1)));
    fs.writeFileSync('qa/browser-regressions.json', JSON.stringify(results,null,2));
  }
  try {
    for(const width of [390,1440]) {
      for(const gate of ['canplaythrough','frame-callback']) {
        await check(`tour-${gate}`,width,async p => {
          await p.addInitScript(gate => {
            if(gate==='canplaythrough') document.addEventListener('canplaythrough',e=>e.stopImmediatePropagation(),true);
            else {
              HTMLVideoElement.prototype.requestVideoFrameCallback = () => 1;
              HTMLVideoElement.prototype.cancelVideoFrameCallback = () => {};
            }
          },gate);
          await p.goto(`${base}/vinyl-preview.html`,{waitUntil:'domcontentloaded'});
          await p.getByRole('button',{name:'Play the Farm villa tour',exact:true}).click();
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
        await p.mouse.wheel(0,90);
        await footerLink(p,'Home');
        assert.equal(new URL(p.url()).search,'');
        assert.ok(await p.evaluate(()=>scrollY<8),'Home must arrive at the top on the first click');
        await p.goBack(); await sleep(p);
        await p.waitForFunction(()=>!document.querySelector('.page-transition')?.dataset.active);
        assert.equal(new URL(p.url()).search,'?page=dining');
        const returned=await p.evaluate(()=>scrollY);
        assert.ok(Math.abs(returned-from)<140,`Back must restore the footer, not the top: ${returned} vs ${from}`);
      });
      for(const label of ['Farm','Dining','Terrace']) {
        await check(`footer-${label.toLowerCase()}`,width,async p => {
          await p.goto(`${base}/${label==='Dining'?'':'?page=dining'}`,{waitUntil:'domcontentloaded'});
          await footer(p); await p.mouse.wheel(0,90); await footerLink(p,label);
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
        const call=p.getByRole('link',{name:'Call +91 8050659721',exact:true}); await call.hover(); await sleep(p,300);
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
        await p.mouse.wheel(0,220);await sleep(p,600);
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
          for(let i=0;i<5;i++){await p.mouse.wheel(0,130);await sleep(p,220);}
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
