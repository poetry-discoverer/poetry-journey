import json,re,html
R='/tmp/repo/'
p=R+'assets/search-index-verb.js';s=open(p,encoding='utf-8').read();i=s.index("]=")+2
J=json.loads(s[i:].rstrip().rstrip(';'))
J['L']=[e for e in J['L'] if int(e['id'][5:])<=40]
def plain(h): return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',h))).strip()
ids=[f'verb-{n}' for n in range(41,65)];allids=[e['id'] for e in J['L']]+ids
for n,lid in enumerate(ids):
    t=open(R+f'lessons/{lid}.html',encoding='utf-8').read();j=t.find('window.STEPS=')+13;S=json.loads(t[j:t.find(';</script>',j)])
    title=html.unescape(re.search(r'<h1>(.*?)</h1>',t).group(1))
    heads=[plain(x['h']) for x in S if x['t']=='section'];ls=[plain(x['h']) for x in S if x['t']=='learn']
    k=allids.index(lid);rel=[allids[x] for x in (k+1,k-1,k+2) if 0<=x<len(allids)][:3]
    J['L'].append({'m':ls[0][:140],'id':lid,'t':title,'k':'verb','h':heads,'b':' '.join(ls)[:1500],'r':rel})
open(p,'w',encoding='utf-8').write(s[:i]+json.dumps(J,ensure_ascii=False,separators=(',',':'))+';');print(len(J['L']))
