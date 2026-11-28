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
if(sessionStorage.getItem('wlc2'))return; sessionStorage.setItem('wlc2','1');window.__wlcSplash=true;
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var css='#wlc{position:fixed;inset:0;z-index:99999;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;padding:20px;background:radial-gradient(ellipse at 50% 30%,#2b6df0 0%,#1b2a8a 45%,#0b1040 100%);transition:opacity .6s;perspective:900px;-webkit-tap-highlight-color:transparent}#wlc.out{opacity:0}'
+'#wlc .rays{position:absolute;left:50%;top:34%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.13) 0 6deg,transparent 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%);'+(rm?'':'animation:wspin 40s linear infinite')+'}'
+'#wlc canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'
+'#wlc .wb{position:relative;max-width:440px;width:100%;transform-style:preserve-3d;transition:transform .15s ease-out}'
+'#wlc .star{position:relative;width:150px;height:150px;margin:0 auto 14px;transform-style:preserve-3d;'+(rm?'':'animation:wopen 1.5s cubic-bezier(.2,1.3,.4,1) both,wsway 5s ease-in-out 1.5s infinite')+'}'
+'#wlc .star img{position:absolute;inset:0;width:100%;height:100%;border-radius:32px;display:block}'
+'#wlc .flare{position:absolute;left:50%;top:75px;width:10px;height:10px;margin:-5px;border-radius:50%;background:radial-gradient(circle,#fff,rgba(255,240,170,.8) 40%,transparent 70%);opacity:0;'+(rm?'':'animation:wflare 1.6s ease-out .5s both')+'}'
+'#wlc .ring{position:absolute;left:50%;top:75px;width:150px;height:150px;margin:-75px;border-radius:50%;border:3px solid rgba(255,240,170,.9);opacity:0;'+(rm?'':'animation:wring 1.4s ease-out .7s both')+'}'
+'#wlc .glow2{position:absolute;left:50%;top:75px;width:300px;height:300px;margin:-150px;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,226,122,0),rgba(255,226,122,.45),rgba(255,226,122,0),rgba(255,226,122,.45),rgba(255,226,122,0));-webkit-mask:radial-gradient(circle,#000 20%,transparent 68%);mask:radial-gradient(circle,#000 20%,transparent 68%);'+(rm?'':'animation:wspin 8s linear infinite')+'}'
+'#wlc h2{margin:10px 0 2px;font-size:34px;font-weight:900;color:#ffe27a;text-shadow:0 1px 0 #e0a800,0 2px 0 #c58f00,0 3px 0 #ab7a00,0 4px 0 #916600,0 5px 0 #775300,0 8px 14px rgba(0,0,0,.45);transform:translateZ(40px)}'
+'#wlc .wen{direction:ltr;font-family:Nunito,system-ui,sans-serif;font-weight:800;font-size:18px;margin:0 0 14px;color:#fff;background:none;border:0;padding:0;text-shadow:0 2px 0 rgba(0,0,0,.35),0 6px 12px rgba(0,0,0,.35);transform:translateZ(30px)}'
+'#wlc p{margin:4px 0 0;font-size:21px;font-weight:800;line-height:1.5;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35),0 6px 12px rgba(0,0,0,.35);transform:translateZ(30px)}'
+'#wlc .l{'+(rm?'':'opacity:0;animation:wup .8s cubic-bezier(.2,1.2,.4,1) forwards')+'}'
+'#wlc button{margin-top:22px;border:0;border-radius:18px;background:linear-gradient(#ffe27a,#ffb800);color:#5a3b00;font:inherit;font-weight:900;font-size:19px;padding:14px 34px;box-shadow:0 6px 0 #b27a00,0 14px 24px rgba(0,0,0,.4);cursor:pointer;transform:translateZ(50px);'+(rm?'':'animation:wbtn 1.6s ease-in-out 3s infinite')+'}#wlc button:active{transform:translateZ(50px) translateY(4px);box-shadow:0 2px 0 #b27a00}'
+'#wlc .sk{position:absolute;bottom:14px;left:0;right:0;font-size:12px;opacity:.6;font-family:Nunito,system-ui,sans-serif}'
+'@keyframes wspin{to{transform:rotate(360deg)}}@keyframes wrot{to{transform:rotateY(360deg)}}@keyframes wopen{0%{transform:translateY(40px) scale(.3) rotateX(80deg);opacity:0}60%{opacity:1}100%{transform:none;opacity:1}}@keyframes wsway{0%,100%{transform:rotateY(-22deg) rotateX(4deg)}50%{transform:rotateY(22deg) rotateX(-4deg)}}@keyframes wflare{0%{opacity:0;transform:scale(1)}30%{opacity:1}100%{opacity:0;transform:scale(40)}}@keyframes wring{0%{opacity:.9;transform:scale(.7)}100%{opacity:0;transform:scale(3.2)}}@keyframes wup{from{opacity:0;transform:translateY(24px) translateZ(0)}to{opacity:1}}@keyframes wpulse{50%{transform:scale(1.15);opacity:.8}}@keyframes wbtn{50%{transform:translateZ(50px) scale(1.06)}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var d=document.createElement('div');d.id='wlc';d.setAttribute('role','dialog');d.setAttribute('aria-label','ترحيب');
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var logo=base+'icons/logo-512.png',layers='';for(var k=0;k<10;k++){var z=(k-9)*2.4;layers+='<img alt="" src="'+logo+'" style="transform:translateZ('+z+'px);filter:brightness('+(0.35+k*0.065)+')">'}
function L(i){return ' class="l" style="animation-delay:'+i+'s"'}
d.innerHTML='<div class="rays"></div><canvas></canvas><div class="wb"><div class="glow"></div><div class="glow2"></div><div class="star">'+layers+'<div class="flare"></div><div class="ring"></div></div><h2'+L(.5)+'>أهلًا بيك! يوم جديد بيبدأ</h2><div class="wen l" style="animation-delay:.7s">Welcome! A new day is starting.</div><p'+L(1.1)+'>يلا نذاكر ونوصل لأهدافنا</p><div class="wen l" style="animation-delay:1.3s">Let\u2019s study and reach our goals.</div><p'+L(1.7)+'>وخلّينا نشتغل شغل حلو سوا</p><div class="wen l" style="animation-delay:1.9s">Let\u2019s do good work together.</div><button type="button" class="l" style="animation-delay:2.4s">يلا نبدأ \u00b7 Let\u2019s go \uD83C\uDF89</button></div><div class="sk">tap to skip</div>';
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
function celebrate(){var x=W/2;burst(x,H*.3,120,9);setTimeout(function(){burst(W*.2,H*.45,60,8);burst(W*.8,H*.45,60,8)},250)}
var vs=['basmala.mp3','salawat.mp3','welcome-2.mp3','welcome-3.mp3'].map(function(n){var a=new Audio(base+n);a.preload='auto';a.__nc=1;return a}),started=false,finished=false,sk=d.querySelector('.sk');
function stopVoice(){vs.forEach(function(a,i){if(i===0)return;try{a.pause()}catch(e){}})}
function close(){if(!d.parentNode)return;alive=false;stopVoice();cancelAnimationFrame(raf);d.classList.add('out');setTimeout(function(){d.remove();st.remove();try{ac&&ac.close()}catch(e){}},600)}
function chain(i){if(!alive)return;if(i>=vs.length){finished=true;if(!rm)celebrate();fanfare();setTimeout(close,3500);return}var a=vs[i];a.onended=function(){setTimeout(function(){chain(i+1)},350)};a.play().catch(function(){chain(i+1)})}
function tryStart(){if(started)return;var p=vs[0].play();if(p&&p.then){p.then(function(){started=true;sk.textContent='tap to skip';vs[0].onended=function(){setTimeout(function(){chain(1)},350)}}).catch(function(){sk.textContent='\u0627\u0636\u063A\u0637 \u0641\u064A \u0623\u064A \u0645\u0643\u0627\u0646 \u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0635\u0648\u062A \u00b7 tap for sound'})}else{started=true;vs[0].onended=function(){setTimeout(function(){chain(1)},350)}}}
var tilt=d.querySelector('.wb');
function mv(x,y){tilt.style.transform='rotateY('+((x/W-.5)*18)+'deg) rotateX('+(-(y/H-.5)*14)+'deg)'}
d.addEventListener('pointermove',function(e){mv(e.clientX,e.clientY)});
d.addEventListener('click',function(e){if(!started){tryStart();burst(e.clientX,e.clientY,60,8);return}close()});
d.querySelector('button').addEventListener('click',function(e){e.stopPropagation();close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function show(){document.body.appendChild(d);size();addEventListener('resize',size);if(!rm){raf=requestAnimationFrame(tick)}
setTimeout(function(){if(alive&&!rm)celebrate()},900);tryStart();setTimeout(function(){if(!started)close()},12000);setTimeout(close,45000)}
if(document.body)show();else addEventListener('DOMContentLoaded',show);
}catch(e){}})();

/* basmala-on-entry + credit */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var p=location.pathname;
function credit(){var f=document.querySelector('.footer');if(!f||f.querySelector('.bsm-credit'))return;var c=document.createElement('div');c.className='bsm-credit';c.setAttribute('style','margin-top:6px;font-size:.8rem;opacity:.75');c.textContent='\u0628\u0633\u0645\u0644\u0629 \u0628\u0635\u0648\u062A \u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0639\u0641\u0627\u0633\u064A - everyayah.com';f.appendChild(c)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',credit);else credit();
if(!/(\/|index\.html|offline\.html|studied\.html|progress\.html|review\.html|exam\.html|exams\.html|glossary\.html|track-[^\/]*\.html|module[^\/]*\.html|lessons\/[^\/]*\.html)$/.test(p))return;
var EV=['pointerdown','touchstart','keydown','click'];
function run(){if(window.__wlcSplash)return;var a=new Audio(base+'basmala.mp3');a.preload='auto';var done=false;
function off(){done=true;EV.forEach(function(t){document.removeEventListener(t,go,true)})}
function go(){if(done)return;var q;try{q=a.play()}catch(e){off();return}if(q&&q.then)q.then(off).catch(function(){});else off()}
function arm(){EV.forEach(function(t){document.addEventListener(t,go,true)})}
var q;try{q=a.play()}catch(e){q=null}
if(q&&q.then){q.then(function(){done=true}).catch(arm)}else if(!q){arm()}}
setTimeout(run,60);
}catch(e){}})();

