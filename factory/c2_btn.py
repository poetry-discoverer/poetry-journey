import re,sys,os
R='/tmp/repo/'
for n in sys.argv[1:]:
    lid=f'grammar-c2-{n}';f=R+f'lessons/{lid}.html';s=open(f,encoding='utf-8').read()
    has=lambda p:os.path.exists(R+p) and os.path.getsize(R+p)>1000
    L=['<a download class="pdf-link" href="/poetry-journey-pdf/pdf/%s.pdf" rel="noopener">📄 حمّل PDF الدرس</a>'%lid]
    if has(f'pdf/summary-ar-{lid}.pdf') and has(f'pdf/summary-en-{lid}.pdf'):
        L.append(f'<a download class="pdf-link" href="/poetry-journey-pdf/pdf/summary-ar-{lid}.pdf" rel="noopener">📝 ملخص الدرس (عربي) PDF</a> <a download class="pdf-link" href="/poetry-journey-pdf/pdf/summary-en-{lid}.pdf" rel="noopener" dir="ltr">📝 Lesson Summary (English) PDF</a>')
    elif has(f'pdf/summary-{lid}.pdf'):
        L.append(f'<a download class="pdf-link" href="/poetry-journey-pdf/pdf/summary-{lid}.pdf" rel="noopener">📝 ملخص الدرس (English + عربي) PDF</a>')
    if has(f'mindmaps/mindmap-{lid}.pdf') and has(f'mindmaps/mindmap-{lid}.png'):
        L.append(f'<a download class="pdf-link mm-link" href="../mindmaps/mindmap-{lid}.pdf" rel="noopener">🧠 الخريطة الذهنية PDF</a>\n<details class="mm"><summary>🧠 شوف الخريطة الذهنية للدرس</summary><a href="../mindmaps/mindmap-{lid}.png" target="_blank" rel="noopener"><img src="../mindmaps/mindmap-{lid}.png" alt="الخريطة الذهنية للدرس" loading="lazy" style="width:100%;height:auto;border-radius:14px;margin-top:10px"></a></details>')
    m=re.search(r'<a [^>]*class="pdf-link"[^>]*href="[^"]*/%s\.pdf".*?\n</div>'%lid,s,re.S)
    if not m: print('nomatch',n);continue
    s=s[:m.start()]+'\n'.join(L)+'\n</div>'+s[m.end():]
    open(f,'w',encoding='utf-8').write(s);print(n,len(L))
