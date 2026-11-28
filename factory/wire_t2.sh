#!/bin/bash
# wire_t2.sh N... : wire tefl-practical lesson(s) text only into /tmp/tefl2s
cd /tmp
for n in "$@"; do
 L=tefl2-$n; D=/tmp/inc/w$L; rm -rf $D; mkdir -p $D
 for z in /downloads/$L-*.zip; do unzip -oq $z -d $D; done
 H=$(find $D -name "$L.html"|head -1); P=$(find $D -name "lesson-$L.pdf"|head -1); G=$(find $D -name "$L-glossary.csv"|head -1)
 TROOT=/tmp/tefl2s python3 tefl_pub2.py $L $H $P none $G 2>&1 | grep -E "^(terms|ok|Traceback|.*Error)" | cut -c1-160
 S=$(find $D -name "summary-ar-$L.pdf"|head -1); cp $(dirname $S)/summary-*-$L.pdf tefl2s/pdf/; cp $(dirname $S)/mindmap-$L.pdf $(dirname $S)/mindmap-$L.png tefl2s/mindmaps/
 python3 - $L <<'P'
import re,sys
L=sys.argv[1];R='/tmp/tefl2s/lessons/'
ref=open(R+'tefl2-41.html',encoding='utf-8').read()
logo=re.search(r'<a class="logo".*?</a>',ref,re.S).group(0)
f=R+L+'.html';s=open(f,encoding='utf-8').read()
s=re.sub(r'<a class="logo".*?</a>',lambda m:logo,s,1,flags=re.S)
s=re.sub(r'(<title>[^<]*?) \| [^<|]*</title>',lambda m:m.group(1)+' | Learn TEFL Practical</title>',s,1)
open(f,'w',encoding='utf-8').write(s)
P
done
