#!/usr/bin/env bash
# Stamp the asset URLs with the current commit, commit that, and push.
#
# GitHub Pages serves everything with Cache-Control: max-age=600, so without a
# version string a browser will keep running the old js and css for ten minutes
# after a deploy. Stamping the URLs means the new files load the moment the
# browser picks up a fresh index.html.
#
#   ./tools/release.sh "commit message"

set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-Deploy}"

git add -A
git diff --cached --quiet || git commit -q -m "$MSG"

REV="$(git rev-parse --short HEAD)"
python - "$REV" <<'PY'
import io, re, sys
rev = sys.argv[1]
s = io.open('index.html', encoding='utf-8').read()
s = re.sub(r'(href="css/app\.css)(\?v=[^"]*)?"', r'\1?v=%s"' % rev, s)
s = re.sub(r'(src="js/(?:data|messages|app)\.js)(\?v=[^"]*)?"', r'\1?v=%s"' % rev, s)
io.open('index.html', 'w', encoding='utf-8', newline='\n').write(s)
print('stamped', rev)
PY

git add index.html
git diff --cached --quiet || git commit -q -m "Stamp assets $REV"
git push -q origin main

echo "pushed. Pages usually rebuilds in under a minute:"
echo "  https://jharvey1113.github.io/away-mode/"
