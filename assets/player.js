(function(){
const root=document.getElementById('player'); if(!root||!window.STEPS) return;
const S=window.STEPS, LID=window.LESSON_ID, M=window.AUDIO_MANIFEST||{audio:{},pdf:{}};
function st(){ const s=state(); s.steps=s.steps||{}; s.sx=s.sx||{}; s.combo=s.combo||0; return s; }
function sv(s){ save(s); refreshHeader(); }
let idx=Math.min((st().steps[LID]||0),S.length-1); if(idx>=S.length-1) idx=0; // finished lessons restart
let gained=0, back=false;
function xp(n,label){ const s=st(); s.xp+=n; gained+=n; sv(s); sfx('xp'); const d=document.createElement('div'); d.className='pl-xp'; d.textContent='+'+n+(label?' '+label:''); document.body.appendChild(d); setTimeout(()=>d.remove(),1150); }
function once(k,n,label){ const s=st(); if(s.sx[k]) return; s.sx[k]=1; sv(s); xp(n,label); }
// ---- sound: shared <audio> element (unlocked by the first tap) + WebAudio sfx
const A=new Audio(); A.preload='auto';
let unlocked=false, speed=1;
function soundOn(){ return st().mute!==true; }
function stopAudio(){ A.onplay=A.onpause=A.onended=A.ontimeupdate=A.onerror=null; stopWA(); try{A.pause()}catch(e){} document.querySelectorAll('.pl-card.playing').forEach(c=>c.classList.remove('playing')); }
let ctx=null;
function ac(){ if(!ctx){ try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){} } if(ctx&&ctx.state==='suspended') ctx.resume(); return ctx; }
function tone(f,t0,d,type,vol){ const c=ac(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,c.currentTime+t0);
  g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.exponentialRampToValueAtTime(vol||0.18,c.currentTime+t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+d);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+d+0.05); }
function bell(f,t0,d,vol){ tone(f,t0,d,'sine',vol); tone(f*2,t0,d*0.7,'sine',(vol||0.18)*0.45); tone(f*3,t0,d*0.4,'triangle',(vol||0.18)*0.18); }
const SFX={
  click(){ tone(520,0,0.05,'triangle',0.10); tone(780,0.03,0.06,'triangle',0.08); },
  right(){ bell(784,0,0.22,0.2); bell(1047,0.09,0.22,0.2); bell(1568,0.19,0.5,0.2); },
  wrong(){ tone(196,0,0.16,'triangle',0.2); tone(147,0.12,0.34,'triangle',0.2); tone(98,0.12,0.34,'sine',0.14); },
  combo(n){ const base=[784,880,988,1047,1175,1319]; const k=Math.min(n,8)-3; const f0=523*Math.pow(1.122,k);
    [0,4,7,12].forEach((st_,i)=>bell(f0*Math.pow(2,st_/12),i*0.07,0.3,0.18)); bell(f0*2*1.5,0.34,0.6,0.16); },
  done(){ const seq=[[523,0],[659,0.12],[784,0.24],[1047,0.36]]; seq.forEach(([f,t])=>bell(f,t,0.28,0.2)); [523,659,784,1047].forEach(f=>bell(f,0.6,0.9,0.14)); bell(1568,0.75,1.0,0.14); bell(2093,0.9,1.0,0.1); },
  xp(){ tone(1175,0,0.05,'square',0.05); tone(1568,0.05,0.09,'square',0.05); }
};
function sfx(n,a){ if(!soundOn()) return; try{SFX[n](a)}catch(e){} }
const blobs={}, bufs={};
function rawUrl(id){ return M.audio[id]; }
function toBytes(u){ const m=u.match(/^data:([^;,]+)?(;base64)?,(.*)$/s); const bin=atob(m[3]); const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return {a,mime:m[1]||'audio/mpeg'}; }
function clipUrl(id){ const v=rawUrl(id);
  if(/^data:/.test(v)){ if(!blobs[id]){ try{ const r=toBytes(v); blobs[id]=URL.createObjectURL(new Blob([r.a],{type:r.mime})); }catch(e){ blobs[id]=v; } } return blobs[id]; }
  return '../audio/'+v; }
