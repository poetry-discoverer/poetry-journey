const SITE=({'poetry-journey':{ls:'poetryJourneyV1',cn:'poetry-offline',sets:['poetry','intensive','analysis','grammar','all']},'learn-tefl':{ls:'learnTeflV1',cn:'tefl-offline',sets:['all']},'tefl-practical':{ls:'learnTeflPracticalV1',cn:'tefl2-offline',sets:['all']}})[location.pathname.split('/')[1]]||{ls:'poetryJourneyV1',cn:'poetry-offline',sets:['poetry','intensive','analysis','grammar','all']};
// رحلة الشعر الإنجليزي — progress + gamification (local, private draft)
const LS_KEY = SITE.ls;
function state(){ try{return JSON.parse(localStorage.getItem(LS_KEY))||{done:{},xp:0,answers:{}}}catch(e){return{done:{},xp:0,answers:{}}} }
function dayKey(d){ d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function touchStreak(s){ const t=dayKey(), y=dayKey(new Date(Date.now()-864e5)); const k=s.streak||(s.streak={n:0,last:'',best:0});
  if(k.last===t) return; k.n=(k.last===y)?k.n+1:1; k.last=t; k.best=Math.max(k.best||0,k.n); }
function levelOf(xp){ const L=Math.floor(Math.sqrt(Math.max(0,xp)/200))+1, lo=200*(L-1)*(L-1), hi=200*L*L; return {L,lo,hi,pct:Math.round((xp-lo)/(hi-lo)*100)}; }
const BADGES=[
 {id:'st3',e:'🔥',t:'٣ أيام ورا بعض',f:s=>(s.streak&&s.streak.best||0)>=3},
 {id:'st7',e:'🔥',t:'أسبوع كامل',f:s=>(s.streak&&s.streak.best||0)>=7},
 {id:'st30',e:'🔥',t:'٣٠ يوم متواصل',f:s=>(s.streak&&s.streak.best||0)>=30},
 {id:'xp100',e:'⭐',t:'١٠٠ نقطة',f:s=>(s.xp||0)>=100},
 {id:'xp500',e:'⭐',t:'٥٠٠ نقطة',f:s=>(s.xp||0)>=500},
 {id:'xp1000',e:'🌟',t:'١٠٠٠ نقطة',f:s=>(s.xp||0)>=1000},
 {id:'xp5000',e:'🏆',t:'٥٠٠٠ نقطة',f:s=>(s.xp||0)>=5000},
 {id:'ls1',e:'📘',t:'أول درس',f:s=>Object.keys(s.done||{}).length>=1},
 {id:'ls5',e:'📚',t:'٥ دروس',f:s=>Object.keys(s.done||{}).length>=5},
 {id:'ls10',e:'🎓',t:'١٠ دروس',f:s=>Object.keys(s.done||{}).length>=10},
 {id:'ls25',e:'🏅',t:'٢٥ درس',f:s=>Object.keys(s.done||{}).length>=25},
 {id:'lv5',e:'🚀',t:'مستوى ٥',f:s=>levelOf(s.xp||0).L>=5},
 {id:'lv10',e:'👑',t:'مستوى ١٠',f:s=>levelOf(s.xp||0).L>=10},
 {id:'goal',e:'🎯',t:'أول هدف يومي',f:s=>!!(s.daily&&s.daily.hit)||!!s.goalHit},
 {id:'exam',e:'🧪',t:'أول امتحان',f:s=>Object.keys(s.exams||{}).length>=1}
];
window.__toasts=window.__toasts||[];
function dailyAdd(s,d){ const t=dayKey(); if(!s.daily||s.daily.d!==t) s.daily={d:t,xp:0,hit:false}; s.daily.xp+=d; if(!s.daily.hit&&s.daily.xp>=(s.goal||200)){ s.daily.hit=true; s.goalHit=true; window.__toasts.push('🎯 خلصت هدف النهارده!'); } }
function awardBadges(s){ s.badges=s.badges||{}; BADGES.forEach(b=>{ if(!s.badges[b.id]&&b.f(s)){ s.badges[b.id]=Date.now(); window.__toasts.push(b.e+' وسام جديد: '+b.t); } }); }
function flushToasts(){ const q=window.__toasts.splice(0); if(!q.length) return; let box=document.getElementById('toasts'); if(!box){ box=document.createElement('div'); box.id='toasts'; box.setAttribute('role','status'); box.setAttribute('aria-live','polite'); document.body.appendChild(box); }
  q.forEach((m,i)=>setTimeout(()=>{ const d=document.createElement('div'); d.className='toast'; d.textContent=m; box.appendChild(d); setTimeout(()=>d.remove(),3800); },i*900)); }
function renderBadges(){ const el=document.getElementById('badges-list'); if(!el) return; const got=state().badges||{};
  el.innerHTML=BADGES.map(b=>'<div class="badge'+(got[b.id]?' on':'')+'" role="img" aria-label="'+b.t+(got[b.id]?'':' (لسه)')+'"><span class="be">'+b.e+'</span><span class="bt">'+b.t+'</span></div>').join(''); }
function a11y(){ try{bidiFix()}catch(e){}
  document.querySelectorAll('.bar:not([role]),.pl-bar:not([role])').forEach(b=>{ const i=b.querySelector('i'); b.setAttribute('role','progressbar'); b.setAttribute('aria-valuemin','0'); b.setAttribute('aria-valuemax','100'); b.setAttribute('aria-label','التقدم'); b.dataset.a11y='1'; });
  document.querySelectorAll('[role=progressbar][data-a11y]').forEach(b=>{ const i=b.querySelector('i'); if(i&&i.style.width) b.setAttribute('aria-valuenow',parseInt(i.style.width)||0); });
  document.querySelectorAll('.pill.xp:not([aria-label])').forEach(e=>e.setAttribute('aria-label','نقاط الخبرة'));
  const LAT=/[A-Za-z]/g, ARB=/[\u0600-\u06FF]/g;
  document.querySelectorAll('main div,main p,main li,main button,main span,main td,main h2,main h3').forEach(e=>{
    if(e.hasAttribute('lang')||e.children.length>0&&!/^(DIV|P|LI|BUTTON)$/.test(e.tagName)) return;
    if(e.children.length>0) return;
    const t=e.textContent||''; const l=(t.match(LAT)||[]).length, a=(t.match(ARB)||[]).length;
    if(l>=3&&a===0){ e.setAttribute('lang','en'); if(e.tagName!=='BUTTON'&&e.tagName!=='SPAN') e.setAttribute('dir','ltr'); }
  });
}

function bidiFix(){
  const T="[A-Za-z0-9'\u2019\\-\\.\\/]*", RUN=new RegExp("[A-Za-z]"+T+"(?:\\s+[A-Za-z0-9]"+T+")*(?:\\s*[\u060c,]\\s*[A-Za-z]"+T+"(?:\\s+[A-Za-z0-9]"+T+")*)*","g");
  const root=document.querySelector('main')||document.body; if(!root) return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ const p=n.parentElement; if(!p||!/[A-Za-z]/.test(n.nodeValue)||!/[\u0600-\u06FF]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT; if(p.closest('script,style,textarea,input,#player,.en,bdi,[dir=ltr],[lang=en],code,pre')) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; }});
  const L=[]; while(w.nextNode()) L.push(w.currentNode);
  L.forEach(n=>{ const t=n.nodeValue; let last=0, m, any=false; const f=document.createDocumentFragment(); RUN.lastIndex=0;
    while((m=RUN.exec(t))){ if(!/[\s\u060c,]/.test(m[0])) continue; any=true; if(m.index>last) f.appendChild(document.createTextNode(t.slice(last,m.index))); const b=document.createElement('bdi'); b.setAttribute('dir','ltr'); b.textContent=m[0].replace(/\s*\u060c\s*/g,', '); f.appendChild(b); last=m.index+m[0].length; }
    if(!any) return; if(last<t.length) f.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(f,n); });
}
let __a11yT=0; function a11yLater(){ clearTimeout(__a11yT); __a11yT=setTimeout(a11y,60); }
if(typeof MutationObserver!=='undefined') addEventListener('DOMContentLoaded',()=>{ a11y(); new MutationObserver(a11yLater).observe(document.body,{childList:true,subtree:true}); });

