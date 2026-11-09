# Guarda una captura PNG de una ventana concreta (por defecto, la consola desde la que se llama).
# Usa PrintWindow, así la imagen contiene solo esa ventana aunque haya otras encima.
param(
  [Parameter(Mandatory = $true)][string]$Archivo,
  [string]$Proceso = "",
  [string]$Titulo = ""
)
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Ventana {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[Ventana]::SetProcessDPIAware() | Out-Null

if ($Proceso) {
  $p = Get-Process -Name $Proceso -ErrorAction SilentlyContinue |
       Where-Object { $_.MainWindowHandle -ne 0 -and ($Titulo -eq "" -or $_.MainWindowTitle -like "*$Titulo*") } |
       Select-Object -First 1
  if (-not $p) { Write-Host "No se encontro la ventana de $Proceso"; exit 1 }
  $h = $p.MainWindowHandle
} else {
  $h = [Ventana]::GetConsoleWindow()
}

$r = New-Object Ventana+RECT
[Ventana]::GetWindowRect($h, [ref]$r) | Out-Null
$ancho = $r.R - $r.L; $alto = $r.B - $r.T
$bmp = New-Object System.Drawing.Bitmap $ancho, $alto
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
[Ventana]::PrintWindow($h, $hdc, 2) | Out-Null   # 2 = PW_RENDERFULLCONTENT
$g.ReleaseHdc($hdc); $g.Dispose()
$bmp.Save($Archivo, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "  [captura guardada: $(Split-Path $Archivo -Leaf)]"
