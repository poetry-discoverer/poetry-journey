# extras.py <root>: "ملفات PDF إضافية" section on track-history / track-mythology from the lists below (idempotent). Add new batches to EX.
import re,sys
R=sys.argv[1]
EX={'history':[('الكورس كامل (الدروس 1 إلى 104): إنجليزي مبسط','history-en-L1-L104.pdf'),('الكورس كامل (الدروس 1 إلى 104): إنجليزي + مصري','history-combined-L1-L104.pdf'),('الكورس كامل (الدروس 1 إلى 104): ملخصات الدروس','history-summaries-L1-L104.pdf'),('الكورس كامل: نظرة عامة على الكورس','history-course-overview-L998.pdf'),('ملخص الكورس (الدروس 1 إلى 47): إنجليزي وعربي','history-course-summary-L1-L47.pdf'),
 ('الدروس 32 إلى 35: إنجليزي مبسط','history-en-L32-L35.pdf'),('الدروس 32 إلى 35: إنجليزي + مصري','history-combined-L32-L35.pdf'),('الدروس 32 إلى 35: ملخصات','history-summaries-L32-L35.pdf'),
 ('الدروس 36 إلى 37: إنجليزي مبسط','history-en-L36-L37.pdf'),('الدروس 36 إلى 37: إنجليزي + مصري','history-combined-L36-L37.pdf'),('الدروس 36 إلى 37: ملخصات','history-summaries-L36-L37.pdf'),
 ('الدروس 38 إلى 39: إنجليزي مبسط','history-en-L38-L39.pdf'),('الدروس 38 إلى 39: إنجليزي + مصري','history-combined-L38-L39.pdf'),('الدروس 38 إلى 39: ملخصات','history-summaries-L38-L39.pdf'),
 ('الدروس 40 إلى 41: إنجليزي مبسط','history-en-L40-L41.pdf'),('الدروس 40 إلى 41: إنجليزي + مصري','history-combined-L40-L41.pdf'),('الدروس 40 إلى 41: ملخصات','history-summaries-L40-L41.pdf'),
 ('الدروس 42 إلى 43: إنجليزي مبسط','history-en-L42-L43.pdf'),('الدروس 42 إلى 43: إنجليزي + مصري','history-combined-L42-L43.pdf'),('الدروس 42 إلى 43: ملخصات','history-summaries-L42-L43.pdf'),
 ('الدروس 44 إلى 45: إنجليزي مبسط','history-en-L44-L45.pdf'),('الدروس 44 إلى 45: إنجليزي + مصري','history-combined-L44-L45.pdf'),('الدروس 44 إلى 45: ملخصات','history-summaries-L44-L45.pdf'),
 ('الدروس 46 إلى 47: إنجليزي مبسط','history-en-L46-L47.pdf'),('الدروس 46 إلى 47: إنجليزي + مصري','history-combined-L46-L47.pdf'),('الدروس 46 إلى 47: ملخصات','history-summaries-L46-L47.pdf')],
 'mythology':[('الموديولات 1 إلى 8: إنجليزي مبسط (A2-B1)','myth-m01-m08-English-A2B1.pdf'),('الموديولات 1 إلى 8: إنجليزي + عربي','myth-m01-m08-English-Arabic.pdf'),
 ('الموديولات 9 إلى 11: إنجليزي مبسط (A2-B1)','myth-m09-m11-English-A2B1.pdf'),('الموديولات 9 إلى 11: إنجليزي + عربي','myth-m09-m11-English-Arabic.pdf'),
 ('الموديولان 12 و13: إنجليزي مبسط (A2-B1)','myth-m12-m13-English-A2B1.pdf'),('الموديولان 12 و13: إنجليزي + عربي','myth-m12-m13-English-Arabic.pdf'),
 ('الموديولان 14 و15: إنجليزي مبسط (A2-B1)','myth-m14-m15-English-A2B1.pdf'),('الموديولان 14 و15: إنجليزي + عربي','myth-m14-m15-English-Arabic.pdf'),
 ('الموديولان 16 و17: إنجليزي مبسط (A2-B1)','myth-m16-m17-English-A2B1.pdf'),('الموديولان 16 و17: إنجليزي + عربي','myth-m16-m17-English-Arabic.pdf'),
 ('الموديولان 18 و19: إنجليزي مبسط (A2-B1)','myth-m18-m19-English-A2B1.pdf'),('الموديولان 18 و19: إنجليزي + عربي','myth-m18-m19-English-Arabic.pdf'),
 ('الموديولان 20 و21: إنجليزي مبسط (A2-B1)','myth-m20-m21-English-A2B1.pdf'),('الموديولان 20 و21: إنجليزي + عربي','myth-m20-m21-English-Arabic.pdf'),
 ('الموديولان 22 و23: إنجليزي مبسط (A2-B1)','myth-m22-m23-English-A2B1.pdf'),('الموديولان 22 و23: إنجليزي + عربي','myth-m22-m23-English-Arabic.pdf'),
 ('الموديولان 24 و25: إنجليزي مبسط (A2-B1)','myth-m24-m25-English-A2B1.pdf'),('الموديولان 24 و25: إنجليزي + عربي','myth-m24-m25-English-Arabic.pdf'),
 ('الموديولان 26 و27: إنجليزي مبسط (A2-B1)','myth-m26-m27-English-A2B1.pdf'),('الموديولان 26 و27: إنجليزي + عربي','myth-m26-m27-English-Arabic.pdf'),
 ('الموديول 28: إنجليزي مبسط (A2-B1)','myth-m28-English-A2B1.pdf'),('الموديول 28: إنجليزي + عربي','myth-m28-English-Arabic.pdf')]}
