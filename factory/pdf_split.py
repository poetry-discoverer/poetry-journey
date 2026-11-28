# pdf_split.py <site dir> : point every pdf/ link at the separate PDF site (same origin, root-relative). Idempotent.
import re,sys,os
R=sys.argv[1];B='/poetry-journey-pdf/pdf/'
pat=re.compile(r'''(?<=["'(=])(?:\.\./)?pdf/''')
n=0
for root,ds,fs in os.walk(R):
    ds[:]=[d for d in ds if d not in('.git','pdf')]
    for f in fs:
        if not f.endswith(('.html','.js')): continue
        p=os.path.join(root,f);s=open(p,encoding='utf-8').read()
        t=pat.sub(B,s)
        if t!=s: open(p,'w',encoding='utf-8').write(t);n+=1
print('files changed',n)