function save(s){ let prev=0,pst=null; try{ pst=JSON.parse(localStorage.getItem(LS_KEY))||{}; prev=pst.xp||0 }catch(e){} try{ window.PRAISE&&window.PRAISE(pst||{},s) }catch(e){} if((s.xp||0)>prev){ touchStreak(s); dailyAdd(s,(s.xp||0)-prev); } awardBadges(s); localStorage.setItem(LS_KEY, JSON.stringify(s)); }
function isDone(id){ return !!state().done[id]; }

function refreshHeader(){
  const s = state();
  document.querySelectorAll('.xp-val').forEach(el=>el.textContent = s.xp);
  { const k=s.streak||{n:0,last:''}, t=dayKey(), y=dayKey(new Date(Date.now()-864e5)); const live=(k.last===t||k.last===y)?k.n:0;
    document.querySelectorAll('.pill.streak').forEach(el=>{ el.innerHTML='<span class="em">🔥</span> '+(live?'<b>'+live+'</b> '+(live===1?'يوم':'أيام'):'ابدأ سلسلتك'); el.title=live?'سلسلة أيام متتالية. أفضل سلسلة: '+(k.best||live):'ذاكر النهارده وابدأ سلسلة أيام'; });
    const lv=levelOf(s.xp||0); let st=document.getElementById('lvstrip');
    if(!st){ const h=document.querySelector('header.topbar'); if(h){ st=document.createElement('div'); st.id='lvstrip'; st.className='lvstrip'; h.insertAdjacentElement('afterend',st); } }
    if(st){ const g=s.goal||200, dx=(s.daily&&s.daily.d===dayKey())?s.daily.xp:0, dp=Math.min(1,dx/g), C=2*Math.PI*11, bp=(location.pathname.indexOf('/lessons/')>-1?'../':'')+'progress.html#badges', nb=Object.keys(s.badges||{}).length;
      const ring='<svg class="ring" width="30" height="30" viewBox="0 0 28 28" role="img" aria-label="الهدف اليومي: '+Math.min(dx,g)+' من '+g+' نقطة"><circle cx="14" cy="14" r="11" fill="none" stroke="#e5e5e5" stroke-width="4"/><circle cx="14" cy="14" r="11" fill="none" stroke="'+(dp>=1?'#58cc02':'#1cb0f6')+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+(C*dp).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 14 14)"/>'+(dp>=1?'<text x="14" y="18.5" text-anchor="middle" font-size="12" fill="#58cc02" font-weight="900">✓</text>':'')+'</svg>';
      st.innerHTML='<div class="wrap">'+ring+'<span class="lvn">مستوى '+lv.L+'</span><span class="lvbar" role="progressbar" aria-label="التقدم للمستوى التالي" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+lv.pct+'"><i style="width:'+lv.pct+'%"></i></span><span class="lvx">'+(s.xp||0)+' / '+lv.hi+'</span><a class="lvb" href="'+bp+'" aria-label="أوسمتي: '+nb+'">🏅 '+nb+'</a></div>'; } }
  flushToasts(); renderBadges(); a11y();
  document.querySelectorAll('[data-overall]').forEach(el=>{
    const ids = (el.getAttribute('data-overall')||'').split(',').filter(Boolean);
    const done = ids.filter(id=>s.done[id]).length;
    const pct = ids.length ? Math.round(done/ids.length*100) : 0;
    const bar = el.querySelector('.bar>i'); if(bar) bar.style.width = pct+'%';
    const lab = el.querySelector('[data-pct]'); if(lab) lab.textContent = pct+'%';
    const cnt = el.querySelector('[data-count]'); if(cnt) cnt.textContent = done+' من '+ids.length;
  });
}

function setupPath(){
  document.querySelectorAll('.node[data-id]').forEach(n=>{
    const id = n.dataset.id;
    if(isDone(id)){ n.classList.add('done'); n.innerHTML = '✓'; }
  });
  // first not-done node becomes "current"
  const nodes = [...document.querySelectorAll('.node[data-id]')];
  const cur = nodes.find(n=>!isDone(n.dataset.id));
  if(cur && !cur.classList.contains('locked')) cur.classList.add('current');
}

function setupComplete(){
  const btn = document.querySelector('[data-complete]');
  if(!btn) return;
  const id = btn.getAttribute('data-complete');
  if(isDone(id)){ btn.textContent='✅ الدرس متكمل — برافو!'; btn.classList.add('ghost'); }
  btn.addEventListener('click', ()=>{
    const s = state();
    if(!s.done[id]){ s.done[id]=Date.now(); s.xp += 10; save(s); }
    btn.textContent='✅ الدرس متكمل — برافو!'; btn.classList.add('ghost');
    refreshHeader(); confetti();
  });
}

function setupAnswers(){
  document.querySelectorAll('textarea[data-answer]').forEach(t=>{
    const id = t.getAttribute('data-answer');
    const s = state(); if(s.answers[id]) t.value = s.answers[id];
    t.addEventListener('input', ()=>{ const s2=state(); s2.answers[id]=t.value; save(s2); });
  });
}

function confetti(){
  const c = document.getElementById('confetti'); if(!c) return;
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#58cc02','#1cb0f6','#ffc800','#ce82ff','#ff4b4b'];
  const parts = Array.from({length:140},()=>({
    x: innerWidth/2 + (Math.random()-.5)*260, y: innerHeight*0.35,
    vx:(Math.random()-.5)*12, vy:-Math.random()*11-4, g:.32,
    s: Math.random()*8+4, col: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*6.28, vr:(Math.random()-.5)*.3, life: 110+Math.random()*40
  }));
  let frame=0;
  (function tick(){
    ctx.clearRect(0,0,c.width,c.height); frame++;
    let alive=false;
    for(const p of parts){ if(frame>p.life) continue; alive=true;
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.col; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.62); ctx.restore();
    }
    if(alive) requestAnimationFrame(tick); else ctx.clearRect(0,0,c.width,c.height);
  })();
}

