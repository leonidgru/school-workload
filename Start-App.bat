@echo off
chcp 65001 > nul
echo ========================================================
echo  מערכית - מחשבון משרות ושעות מורים בתיכון
echo  האפליקציה נפתחת כעת בדפדפן...
echo ========================================================

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%~dp0index.html" || start "" "%~dp0index.html"
exit
