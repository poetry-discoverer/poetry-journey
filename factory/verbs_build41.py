import json,re,html,shutil,os,sys,random,hashlib
sys.path.insert(0,'/tmp/mq')
R='/tmp/repo/'
M=json.load(open(sys.argv[1],encoding='utf-8')); CARDS=sys.argv[2]
V={v['verb']:v for v in M['verbs']}
import csv
L2M=json.load(open('/downloads/irregular_verbs_manifest_L2b-b4c053b1.json',encoding='utf-8'))['verbs']
LEG0={int(k):v.split(':')[0] for k,v in M['levels_legend'].items()}
_U={x['verb']:x['unit'] for x in json.load(open('/downloads/irregular_verbs_manifest_L2-1ed74a14.json',encoding='utf-8'))['verbs']}
for a in L2M: a.setdefault('unit',_U.get(a['verb']))
GR={}
for a in sorted(L2M,key=lambda z:(z['unit'],z['order'])):
    V[a['verb']]=a; GR.setdefault(40+a['unit'],[]).append(a['verb'])
order=[v for k in sorted(GR) for v in GR[k]]
LEG={int(k):v.split(':')[0] for k,v in M['levels_legend'].items()}
LV=LEG
os.makedirs(R+'verbs',exist_ok=True)
EXJ={}
for _f in sorted(__import__('glob').glob('/downloads/lessons_content_*.json'),key=lambda p:int(re.search(r'1-(\d+)-',p).group(1)))[-1:]:
    for _k,_l in json.load(open(_f,encoding='utf-8')).items():
        for _v,_e in _l.get('extra',{}).items(): EXJ[_v]=_e
def en(t): return '<span class="en" dir="ltr">'+html.escape(t,quote=False)+'</span>'
rnd=random.Random(7)
def wrong_forms(v,key):
    pool=[x[key] for k,x in V.items() if k!=v['verb'] and x[key]!=v[key]]
    w=[v['base']+'ed' if not v['base'].endswith('e') else v['base']+'d']
    w=[x for x in w if x!=v[key]]
    pool=[x for x in pool if x not in w]; rnd.shuffle(pool)
    return (w+pool)[:2]
def steps(v,nxt,i0=0,end=True):
    i=i0;S=[]
    def add(d): 
        nonlocal i; d['i']=i; S.append(d); i+=1
    b,p,pp=v['base'],v['past'],v['pp']
    add({'t':'section','h':'الفعل '+en(b),'n':1})
    ext=next((e for e in ('png','jpg') if os.path.exists(R+f'verbs/{b}.{e}')),None)
    if ext:
        add({'t':'learn','h':f'<div class="u" style="text-align:center"><img src="../verbs/{b}.{ext}" alt="{b}" style="width:100%;max-width:420px;height:auto;border-radius:16px"></div><div class="u" style="text-align:center;font-size:2em;font-weight:900">{en(b)}</div><div class="u" style="text-align:center">{v["meaning_ar"]}</div>','n':1})
    else:
        add({'t':'learn','h':f'<div class="u" style="text-align:center;font-size:5em">🔤</div><div class="u" style="text-align:center;font-size:2em;font-weight:900">{en(b)}</div>','n':1})
    add({'t':'learn','h':f'<div class="u" style="text-align:center;font-size:1.5em;font-weight:900">{en(b)} ← {en(p)} ← {en(pp)}</div><div class="u">المصدر (base): {en(b)}</div><div class="u">الماضي (past): {en(p)}</div><div class="u">التصريف التالت (past participle): {en(pp)}</div>'+(f'<div class="u">{en(v["alt_forms"])}</div>' if v.get('alt_forms') else ''),'n':4})
    if v.get('pattern'): add({'t':'learn','h':f'<div class="u">نمط التصريف (grammar pattern): {en(v["pattern"])}</div>','n':1})
    ipa=lambda L:' ← '.join(L)
    add({'t':'learn','h':f'<div class="u">النطق البريطاني (UK): {en(ipa(v["ipa_uk"]))}</div><div class="u">النطق الأمريكي (US): {en(ipa(v["ipa_us"]))}</div>','n':2})
    add({'t':'learn','h':f'<div class="u">المعنى: {v["meaning_ar"]}</div><div class="u">{en(v["meaning_en"])}</div><div class="u">النوع: {en(v["register"])} | الندرة: {v["rarity"]} | المستوى: {LV.get(v["level"],"")} ({v["level"]} من 5)</div>','n':3})
    ex=''.join(f'<div class="u">{en(a)}</div><div class="u">{html.escape(r,quote=False)}</div>' for a,r in v['examples'])
    add({'t':'learn','h':ex,'n':2*len(v['examples'])})
    X=EXJ.get(b)
    if X:
        if X.get('uses'):
            add({'t':'learn','h':''.join(f'<div class="u">{en(a)}</div><div class="u">{html.escape(r,quote=False)}</div>' for a,r in X['uses']),'n':2*len(X['uses'])})
        if X.get('rare'): add({'t':'learn','h':'<div class="u"><b>استخدامات نادرة:</b></div><div class="u">'+html.escape(X['rare'],quote=False)+'</div>','n':2})
        for tr in X.get('traps') or []:
            add({'t':'learn','h':'<div class="u" style="border:2px solid #f5c542;background:#fff8e1;border-radius:14px;padding:10px"><b>⚠️ انتبه (كلمات متشابهة):</b> '+html.escape(tr,quote=False)+'</div>','n':1})
    def mc(q,r,ws,why):
        opts=[r]+ws
        add({'t':'mc','h':'','q':q,'nq':1,'opts':opts,'ans':0,'why':r,'ex':['صح: '+why]+['غلط: مش ده، راجع التصريفات.']*len(ws)})
    mc(f'إيه الـ past بتاع {en(b)}؟',en(p),[en(x) for x in wrong_forms(v,'past')],f'{en(b)} ← {en(p)}')
    mc(f'إيه الـ past participle بتاع {en(b)}؟',en(pp),[en(x) for x in wrong_forms(v,'pp')],f'التصريف التالت: {en(pp)}')
    others=[x['meaning_ar'] for k,x in V.items() if k!=b]; rnd.shuffle(others)
    mc(f'إيه معنى {en(b)}؟',v['meaning_ar'],others[:2],v['meaning_ar'])
    wf=wrong_forms(v,'past')[0]; true=(len(b)%2==0)
    stmt=p if true else wf
    add({'t':'tf','h':'','q':f'الـ past بتاع {en(b)} هو {en(stmt)}.','nq':1,'ans':true,'why':'صح' if true else 'غلط','ex':[('صح: ' if true else 'غلط: ')+f'{en(b)} ← {en(p)}',('غلط: ' if true else 'صح: ')+'راجع التصريفات.']})
    if end: add({'t':'end','h':'','teaser':'<div class="u">'+(f'الفعل الجاي: {en(nxt)}' if nxt else 'خلصت الأفعال الموجودة حالياً. أفعال جديدة هتنزل قريب.')+'</div>','extra':''})
    return S
T=open(R+'lessons/myth-m14.html',encoding='utf-8').read()
nodes=[];ids=[];lastlv=None
tt=open(R+'assets/titles.js',encoding='utf-8').read();k=tt.index('{');D=json.loads(tt[k:tt.rindex('}')+1])
import glob as _g0
pass
pass
GROUPS=[GR[k] for k in sorted(GR)]
for b in order:
    for cf in _g0.glob(CARDS+'/**/'+b+'_card.*',recursive=True):
        e=cf.rsplit('.',1)[1].lower().replace('jpeg','jpg')
        if e in('png','jpg'):
            for x in ('png','jpg'):
                if os.path.exists(R+f'verbs/{b}.{x}'): os.remove(R+f'verbs/{b}.{x}')
            shutil.copy(cf,R+f'verbs/{b}.{e}'); break
