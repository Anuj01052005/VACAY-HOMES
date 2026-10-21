import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),dist=path.join(root,'dist');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dist,'content.js'),'utf8'),ctx);const c=ctx.window.VACAY_CONTENT;
assert.equal(c.story.length,3);assert.equal(c.stays.length,2);
assert.equal(c.stays[0].id,'002');assert.equal(c.stays[1].id,'003');
for(const file of fs.readdirSync(dist)){if(file.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(dist,file),'utf8'),{filename:file});}
let links=0;
for(const file of fs.readdirSync(dist).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(path.join(dist,file),'utf8');for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){let ref=m[1].split(/[?#]/)[0];if(/^[a-z]+:/i.test(ref)||!ref)continue;assert(fs.existsSync(path.join(dist,ref)),`${file}: missing ${ref}`);links++;}}
for(const [key,value] of Object.entries(c.images)){if(value.src.startsWith('assets/'))assert(fs.existsSync(path.join(dist,value.src)),`Missing ${key} photo`);}
assert(!JSON.stringify(c).match(/wa\.me|api\.whatsapp/),'No WhatsApp links');
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'assets','manifest.json'),'utf8'));
assert.equal(manifest.generatedMedia,false);assert.equal(manifest.activePinnedTravelVh,400);
console.log(`PASS: JavaScript syntax, content structure, ${links} local links, media manifest and no WhatsApp routing.\nProduction output is the ready-to-serve dist directory; no dependency install or compilation required.`);
