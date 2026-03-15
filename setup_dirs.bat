@echo off
setlocal enabledelayedexpansion

set "base_path=c:\Users\niteesh\OneDrive\Desktop\coding\codeswayam\codeswayam-auth"

echo Creating directories...
if not exist "!base_path!\app\dashboard" mkdir "!base_path!\app\dashboard"
if not exist "!base_path!\app\account" mkdir "!base_path!\app\account"

echo Creating files...
echo // Dashboard page component > "!base_path!\app\dashboard\page.tsx"
echo // Dashboard layout component > "!base_path!\app\dashboard\layout.tsx"
echo // Account page component > "!base_path!\app\account\page.tsx"
echo // Account layout component > "!base_path!\app\account\layout.tsx"

echo.
echo Directories and files created successfully!
