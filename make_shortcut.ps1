$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath 'EduControl.lnk'
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'c:\Users\user\Downloads\educontrol\EduControl.bat'
$Shortcut.WorkingDirectory = 'c:\Users\user\Downloads\educontrol'
$Shortcut.IconLocation = 'c:\Users\user\Downloads\educontrol\EduControl.ico,0'
$Shortcut.Description = 'EduControl - Ish vaqti hisobi (Brauzer)'
$Shortcut.Save()