const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.08});
document.querySelectorAll('.fade').forEach(el=>io.observe(el));

refreshHeader(); setupPath(); setupComplete(); setupAnswers();

// reveal fallback: never leave content hidden (headless/no-observer cases)
setTimeout(function(){ document.querySelectorAll('.fade:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 700);

document.addEventListener('click',function(e){var r=e.target.closest&&e.target.closest('.node-row');if(!r||e.target.closest("a,button"))return;var a=r.querySelector('a.node');if(a)location.href=a.href;});

;window.CHIP=(function(){
var ctx=null;
function on(){try{var s=state();return s.mute!==true&&s.nosfx!==true}catch(e){return true}}
function ac(){if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ctx&&ctx.state==='suspended')try{ctx.resume()}catch(e){}return ctx}
function k(){try{return(window.CHIP&&CHIP.voice&&CHIP.voice())?0.45:1}catch(e){return 1}}
function n(f,t0,d,type,vol,to){var c=ac();if(!c)return;var o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0,v=(vol||.08)*k();
o.type=type||'square';o.frequency.setValueAtTime(f,t);if(to)o.frequency.linearRampToValueAtTime(to,t+d);
g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+d*.55);g.gain.linearRampToValueAtTime(0.0001,t+d);
o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
var X={
click:function(){n(1400,0,.03,'square',.045)},
jump:function(){n(260,0,.13,'square',.08,640)},
right:function(){n(988,0,.07,'square',.09);n(1319,.07,.36,'square',.09)},
wrong:function(){n(150,0,.08,'square',.11,95);n(82,.08,.14,'triangle',.22)},
xp:function(){n(1760,0,.04,'square',.035)},
power:function(){[523,659,784,1047,1319,1568,2093,2637].forEach(function(f,i){n(f,i*.05,.06,'square',.07)})},
combo:function(c){var s=Math.pow(1.06,Math.min(c||3,8)-3);[523,659,784,1047,1319,1568].forEach(function(f,i){n(f*s,i*.05,.07,'square',.075);n(f*s/2,i*.05,.07,'triangle',.12)})},
done:function(){[[392,0,.1],[523,.12,.1],[659,.24,.1],[784,.36,.22],[659,.62,.1],[784,.74,.1],[1047,.86,.6]].forEach(function(a){n(a[0],a[1],a[2],'square',.08)});
[[196,0,.34],[262,.36,.22],[330,.62,.2],[392,.86,.6]].forEach(function(a){n(a[0],a[1],a[2],'triangle',.2)});n(2093,1.0,.3,'square',.04)}};
var C={on:on,ac:ac,voice:null};
Object.keys(X).forEach(function(nm){C[nm]=function(a){if(!on())return;try{X[nm](a)}catch(e){}}});
function pill(){var st=document.querySelector('.stats');if(!st||document.getElementById('sfxp'))return;var p=document.createElement('button');p.type='button';p.id='sfxp';p.className='pill sfxp';p.setAttribute('role','button');p.setAttribute('aria-label','مؤثرات الصوت');p.style.cursor='pointer';
function lab(){var s=state();p.setAttribute('aria-pressed',s.nosfx===true?'false':'true');p.setAttribute('aria-label',s.nosfx===true?'تشغيل المؤثرات الصوتية':'إيقاف المؤثرات الصوتية');p.innerHTML='<span class="em">'+(s.nosfx===true?'🔇':'🔊')+'</span>'}lab();
p.addEventListener('click',function(e){e.stopPropagation();var s=state();s.nosfx=s.nosfx!==true;save(s);lab();if(s.nosfx!==true){ac();X.right()}});st.insertBefore(p,st.firstChild)}
function ready(f){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else f()}
ready(function(){pill();document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.btn,a.card,a.node,.node-label');if(t&&!t.closest('#player,#qz'))C.click()},true)});
return C})();

;(function(){try{var s=document.currentScript;if(!s)return;var b=s.src.replace(/app\.js.*$/,'');var l=document.createElement('link');l.rel='stylesheet';l.href=b+'search.css';document.head.appendChild(l);var j=document.createElement('script');j.src=b+'search.js';document.head.appendChild(j)}catch(e){}})();

/* per-lesson full MP3 is a static file linked under the PDF button (mp3-link) */

/* update banner: when a newer version of the app is installed, offer one tap to reload */
(function(){
  if(!('serviceWorker' in navigator)||!navigator.serviceWorker.controller) return;
  var shown=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(shown) return; shown=true;
    var b=document.createElement('button'); b.type='button';
    b.textContent='✅ في تحديث جديد للموقع، اضغط هنا للتحديث';
    b.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:90;padding:14px 16px;border:0;border-radius:16px;background:#2f7d00;color:#fff;font:700 1.05rem inherit;font-family:inherit;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer';
    b.onclick=function(){ location.reload(); };
    document.body.appendChild(b);
  });
  try{ navigator.serviceWorker.getRegistration().then(function(r){ if(r) r.update(); }); }catch(e){}
})();

;(function(){
var TG=100,last=0;
var Q=[
["A journey of a thousand miles begins with a single step.","رحلة الألف ميل بتبدأ بخطوة واحدة.","Lao Tzu"],
["Genius is one per cent inspiration, ninety-nine per cent perspiration.","العبقرية واحد في المية إلهام وتسعة وتسعين في المية عرق وشغل.","Thomas Edison"],
["Education is the most powerful weapon which you can use to change the world.","التعليم أقوى سلاح تقدر تغيّر بيه العالم.","Nelson Mandela"],
["The beautiful thing about learning is that no one can take it away from you.","أجمل حاجة في التعلم إن محدش يقدر ياخده منك.","B. B. King"],
["The more that you read, the more things you will know. The more that you learn, the more places you'll go.","كل ما تقرا أكتر هتعرف حاجات أكتر، وكل ما تتعلم أكتر هتروح أماكن أكتر.","Dr. Seuss"],
["Fall seven times, stand up eight.","وقع سبع مرات، وقف تمانية.","Japanese proverb"],
["Success is the sum of small efforts, repeated day in and day out.","النجاح هو مجموع مجهودات صغيرة بتتكرر كل يوم.","Robert Collier"],
["He who strives, finds.","من جدّ وجد.","مثل عربي"]];
var P=['🎉 برافو عليك!','👏 شغل ممتاز!','🔥 كمّل كده!','⭐ أحسنت!'];
function base(){return location.pathname.indexOf('/lessons/')>-1?'../':''}
function st(){try{return JSON.parse(localStorage.getItem(LS_KEY))||{}}catch(e){return {}}}
function tgt(x){var n=(Math.floor((x||0)/TG)+1)*TG;document.querySelectorAll('.pill.xp').forEach(function(p){var t=p.querySelector('.tgt');if(!t){t=document.createElement('span');t.className='tgt';p.appendChild(t)}t.textContent='🎯'+n;t.title='الهدف الجاي: '+n+' نقطة'})}
function snd(){try{if(window.CHIP&&CHIP.on&&!CHIP.on())return;var n,L=0;try{L=+localStorage.getItem('praiseLast')||0}catch(e){}do{n=1+Math.floor(Math.random()*20)}while(n===L);try{localStorage.setItem('praiseLast',n)}catch(e){}var a=new Audio(base()+'assets/praise/praise-'+(n<10?'0':'')+n+'.mp3');a.volume=.9;var p=a.play();if(p&&p.catch)p.catch(function(){})}catch(e){}}
function show(kind,xp){
 if(Date.now()-last<8000)return;last=Date.now();
 var q=Q[Math.floor(Math.random()*Q.length)],h=P[Math.floor(Math.random()*P.length)];
 var msg=kind==='lesson'?'خلّصت الدرس! 🏁':kind==='exam'?'خلّصت الامتحان! 📝':'وصلت '+xp+' نقطة! 🎯';
 var d=document.createElement('div');d.className='praise';d.setAttribute('role','status');d.setAttribute('aria-live','polite');
 d.innerHTML='<button type="button" class="px" aria-label="إغلاق">×</button><div class="ph">'+h+'</div><div class="pm">'+msg+'</div><div class="pq" dir="ltr">“'+q[0]+'”</div><div class="pa">'+q[1]+'</div><div class="pw">— '+q[2]+'</div>';
 var conf=document.createElement('div');conf.className='pconf';conf.setAttribute('aria-hidden','true');
 ['🎉','⭐','✨','🎊','🌟','💫'].forEach(function(e,i){for(var j=0;j<2;j++){var s=document.createElement('span');s.textContent=e;s.style.left=(8+((i*2+j)*7.5))+'%';s.style.animationDelay=(j*.12+i*.05)+'s';conf.appendChild(s)}});
 document.body.appendChild(conf);document.body.appendChild(d);
 var rm=function(){try{d.remove();conf.remove()}catch(e){}};d.querySelector('.px').onclick=rm;setTimeout(rm,6500);snd();}
window.PRAISE=function(p,s){
 try{tgt(s.xp);
 var kd=Object.keys(s.done||{}).length>Object.keys(p.done||{}).length;
 var ke=JSON.stringify(s.exams||{})!==JSON.stringify(p.exams||{})&&Object.keys(s.exams||{}).length>=Object.keys(p.exams||{}).length&&Object.keys(s.exams||{}).length>0;
 var km=Math.floor((s.xp||0)/TG)>Math.floor((p.xp||0)/TG)&&(s.xp||0)>(p.xp||0);
 if(kd)show('lesson');else if(ke)show('exam');else if(km)show('points',Math.floor(s.xp/TG)*TG);}catch(e){}};
function r(){tgt(st().xp);if(/[?&]praisedemo/.test(location.search))setTimeout(function(){show('points',100)},1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',r);else r();
})();

/* welcome-splash */
(function(){try{
if(sessionStorage.getItem('wlc2'))return; sessionStorage.setItem('wlc2','1');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var css='#wlc{position:fixed;inset:0;z-index:99999;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;padding:20px;background:radial-gradient(ellipse at 50% 30%,#2b6df0 0%,#1b2a8a 45%,#0b1040 100%);transition:opacity .6s;perspective:900px;-webkit-tap-highlight-color:transparent}#wlc.out{opacity:0}'
+'#wlc .rays{position:absolute;left:50%;top:34%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.13) 0 6deg,transparent 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%);'+(rm?'':'animation:wspin 40s linear infinite')+'}'
+'#wlc canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'#wlc .wb{position:relative;max-width:440px;width:100%;transform-style:preserve-3d;transition:transform .15s ease-out}'
+'#wlc .star{position:relative;width:130px;height:130px;margin:0 auto 6px;transform-style:preserve-3d;'+(rm?'':'animation:wfly 1.3s cubic-bezier(.2,1.4,.4,1) both,wrot 6s linear 1.3s infinite')+'}'
+'#wlc .star i{position:absolute;inset:0;font-style:normal;font-size:110px;line-height:130px;text-align:center;filter:drop-shadow(0 0 0 transparent)}'
+'#wlc .glow{position:absolute;left:50%;top:0;width:230px;height:230px;margin:-50px 0 0 -115px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,70,.7),transparent 65%);filter:blur(6px);'+(rm?'':'animation:wpulse 2s ease-in-out infinite')+'}'
+'#wlc h2{margin:10px 0 2px;font-size:34px;font-weight:900;color:#ffe27a;text-shadow:0 1px 0 #e0a800,0 2px 0 #c58f00,0 3px 0 #ab7a00,0 4px 0 #916600,0 5px 0 #775300,0 8px 14px rgba(0,0,0,.45);transform:translateZ(40px)}'
+'#wlc .wen{direction:ltr;font-family:Nunito,system-ui,sans-serif;font-weight:800;font-size:18px;margin:0 0 14px;color:#fff;background:none;border:0;padding:0;text-shadow:0 2px 0 rgba(0,0,0,.35),0 6px 12px rgba(0,0,0,.35);transform:translateZ(30px)}'
+'#wlc p{margin:4px 0 0;font-size:21px;font-weight:800;line-height:1.5;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35),0 6px 12px rgba(0,0,0,.35);transform:translateZ(30px)}'
+'#wlc .l{'+(rm?'':'opacity:0;animation:wup .8s cubic-bezier(.2,1.2,.4,1) forwards')+'}'
+'#wlc button{margin-top:22px;border:0;border-radius:18px;background:linear-gradient(#ffe27a,#ffb800);color:#5a3b00;font:inherit;font-weight:900;font-size:19px;padding:14px 34px;box-shadow:0 6px 0 #b27a00,0 14px 24px rgba(0,0,0,.4);cursor:pointer;transform:translateZ(50px);'+(rm?'':'animation:wbtn 1.6s ease-in-out 3s infinite')+'}#wlc button:active{transform:translateZ(50px) translateY(4px);box-shadow:0 2px 0 #b27a00}'
+'#wlc .sk{position:absolute;bottom:14px;left:0;right:0;font-size:12px;opacity:.6;font-family:Nunito,system-ui,sans-serif}'
+'@keyframes wspin{to{transform:rotate(360deg)}}@keyframes wrot{to{transform:rotateY(360deg)}}@keyframes wfly{from{transform:translateY(-120px) scale(.2) rotateY(-540deg);opacity:0}to{transform:none;opacity:1}}@keyframes wup{from{opacity:0;transform:translateY(24px) translateZ(0)}to{opacity:1}}@keyframes wpulse{50%{transform:scale(1.15);opacity:.8}}@keyframes wbtn{50%{transform:translateZ(50px) scale(1.06)}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var d=document.createElement('div');d.id='wlc';d.setAttribute('role','dialog');d.setAttribute('aria-label','ترحيب');
var layers='';for(var k=0;k<14;k++){var z=(k-7)*2.2;layers+='<i style="transform:translateZ('+z+'px);'+(k===13?'':'filter:brightness('+(0.55+k*0.03)+') saturate(1.2)')+'">\u2B50</i>'}
function L(i){return ' class="l" style="animation-delay:'+i+'s"'}
d.innerHTML='<div class="rays"></div><canvas></canvas><div class="wb"><div class="glow"></div><div class="star">'+layers+'</div><h2'+L(.5)+'>أهلًا بيك! يوم جديد بيبدأ</h2><div class="wen l" style="animation-delay:.7s">Welcome! A new day is starting.</div><p'+L(1.1)+'>يلا نذاكر ونوصل لأهدافنا</p><div class="wen l" style="animation-delay:1.3s">Let\u2019s study and reach our goals.</div><p'+L(1.7)+'>وخلّينا نشتغل شغل حلو سوا</p><div class="wen l" style="animation-delay:1.9s">Let\u2019s do good work together.</div><button type="button" class="l" style="animation-delay:2.4s">يلا نبدأ \u00b7 Let\u2019s go \uD83C\uDF89</button></div><div class="sk">tap to skip</div>';
var cv=d.querySelector('canvas'),cx=cv.getContext('2d'),W=0,H=0,P=[],raf=0,alive=true;
function size(){var r=window.devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*r;cv.height=H*r;cx.setTransform(r,0,0,r,0,0)}
var cols=['#ffd23f','#ff5d8f','#3ddc97','#4cc9f0','#ffffff','#ff9f1c','#b388ff'];
function burst(x,y,n,pw){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,s=(Math.random()*.6+.4)*pw;P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-pw*.5,w:6+Math.random()*7,h:3+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],t:0,sp:Math.random()<.25,fl:Math.random()*6})}}
function rain(){if(!alive)return;for(var i=0;i<3;i++)P.push({x:Math.random()*W,y:-10,vx:(Math.random()-.5)*1.5,vy:2+Math.random()*2,w:6+Math.random()*6,h:3+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[(Math.random()*7)|0],t:0,sp:false,fl:Math.random()*6})}
var last=0,rt=0;
function tick(ts){if(!alive)return;raf=requestAnimationFrame(tick);var dt=Math.min(2,(ts-last)/16.7||1);last=ts;rt+=dt;if(rt>6&&P.length<260){rt=0;rain()}
cx.clearRect(0,0,W,H);for(var i=P.length-1;i>=0;i--){var p=P[i];p.vy+=.16*dt;p.vx*=.995;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.fl+=.15*dt;p.t+=dt;
if(p.y>H+20){P.splice(i,1);continue}
cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.globalAlpha=Math.max(0,1-p.t/420);
if(p.sp){cx.shadowColor=p.c;cx.shadowBlur=8;cx.beginPath();cx.arc(0,0,2.2,0,6.3);cx.fill()}else{cx.scale(1,Math.cos(p.fl));cx.fillRect(-p.w/2,-p.h/2,p.w,p.h)}cx.restore()}}
/* celebration sound (synthesized, no files) */
var ac=null,played=false;
function tone(f,t0,dur,type,vol){var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(ac.destination);o.start(t0);o.stop(t0+dur+.05)}
function fanfare(){if(played)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=ac||new AC();if(ac.state==='suspended')ac.resume();if(ac.state!=='running')return;played=true;var t=ac.currentTime+.05;
[523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,t+i*.11,.5,'triangle',.18)});
[1046.5,1318.5,1568,2093].forEach(function(f,i){tone(f,t+.55+i*.07,.9,'sine',.12)});
[523.25,659.25,783.99].forEach(function(f){tone(f,t+.5,1.3,'sawtooth',.05)});
var n=ac.sampleRate*.25,b=ac.createBuffer(1,n,ac.sampleRate),dd=b.getChannelData(0);for(var i=0;i<n;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);var s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;g.gain.value=.25;s.connect(g);g.connect(ac.destination);s.start(t+.5)}catch(e){}}
function celebrate(){var x=W/2;burst(x,H*.3,120,9);setTimeout(function(){burst(W*.2,H*.45,60,8);burst(W*.8,H*.45,60,8)},250);fanfare()}
function close(){if(!d.parentNode)return;alive=false;cancelAnimationFrame(raf);d.classList.add('out');setTimeout(function(){d.remove();st.remove();try{ac&&ac.close()}catch(e){}},600)}
var tilt=d.querySelector('.wb');
function mv(x,y){tilt.style.transform='rotateY('+((x/W-.5)*18)+'deg) rotateX('+(-(y/H-.5)*14)+'deg)'}
d.addEventListener('pointermove',function(e){mv(e.clientX,e.clientY)});
d.addEventListener('click',function(e){if(!played){fanfare();burst(e.clientX,e.clientY,80,8);return}close()});
d.querySelector('button').addEventListener('click',function(e){e.stopPropagation();close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function show(){document.body.appendChild(d);size();addEventListener('resize',size);if(!rm){raf=requestAnimationFrame(tick)}
setTimeout(function(){if(alive){if(!rm)celebrate();else fanfare()}},900);setTimeout(close,9000)}
if(document.body)show();else addEventListener('DOMContentLoaded',show);
}catch(e){}})();
