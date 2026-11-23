#!/usr/bin/env bash
# Attend la fin du déploiement Netlify d'un commit (CLI `netlify` connectée, site lié).
# Usage : scripts/wait-deploy.sh [sha]   (défaut : HEAD ; code 1 si le déploiement échoue ou n'aboutit pas en 15 min)
set -euo pipefail
sha=$(git rev-parse "${1:-HEAD}")
site=$(python3 -c "import json;print(json.load(open('.netlify/state.json'))['siteId'])")
for _ in $(seq 1 90); do
  state=$(netlify api listSiteDeploys --data "{\"site_id\":\"$site\",\"per_page\":20}" |
    python3 -c "import sys,json;print(next((d['context']+' '+d['state'] for d in json.load(sys.stdin) if d.get('commit_ref')=='$sha'),'absent'))")
  echo "$state"
  case "$state" in *ready) exit 0 ;; *error) exit 1 ;; esac
  sleep 10
done
exit 1
