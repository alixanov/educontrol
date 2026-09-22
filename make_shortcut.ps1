$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('C:\\Users\\user\\Desktop\\EduControl.lnk')
$Shortcut.TargetPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
$Shortcut.Arguments = '--app=http://localhost:3000/cameras'
$Shortcut.WorkingDirectory = 'c:\\Users\\user\\Downloads\\educontrol'
$Shortcut.Description = 'EduControl'
$Shortcut.Save()