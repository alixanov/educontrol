Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Ensure logs directory exists
logsDir = baseDir & "\logs"
If Not fso.FolderExists(logsDir) Then
    fso.CreateFolder(logsDir)
End If

' 1. Check if backend (port 5000) is running
cmd5000 = "cmd.exe /c netstat -ano | findstr :5000 | findstr LISTENING"
res5000 = WshShell.Run(cmd5000, 0, True)
If res5000 <> 0 Then
    WshShell.Run "cmd.exe /c """ & baseDir & "\scripts\start_backend.bat""", 0, False
End If

' 2. Check if frontend (port 3000) is running
cmd3000 = "cmd.exe /c netstat -ano | findstr :3000 | findstr LISTENING"
res3000 = WshShell.Run(cmd3000, 0, True)
If res3000 <> 0 Then
    WshShell.Run "cmd.exe /c """ & baseDir & "\scripts\start_frontend.bat""", 0, False
End If

' 3. Wait until port 3000 is listening (max 60 seconds)
For i = 1 To 120
    res3000 = WshShell.Run(cmd3000, 0, True)
    If res3000 = 0 Then Exit For
    WScript.Sleep 500
Next

WScript.Sleep 1000

' 4. Launch app in Chrome app mode or Edge or default browser (forced new window)
appUrl = "http://localhost:3000/cameras"

Dim chromePath, chromePath86, edgePath, edgePath86
chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")
chromePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")
edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
edgePath86 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --new-window --app=" & appUrl, 1, False
ElseIf fso.FileExists(chromePath86) Then
    WshShell.Run """" & chromePath86 & """ --new-window --app=" & appUrl, 1, False
ElseIf fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --new-window --app=" & appUrl, 1, False
ElseIf fso.FileExists(edgePath86) Then
    WshShell.Run """" & edgePath86 & """ --new-window --app=" & appUrl, 1, False
Else
    WshShell.Run "cmd.exe /c start """" """ & appUrl & """", 0, False
End If

