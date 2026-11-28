import re,json
p='/tmp/repo/track-verbs.html';s=open(p,encoding='utf-8').read()
s=re.sub(r'<div class="lvhead l2head".*?</div>\n(?:<div class="node-row fade">\n<a class="node" data-id="verb-(?:4[1-9]|5\d|60)".*?</div>\n</div>\n)*','',s,flags=re.S)
s=re.sub(r'<div class="lvhead l1head".*?</div>\n','',s)
nodes=open('/tmp/v41_nodes.html',encoding='utf-8').read()
ids1=[f'verb-{i:02d}' for i in range(1,41)]; ids2=json.load(open('/tmp/v41_ids.json'))
H='<div class="lvhead %s" style="margin:30px 0 10px;padding:14px;border-radius:16px;background:%s;font-weight:900;font-size:1.3em;text-align:center">%s</div>\n'
a=s.index('<div class="path">')+len('<div class="path">\n')
s=s[:a]+H%('l1head','#e8f7ee','المتمرس: الأفعال الشاذة (الدروس 1 إلى 40)')+s[a:]
seg_end=s.index('</main>'); k=s.rfind('</div>\n</div>\n',0,seg_end)+len('</div>\n')
s=s[:k]+H%('l2head','#fff1dc','التنين: الأفعال الأغرب (24 وحدة)')+nodes+s[k:]
allids=ids1+ids2
s=re.sub(r'data-overall="[^"]*"','data-overall="'+','.join(allids)+'"',s,count=1)
s=re.sub(r'window\.ALL_IDS=\[[^\]]*\]','window.ALL_IDS='+json.dumps(allids),s,count=1)
s=s.replace('<span class="tag">40 درس، 5 أفعال في كل درس</span>','<span class="tag">المتمرس: 40 درس</span><span class="tag">التنين: 24 وحدة</span>')
open(p,'w',encoding='utf-8').write(s);print(len(allids))
