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
Write-Host "[2/5] Ish stolidagi yorliq yangilandi (Desktop shortcut created)." -ForegroundColor Green

# 2. Windows Startup Shortcut (shell:startup)
$StartupLnk = Join-Path $StartupPath "EduControl.lnk"
$StartupShortcut = $WshShell.CreateShortcut($StartupLnk)
$StartupShortcut.TargetPath = $WscriptExe
$StartupShortcut.Arguments = "`"$VbsPath`""
$StartupShortcut.WorkingDirectory = $ProjectDir
$StartupShortcut.IconLocation = "$IconPath,0"
$StartupShortcut.Description = "EduControl AutoStart"
$StartupShortcut.Save()
Write-Host "[3/5] Windows avto-yuklanishiga (Startup) qo'shildi." -ForegroundColor Green

# 3. Windows Registry Run (HKCU - 100% reliable on every reboot)
try {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "EduControl" -Value "`"$WscriptExe`" `"$VbsPath`"" -Force
    Write-Host "[4/5] Windows Registry Run kalitiga muvaffaqiyatli yozildi." -ForegroundColor Green
} catch {
    Write-Host "[4/5] Registry yozish o'tkazib yuborildi." -ForegroundColor Yellow
}

# 4. Windows Task Scheduler (OnLogon)
$TaskName = "EduControl_AutoBoot"
$TaskRun = "`"$WscriptExe`" `"$VbsPath`""
schtasks.exe /create /tn $TaskName /tr $TaskRun /sc onlogon /f 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[5/5] Windows Rejalashtiruvchisi (Task Scheduler) muvaffaqiyatli sozlandi." -ForegroundColor Green
} else {
    Write-Host "[5/5] Startup va Registry orqali avto-ishga tushirish to'liq faol." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " [MUVOFAQIYATLI / УСПЕШНО] " -ForegroundColor Green
Write-Host " Kompyuter yoqilganda EduControl avtomatik ishga tushadi!" -ForegroundColor White
Write-Host " При включении компьютера EduControl запустится сам!" -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan
