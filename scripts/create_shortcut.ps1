$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$targetDir = "c:\Users\user\Downloads\educontrol"
$vbsPath = "$targetDir\EduControl.vbs"
$iconPath = "$targetDir\EduControl.ico"

$wsh = New-Object -ComObject WScript.Shell

# Desktop shortcut
$shortcutPath = Join-Path $desktop "EduControl.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $targetDir
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = "EduControl - Ish vaqti hisobi"
$shortcut.Save()

# Startup shortcut
$startupShortcutPath = Join-Path $startup "EduControl.lnk"
$startupShortcut = $wsh.CreateShortcut($startupShortcutPath)
$startupShortcut.TargetPath = "wscript.exe"
$startupShortcut.Arguments = "`"$vbsPath`""
$startupShortcut.WorkingDirectory = $targetDir
$startupShortcut.IconLocation = "$iconPath,0"
$startupShortcut.Description = "EduControl - Ish vaqti hisobi"
$startupShortcut.Save()

Write-Output "Shortcuts created successfully: $shortcutPath and $startupShortcutPath"
