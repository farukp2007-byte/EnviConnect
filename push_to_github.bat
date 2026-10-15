@echo off
set GIT_PATH=C:\Users\affan\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe
echo Pushing EnviConnect to https://github.com/gattujayakrishna48-arch/EnviConnect.git ...
"%GIT_PATH%" push -u origin main
pause
