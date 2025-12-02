#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 8002 >/dev/null 2>&1 &
sleep 2
open "http://localhost:8002"
