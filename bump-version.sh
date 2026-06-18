#!/bin/bash
# Verzió kód automatikus növelés buildelés előtt

APP_JSON="app.json"

# Jelenlegi verzió kód kiolvasása
CURRENT=$(node -e "const a=require('./app.json'); console.log(a.expo.android?.versionCode || 1)")
NEW=$((CURRENT + 1))

# Verzió kód frissítése
node -e "
const fs = require('fs');
const app = require('./app.json');
if (!app.expo.android) app.expo.android = {};
app.expo.android.versionCode = $NEW;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
"

echo "✅ versionCode: $CURRENT → $NEW"
