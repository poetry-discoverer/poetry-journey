import re,json,glob,html
R='/tmp/repo/lessons/'
def L(l):
    s=open(R+l+'.html',encoding='utf-8').read(); i=s.index('window.STEPS=')+13;j=s.index(';</script>',i); return json.loads(s[i:j]),s
def txt(h):
    h=re.sub(r'<(/div|/li|br|/p)[^>]*>','\n',h); h=html.unescape(re.sub('<[^>]+>','',h)); h=re.sub(r'[ \t]+',' ',h); return [x.strip() for x in h.split('\n') if x.strip()]
out={}
for tr,pre in (('verbs','verb'),('verbs-l2','verb'),('phrasal','phrasal'),('phrasal-l2','phrasal-l2'),('collocations','collocations')):
    ents=[]
    for f in sorted(glob.glob(R+pre+'-[0-9]*.html'),key=lambda p:int(re.search(r'-(\d+)\.html',p).group(1))):
        lid=f.split('/')[-1][:-5]
        _n=int(re.search(r'-(\d+)$',lid).group(1))
        if tr=='verbs' and _n>40: continue
        if tr=='verbs-l2' and _n<=40: continue
        st,s=L(lid)
        title=re.sub('<[^>]+>','',re.search(r'<h1>(.*?)</h1>',s,re.S).group(1)); title=html.unescape(title)
        cur=None
        for x in st:
            if x['t']=='section':
                t=txt(x['h']); 
                if not t: continue
                m=re.match(r'^(?:الفعل المركب|الفعل|الكولوكيشن|الكولوكيشن\s*)\s*(.*)$',t[0]); term=(m.group(1) if m else t[0]).strip()
                cur={'lesson':lid,'ltitle':title,'term':term,'ar':'','def':'','forms':'','ex':[], 'level':''}; ents.append(cur); continue
            if x['t']!='learn' or cur is None: continue
            L_=txt(x['h'])
            for i,l in enumerate(L_):
                if l.startswith('المعنى:') and not cur['ar']:
                    cur['ar']=l[7:].strip()
                    for n in L_[i+1:i+3]:
                        if re.match(r'^[A-Za-z]',n) and not cur['def']: cur['def']=n
                    for n in L_:
                        mm=re.search(r'المستوى:\s*([^|]*)',n)
                        if mm: cur['level']=mm.group(1).strip()
            if any('←' in l for l in L_) and not cur['forms'] and tr.startswith('verbs'):
                cur['forms']=L_[0]
            if len(L_)>=2 and re.match(r'^[A-Z]',L_[0]) and re.search(r'[\u0600-\u06FF]',L_[1]) and not cur['ex'] and 'المعنى' not in L_[0]:
                cur['ex']=[L_[0],L_[1]]
        if tr=='collocations' and cur and not cur['ar']:
            pass
    out[tr]=ents; print(tr,len(ents),sum(1 for e in ents if e['ar']),sum(1 for e in ents if e['ex']),sum(1 for e in ents if e['forms']))
json.dump(out,open('entries.json','w'),ensure_ascii=False,indent=1)
for tr in out: print(tr,out[tr][0],out[tr][7])