/* force-download */
(function(){try{
var RX=/\.(pdf|xlsx|mp3|zip|docx)(\?|#|$)/i;
function fix(a){if(!a||a.dataset.dlx)return;var h=a.getAttribute('href')||'';if(!RX.test(h))return;a.dataset.dlx='1';a.setAttribute('download','');if(a.getAttribute('target')==='_blank')a.removeAttribute('target');
if(/\.(pdf|xlsx)(\?|#|$)/i.test(h)&&!a.classList.contains('vw')){var b=document.createElement('a');b.className=a.className.replace(/\bmp3-link\b/,'')+' vw';b.dataset.dlx='1';var u=new URL(h,location.href).href;b.href=/\.xlsx/i.test(h)?'https://docs.google.com/viewer?url='+encodeURIComponent(u):u;b.target='_blank';b.rel='noopener';if(a.getAttribute('dir'))b.setAttribute('dir',a.getAttribute('dir'));b.setAttribute('style',(a.getAttribute('style')||'')+';margin-inline-start:8px');b.textContent='\uD83D\uDC41 \u0641\u062A\u062D';a.parentNode.insertBefore(b,a.nextSibling)}}
function all(r){[].forEach.call((r||document).querySelectorAll('a.pdf-link,a.course-pdf,a.course-audio,a.course-sheet,a.mp3-link,a.mm-link'),fix)}
function go(){all();new MutationObserver(function(m){all()}).observe(document.body,{childList:true,subtree:true})}
if(document.body)go();else addEventListener('DOMContentLoaded',go);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.pdf-link');if(a)fix(a)},true);
}catch(e){}})();

/* alhamdulillah-on-completion (Alafasy, ignores mute, silent on failure) */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var last=0,aud=null;
function hamd(){try{var n=Date.now();if(n-last<9000)return;last=n;if(!aud){aud=new Audio(base+'alhamdulillah.mp3');aud.preload='auto'}aud.currentTime=0;var q=aud.play();if(q&&q.catch)q.catch(function(){})}catch(e){}}
window.__hamd=hamd;
function hit(nd){try{if(!nd||nd.nodeType!==1)return false;
if(nd.id==='plfin'||(nd.querySelector&&nd.querySelector('#plfin')))return true;
var s=nd.querySelectorAll?nd.querySelectorAll('div[style*="font-size:64px"]'):[];
for(var i=0;i<s.length;i++){if(/%/.test(s[i].textContent))return true}
if(nd.getAttribute&&/font-size:64px/.test(nd.getAttribute('style')||'')&&/%/.test(nd.textContent))return true}catch(e){}return false}
function start(){try{
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++){if(hit(a[j])){hamd();return}}}}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',function(e){try{var t=e.target;if(t&&t.closest&&(t.closest('#plfin')||t.closest('[data-complete]')))hamd()}catch(x){}},true);
}catch(e){}}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();
function cr(){var c=document.querySelector('.bsm-credit');if(c&&c.textContent.indexOf('\u0627\u0644\u062D\u0645\u062F')<0)c.textContent='\u0627\u0644\u0628\u0633\u0645\u0644\u0629 \u0648\u00AB\u0627\u0644\u062D\u0645\u062F \u0644\u0644\u0647 \u0631\u0628 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0646\u00BB \u0628\u0635\u0648\u062A \u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0639\u0641\u0627\u0633\u064A - everyayah.com'}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(cr,0)});else setTimeout(cr,0);
}catch(e){}})();

