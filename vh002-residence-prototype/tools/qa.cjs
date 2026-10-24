const fs=require('fs'),path=require('path'),assert=require('assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const {chromium}=playwright;
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4176';
(async()=>{
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{}),args:['--disable-features=MediaRouter']});
const errors=[],failed=[];
async function create(viewport,opts={}){const c=await browser.newContext({viewport,deviceScaleFactor:1,...opts});await c.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{}});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url())});return {c,p}}
const {c,p}=await create({width:1440,height:960});
await p.goto(base,{waitUntil:'networkidle'});await p.waitForFunction(()=>window.__VH002_READY__);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
assert(await p.evaluate(()=>__VH002.cinematic),'Desktop cinematic mode enabled');
assert.equal(await p.locator('h1').innerText(),'VACAY\nHomes 002');
assert.equal(await p.locator('a[href*="wa.me"]').count(),0,'No dummy number');
assert.equal(await p.locator('.seasonal').isVisible(),false);
await p.screenshot({path:path.join(out,'desktop-hero.png')});
const metrics=await p.evaluate(()=>{const t=__VH002.timeline.scrollTrigger;return{start:t.start,end:t.end}});
for(const [label,progress,scene] of [['expanding',.12,0],['aerial',.26,0],['entrance',.5,1],['transition',.71,2],['pool',.88,2],['reverse-entrance',.5,1]]){
 await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),metrics.start+(metrics.end-metrics.start)*progress);await p.waitForTimeout(1000);
 assert.equal(await p.evaluate(()=>__VH002.activeScene),scene,label);
 assert.equal(await p.locator('.scene:not([inert])').count(),1,label+' one active scene');
 await p.screenshot({path:path.join(out,'desktop-'+label+'.png')});
}
await p.locator('[data-chapter="2"]').click();await p.waitForTimeout(1800);assert.equal(await p.evaluate(()=>__VH002.activeScene),2,'chapter control');
if(await p.locator('video[data-video="pool"]').evaluate(v=>v.ended)){await p.locator('.film-toggle').click();await p.waitForTimeout(100);assert(!(await p.locator('video[data-video="pool"]').evaluate(v=>v.paused)),'replay control');}
await p.locator('.film-toggle').click();assert(await p.locator('video[data-video="pool"]').evaluate(v=>v.paused),'pause control');
await p.locator('.film-toggle').click();await p.waitForTimeout(300);
for(const [id,name] of [['inside','rooms'],['gather','evening'],['inquire','inquiry']]){await p.locator('#'+id).scrollIntoViewIfNeeded();await p.waitForTimeout(900);await p.screenshot({path:path.join(out,'desktop-'+name+'.png')});}
await p.locator('[data-lightbox="living"]').click();assert(await p.locator('#photo-dialog').isVisible());await p.keyboard.press('Escape');assert(!(await p.locator('#photo-dialog').isVisible()));
await p.locator('.header-cta').click();assert(await p.locator('#contact-dialog').isVisible());assert.match(await p.locator('#contact-dialog').innerText(),/not available yet/);await p.keyboard.press('Escape');
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'desktop overflow');
await p.locator('.footer-motion').click();await p.waitForTimeout(500);assert(await p.evaluate(()=>__VH002.reduced));assert.equal(await p.locator('.pin-spacer').count(),0);assert.equal(await p.locator('.scene[inert]').count(),0);assert(await p.locator('video').evaluateAll(v=>v.every(x=>x.paused)));
const mobiles=[];
for(const viewport of [{width:390,height:844},{width:360,height:640},{width:844,height:390},{width:768,height:1024}]){
 const {c:mc,p:mp}=await create(viewport);
 const requests=[];mp.on('request',r=>{if(r.url().includes('.mp4'))requests.push(r.url())});
 await mp.goto(base,{waitUntil:'networkidle'});await mp.waitForFunction(()=>window.__VH002_READY__);await mp.waitForTimeout(500);
 assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+viewport.width);
 if(viewport.width<768){assert.equal(requests.length,0,'mobile no unsolicited video download');await mp.locator('.menu-button').click();assert(await mp.locator('#mobile-menu').isVisible());await mp.locator('#mobile-menu a[href="#inside"]').click();assert(!(await mp.locator('#mobile-menu').isVisible()));await mp.waitForTimeout(700);await mp.screenshot({path:path.join(out,`mobile-${viewport.width}-rooms.png`)});await mp.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await mp.screenshot({path:path.join(out,`mobile-${viewport.width}-top.png`)});await mp.locator('.scene-aerial').scrollIntoViewIfNeeded();await mp.locator('[data-target-video="arrival"]').click();await mp.waitForTimeout(1800);assert(requests.some(u=>u.includes('arrival-720.mp4')),'mobile variant selected');await mp.screenshot({path:path.join(out,`mobile-${viewport.width}-aerial.png`)});await mp.locator('.mobile-inquiry a').click();assert(await mp.locator('#contact-dialog').isVisible());await mp.keyboard.press('Escape');}
 mobiles.push(viewport);await mc.close();
}
const {c:rc,p:rp}=await create({width:1440,height:960},{reducedMotion:'reduce'});const rr=[];rp.on('request',r=>{if(r.url().includes('.mp4'))rr.push(r.url())});await rp.goto(base,{waitUntil:'networkidle'});await rp.waitForFunction(()=>window.__VH002_READY__);assert(await rp.evaluate(()=>__VH002.reduced));assert.equal(rr.length,0);assert.equal(await rp.locator('.pin-spacer').count(),0);await rp.screenshot({path:path.join(out,'reduced-desktop.png')});await rp.emulateMedia({reducedMotion:'no-preference'});await rp.waitForTimeout(1000);assert(await rp.evaluate(()=>__VH002.cinematic),'live reduced preference reversal');await rc.close();
const {c:nc,p:np}=await create({width:390,height:844},{javaScriptEnabled:false});await np.goto(base);assert.equal(await np.locator('.scene').count(),3);assert(await np.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await np.screenshot({path:path.join(out,'no-js-mobile.png')});await nc.close();
// Verify the future configured path in an isolated browser response. No file mutation and no messages sent.
const {c:wc,p:wp}=await create({width:1440,height:960});await wp.route('**/content.js',async route=>{const src=fs.readFileSync(path.join(root,'content.js'),'utf8').replace("whatsappNumber: ''","whatsappNumber: '919876543210'");await route.fulfill({contentType:'text/javascript',body:src})});await wp.goto(base);await wp.waitForFunction(()=>window.__VH002_READY__);assert.equal(await wp.locator('a[href^="https://wa.me/919876543210"]').count(),3);assert.match(await wp.locator('.inquiry-main').getAttribute('href'),/text=/);await wc.close();
const range=await c.request.get(base+'/assets/arrival-720.mp4',{headers:{Range:'bytes=0-99'}});assert.equal(range.status(),206);assert.equal((await range.body()).length,100);
const forbidden=await c.request.get(base+'/source-reference/entrance-night-original.jpeg');assert.equal(forbidden.status(),403);
assert.deepEqual(errors,[],'browser errors');assert.deepEqual(failed,[],'asset failures');
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,desktop:{width:1440,height:960},mobile:mobiles,checks:['three cinematic scenes forward/reverse','chapter navigation','film pause','actual footage decoding','responsive layouts','mobile opt-in video and 720 rendition','empty contact honest dialog','configured WhatsApp link (intercepted config, no message)','photo modal/Escape','mobile navigation','reduced motion no video/no pin','live preference changes','no-JS content','range requests','no horizontal overflow','no browser errors'],errors,failed},null,2));
console.log('PASS: cinematic, responsive, accessibility and inquiry flow checks.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
