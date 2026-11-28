import re,json,html
R='/tmp/repo/'
p=R+'track-phrasal.html';s=open(p,encoding='utf-8').read()
ids=json.load(open('/tmp/ph_ids.json'));n1=open('/tmp/ph_nodes1.html',encoding='utf-8').read();n2=open('/tmp/ph_nodes2.html',encoding='utf-8').read()
# strip previous additions
s=re.sub(r'<div class="lvhead l[12]head".*?</div>\n','',s)
s=re.sub(r'<div class="node-row fade">\n<a class="node" data-id="phrasal-(?:3[89]|4\d|l2-\d+)".*?</div>\n</div>\n','',s,flags=re.S)
H='<div class="lvhead %s" style="margin:30px 0 10px;padding:14px;border-radius:16px;background:%s;font-weight:900;font-size:1.3em;text-align:center">%s</div>\n'
a=s.index('<div class="path">')+len('<div class="path">\n')
s=s[:a]+H%('l1head','#e8f7ee','المستوى الأول: الأفعال المركبة (الدروس 1 إلى 42)')+s[a:]
k=s.index('</main>');e=s.rfind('</div>\n</div>\n',0,k)+len('</div>\n')
s=s[:e]+n1+H%('l2head','#fff1dc','المستوى الثاني: الأفعال المركبة الأغرب (الاستعمالات النادرة والأدبية)')+n2+s[e:]
allids=[f'phrasal-{i:02d}' for i in range(1,38)]+ids
s=re.sub(r'data-overall="[^"]*"','data-overall="'+','.join(allids)+'"',s,count=1)
s=re.sub(r'window\.ALL_IDS=\[[^\]]*\]','window.ALL_IDS='+json.dumps(allids),s,count=1)
open(p,'w',encoding='utf-8').write(s)
# phrasal-37 teaser
f=R+'lessons/phrasal-37.html';t=open(f,encoding='utf-8').read()
t=t.replace('أفعال مركبة جديدة هتنزل قريب','الأفعال المركبة 38');open(f,'w',encoding='utf-8').write(t)
# search shard
sp=R+'assets/search-index-phrasal.js';ss=open(sp,encoding='utf-8').read();i=ss.index("]=")+2
J=json.loads(ss[i:].rstrip().rstrip(';'));J['L']=[e for e in J['L'] if e['id'] in allids[:37]]
def plain(h): return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',h))).strip()
ai=[e['id'] for e in J['L']]+ids
for lid in ids:
    t=open(R+f'lessons/{lid}.html',encoding='utf-8').read();j=t.find('window.STEPS=')+13;S=json.loads(t[j:t.find(';</script>',j)])
    title=html.unescape(re.search(r'<h1>(.*?)</h1>',t).group(1));ls=[plain(x['h']) for x in S if x['t']=='learn']
    kk=ai.index(lid);rel=[ai[x] for x in (kk+1,kk-1,kk+2) if 0<=x<len(ai)][:3]
    J['L'].append({'m':ls[0][:140],'id':lid,'t':title,'k':'phrasal','h':[plain(x['h']) for x in S if x['t']=='section'],'b':' '.join(ls)[:1500],'r':rel})
open(sp,'w',encoding='utf-8').write(ss[:i]+json.dumps(J,ensure_ascii=False,separators=(',',':'))+';');print(len(J['L']),len(allids))