/* alhamdulillah-on-exit (best effort: mobile browsers may block audio once hidden) */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var ex=null,fired=0;
var lk=0;['click','pointerdown','touchstart','keydown'].forEach(function(ev){document.addEventListener(ev,function(){lk=Date.now()},true)});
function go(){try{var n=Date.now();if(n-lk<3000)return;if(n-fired<4000)return;fired=n;if(!ex){ex=new Audio(base+'alhamdulillah.mp3')}ex.currentTime=0;var q=ex.play();if(q&&q.catch)q.catch(function(){})}catch(e){}}
function pre(){try{if(!ex){ex=new Audio(base+'alhamdulillah.mp3');ex.preload='auto';ex.load()}}catch(e){}}
setTimeout(pre,1500);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')go()});
}catch(e){}})();

/* salawat on PDF open/download and external links (plays on the click itself, never blocks navigation) */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var a=null,t0=0;
function sal(){try{var n=Date.now();if(n-t0<1500)return;t0=n;if(!a){a=new Audio(base+'salawat.mp3');a.preload='auto'}a.currentTime=0;var q=a.play();if(q&&q.catch)q.catch(function(){})}catch(e){}}
document.addEventListener('click',function(e){try{var l=e.target&&e.target.closest&&e.target.closest('a[href]');if(!l)return;var h=l.getAttribute('href')||'';if(/^(#|javascript:|mailto:|tel:)/i.test(h))return;var u=new URL(l.href,location.href);
var ext=u.origin!==location.origin;var file=/\.(pdf|xlsx|zip)(\?|#|$)/i.test(u.pathname)||/viewer|docs\.google\.com/.test(u.href);
if(ext||file)sal()}catch(x){}},true);
function cr(){var f=document.querySelector('.footer');if(!f||f.querySelector('.sal-credit'))return;var c=document.createElement('div');c.className='sal-credit';c.setAttribute('style','margin-top:4px;font-size:.8rem;opacity:.75');c.textContent='\u0627\u0644\u0635\u0644\u0627\u0629 \u0639\u0644\u0649 \u0627\u0644\u0646\u0628\u064A - archive.org';f.appendChild(c)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(cr,50)});else setTimeout(cr,50);
}catch(e){}})();

