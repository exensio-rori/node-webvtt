@ECHO OFF
Setlocal EnableDelayedExpansion
ECHO Kontrolliere alle VTT Dateien
REM Add Node.JS to the PATH
SET PATH=%PATH%;Node.js\
FOR %%f in (*.vtt) DO (
    ECHO   Arbeite an %%f...
    "Node.js\node.exe" "Node.js\node_modules\webvtt\bin\webvtt.js" "%%f"
)
ENDLOCAL
PAUSE EXIT %errorlevel%