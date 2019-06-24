rmdir /S /Q Deploy
mkdir Deploy
xcopy Sowatech.TestAnwendung.Spa\dist Deploy /s /y
xcopy Sowatech.TestAnwendung.Application\dist Deploy /s /y
pause