import glob,os
_P=sorted({(lambda m:(m.group(1),m.group(2) or ''))(re.match(r'poetry-(\d+)(?:-(\d+))?-English',os.path.basename(f))) for f in glob.glob(R+'/pdf/extra/poetry-*-English-A2B1.pdf')},key=lambda x:int(x[0]))
EX['poetry']=[]
for a,b in _P:
    sfx=f'{a}-{b}' if b else a;tt=f'الدروس {int(a)} و{int(b)}' if b else f'الدرس {int(a)}'
    EX['poetry']+=[(f'تحليل القصائد، {tt}: إنجليزي مبسط (A2-B1)',f'poetry-{sfx}-English-A2B1.pdf'),(f'تحليل القصائد، {tt}: إنجليزي + عربي',f'poetry-{sfx}-English-Arabic.pdf')]
EX['grammar-c2']=[]
for r,t in [('L01-L04','1 إلى 4'),('L05-L06','5 و6'),('L07-L09','7 إلى 9'),('L10-L12','10 إلى 12'),('L13-L15','13 إلى 15'),('L16-L18','16 إلى 18'),('L19-L21','19 إلى 21'),('L22-L24','22 إلى 24'),('L25-L26','25 و26'),('L27-L29','27 إلى 29'),('L30-L32','30 إلى 32'),('L33-L35','33 إلى 35'),('L36-L38','36 إلى 38'),('L39-L41','39 إلى 41'),('L42-L44','42 إلى 44'),('L45-L46','45 و46')]:
    EX['grammar-c2']+=[(f'القواعد المتقدمة، الدروس {t}: إنجليزي مبسط',f'grammar-c2-en-{r}.pdf'),(f'القواعد المتقدمة، الدروس {t}: إنجليزي + مصري',f'grammar-c2-combined-{r}.pdf'),(f'القواعد المتقدمة، الدروس {t}: ملخصات الدروس',f'grammar-c2-summaries-{r}.pdf')]
EX['grammar-c2']=[(f'القواعد المتقدمة، الكورس كامل (1 إلى 46): {n}',f'grammar-c2-{k}-L01-L46.pdf') for k,n in [('en','إنجليزي مبسط'),('combined','إنجليزي + مصري'),('summaries','ملخصات الدروس')]]+EX['grammar-c2']
EX['comp']=[]
for r,t in [('01','1'),('02-05','2 إلى 5'),('06-09','6 إلى 9'),('10-13','10 إلى 13'),('14-18','14 إلى 18'),('19-22','19 إلى 22')]:
    EX['comp']+=[(f'الفهم والقراءة، الدروس {t}: إنجليزي مبسط',f'comp-en-{r}.pdf'),(f'الفهم والقراءة، الدروس {t}: إنجليزي + مصري',f'comp-combined-{r}.pdf'),(f'الفهم والقراءة، الدروس {t}: ملخصات',f'comp-summaries-{r}.pdf')]
EX['history']+=[('الدروس 48 إلى 52: إنجليزي مبسط','history-en-L48-L52.pdf'),('الدروس 48 إلى 52: إنجليزي + مصري','history-combined-L48-L52.pdf'),('الدروس 48 إلى 52: ملخصات','history-summaries-L48-L52.pdf'),('الدروس 53 إلى 55: إنجليزي مبسط','history-en-L53-L55.pdf'),('الدروس 53 إلى 55: إنجليزي + مصري','history-combined-L53-L55.pdf'),('الدروس 53 إلى 55: ملخصات','history-summaries-L53-L55.pdf'),('الدروس 101 إلى 104: إنجليزي مبسط','history-en-L101-L104.pdf'),('الدروس 101 إلى 104: إنجليزي + مصري','history-combined-L101-L104.pdf'),('الدروس 101 إلى 104: ملخصات','history-summaries-L101-L104.pdf')]
EX['grammar']=[]
for f in sorted(glob.glob(R+'/pdf/extra/grammar-[0-9]*-English-A2B1.pdf')):
    m=re.match(r'grammar-(\d+)(?:-(\d+))?-English',os.path.basename(f));a,b=m.groups();sfx=f'{a}-{b}' if b else a
    tt=f'الدروس {int(a)} إلى {int(b)}' if b else f'الدرس {int(a)}'
    EX['grammar']+=[(f'القواعد، {tt}: إنجليزي مبسط (A2-B1)',f'grammar-{sfx}-English-A2B1.pdf'),(f'القواعد، {tt}: إنجليزي + عربي',f'grammar-{sfx}-English-Arabic.pdf')]