/* alhamdulillah on return to home (flag survives the navigation; home page plays it instead of the basmala) */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var root=new URL(base+'../',location.href).pathname;
function isHome(p){return p===root||p===root+'index.html'}
var onHome=isHome(location.pathname);
if(onHome){var fl=null;try{fl=sessionStorage.getItem('hamdHome');sessionStorage.removeItem('hamdHome')}catch(e){}
if(fl&&Date.now()-(+fl)<15000){window.__wlcSplash=true;var go=function(){try{var a=new Audio(base+'alhamdulillah.mp3');var q=a.play();if(q&&q.catch)q.catch(function(){arm()})}catch(e){}};
var EVS=['pointerdown','touchstart','keydown','click'],armed=false;
function arm(){if(armed)return;armed=true;var f=function(){EVS.forEach(function(t){document.removeEventListener(t,f,true)});try{new Audio(base+'alhamdulillah.mp3').play().catch(function(){})}catch(e){}};EVS.forEach(function(t){document.addEventListener(t,f,true)})}
go()}}
else document.addEventListener('click',function(e){try{var l=e.target&&e.target.closest&&e.target.closest('a[href]');if(!l)return;var u=new URL(l.href,location.href);if(u.origin===location.origin&&isHome(u.pathname)&&!l.hasAttribute('download')&&l.target!=='_blank'){try{sessionStorage.setItem('hamdHome',String(Date.now()))}catch(x){}}}catch(x){}},true);
}catch(e){}})();

/* clip queue guard: our four clips never overlap; a clip requested while another plays is skipped (basmala->salawat chains run on 'ended') */
(function(){try{var P=HTMLMediaElement.prototype,op=P.play,cur=null;
P.play=function(){try{var s=this.currentSrc||this.src||'';if(/\/(basmala|salawat|alhamdulillah)\.mp3/.test(s)){
if(cur&&cur!==this&&!cur.ended&&!cur.paused&&cur.currentTime>0){return Promise.resolve()}
var nm=(s.match(/\/(basmala|salawat|alhamdulillah)\.mp3/)||[])[1],L=window.__lastClip;
if(nm==='alhamdulillah'&&L&&(L.n==='basmala'||L.n==='salawat')&&Date.now()-L.t<8000){return Promise.resolve()}
window.__lastClip={n:nm,t:Date.now()};if(!this.__lt){this.__lt=1;this.addEventListener('ended',function(){window.__lastClip={n:nm,t:Date.now()}})}
cur=this;if(/\/(basmala|alhamdulillah)\.mp3/.test(s)&&!this.__ch&&!this.__nc){this.__ch=1;var base=s.replace(/[^\/]*$/,'');this.addEventListener('ended',function(){try{var z=new Audio(base+'salawat.mp3');var q=z.play();if(q&&q.catch)q.catch(function(){})}catch(e){}})}}}catch(e){}return op.apply(this,arguments)}}catch(e){}})();

/* in-app exit button (home page): alhamdulillah through the queue, then close as the platform allows */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var root=new URL(base+'../',location.href).pathname,p=location.pathname;
if(!(p===root||p===root+'index.html'))return;
function mk(){var f=document.querySelector('.footer');if(!f||document.getElementById('exitbtn'))return;
var b=document.createElement('button');b.id='exitbtn';b.type='button';b.textContent='\u062E\u0631\u0648\u062C \uD83D\uDEAA';
b.setAttribute('style','display:block;margin:12px auto 4px;padding:10px 26px;border-radius:14px;border:2px solid #e5e5e5;background:#fff;font:inherit;font-weight:800;cursor:pointer');
b.addEventListener('click',function(){var done=false;function leave(){if(done)return;done=true;try{window.close()}catch(e){}setTimeout(function(){if(!window.closed){b.textContent='\u0627\u0642\u0641\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0645\u0646 \u0632\u0631\u0627\u0631 \u0627\u0644\u0647\u0648\u0645 \u0623\u0648 \u0627\u0644\u062A\u0627\u0628'}},400)}
try{window.__lastClickGuard=1;var a=new Audio(base+'alhamdulillah.mp3');a.addEventListener('ended',function(){setTimeout(leave,3600)});var q=a.play();if(q&&q.catch)q.catch(leave);setTimeout(leave,12000)}catch(e){leave()}});
f.insertBefore(b,f.firstChild)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(mk,80)});else setTimeout(mk,80);
}catch(e){}})();

