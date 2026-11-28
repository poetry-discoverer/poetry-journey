#!/bin/bash
# usage: c2_all.sh [lesson numbers with new html...]; also splits any new summaries pdfs; wires buttons; publishes
cd /tmp
for n in "$@"; do python3 c2_pub.py $n | tail -1; python3 c2_fix.py $n >/dev/null; python3 c2_mm.py $n | tail -1; done
touch /tmp/.sumdone
for f in $(ls /downloads/grammar-c2-summaries-L*.pdf 2>/dev/null); do
  grep -qxF "$f" /tmp/.sumdone || { first=$(basename $f | sed -E 's/.*summaries-L([0-9]+).*/\1/'); python3 c2_sumsplit.py $f $first | tail -3; echo $f >> /tmp/.sumdone; }
done
python3 c2_btn.py $(ls repo/lessons/grammar-c2-*.html | sed -E 's/.*c2-([0-9]+)\.html/\1/' | awk '$1>=41') | tr '\n' ' '
python3 extras.py /tmp/repo >/dev/null
timeout 100 ./pubsite.sh repo poetry-journey poetry 2>&1 | tail -2
