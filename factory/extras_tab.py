# extras_tab.py <root>: moves "extra files" (extra-files box + course-extra links) of each track page to its own page extras-<name>.html, leaving one button. Idempotent.
import re,sys,glob,os
R=sys.argv[1]
BTN='<a class="pdf-link extras-tab" href="%s" style="display:inline-block;margin:10px 0">📚 ملفات إضافية للكورس</a>\n'
for f in sorted(glob.glob(R+'/track-*.html')+glob.glob(R+'/modules-*.html')):
    s=open(f,encoding='utf-8').read()
    base=os.path.basename(f)[:-5]
    name='extras-'+base.split('-',1)[1] if base.startswith('track-') else 'extras-'+base
    page=R+'/'+name+'.html'
    box=re.search(r'<div class="extra-files">(.*?)</div>\n?',s,re.S)
    anch=re.findall(r'<a download class="pdf-link course-extra"[^>]*>.*?</a>\n?',s,re.S)
    if not box and not anch: continue
    old_a='';old_b=''
    if os.path.exists(page):
        p=open(page,encoding='utf-8').read()
        m=re.search(r'<!--A-->(.*?)<!--/A-->',p,re.S);old_a=m.group(1) if m else ''
        m=re.search(r'<!--B-->(.*?)<!--/B-->',p,re.S);old_b=m.group(1) if m else ''
    A=''.join(a.replace('display:inline-block;margin:10px 0','display:block;margin:8px 0') for a in anch) or old_a
    B=re.sub(r'<h2[^>]*>.*?</h2>','',box.group(1),flags=re.S) if box else old_b
    h1=re.search(r'<h1>(.*?)</h1>',s,re.S);h1=h1.group(1) if h1 else ''
    a=s.index('<main class="wrap">')+len('<main class="wrap">');b=s.index('</main>')
    head=s[:a];tail=s[b:]
    tail=re.sub(r'<script>window\.ALL_IDS=.*?</script>\n?','',tail,flags=re.S)
    head=re.sub(r'<title>.*?</title>','<title>ملفات إضافية | آداب الإنجليزية</title>',head,count=1)
    body=f'\n<div class="lesson-head fade"><div class="emoji"><span class="em">📚</span></div><h1>ملفات إضافية</h1><p style="color:var(--ink-soft)">{h1}</p></div>\n<a class="pdf-link" href="{base}.html" style="display:inline-block;margin:10px 0">⬅️ رجوع للكورس</a>\n<div class="extra-files"><!--A-->{A}<!--/A--><!--B-->{B}<!--/B--></div>\n'
    open(page,'w',encoding='utf-8').write(head+body+tail)
    s=re.sub(r'<div class="extra-files">.*?</div>\n?','',s,flags=re.S)
    s=re.sub(r'<a download class="pdf-link course-extra"[^>]*>.*?</a>\n?','',s,flags=re.S)
    s=re.sub(r'<a class="pdf-link extras-tab"[^>]*>.*?</a>\n?','',s,flags=re.S)
    m=re.search(r'<details class="mm course-mm">.*?</details>\n?',s,re.S)
    pos=m.end() if m else s.index('<div class="overall')
    s=s[:pos]+BTN%(name+'.html')+s[pos:]
    open(f,'w',encoding='utf-8').write(s);print(base,'->',name,len(anch),'anch',bool(box))
