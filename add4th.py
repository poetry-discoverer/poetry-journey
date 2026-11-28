import json,re,random,sys,collections
# usage: python3 add4th.py assets/bank.js  (run AFTER apply_questions.py). Adds a 4th option to 3-option template MCQs in verb/phrasal/collocations.
p=sys.argv[1];s=open(p).read();i0=s.index('[');pre=s[:i0];B=json.loads(s[i0:s.rindex(']')+1])
tail=s[s.rindex(']')+1:]
st=lambda x:re.sub(r'<[^>]+>','',x).strip()
stop={'و','في','من','على','إلى','ال'}
tok=lambda t:{w for w in re.split(r'[\s/،()]+',st(t)) if w and w not in stop}
def kind(q):
    q=st(q)
    if 'past participle' in q: return 'pp'
    if 'past' in q: return 'past'
    if q.startswith('إيه معنى'): return 'mean'
    if 'أنهي' in q: return 'which'
    return None
pool=collections.defaultdict(list)
for b in B:
    k=kind(b['q'])
    if b['c'] in('verb','phrasal','collocations') and k and len(b['o'])>=3: pool[(b['c'],k)].append(st(b['o'][b['a']]))
n=0
for b in B:
    k=kind(b['q'])
    if b['c'] not in('verb','phrasal','collocations') or not k or len(b['o'])!=3: continue
    r=random.Random(b['id'])
    have=[st(o) for o in b['o']]
    used=set().union(*[tok(o) for o in have])
    cand=[c for c in pool[(b['c'],k)] if c not in have and not (tok(c)&used)]
    if not cand: continue
    new=r.choice(cand)
    pos=r.randint(0,3)
    o=list(b['o']);ex=list(b['ex']);a=b['a']
    o.insert(pos,new);ex.insert(pos,'غلط: ده مش المقصود هنا، راجع الدرس.')
    if pos<=a:a+=1
    b['o'],b['ex'],b['a']=o,ex,a;n+=1
open(p,'w').write(pre+json.dumps(B,ensure_ascii=False)+tail)
print('added 4th option to',n)