function hasClip(id){ return id && M.audio && M.audio[id]; }
let cur=null; // WebAudio fallback source
function stopWA(){ if(cur){ try{cur.stop()}catch(e){} cur=null; } }
function showErr(card,msg){ if(!card) return; card.classList.remove('playing'); let e=card.querySelector('.pl-err'); if(!e){ e=document.createElement('div'); e.className='pl-err'; const ab=card.querySelector('.pl-audio'); (ab&&ab.parentNode)?ab.parentNode.insertBefore(e,ab.nextSibling):card.insertBefore(e,card.firstChild); } e.innerHTML=msg; }
function clearErr(card){ const e=card&&card.querySelector('.pl-err'); if(e) e.remove(); }
function playWA(id,card){ // fallback: decode with WebAudio
  const c=ac(); if(!c) { showErr(card,'🔇 المتصفح ده مش بيشغّل الصوت. جرّب تفتح الملف في Chrome.'); return; }
  const go=buf=>{ stopWA(); const src=c.createBufferSource(); src.buffer=buf; src.playbackRate.value=speed; src.connect(c.destination); src.onended=()=>{ if(card) card.classList.remove('playing'); }; src.start(0); cur=src; if(card) card.classList.add('playing'); clearErr(card); };
  if(bufs[id]) return go(bufs[id]);
  try{ const r=/^data:/.test(rawUrl(id))?toBytes(rawUrl(id)).a.buffer:null;
    const dec=r?Promise.resolve(r):fetch(clipUrl(id)).then(x=>x.arrayBuffer());
    dec.then(ab=>new Promise((ok,no)=>c.decodeAudioData(ab,ok,no))).then(buf=>{ bufs[id]=buf; go(buf); }).catch(er=>showErr(card,'🔇 الصوت ما اشتغلش على الجهاز ده ('+(er&&er.name||'decode')+'). جرّب Chrome أو اضغط ▶ تاني.'));
  }catch(er){ showErr(card,'🔇 الصوت ما اشتغلش ('+er.message+')'); }
}
function playClip(id,card){
  if(!soundOn()||!hasClip(id)) return;
  stopWA();
  A.onplay=A.onpause=A.onended=A.ontimeupdate=A.onerror=null;
  const btn=card&&card.querySelector('.pl-play'); let failed=false;
  A.src=clipUrl(id); A._id=id; A.playbackRate=speed;
  A.onplay=()=>{ clearErr(card); if(card) card.classList.add('playing'); if(btn) btn.textContent='⏸'; };
  A.onpause=()=>{ if(card) card.classList.remove('playing'); if(btn) btn.textContent='▶'; };
  A.onended=()=>{ if(card) card.classList.remove('playing'); if(btn) btn.textContent='▶'; };
  const bar=card&&card.querySelector('.pl-wave i');
  A.ontimeupdate=()=>{ if(bar&&A.duration) bar.style.width=(A.currentTime/A.duration*100)+'%'; };
  A.onerror=()=>{ if(failed) return; failed=true; playWA(id,card); };
  const pr=A.play();
  if(pr&&pr.catch) pr.catch(er=>{
    if(er&&er.name==='NotAllowedError'){ showErr(card,'🎧 اضغط ▶ عشان الصوت يشتغل (المتصفح بيمنع التشغيل التلقائي قبل أول ضغطة).'); const bb=card&&card.querySelector('.pl-play'); if(bb) bb.classList.add('pulse'); unlocked=false; }
    else if(!failed){ failed=true; playWA(id,card); }
  });
}
function audioBox(id){
  if(!hasClip(id)) return '';
  return '<div class="pl-audio"><button class="pl-play" aria-label="تشغيل">▶</button><div class="pl-wave"><i></i></div><button class="pl-spd">'+(speed===1?'1':speed)+'×</button></div>';
}
function wireAudio(card,id){
  const b=card.querySelector('.pl-play'); if(!b) return; const card0=card;
  const sp=card.querySelector('.pl-spd');
  sp.onclick=()=>{ speed=speed===1?0.8:speed===0.8?1.25:1; sp.textContent=(speed===1?'1':speed)+'×'; A.playbackRate=speed; };
  b.onclick=()=>{ unlocked=true; ac(); if((!A.paused&&!A.ended&&A._id===id)||cur){ stopWA(); A.pause(); if(card0) card0.classList.remove('playing'); b.textContent='▶'; } else { const s0=st(); if(s0.mute){ s0.mute=false; save(s0); } playClip(id,card); } };
  // preload next clips (warm the cache)
  let n=0; for(let j=idx+1;j<S.length&&n<2;j++){ if(hasClip(S[j].a)){ if(!/^data:/.test(M.audio[S[j].a])){ const p=new Audio(clipUrl(S[j].a)); p.preload='auto'; } else clipUrl(S[j].a); n++; } }
}
function esc(t){ return t; }
function render(){
  stopAudio();
  const s=S[idx]; const pct=Math.round(idx/(S.length-1)*100);
  const st0=st(); st0.steps[LID]=idx; save(st0);
  let h='<div class="pl-top"><div class="pl-bar"><i style="width:'+pct+'%"></i></div><div class="pl-count">'+(idx+1)+' / '+S.length+'</div><button class="pl-mute" id="plmute" aria-label="الصوت">'+(soundOn()?'🔊':'🔇')+'</button></div>';
  h+='<div class="pl-card'+(back?' back':'')+(s.t==='section'?' pl-section':'')+(s.t==='end'?' pl-end':'')+'" id="plc">';
  const nxt='<div class="pl-nav">'+(idx>0&&s.t!=='end'?'<button class="pl-back" aria-label="رجوع">→</button>':'')+'<button class="pl-next" id="plnext">التالي</button></div>';
  if(s.t==='learn'){ h+=audioBox(s.a)+'<div class="pl-text">'+s.h+'</div>'+nxt; }
  else if(s.t==='section'){ h+='<div class="big">📄</div><h2>'+s.h.replace(/^(<span class="em">.*?<\/span>\s*)+/,'')+'</h2>'+nxt; }
  else if(s.t==='mc'||s.t==='tf'){
    h+='<div class="pl-q">'+s.q+'</div>';
    const opts=s.t==='tf'?['صح ✅','غلط ❌']:s.opts;
    opts.forEach((o,k)=>{ h+='<button class="pl-opt" data-k="'+k+'">'+o+'</button>'; });
    h+='<div id="plfb"></div>';
  }
  else if(s.t==='recall'){ h+='<div class="pl-q">'+s.q+'</div><div class="pl-hint" style="color:#777;margin-bottom:10px">فكّر في إجابتك الأول، وبعدين اضغط.</div><button class="pl-next" id="plshow" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">شوف الإجابة</button><div id="plfb"></div>'; }
  else if(s.t==='write'){ h+='<div class="pl-q">'+s.q+'</div><textarea class="pl-write" id="plw" placeholder="اكتب إجابتك هنا… بتتحفظ عندك"></textarea>'+nxt; }
  else if(s.t==='end'){
    const pdf=M.pdf&&M.pdf[LID];
    h+='<div class="big">🏆</div><h2>برافو! خلصت الدرس</h2><div class="xps">⭐ كسبت '+gained+' نقطة في الدرس ده</div>';
    h+=pdf?'<a class="pl-btn2" href="../pdf/'+pdf+'" target="_blank" rel="noopener">📄 حمّل PDF الدرس كامل بالتمارين</a>':'<div class="pl-btn2 off">📄 PDF الدرس كامل بالتمارين — قريبًا</div>';
    if(s.teaser) h+='<div class="pl-text" style="font-size:20px;line-height:1.9;margin:8px 0">'+s.teaser+'</div>';
    h+='<button class="pl-next" id="plfin">أنهي الدرس ✅</button><button class="pl-btn2" id="plrest">↺ ابدأ الدرس من الأول</button>';
    if(s.extra) h+='<div class="pl-src">'+s.extra+'</div>';
  }
  h+='</div>';
  root.innerHTML=h; back=false;
  const card=document.getElementById('plc'); wireAudio(card,s.a);
  document.getElementById('plmute').onclick=()=>{ const q=st(); q.mute=soundOn(); save(q); if(q.mute) stopAudio(); else { ac(); sfx('click'); } document.getElementById('plmute').textContent=soundOn()?'🔊':'🔇'; };
  if(s.t==='learn'&&unlocked) playClip(s.a,card);
  if(s.t==='learn'&&!unlocked&&hasClip(s.a)){ const bb=card.querySelector('.pl-play'); if(bb) bb.classList.add('pulse'); const hint=document.createElement('div'); hint.className='pl-tap'; hint.textContent='🎧 اضغط ▶ مرة واحدة وبعدها الصوت هيشتغل لوحده'; card.insertBefore(hint,card.firstChild); }
  const bk=card.querySelector('.pl-back'); if(bk) bk.onclick=()=>{ unlocked=true; sfx('click'); if(idx>0){ idx--; back=true; render(); scrollTo(0,0);} };
  const nb=document.getElementById('plnext');
  if(nb) nb.onclick=()=>{ unlocked=true; ac(); sfx('click');
    if(s.t==='learn') once(LID+':'+idx,2);
    if(s.t==='write'){ const v=document.getElementById('plw').value; const q=st(); q.answers=q.answers||{}; q.answers[s.key]=v; save(q); if(v.trim()) once(LID+':'+idx,3,'كتبت!'); }
    go(1);
  };
  if(s.t==='write'){ const q=st(); const w=document.getElementById('plw'); if(q.answers&&q.answers[s.key]) w.value=q.answers[s.key]; }
  if(s.t==='mc'||s.t==='tf'){
    let tries=0, done=false;
    card.querySelectorAll('.pl-opt').forEach(b=>b.onclick=()=>{
      if(done) return; const k=+b.dataset.k;
      const ok=s.t==='tf'? ((k===0)===s.ans) : (k===s.ans);
      const fb=document.getElementById('plfb');
      unlocked=true; ac(); if(ok){ done=true; b.classList.add('right'); const q=st(); q.combo=(q.combo||0)+1; save(q); if(q.combo>=3&&tries===0) sfx('combo',q.combo); else sfx('right');
        const pts=tries===0?5:2; if(!q.sx[LID+':'+idx]){ q.sx[LID+':'+idx]=1; save(q); xp(pts+(q.combo>=3&&tries===0?2:0), tries===0&&q.combo>=3?'🔥':''); }
        fb.innerHTML='<div class="pl-fb ok">✅ صح! '+(s.why?'<div style="font-size:17px;font-weight:600;margin-top:4px">'+s.why+'</div>':'')+'<button class="pl-next" id="plgo">كمّل</button></div>';
        document.getElementById('plgo').onclick=()=>{ sfx('click'); go(1); };
      } else { sfx('wrong'); tries++; b.classList.add('wrong'); const q=st(); q.combo=0; save(q); fb.innerHTML='<div class="pl-fb no">❌ لأ، جرّب تاني</div>'; setTimeout(()=>{b.classList.remove('wrong');b.style.opacity=.45;b.disabled=true;},420); }
    });
  }
  if(s.t==='recall'){
    document.getElementById('plshow').onclick=()=>{ unlocked=true; ac(); sfx('click');
      document.getElementById('plshow').remove();
      document.getElementById('plfb').innerHTML='<div class="pl-fb info"><div style="font-size:17px;font-weight:600">الإجابة:</div>'+s.a+'<button class="pl-next" id="plknew">عرفتها ✅</button><button class="pl-btn2" id="plreview" style="margin-top:8px">هراجعها 🔁</button></div>';
      document.getElementById('plknew').onclick=()=>{ sfx('right'); once(LID+':'+idx,5); go(1); };
      document.getElementById('plreview').onclick=()=>{ once(LID+':'+idx,1); go(1); };
    };
  }
  if(s.t==='end'){
    document.getElementById('plrest').onclick=()=>{ unlocked=true; sfx('click'); idx=0; gained=0; render(); scrollTo(0,0); };
    document.getElementById('plfin').onclick=()=>{ sfx('done'); const q=st(); if(!q.done[LID]){ q.done[LID]=Date.now(); q.xp+=20; save(q); xp(20,'🎉'); } else sv(q); const b=document.getElementById('plfin'); b.textContent='✅ الدرس متكمل'; b.disabled=true; confetti(); };
    if(st().done[LID]){ const b=document.getElementById('plfin'); b.textContent='✅ الدرس متكمل'; b.disabled=true; }
    else { try{confetti()}catch(e){} setTimeout(()=>sfx('done'),50); }
  }
  refreshHeader();
  if(!document.getElementById('plver')){ const v=document.createElement('div'); v.id='plver'; v.style.cssText='text-align:center;color:#bbb;font-size:12px;margin-top:6px;direction:ltr'; v.textContent='player v7 · audio '+(M.audio&&Object.keys(M.audio).length?Object.keys(M.audio).length+' clips (mp3)':'none'); root.appendChild(v); } else { const v=document.getElementById('plver'); root.appendChild(v); }
}
function go(d){ if(idx+d<0||idx+d>=S.length) return; idx+=d; render(); const t=document.getElementById('plc'); if(t) window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-90)}); }
render();
})();
