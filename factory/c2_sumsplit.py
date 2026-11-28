import subprocess,sys,re,glob,os
src,first=sys.argv[1],int(sys.argv[2])
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',src],capture_output=True,text=True).stdout).group(1))
secs=[];cur=None;lesson=first-1
for p in range(2,n+1):
    t=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),src,'-'],capture_output=True,text=True).stdout
    head='\n'.join(t.split('\n')[:6])
    if 'Summary (English)' in head: lesson+=1;cur=(lesson,'en',[p]);secs.append(cur)
    else: cur[2].append(p)
for l,k,ps in secs:
    out=f'/tmp/repo/pdf/summary-grammar-c2-{l}.pdf'
    tmp=[]
    for p in ps:
        f=f'/tmp/_pg{p}.pdf';subprocess.run(['pdfseparate','-f',str(p),'-l',str(p),src,f.replace('.pdf','-%d.pdf')],check=True);tmp.append(f.replace('.pdf',f'-{p}.pdf'))
    subprocess.run(['pdfunite']+tmp+[out],check=True)
    for t in tmp: os.remove(t)
    print(l,k,ps,out)
