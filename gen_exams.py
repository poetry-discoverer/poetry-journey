import json,random,re,sys,collections
# usage: python3 gen_exams.py bank.js exams.js  (rewrites exams.js, adds model-A lesson exams for lessons that have none)
bp,ep=sys.argv[1],sys.argv[2]
s=open(bp).read();B=json.loads(s[s.index('['):s.rindex(']')+1])
e=open(ep).read();E=json.loads(e[e.index('['):e.rindex(']')+1])
E=[x for x in E if not x['id'].endswith('-lesson-A')]
have={x['ref'] for x in E if x['scope']=='lesson'}
by=collections.OrderedDict()
for b in B: by.setdefault(b['l'],[]).append(b)
N=8;made=0
for l,qs in by.items():
    if l in have: continue
    r=random.Random(l)
    seen=set();mc=[];tf=[]
    for b in qs:
        k=re.sub(r'\W+','',b['q'])[:40]
        if k in seen: continue
        seen.add(k)
        (mc if len(b['o'])>=3 else tf).append(b)
    r.shuffle(mc);r.shuffle(tf)
    mc.sort(key=lambda b:-len(b['o']))  # prefer 4 options
    pick=mc[:N-2 if len(tf)>=2 else N]
    if len(pick)<N: pick+=tf[:N-len(pick)]
    if len(pick)<N: pick+=mc[len(pick):N]
    pick=pick[:N]
    if len(pick)<3: continue
    r.shuffle(pick)
    items=[]
    for i,b in enumerate(pick,1):
        idx=list(range(len(b['o'])));r.shuffle(idx)
        items.append({"id":f"{l}-lesson-A:{i}","type":"mc4" if len(b['o'])>2 else "tf","q":b['q'],"o":[b['o'][j] for j in idx],"a":idx.index(b['a']),"ex":[b['ex'][j] for j in idx],"l":l})
    E.append({"id":f"{l}-lesson-A","track":b['c'],"scope":"lesson","ref":l,"model":"A","title":f"امتحان الدرس {l} على نمط امتحانات الكلية","minutes":12,"pass_percent":70,"items":items})
    made+=1
open(ep,'w').write('window.EXAMS='+json.dumps(E,ensure_ascii=False)+';\n')
print('generated',made,'total',len(E))