/* deep search: card-level passages (lesson text, examples, questions, answers), shown under the normal results */
(function(){try{
var base='';try{var sc=[].slice.call(document.scripts).filter(function(x){return /assets\/app\.js/.test(x.src)})[0];base=sc.src.replace(/app\.js.*$/,'')}catch(e){}
var root=base.replace(/assets\/$/,'');
function norm(s){s=String(s||'').toLowerCase().replace(/[\u064b-\u0652\u0670\u0640]/g,'');return s.replace(/[\u0623\u0625\u0622]/g,'\u0627').replace(/\u0649/g,'\u064A').replace(/\u0629/g,'\u0647')}
function toks(q){return norm(q).split(/[^a-z0-9\u0600-\u06ff]+/).filter(function(w){return w.length>1}).map(function(w){return w.length>3&&w.indexOf('\u0627\u0644')===0?w.slice(2):w})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var LT={learn:'\u0634\u0631\u062D',mc:'\u0633\u0624\u0627\u0644',tf:'\u0635\u062D/\u063A\u0644\u0637',recall:'\u062A\u0630\u0643\u0651\u0631',write:'\u0643\u062A\u0627\u0628\u0629'};
var TW={learn:1,mc:.85,tf:.8,recall:.7,write:.7};
var data={},loaded={},loading=false,ready=false;
function scopeK(){var f=location.pathname.split('/').pop()||'index.html',m=f.match(/^track-(.+)\.html$/);if(m)return m[1]==='mythology'?'myth':m[1];if(/^modules?-tefl/.test(f))return 'tefl';if(/\/lessons\//.test(location.pathname))return f.replace('.html','').split('-')[0];return null}
function add(src,ok,no){var s=document.createElement('script');s.src=base+src;s.onload=ok;s.onerror=no;document.head.appendChild(s)}
function load(cb){if(ready)return cb();if(loading){setTimeout(function(){load(cb)},150);return}loading=true;
add('deep-meta.js',function(){var K=window.DEEP_KEYS||[],SK=scopeK(),need=(SK&&K.indexOf(SK)>-1)?[SK]:K,left=need.length;if(!left){loading=false;ready=true;return cb()}
need.forEach(function(k){add('deep-'+k+'.js',function(){if(--left===0){need.forEach(function(x){var d=(window.DEEP||{})[x];if(d){d.P.forEach(function(p){p.n=norm(p.x);p.nh=norm(p.h)});data[x]=d}});ready=true;loading=false;cb()}},function(){if(--left===0){ready=true;loading=false;cb()}})})},function(){loading=false;ready=true;cb()})}
function find(q){var ts=toks(q);if(!ts.length)return [];var nq=norm(q).replace(/\s+/g,' ').trim(),out=[],need=Math.max(1,Math.ceil(ts.length*.6));
Object.keys(data).forEach(function(k){var d=data[k];d.P.forEach(function(p){var hit=0,sc=0;for(var i=0;i<ts.length;i++){var pos=p.n.indexOf(ts[i]);if(pos>-1){hit++;sc+=3;if(pos<40)sc+=1;if(p.nh.indexOf(ts[i])>-1)sc+=1.5;if(p.n.indexOf(ts[i],pos+1)>-1)sc+=.5}else if(d.T[p.i]&&norm(d.T[p.i]).indexOf(ts[i])>-1){hit++;sc+=1.5}}
if(hit<need)return;if(hit===ts.length)sc+=4;if(ts.length>1&&p.n.indexOf(nq)>-1)sc+=8;sc*=TW[p.t]||.8;if(hit<ts.length)sc*=.4;out.push({p:p,s:sc,T:d.T[p.i]})})});
out.sort(function(a,b){return b.s-a.s});var per={},res=[];for(var i=0;i<out.length&&res.length<8;i++){var o=out[i];per[o.p.i]=(per[o.p.i]||0)+1;if(per[o.p.i]<=2)res.push(o)}return {ts:ts,res:res,total:out.length}}
function snippet(p,ts){var n=p.n,x=p.x,pos=-1;for(var i=0;i<ts.length;i++){var q=n.indexOf(ts[i]);if(q>-1&&(pos<0||q<pos))pos=q}if(pos<0)pos=0;var a=Math.max(0,pos-45),b=Math.min(x.length,a+170);a=Math.max(0,Math.min(a,b-170));
var seg=x.slice(a,b),nseg=n.slice(a,b),marks=[];ts.forEach(function(t){var from=0,q;while((q=nseg.indexOf(t,from))>-1){marks.push([q,q+t.length]);from=q+t.length}});marks.sort(function(u,v){return u[0]-v[0]});var h='',last=0;marks.forEach(function(m){if(m[0]<last)return;h+=esc(seg.slice(last,m[0]))+'<mark>'+esc(seg.slice(m[0],m[1]))+'</mark>';last=m[1]});h+=esc(seg.slice(last));return (a?'\u2026 ':'')+h+(b<x.length?' \u2026':'')}
var wrap,inp,box,busy=false,cur='';
function render(){var q=inp.value.trim();cur=q;var old=box.querySelector('#srdeep');if(old)old.remove();if(!q||q.length<2)return;
load(function(){if(inp.value.trim()!==q)return;var r=find(q);var old2=box.querySelector('#srdeep');if(old2)old2.remove();if(!r.res.length)return;
var h='<div id="srdeep"><div class="sr-h">\u062C\u0648\u0647 \u0627\u0644\u062F\u0631\u0648\u0633 \u2022 \u0646\u062A\u0627\u064A\u062C \u0628\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644'+(r.total>r.res.length?' ('+r.total+')':'')+'</div>';
r.res.forEach(function(o){var p=o.p;h+='<a class="sr-it sr-deep" href="'+root+'lessons/'+p.i+'.html#s='+p.s+'&q='+encodeURIComponent(r.ts.join(' '))+'"><b>'+esc(o.T||p.i)+'</b><span class="sr-k">'+(p.h?esc(p.h)+' \u00B7 ':'')+(LT[p.t]||'')+'</span><small>'+snippet(p,r.ts)+'</small></a>'});
h+='</div>';busy=true;var em=box.querySelector('.sr-empty');if(em&&em.textContent.indexOf('\u0645\u0641\u064A\u0634')>-1)em.remove();var hs=[].slice.call(box.querySelectorAll('.sr-h')).filter(function(e){return e.textContent.indexOf('\u0645\u0631\u062A\u0628\u0637\u0629')>-1})[0];if(hs)hs.insertAdjacentHTML('beforebegin',h);else box.insertAdjacentHTML('beforeend',h);box.style.display='block';busy=false})}
function init(){inp=document.getElementById('srq');box=document.getElementById('srbox');if(!inp||!box||inp.__deep)return false;inp.__deep=1;
var t;inp.addEventListener('input',function(){clearTimeout(t);t=setTimeout(render,120)});inp.addEventListener('focus',function(){load(function(){})});
new MutationObserver(function(){if(busy)return;if(inp.value.trim()&&!box.querySelector('#srdeep'))render()}).observe(box,{childList:true});
var st=document.createElement('style');st.textContent='.sr-deep mark{background:#fff1a8;color:inherit;border-radius:3px;padding:0 1px}.sr-deep small{display:block;line-height:1.7;white-space:normal}';document.head.appendChild(st);return true}
var tries=0,iv=setInterval(function(){if(init()||++tries>40)clearInterval(iv)},250);
}catch(e){}})();

/* jump-to-match: highlight search words inside the opened lesson card */
(function(){try{var m=location.hash.match(/[#&]q=([^&]+)/);if(!m||!/\/lessons\//.test(location.pathname))return;
var q=decodeURIComponent(m[1]);
function norm(s){s=String(s||'').toLowerCase().replace(/[\u064b-\u0652\u0670\u0640]/g,'');return s.replace(/[\u0623\u0625\u0622]/g,'\u0627').replace(/\u0649/g,'\u064A').replace(/\u0629/g,'\u0647')}
var ts=norm(q).split(/[^a-z0-9\u0600-\u06ff]+/).filter(function(w){return w.length>1}).map(function(w){return w.length>3&&w.indexOf('\u0627\u0644')===0?w.slice(2):w});if(!ts.length)return;
var busy=false,done=0;
function run(){if(busy)return;var P=document.getElementById('player');if(!P)return;busy=true;
try{var w=document.createTreeWalker(P,NodeFilter.SHOW_TEXT,null),nodes=[],n;while(n=w.nextNode()){if(n.parentNode.closest&&n.parentNode.closest('mark.srhit,button,script,style'))continue;nodes.push(n)}
var first=null;nodes.forEach(function(n){var t=n.nodeValue,nt=norm(t);if(nt.length!==t.length)return;var marks=[];ts.forEach(function(x){var f=0,i;while((i=nt.indexOf(x,f))>-1){marks.push([i,i+x.length]);f=i+x.length}});if(!marks.length)return;marks.sort(function(a,b){return a[0]-b[0]});var fr=document.createDocumentFragment(),last=0;marks.forEach(function(k){if(k[0]<last)return;fr.appendChild(document.createTextNode(t.slice(last,k[0])));var el=document.createElement('mark');el.className='srhit';el.setAttribute('style','background:#fff1a8;color:inherit;border-radius:3px;padding:0 1px');el.textContent=t.slice(k[0],k[1]);fr.appendChild(el);if(!first)first=el;last=k[1]});fr.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(fr,n)});
if(first){done=1;first.scrollIntoView({block:'center',behavior:'smooth'})}}catch(e){}
busy=false}
var mo=new MutationObserver(function(){if(!done&&!busy)setTimeout(run,60)});
function start(){var P=document.getElementById('player');if(!P){setTimeout(start,200);return}mo.observe(P,{childList:true,subtree:true});run();setTimeout(function(){mo.disconnect()},8000)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();
}catch(e){}})();

/* header: collapse on scroll down, return on scroll up; quick exit button in the home header */
(function(){try{
var tb=null,last=0,tk=false;
function init(){tb=document.querySelector('.topbar');if(!tb)return;last=window.pageYOffset||0;
addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;var y=window.pageYOffset||0,d=y-last;
if(y<60){tb.classList.remove('tb-hide')}else if(d>8){tb.classList.add('tb-hide')}else if(d<-8){tb.classList.remove('tb-hide')}
if(Math.abs(d)>8)last=y})},{passive:true});
var w=tb.querySelector('.wrap'),f=document.getElementById('exitbtn');
if(w&&!document.getElementById('exitq')){var p=location.pathname,isHome=/\/(index\.html)?$/.test(p)&&!/\/lessons\//.test(p);
if(isHome){var b=document.createElement('button');b.id='exitq';b.type='button';b.textContent='\u062E\u0631\u0648\u062C \uD83D\uDEAA';b.setAttribute('style','margin-inline-start:auto;padding:6px 12px;border-radius:12px;border:2px solid #e5e5e5;background:#fff;font:inherit;font-weight:800;font-size:.85rem;cursor:pointer;flex:none');
b.addEventListener('click',function(){var e=document.getElementById('exitbtn');if(e)e.click()});w.appendChild(b)}}}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(init,200)});else setTimeout(init,200);
}catch(e){}})();
