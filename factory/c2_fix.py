import re,sys
R='/tmp/repo/lessons/'
ref=open(R+'grammar-c2-40.html',encoding='utf-8').read()
logo=re.search(r'<a class="logo".*?</a>',ref,re.S).group(0);suf=re.search(r'<title>[^<]*?( \| [^<|]*)</title>',ref).group(1)
for n in sys.argv[1:]:
    f=R+f'grammar-c2-{n}.html';s=open(f,encoding='utf-8').read()
    s=re.sub(r'<a class="logo".*?</a>',lambda m:logo,s,1,flags=re.S);s=re.sub(r'(<title>[^<]*?) \| [^<|]*</title>',lambda m:m.group(1)+suf+'</title>',s,1)
    open(f,'w',encoding='utf-8').write(s);print(n,'fixed')
import subprocess;subprocess.run(['python3','/tmp/c2_btn.py']+sys.argv[1:])
