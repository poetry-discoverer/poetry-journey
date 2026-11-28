import json,sys,random,re
random.seed(7)
import os
bank=os.environ.get('BANK','poetry-journey/assets/bank.js')
s=open(bank).read(); pre=s[:s.index('[')]; post=s[s.rindex(']')+1:]
B=json.loads(s[s.index('['):s.rindex(']')+1]); by={b['id']:b for b in B}
GEN='غلط: ده مش المقصود هنا، راجع الدرس.'
n=0;skip=0
for f in sys.argv[1:]:
  v1=False
  for ln in open(f,encoding='utf8'):
    p=ln.rstrip('\n').split('|')
    if len(p)<3: continue
    b=by.get(p[0])
    if not b: print('missing',p[0]); continue
    if len(b['o'])>=4 and not b.get('_orig') and b.get('_done'): continue
    ok=b['o'][b['a']]; oldex=b['ex'][b['a']]
    dd=p[1:]
    keep=[]
    if v1 and p[0]!='analysis-01:13':
        dd=p[2:]
    olds=[(x,e) for i,(x,e) in enumerate(zip(b['o'],b['ex'])) if i!=b['a']]
    new=[(d,GEN) for d in dd]
    if len(new)<3:
        olds.sort(key=lambda t:-len(t[0])); new+=olds[:3-len(new)]
    new=new[:3]
    if len({re.sub(r'<[^>]+>','',x[0]) for x in new}|{re.sub(r'<[^>]+>','',ok)})<4: skip+=1; print('dup',p[0]); continue
    pos=random.randrange(4)
    opts=[x for x,_ in new]; exs=[e for _,e in new]
    opts.insert(pos,ok); exs.insert(pos,oldex)
    b['o']=opts;b['a']=pos;b['ex']=exs;b['_done']=1;n+=1
for b in B: b.pop('_done',None)
open(bank,'w').write(pre+json.dumps(B,ensure_ascii=False)+post); print('patched',n,'skip',skip)
