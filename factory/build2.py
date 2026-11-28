import json,re,html,subprocess,urllib.parse,openpyxl
from openpyxl.styles import Font,Alignment,PatternFill
d=json.load(open('entries.json'))
S='https://dictionary.cambridge.org/search/english-arabic/direct/?q='
def u(w): return S+urllib.parse.quote_plus(w.lower())
def link_en(t):
    def f(m):
        w=m.group(0); return '<a href="%s">%s</a>'%(u(w),html.escape(w))
    parts=re.split(r"([A-Za-z]+(?:'[a-z]+)?)",t)
    return ''.join(f(re.match('.*',p)) if re.fullmatch(r"[A-Za-z]+(?:'[a-z]+)?",p) else html.escape(p) for p in parts)
names={'verbs-l2':('الأفعال الشاذة: المستوى الثاني','Irregular Verbs Level 2'),'phrasal-l2':('الأفعال المركبة: المستوى الثاني','Phrasal Verbs Level 2'),'verbs':('الأفعال الشاذة','Irregular Verbs'),'phrasal':('الأفعال المركبة','Phrasal / Compound Verbs'),'collocations':('الكولوكيشنز','Collocations')}
CSS=open('css.txt').read()
for tr,es in d.items():
    es=[e for e in es if e['ar']]
    ar,en=names[tr]
    h=['<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>%s</style><body>'%CSS]
    h.append('<h1>%s (%s)</h1><p class="n">%d كلمة. اضغط على أي كلمة إنجليزي علشان تفتح قاموس Cambridge Learner إنجليزي عربي. الرابط الأزرق على المصطلح كله، وكل كلمة لوحدها ليها رابطها.</p>'%(ar,en,len(es)))
    cl=None
    for e in es:
        if e['lesson']!=cl:
            cl=e['lesson']; a_,_,b_=e['ltitle'].partition(': '); h.append('<h2>%s: <bdi dir="ltr">%s</bdi></h2>'%(html.escape(a_),html.escape(b_.replace('،',','))))
        h.append('<div class="c"><div class="t" dir="ltr"><a class="ph" href="%s">%s</a></div>'%(u(e['term']),html.escape(e['term'])))
        if e['forms']: h.append('<div class="f" dir="ltr">%s</div>'%link_en(e['forms']))
        h.append('<div class="a">%s</div>'%html.escape(e['ar']))
        if e['def']: h.append('<div class="d" dir="ltr">%s</div>'%link_en(e['def']))
        if e['ex']: h.append('<div class="x" dir="ltr">%s</div><div class="xa">%s</div>'%(link_en(e['ex'][0]),html.escape(e['ex'][1])))
        h.append('</div>')
    open('%s.html'%tr,'w',encoding='utf-8').write(''.join(h))
    # xlsx
    wb=openpyxl.Workbook(); ws=wb.active; ws.title=en.replace('/',' ')[:30]; ws.sheet_view.rightToLeft=True
    ws.append(['#','الكلمة / المصطلح (رابط القاموس)','التصريفات','المعنى بالعربي','Definition','مثال','ترجمة المثال','الدرس'])
    for c in ws[1]: c.font=Font(bold=True,color='FFFFFF'); c.fill=PatternFill('solid',fgColor='58A700'); c.alignment=Alignment(horizontal='center')
    words={}
    for i,e in enumerate(es,1):
        ws.append([i,e['term'],e['forms'],e['ar'],e['def'],e['ex'][0] if e['ex'] else '',e['ex'][1] if e['ex'] else '',e['ltitle']])
        c=ws.cell(i+1,2); c.hyperlink=u(e['term']); c.font=Font(color='0B6FA8',underline='single',bold=True)
        for w in re.findall(r"[A-Za-z]+(?:'[a-z]+)?",' '.join([e['term'],e['forms'],e['def']]+e['ex'][:1])): words.setdefault(w.lower(),0)
    for col,wd in zip('ABCDEFGH',(5,28,26,28,36,40,34,40)): ws.column_dimensions[col].width=wd
    for r in ws.iter_rows(min_row=2):
        for c in r: c.alignment=Alignment(wrap_text=True,vertical='top')
    ws.freeze_panes='A2'
    w2=wb.create_sheet('كل الكلمات'); w2.sheet_view.rightToLeft=True; w2.append(['Word','Cambridge link'])
    for c in w2[1]: c.font=Font(bold=True)
    for i,w in enumerate(sorted(words),2):
        w2.append([w,'Cambridge ↗']); c=w2.cell(i,2); c.hyperlink=u(w); c.font=Font(color='0B6FA8',underline='single')
    w2.column_dimensions['A'].width=24;w2.column_dimensions['B'].width=18
    wb.save('course-%s.xlsx'%tr)
    print(tr,len(es),len(words))
