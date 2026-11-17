@echo off
cd /d "%~dp0"
title PeerConnect - unit tests
"%~dp0runtime\node.exe" node_modules\vitest\vitest.mjs run
pause