for gi,grp in enumerate(GROUPS,41):
    lid=f'verb-{gi:02d}'; ids.append(lid)
    names='، '.join(grp)
    title=f'الأفعال الشاذة، التنين، الوحدة {gi-40}: '+names
    D[lid]=title
    S=[]
    for b in grp: S+=steps(V[b],None,i0=len(S),end=False)
    nxtg=GROUPS[gi-40] if gi-40<len(GROUPS) else None
    PK=f'/tmp/vpk/{gi:02d}'; btn=''
    if os.path.isdir(PK):
        def rd(n):
            fs=_g0.glob(PK+'/*'+n); return open(fs[0],encoding='utf-8').read().strip() if fs else ''
        st=rd('_story.txt'); sm=rd('_summary_mnemonic.txt')
        def ent(t): return html.escape(t,quote=False)
        def para(t): return ''.join('<div class="u">'+(en(p) if re.match(r'^[A-Za-z]',p) else ent(p))+'</div>' for p in re.split(r'\n+',t) if p.strip())
        j=len(S)
        if st: S+=[{'t':'section','h':'القصة','i':j},{'t':'learn','h':para(st),'n':len([p for p in st.split('\n') if p.strip()]),'i':j+1}]
        if sm:
            m=re.search(r'SUMMARY EN\s*(.*?)\n\s*الملخص\s*(.*?)\n\s*ربط شامل\s*(.*)$',sm,re.S)
            if m:
                j=len(S); S+=[{'t':'section','h':'ربط وحفظ','i':j}]
                lines=[x for x in m.group(3).split('\n') if x.strip()]
                for x in lines: S.append({'t':'learn','h':'<div class="u">'+ent(x.strip())+'</div>','n':1,'i':len(S)})
                S.append({'t':'section','h':'الملخص','i':len(S)}); S.append({'t':'learn','h':para(m.group(2))+para(m.group(1)),'n':2,'i':len(S)})
        for fn,dst in ((_g0.glob(PK+'/*.pdf'),f'pdf/{lid}.pdf'),(_g0.glob(PK+'/*mindmap*.png'),f'mindmaps/mindmap-{lid}.png')):
            if fn: os.makedirs(os.path.dirname(R+dst),exist_ok=True); shutil.copy(fn[0],R+dst)
        btn=f'\n<a class="pdf-link" href="../pdf/{lid}.pdf" target="_blank" rel="noopener">📄 ملف الدرس PDF</a>\n<details class="mm"><summary>🧠 شوف الخريطة الذهنية للدرس</summary><a href="../mindmaps/mindmap-{lid}.png" target="_blank" rel="noopener"><img src="../mindmaps/mindmap-{lid}.png" alt="الخريطة الذهنية للدرس" loading="lazy" style="width:100%;height:auto;border-radius:14px;margin-top:10px"></a></details>'
    S.append({'t':'end','h':'','teaser':'<div class="u">'+('الوحدة الجاية: '+en('، '.join(nxtg)) if nxtg else 'خلصت الأفعال الموجودة حالياً.')+'</div>','extra':'','i':len(S)})
    H=T
    H=re.sub(r'<title>.*?</title>',lambda _:f'<title>{html.escape(title,quote=False)} | آداب الإنجليزية: قواعد وجرامر وشعر وأساطير</title>',H,count=1)
    H=re.sub(r'<h1>.*?</h1>',lambda _:f'<h1>{html.escape(title,quote=False)}</h1>',H,count=1)
    H=re.sub(r'(<div class="emoji"><span class="em">).*?(</span>)',lambda m:m.group(1)+'🔤'+m.group(2),H,count=1)
    H=H.replace('الدرس M14','الوحدة '+str(gi-40)).replace('myth-m14',lid)
    for pat in (r'\n<a class="pdf-link"[^\n]*',r'\n<a class="pdf-link mp3-link"[^\n]*',r'\n<a class="pdf-link mm-link"[^\n]*'): H=re.sub(pat,'',H)
    H=re.sub(r'\n<details class="mm">.*?</details>','',H,flags=re.S)
    lv=sorted({V[b]['level'] for b in grp})
    H=re.sub(r'<div class="tags">.*?</div>',f'<div class="tags"><span class="tag">{len(grp)} أفعال</span><span class="tag">التنين</span></div>',H,count=1,flags=re.S)
    H=re.sub(r'window\.LESSON_ID="[^;]*;window\.STEPS=\[.*?\];</script>',lambda _:f'window.LESSON_ID="{lid}";window.STEPS='+json.dumps(S,ensure_ascii=False)+';</script>',H,count=1,flags=re.S)
    H=re.sub(r'data-lesson="[^>]*>',f'data-lesson="{lid}">',H,count=1)
    if btn: H=H.replace('</div>\n\n<div id="player"',btn+'\n</div>\n\n<div id="player"',1)
    open(R+f'lessons/{lid}.html','w',encoding='utf-8').write(H)
    l0=V[grp[0]]['level']
    pass
    nodes.append(f'<div class="node-row fade">\n<a class="node" data-id="{lid}" href="lessons/{lid}.html"><span class="em">🔤</span></a>\n<div class="node-label">الوحدة {gi-40}: {html.escape(names)}<small>{len(grp)} أفعال · المستوى {"-".join(map(str,lv))}</small></div>\n</div>\n')
open(R+'assets/titles.js','w',encoding='utf-8').write(tt[:k]+json.dumps(D,ensure_ascii=False)+tt[tt.rindex('}')+1:])

open('/tmp/v41_nodes.html','w',encoding='utf-8').write(''.join(nodes))
open('/tmp/v41_ids.json','w').write(json.dumps(ids))
print('built',ids)
