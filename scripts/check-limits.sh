#!/bin/sh
# Prints each file that breaks the size limits: 400 lines for a file,
# 80 characters for a line. Empty output means that all files pass.
# Data fixtures and the files of the design tool are exempt.
EXEMPT='^data/problems\.json$|^scripts/.*\.json$|^tests/fixtures/'
EXEMPT="$EXEMPT|^\.impeccable/"
FILES=$(git ls-files --cached --others --exclude-standard |
  grep -vE "$EXEMPT")
for f in $FILES; do
  [ -f "$f" ] || continue
  n=$(wc -l < "$f")
  if [ "$n" -gt 400 ]; then echo "LONG $f ($n)"; fi
  awk -v f="$f" 'length($0) > 80 {print "WIDE " f ":" FNR}' "$f"
done
