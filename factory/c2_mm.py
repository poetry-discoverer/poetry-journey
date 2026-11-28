import json,re,sys,html,subprocess,os
cols=['#58cc02','#1cb0f6','#ff9600','#ce82ff','#ff4b4b','#00cd9c','#ffc800','#2b70c9']
def build(n):
    lid=f'grammar-c2-{n}';s=open(f'/tmp/repo/lessons/{lid}.html',encoding='utf-8').read();i=s.index('window.STEPS=')+13
    st=json.JSONDecoder().raw_decode(s[i:])[0]
    title=re.search(r'<h1>(.*?)</h1>',s).group(1)
    br=[]
    for x in st:
        if x['t']=='section': br.append([x['h'],[],''])
        elif x['t']=='learn' and br:
            terms=re.findall(r'<span class="en">(.*?)</span>',x['h'])
            for t in terms:
                t=re.sub('<[^>]+>','',t).strip()
                if t and t not in br[-1][1] and len(t)<30 and len(t.split())<=3 and 'simple english' not in t.lower(): br[-1][1].append(t)
            if not br[-1][2]:
                tx=re.sub(r'<[^>]+>',' ',x['h']);tx=re.sub(r'\s+',' ',tx).strip();br[-1][2]=tx.split('.')[0][:90]
    br=[b for b in br if b[0].strip()]
    boxes=''
    for k,(h,ts,d) in enumerate(br):
        c=cols[k%len(cols)]
        lv=''.join(f'<span dir="ltr">{html.escape(t)}</span>' for t in ts[:5])
        boxes+=f'<div class="b" style="border-color:{c}"><div class="bh" style="background:{c}">{html.escape(h)}</div><div class="bd">{html.escape(d)}</div><div class="bt">{lv}</div></div>'
    H=f'''<!DOCTYPE html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>
body{{margin:0;background:#fff;font-family:"Noto Naskh Arabic","Noto Sans Arabic",Arial,sans-serif;width:1600px}}
.c{{margin:30px auto 10px;width:900px;text-align:center;background:#58cc02;color:#fff;border-radius:40px;padding:26px;font-size:40px;font-weight:900}}
.g{{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:20px 40px 40px}}
.b{{border:5px solid;border-radius:24px;overflow:hidden;background:#fafafa}}
.bh{{color:#fff;font-size:32px;font-weight:900;padding:12px 18px}}
.bd{{font-size:25px;padding:12px 18px;color:#333;line-height:1.6}}
.bt{{padding:4px 18px 16px;display:flex;flex-wrap:wrap;gap:8px}}
.bt span{{background:#eef6ff;border-radius:12px;padding:4px 12px;font-size:24px;font-weight:700;font-family:Arial}}
</style><body><div class="c">{html.escape(title)}</div><div class="g">{boxes}</div></body></html>'''
    p=f'/tmp/mm/mm-{n}.html';os.makedirs('/tmp/mm',exist_ok=True);open(p,'w',encoding='utf-8').write(H)
    # height
    rows=(len(br)+1)//2;hgt=140+rows*330
    png=f'/tmp/repo/mindmaps/mindmap-{lid}.png'
    subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',f'--window-size=1600,{hgt}',f'--screenshot={png}',f'file://{p}'],capture_output=True,timeout=60)
    subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--no-pdf-header-footer',f'--print-to-pdf=/tmp/repo/mindmaps/mindmap-{lid}.pdf',f'file://{p}'],capture_output=True,timeout=60)
    print(lid,len(br))
for n in sys.argv[1:]: build(n)
