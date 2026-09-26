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

# Desktop shortcut (Starts EduControl and opens in standard browser)
$shortcutPath = Join-Path $desktop "EduControl.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $targetDir
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = "EduControl - Ish vaqti hisobi (Brauzer)"
$shortcut.Save()

Write-Output "Desktop shortcut created successfully: $shortcutPath"

