@echo off
cd /d "%~dp0"
title PeerConnect - keep this window open
if not exist "runtime\node.exe" (
  echo The folder is incomplete. Extract the entire ZIP before opening this file.
  pause
  exit /b 1
)
"%~dp0runtime\node.exe" scripts\easy-open.mjs
if errorlevel 1 pause
