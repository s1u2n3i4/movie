@echo off
title Reelhouse Movie Catalog
echo ====================================================
echo Starting Reelhouse Movie Catalog (React / Next.js)
echo ====================================================
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Dev Server Starting at http://localhost:3000 ...
call npm run dev
pause