for t,ar in [('essay','الإنشاء'),('skills','المهارات')]:
    EX[t]=[]
    for r,tt in [('L01-L03','1 إلى 3'),('L04-L06','4 إلى 6'),('L07-L09','7 إلى 9')]:
        EX[t]+=[(f'{ar}، الدروس {tt}: إنجليزي مبسط',f'{t}-en-{r}.pdf'),(f'{ar}، الدروس {tt}: إنجليزي + مصري',f'{t}-combined-{r}.pdf'),(f'{ar}، الدروس {tt}: ملخصات',f'{t}-summaries-{r}.pdf')]
EX['lt']=[]
for r,tt in [('L1-L4','1 إلى 4'),('L5-L8','5 إلى 8'),('L9-L12','9 إلى 12')]:
    EX['lt']+=[(f'نظرية الأدب، الدروس {tt}: إنجليزي مبسط',f'lt-en-{r}.pdf'),(f'نظرية الأدب، الدروس {tt}: إنجليزي + مصري',f'lt-combined-{r}.pdf'),(f'نظرية الأدب، الدروس {tt}: ملخصات',f'lt-summaries-{r}.pdf')]
EX['psycholinguistics']=[]
for r,tt in [('L01-L03','1 إلى 3')]:
    EX['psycholinguistics']+=[(f'علم اللغة النفسي، الدروس {tt}: إنجليزي مبسط',f'psy-en-{r}.pdf'),(f'علم اللغة النفسي، الدروس {tt}: إنجليزي + مصري',f'psy-combined-{r}.pdf'),(f'علم اللغة النفسي، الدروس {tt}: ملخصات',f'psy-summaries-{r}.pdf')]
EX['analysis']=[]
for f in sorted(glob.glob(R+'/pdf/extra/analysis-[0-9]*-English-A2B1.pdf')):
    m=re.match(r'analysis-(\d+)(?:-(\d+))?-English',os.path.basename(f));a,b=m.groups();sfx=f'{a}-{b}' if b else a
    tt=f'الدروس {int(a)} و{int(b)}' if b else f'الدرس {int(a)}'
    EX['analysis']+=[(f'التحليل الأدبي، {tt}: إنجليزي مبسط (A2-B1)',f'analysis-{sfx}-English-A2B1.pdf'),(f'التحليل الأدبي، {tt}: إنجليزي + عربي',f'analysis-{sfx}-English-Arabic.pdf')]

def _rng(t):
    out=[]
    for f in glob.glob(R+f'/pdf/extra/{t}-en-L*.pdf'):
        m=re.match(rf'{t}-en-L(\d+)(?:-L(\d+))?\.pdf',os.path.basename(f));out.append((int(m.group(1)),int(m.group(2) or m.group(1)),os.path.basename(f)[len(t)+4:-4]))
    return sorted(out)
for t,ar in [('psy','psycholinguistics'),('essay','essay'),('skills','skills'),('lt','lt')]:
    nm={'psy':'علم اللغة النفسي','essay':'الإنشاء','skills':'المهارات','lt':'نظرية الأدب'}[t]
    EX[ar]=[]
    for a,b,r in _rng(t):
        tt=f'الدروس {a} إلى {b}' if a!=b else f'الدرس {a}'
        EX[ar]+=[(f'{nm}، {tt}: إنجليزي مبسط',f'{t}-en-{r}.pdf'),(f'{nm}، {tt}: إنجليزي + مصري',f'{t}-combined-{r}.pdf'),(f'{nm}، {tt}: ملخصات',f'{t}-summaries-{r}.pdf')]
for t,L in EX.items():
    f=f'{R}/track-{t}.html';s=open(f,encoding='utf-8').read()
    s=re.sub(r'<div class="extra-files">.*?</div>\n?','',s,flags=re.S)
    box='<div class="extra-files"><h2 style="margin:14px 0 4px;font-size:1.05rem">📚 ملفات PDF إضافية للكورس</h2>'+''.join(f'<a download class="pdf-link" href="pdf/extra/{p}" rel="noopener" style="display:block;margin:6px 0">📄 {l}</a>' for l,p in L)+'</div>\n'
    m=list(re.finditer(r'<details class="mm course-mm">.*?</details>\n?',s,re.S))
    if not m: print('noplace',t);continue
    s=s[:m[-1].end()]+box+s[m[-1].end():];open(f,'w',encoding='utf-8').write(s);print(t,len(L))

import subprocess;subprocess.run(["python3","/tmp/extras_tab.py",R])
