@echo off
start .\node_modules\.bin\appium 
timeout /t 5
start watch ".\node_modules\.bin\protractor .\protractor.android.conf.js" --wait=1



