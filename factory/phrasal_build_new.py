import json,re,html,shutil,os,glob,random
R='/tmp/repo/'
J=sorted(glob.glob('/downloads/phrasal_lessons_content_*.json'),key=lambda p:int(re.search(r'1-(\d+)-',p).group(1)))[-1]
L=json.load(open(J,encoding='utf-8'))
ALLV=[v for l in L for v in l['items']]
for l in L: l.setdefault('lesson',l.get('legacy_lesson'))
L=[l for l in L if l['section']=='phrasal_level2' or l['lesson']>=38]
rnd=random.Random(11)
def en(t): return '<span class="en" dir="ltr">'+html.escape(t,quote=False)+'</span>'
def ent(t): return html.escape(t,quote=False)
def u(x): return '<div class="u">'+x+'</div>'
def mix(t): return en(t) if re.match(r'^[A-Za-z]',t) else ent(t)
T=open(R+'lessons/myth-m14.html',encoding='utf-8').read()
tt=open(R+'assets/titles.js',encoding='utf-8').read();k=tt.index('{');D=json.loads(tt[k:tt.rindex('}')+1])
pass
pass
ids=[];nodes=[];nodes2=[]
for l in L:
    n=l['lesson']; l2=l['section']=='phrasal_level2'; num=l['unit'] if l2 else n; lid=f'phrasal-l2-{num:02d}' if l2 else f'phrasal-{n:02d}'; ids.append(lid)
    title=(f'المستوى الثاني، الوحدة {num}: ' if l2 else f'الأفعال المركبة {n}: ')+'، '.join(v['phrasal'] for v in l['items']); D[lid]=title
    S=[]
    def add(d): d['i']=len(S); S.append(d)
    for v in l['items']:
        add({'t':'section','h':'الفعل المركب '+en(v['phrasal'])})
        add({'t':'learn','h':'<div class="u" style="text-align:center;font-size:2em;font-weight:900">'+en(v['phrasal'])+'</div>'+u('الفعل الأساسي: '+en(v['base_verb'])+' + الكلمة الصغيرة: '+en(v['particles'])),'n':2})
        add({'t':'learn','h':u('المعنى: '+ent(v['meaning_ar']))+u(en(v['meaning_en']))+u('الندرة: '+ent(v['rarity'])+' | المجال: '+en(v['domain']))+u('بيتفصل (تحط المفعول في النص)؟ '+('أيوه' if v['separable'] else 'لأ')),'n':4})
        seen=set();ex=[]
        for e in v['examples']:
            if e['en'] not in seen: seen.add(e['en']); ex.append(e)
        add({'t':'learn','h':''.join(u(en(e['en']))+u(ent(e['ar'])) for e in ex),'n':2*len(ex)})
        if v.get('other_meanings'): add({'t':'learn','h':u('<b>معاني تانية:</b>')+u(mix(v['other_meanings'])),'n':2})
        if v.get('mnemonic_ar'): add({'t':'learn','h':u('<b>طريقة تفتكره:</b> '+ent(v['mnemonic_ar'])),'n':1})
        others=[x['meaning_ar'] for x in ALLV if x['phrasal']!=v['phrasal'] and x['meaning_ar']!=v['meaning_ar']]; rnd.shuffle(others)
        add({'t':'mc','h':'','q':f'إيه معنى {en(v["phrasal"])}؟','nq':1,'opts':[v['meaning_ar']]+others[:2],'ans':0,'why':v['meaning_ar'],'ex':['صح: '+v['meaning_ar'],'غلط: مش ده المعنى.','غلط: مش ده المعنى.']})
        wrong=[x['phrasal'] for x in ALLV if x['phrasal']!=v['phrasal']]; rnd.shuffle(wrong)
        e0=ex[0]['en']
        add({'t':'mc','h':'','q':f'الجملة دي معناها: {ent(ex[0]["ar"])}<br>أنهي فعل مركب فيها؟','nq':1,'opts':[v['phrasal'],wrong[0],wrong[1]],'ans':0,'why':v['phrasal'],'ex':['صح: '+en(e0),'غلط: الفعل ده بمعنى تاني.','غلط: الفعل ده بمعنى تاني.']})
        true=(len(v['phrasal'])%2==0); alt=[x for x in ALLV if x['phrasal']!=v['phrasal']][0 if true else rnd.randrange(5)]
        add({'t':'tf','h':'','q':f'{en(v["phrasal"])} معناها: {ent(v["meaning_ar"] if true else alt["meaning_ar"])}','nq':1,'ans':true,'why':'صح' if true else 'غلط','ex':[('صح: ' if true else 'غلط: ')+ent(v['meaning_ar']),('غلط: ' if true else 'صح: ')+'راجع المعنى.']})
    add({'t':'section','h':'القصة'})
    add({'t':'learn','h':u(en(l['story_en']))+u(ent(l['story_ar'])),'n':2})
    add({'t':'section','h':'ربط وحفظ'})
    add({'t':'learn','h':u(ent(l['mnemonic_all'])),'n':1})
    add({'t':'section','h':'الملخص'})
    add({'t':'learn','h':u(ent(l['summary_ar']))+u(en(l['summary_en'])),'n':2})
    nxt=f'phrasal-{n+1:02d}'
    add({'t':'end','h':'','teaser':u('الدرس الجاي: '+(('الوحدة '+str(num+1)) if l2 and num<11 else ('الأفعال المركبة '+str(n+1) if (not l2 and n<42) else ('وحدات جديدة هتنزل قريب' if l2 else 'المستوى الثاني: الوحدة 1')))),'extra':''})
    PK=f'/tmp/ppk/L2-{num:02d}' if l2 else f'/tmp/ppk/{n:02d}';btn=''
    for fn,dst in ((glob.glob(PK+'/*.pdf'),f'pdf/{lid}.pdf'),(glob.glob(PK+'/*mindmap*.png'),f'mindmaps/mindmap-{lid}.png')):
        if fn: os.makedirs(os.path.dirname(R+dst),exist_ok=True); shutil.copy(fn[0],R+dst)
    if os.path.exists(R+f'pdf/{lid}.pdf'):
        btn=f'\n<a class="pdf-link" href="../pdf/{lid}.pdf" target="_blank" rel="noopener">📄 ملف الدرس PDF</a>\n<details class="mm"><summary>🧠 شوف الخريطة الذهنية للدرس</summary><a href="../mindmaps/mindmap-{lid}.png" target="_blank" rel="noopener"><img src="../mindmaps/mindmap-{lid}.png" alt="الخريطة الذهنية للدرس" loading="lazy" style="width:100%;height:auto;border-radius:14px;margin-top:10px"></a></details>'
    H=T
    H=re.sub(r'<title>.*?</title>',lambda _:f'<title>{ent(title)} | آداب الإنجليزية: قواعد وجرامر وشعر وأساطير</title>',H,count=1)
    H=re.sub(r'<h1>.*?</h1>',lambda _:f'<h1>{ent(title)}</h1>',H,count=1)
    H=re.sub(r'(<div class="emoji"><span class="em">).*?(</span>)',lambda m:m.group(1)+'🧩'+m.group(2),H,count=1)
    H=H.replace('الدرس M14',('الوحدة ' if l2 else 'الدرس ')+str(num)).replace('myth-m14',lid)
    for pat in (r'\n<a class="pdf-link"[^\n]*',r'\n<a class="pdf-link mp3-link"[^\n]*',r'\n<a class="pdf-link mm-link"[^\n]*'): H=re.sub(pat,'',H)
    H=re.sub(r'\n<details class="mm">.*?</details>','',H,flags=re.S)
    H=re.sub(r'<div class="tags">.*?</div>','<div class="tags"><span class="tag">5 أفعال مركبة</span>'+('<span class="tag">المستوى الثاني</span>' if l2 else '')+'</div>',H,count=1,flags=re.S)
    H=re.sub(r'window\.LESSON_ID="[^;]*;window\.STEPS=\[.*?\];</script>',lambda _:f'window.LESSON_ID="{lid}";window.STEPS='+json.dumps(S,ensure_ascii=False)+';</script>',H,count=1,flags=re.S)
    H=re.sub(r'data-lesson="[^>]*>',f'data-lesson="{lid}">',H,count=1)
    if btn: H=H.replace('</div>\n\n<div id="player"',btn+'\n</div>\n\n<div id="player"',1)
    open(R+f'lessons/{lid}.html','w',encoding='utf-8').write(H)
    LBL='الوحدة' if l2 else 'الدرس'; RAR=ent(l['items'][0]['rarity'])
    (nodes2 if l2 else nodes).append(f'<div class="node-row fade">\n<a class="node" data-id="{lid}" href="lessons/{lid}.html"><span class="em">🧩</span></a>\n<div class="node-label">{LBL} {num}: {ent("، ".join(v["phrasal"] for v in l["items"]))}<small>5 أفعال مركبة · {RAR}</small></div>\n</div>\n')
open(R+'assets/titles.js','w',encoding='utf-8').write(tt[:k]+json.dumps(D,ensure_ascii=False)+tt[tt.rindex('}')+1:])

open('/tmp/ph_nodes1.html','w',encoding='utf-8').write(''.join(nodes));open('/tmp/ph_nodes2.html','w',encoding='utf-8').write(''.join(nodes2));open('/tmp/ph_ids.json','w').write(json.dumps(ids));print('built',ids)
