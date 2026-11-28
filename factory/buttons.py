# buttons.py <root>: one canonical button row per lesson page, from files on disk. Prints a gap list.
import sys,re,glob,os
R=sys.argv[1]; gaps=[]; fixed=0
A=re.compile(r'<a class="pdf-link[^"]*"[^>]*>.*?</a>',re.S)
for f in sorted(glob.glob(R+'/lessons/*.html')):
    lid=os.path.basename(f)[:-5]; s=open(f,encoding='utf-8').read()
    m1=re.search(r'\n<a class="pdf-link" href="\.\./pdf/'+re.escape(lid)+r'\.pdf"',s)
    if not m1: gaps.append((lid,'no lesson pdf button')); continue
    st=m1.start()+1
    m2=re.search(r'</details>|(?=\n</div>)',s[st:])
    # block end: after last pdf-link/mm/details contiguous lines
    end=st
    for m in re.finditer(r'(<a class="pdf-link[^>]*>.*?</a>[ ]?)+\n?|<details class="mm">.*?</details>\n?',s[st:],re.S):
        if m.start()>end-st+3: break
        end=st+m.end()
    blk=s[st:end]
    pdf=re.search(r'<a class="pdf-link" href="\.\./pdf/'+re.escape(lid)+r'\.pdf".*?</a>',blk,re.S).group(0)
    mp3=re.search(r'<a class="pdf-link mp3-link".*?</a>',blk,re.S)
    has=lambda p:os.path.exists(f'{R}/{p}') and os.path.getsize(f'{R}/{p}')>1000
    pdf=re.sub(r'>[^<]*</a>$','>📄 حمّل PDF الدرس</a>',pdf)
    new=[pdf]
    if mp3: new.append(mp3.group(0))
    if has(f'pdf/summary-ar-{lid}.pdf') and has(f'pdf/summary-en-{lid}.pdf'):
        new.append(f'<a class="pdf-link" href="../pdf/summary-ar-{lid}.pdf" target="_blank" rel="noopener">📝 ملخص الدرس (عربي) PDF</a> <a class="pdf-link" href="../pdf/summary-en-{lid}.pdf" target="_blank" rel="noopener" dir="ltr">📝 Lesson Summary (English) PDF</a>')
    elif has(f'pdf/summary-{lid}.pdf'):
        new.append(f'<a class="pdf-link" href="../pdf/summary-{lid}.pdf" target="_blank" rel="noopener">📝 ملخص الدرس (English + عربي) PDF</a>')
    else: gaps.append((lid,'summary AR/EN missing'))
    if has(f'mindmaps/mindmap-{lid}.pdf') and has(f'mindmaps/mindmap-{lid}.png'):
        new.append(f'<a class="pdf-link mm-link" href="../mindmaps/mindmap-{lid}.pdf" target="_blank" rel="noopener">🧠 الخريطة الذهنية PDF</a>\n<details class="mm"><summary>🧠 شوف الخريطة الذهنية للدرس</summary><a href="../mindmaps/mindmap-{lid}.png" target="_blank" rel="noopener"><img src="../mindmaps/mindmap-{lid}.png" alt="الخريطة الذهنية للدرس" loading="lazy" style="width:100%;height:auto;border-radius:14px;margin-top:10px"></a></details>')
    else: gaps.append((lid,'mind map missing'))
    out='\n'.join(new)+'\n'
    if out.strip()!=blk.strip():
        s=s[:st]+out+s[end:]; open(f,'w',encoding='utf-8').write(s); fixed+=1
print('buttons rebuilt',fixed,'gaps',len(gaps))
import collections
g=collections.defaultdict(list)
for l,w in gaps: g[w].append(l)
for w,l in g.items(): print(' ',w,len(l),' '.join(l[:30]))
