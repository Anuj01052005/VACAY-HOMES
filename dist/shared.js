/* Shared asset rendering and browser-local draft storage. No external upload. */
window.Vacay = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeImage(src) { return typeof src === 'string' && /^(assets\/|\.\/assets\/|blob:|https:\/\/)/.test(src) ? src : ''; }
  function illustration(kind) {
    const shapes = {
      landscape: '<circle class="line" cx="200" cy="110" r="47"/><circle class="fill" cx="200" cy="110" r="47"/><path class="line" d="M-40 320Q75 180 210 280T460 250M-40 342Q75 202 210 302T460 272M-40 365Q75 225 210 325T460 295M-40 388Q75 248 210 348T460 318M-40 410Q75 270 210 370T460 340"/>',
      pool: '<path class="line" d="M-30 150q45-32 90 0t90 0t90 0t90 0t90 0M-30 175q45-32 90 0t90 0t90 0t90 0t90 0M-30 200q45-32 90 0t90 0t90 0t90 0t90 0M-30 225q45-32 90 0t90 0t90 0t90 0t90 0M-30 250q45-32 90 0t90 0t90 0t90 0t90 0M-30 275q45-32 90 0t90 0t90 0t90 0t90 0M-30 300q45-32 90 0t90 0t90 0t90 0t90 0"/><circle class="line" cx="300" cy="80" r="28"/>',
      table: '<ellipse class="line" cx="200" cy="205" rx="118" ry="160"/><ellipse class="line" cx="200" cy="205" rx="105" ry="147"/><circle class="line" cx="200" cy="205" r="61"/><circle class="line" cx="200" cy="205" r="50"/><circle class="fill" cx="200" cy="205" r="50"/><path class="line" d="M110 165v80m-8-80v32q8 15 16 0v-32m175 0v80m-10-80q-15 40 10 45"/><circle class="line" cx="200" cy="85" r="17"/><circle class="line" cx="200" cy="325" r="17"/>',
      arch: '<path class="line" d="M70 420V170a130 130 0 0 1 260 0v250M88 420V170a112 112 0 0 1 224 0v250M107 420V170a93 93 0 0 1 186 0v250M126 420V170a74 74 0 0 1 148 0v250"/><path class="fill" d="M126 420V170a74 74 0 0 1 148 0v250Z"/><path class="line" d="M126 320h148m-148 20h148m-148 20h148m-148 20h148"/>',
      sun: '<circle class="line" cx="200" cy="205" r="90"/><circle class="line" cx="200" cy="205" r="75"/><circle class="fill" cx="200" cy="205" r="75"/><path class="line" d="M200 60v35m0 220v35M55 205h35m220 0h35M98 103l25 25m154 154 25 25m0-204-25 25M123 282l-25 25M144 71l14 34m84 200 14 34M66 149l34 14m200 84 34 14M66 261l34-14m200-84 34-14M144 339l14-34m84-200 14-34"/>'
    };
    return `<svg class="placeholder-art" viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${shapes[kind] || shapes.landscape}</svg>`;
  }
  function placeholder(info, failed = false) {
    return `<div class="photo-placeholder ${escape(info.tone || 'olive')}">${illustration(info.kind)}<span class="placeholder-corner">A LITTLE SPACE FOR YOUR STORY</span><div class="placeholder-label"><span class="frame-icon" aria-hidden="true">+</span><span>${escape(info.label)}</span><em>PHOTO SPACE</em></div>${failed ? '<span class="image-error">Photo unavailable</span>' : ''}<div class="placeholder-meta"><strong>${escape(info.ratio)}</strong><span>${escape(info.hint)}</span></div></div>`;
  }
  function photo(info, eager = false) {
    const wrap = document.createElement('div'); wrap.className = 'photo-frame';
    const src = safeImage(info.src);
    if (!src) { wrap.innerHTML = placeholder(info); return wrap; }
    const img = new Image(); img.alt = info.alt || info.label; img.loading = eager ? 'eager' : 'lazy'; img.decoding = 'async';
    if (eager) img.fetchPriority = 'high';
    img.addEventListener('error', () => { wrap.innerHTML = placeholder(info, true); }, { once:true });
    img.src = src; wrap.append(img); return wrap;
  }
  let dbPromise;
  function db() { return dbPromise ||= new Promise((resolve,reject) => { const r=indexedDB.open('vacay-local-studio',1); r.onupgradeneeded=()=>r.result.createObjectStore('assets',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error); }); }
  async function assetOp(mode, action) { const d=await db(); return new Promise((resolve,reject)=>{ const tx=d.transaction('assets',mode);const request=action(tx.objectStore('assets'));let result;request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error); }); }
  const assets = { all:()=>assetOp('readonly',s=>s.getAll()), put:item=>assetOp('readwrite',s=>s.put(item)), remove:id=>assetOp('readwrite',s=>s.delete(id)) };
  function getDraft() { try { const d = JSON.parse(localStorage.getItem('vacay-draft') || 'null'); return d && d.story && d.images ? d : null; } catch {return null;} }
  function setDraft(value) { localStorage.setItem('vacay-draft',JSON.stringify(value)); }
  function contactValue(type,value) {
    value=String(value || '').trim();
    if(type==='phone') { const normalized=value.replace(/[\s().-]/g,''); return /^\+?\d{7,15}$/.test(normalized)?'tel:'+normalized:null; }
    return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)?'mailto:'+encodeURIComponent(value).replace(/%40/g,'@'):null;
  }
  return {escape,safeImage,photo,placeholder,assets,getDraft,setDraft,contactValue};
})();
