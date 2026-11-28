#!/bin/bash
# pushes /tmp/repo/pdf to the separate PDF site repo (poetry-journey-pdf)
rsync -a /tmp/repo/pdf/ /tmp/pdfsite/pdf/; cd /tmp/pdfsite; git add -A
git -c user.name=poetry-discoverer -c user.email=omar.ahmed.tat@gmail.com commit -qm pdfs 2>/dev/null
GIT_ASKPASS=/tmp/askpass.sh GIT_TERMINAL_PROMPT=0 timeout 100 git push -q https://github.com/poetry-discoverer/poetry-journey-pdf.git main && echo pdf-pushed
