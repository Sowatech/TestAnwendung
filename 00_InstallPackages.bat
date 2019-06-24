@echo off
cd Sowatech.TestAnwendung.Mobile
start 00_InstallPackages.bat
cd ..
cd Sowatech.TestAnwendung.Spa
call  00_InstallPackages.bat
cd ..
pause