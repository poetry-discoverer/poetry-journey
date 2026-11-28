# extras.py <root>: "ملفات PDF إضافية" section on track-history / track-mythology from the lists below (idempotent). Add new batches to EX.
import re,sys
R=sys.argv[1]
EX={'history':[('الدروس 32 إلى 35: إنجليزي مبسط','history-en-L32-L35.pdf'),('الدروس 32 إلى 35: إنجليزي + مصري','history-combined-L32-L35.pdf'),('الدروس 32 إلى 35: ملخصات','history-summaries-L32-L35.pdf'),
 ('الدروس 36 إلى 37: إنجليزي مبسط','history-en-L36-L37.pdf'),('الدروس 36 إلى 37: إنجليزي + مصري','history-combined-L36-L37.pdf'),('الدروس 36 إلى 37: ملخصات','history-summaries-L36-L37.pdf'),
 ('الدروس 38 إلى 39: إنجليزي مبسط','history-en-L38-L39.pdf'),('الدروس 38 إلى 39: إنجليزي + مصري','history-combined-L38-L39.pdf'),('الدروس 38 إلى 39: ملخصات','history-summaries-L38-L39.pdf'),
 ('الدروس 40 إلى 41: إنجليزي مبسط','history-en-L40-L41.pdf'),('الدروس 40 إلى 41: إنجليزي + مصري','history-combined-L40-L41.pdf'),('الدروس 40 إلى 41: ملخصات','history-summaries-L40-L41.pdf'),
 ('الدروس 42 إلى 43: إنجليزي مبسط','history-en-L42-L43.pdf'),('الدروس 42 إلى 43: إنجليزي + مصري','history-combined-L42-L43.pdf'),('الدروس 42 إلى 43: ملخصات','history-summaries-L42-L43.pdf'),
 ('الدروس 44 إلى 45: إنجليزي مبسط','history-en-L44-L45.pdf'),('الدروس 44 إلى 45: إنجليزي + مصري','history-combined-L44-L45.pdf'),('الدروس 44 إلى 45: ملخصات','history-summaries-L44-L45.pdf')],
 'mythology':[('الموديولات 1 إلى 8: إنجليزي مبسط (A2-B1)','myth-m01-m08-English-A2B1.pdf'),('الموديولات 1 إلى 8: إنجليزي + عربي','myth-m01-m08-English-Arabic.pdf'),
 ('الموديولات 9 إلى 11: إنجليزي مبسط (A2-B1)','myth-m09-m11-English-A2B1.pdf'),('الموديولات 9 إلى 11: إنجليزي + عربي','myth-m09-m11-English-Arabic.pdf'),
 ('الموديولان 12 و13: إنجليزي مبسط (A2-B1)','myth-m12-m13-English-A2B1.pdf'),('الموديولان 12 و13: إنجليزي + عربي','myth-m12-m13-English-Arabic.pdf'),
 ('الموديولان 14 و15: إنجليزي مبسط (A2-B1)','myth-m14-m15-English-A2B1.pdf'),('الموديولان 14 و15: إنجليزي + عربي','myth-m14-m15-English-Arabic.pdf'),
 ('الموديولان 16 و17: إنجليزي مبسط (A2-B1)','myth-m16-m17-English-A2B1.pdf'),('الموديولان 16 و17: إنجليزي + عربي','myth-m16-m17-English-Arabic.pdf'),
 ('الموديولان 18 و19: إنجليزي مبسط (A2-B1)','myth-m18-m19-English-A2B1.pdf'),('الموديولان 18 و19: إنجليزي + عربي','myth-m18-m19-English-Arabic.pdf'),
 ('الموديولان 20 و21: إنجليزي مبسط (A2-B1)','myth-m20-m21-English-A2B1.pdf'),('الموديولان 20 و21: إنجليزي + عربي','myth-m20-m21-English-Arabic.pdf'),
 ('الموديولان 22 و23: إنجليزي مبسط (A2-B1)','myth-m22-m23-English-A2B1.pdf'),('الموديولان 22 و23: إنجليزي + عربي','myth-m22-m23-English-Arabic.pdf'),
 ('الموديولان 24 و25: إنجليزي مبسط (A2-B1)','myth-m24-m25-English-A2B1.pdf'),('الموديولان 24 و25: إنجليزي + عربي','myth-m24-m25-English-Arabic.pdf')]}
for t,L in EX.items():
    f=f'{R}/track-{t}.html';s=open(f,encoding='utf-8').read()
    s=re.sub(r'<div class="extra-files">.*?</div>\n?','',s,flags=re.S)
    box='<div class="extra-files"><h2 style="margin:14px 0 4px;font-size:1.05rem">📚 ملفات PDF إضافية للكورس</h2>'+''.join(f'<a download class="pdf-link" href="pdf/extra/{p}" rel="noopener" style="display:block;margin:6px 0">📄 {l}</a>' for l,p in L)+'</div>\n'
    m=list(re.finditer(r'<details class="mm course-mm">.*?</details>\n?',s,re.S))
    if not m: print('noplace',t);continue
    s=s[:m[-1].end()]+box+s[m[-1].end():];open(f,'w',encoding='utf-8').write(s);print(t,len(L))
