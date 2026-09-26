$ErrorActionPreference = "SilentlyContinue"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $ProjectDir) {
    $ProjectDir = "c:\Users\user\Downloads\educontrol"
}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   EduControl: Avto-ishga tushirish va yorliq sozlash    " -ForegroundColor Cyan
Write-Host "   Настройка автозапуска и рабочего ярлыка EduControl    " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/4] Loyiha manzili: $ProjectDir" -ForegroundColor Gray

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$StartupPath = [Environment]::GetFolderPath("Startup")
$IconPath = Join-Path $ProjectDir "EduControl.ico"
$VbsPath = Join-Path $ProjectDir "EduControl.vbs"
$BatPath = Join-Path $ProjectDir "EduControl.bat"
$WscriptExe = "$env:SystemRoot\System32\wscript.exe"

# 1. Desktop Shortcut
$DesktopLnk = Join-Path $DesktopPath "EduControl.lnk"
$DesktopShortcut = $WshShell.CreateShortcut($DesktopLnk)
$DesktopShortcut.TargetPath = $BatPath
$DesktopShortcut.WorkingDirectory = $ProjectDir
$DesktopShortcut.IconLocation = "$IconPath,0"
$DesktopShortcut.Description = "EduControl - Ish vaqti hisobi va nazorati"
$DesktopShortcut.Save()
Write-Host "[2/3] Ish stolidagi yorliq yangilandi (Desktop shortcut created)." -ForegroundColor Green

# 2. Remove any lingering autostarts (Startup folder, Registry Run, Task Scheduler)
$StartupLnk = Join-Path $StartupPath "EduControl*.lnk"
Remove-Item $StartupLnk -Force -ErrorAction SilentlyContinue

try {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "EduControl" -Force -ErrorAction SilentlyContinue
} catch {}

$TaskName = "EduControl_AutoBoot"
schtasks.exe /delete /tn $TaskName /f 2>$null

Write-Host "[3/3] Avto-ishga tushirish (Startup, Registry, Scheduler) butunlay o'chirildi." -ForegroundColor Green

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " [MUVOFAQIYATLI / УСПЕШНО] " -ForegroundColor Green
Write-Host " EduControl faqat brauzerda localhost:3000 rejimida ishlaydi!" -ForegroundColor White
Write-Host " Avtomatik ishga tushish o'chirildi (Без автозапуска)." -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan
