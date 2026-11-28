#!/bin/bash
# size check run on every publish; warns above 700 MB (Pages limit 1000 MB)
chk(){ s=$(du -sm --exclude=.git $2 "$1" | cut -f1); if [ $s -gt 700 ]; then echo "SIZE WARNING $1 ${s}MB"; else echo "size $1 ${s}MB"; fi; }
chk /tmp/repo --exclude=pdf; chk /tmp/tefl; chk /tmp/tefl2s; chk /tmp/pdfsite/pdf
for d in aud/L-main clips clips2 clips3 clips4; do chk /tmp/$d; done | grep WARNING
true
