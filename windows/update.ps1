[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "----------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "|                                 ⚠️ WARNING ⚠️                                  |" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "|          This function will overwrite all files in the local project           |" -ForegroundColor Yellow
Write-Host "|                   that are the same as those on the server.                    |" -ForegroundColor Yellow
Write-Host "| Make sure you have backed up any changes you have made to the INTERNAL SYSTEM. |" -ForegroundColor Yellow
Write-Host "|                                                                                |" -ForegroundColor Yellow
Write-Host "|  This function will not affect temporary files (those in the '__temp' folder)  |" -ForegroundColor Yellow
Write-Host "|                    or other files included in '.gitignore'                     |" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------------------" -ForegroundColor Yellow

function Invoke-Menu {
    param(
        [string]$Title,
        [string[]]$Options
    )

    $selection = 0
    
    $menuHeight = $Options.Count + 2

    $originCursorVisible = [Console]::CursorVisible
    [Console]::CursorVisible = $false

    try {
        Write-Host ("`n" * $menuHeight) -NoNewline
        
        $startTop = [Console]::CursorTop - $menuHeight

        while ($true) {
            [Console]::SetCursorPosition(0, $startTop)

            $width = [Console]::WindowWidth - 1
            
            $titleLine = "$Title".PadRight($width)
            Write-Host $titleLine -ForegroundColor Gray
            
            for ($i = 0; $i -lt $Options.Count; $i++) {
                $lineText = "   $($Options[$i])"
                
                if ($i -eq $selection) {
                    $lineText = " > $($Options[$i])"
                    Write-Host $lineText.PadRight($width) -ForegroundColor Black -BackgroundColor Green
                } else {
                    Write-Host $lineText.PadRight($width) -ForegroundColor White -BackgroundColor Black
                }
            }
            
            $key = [Console]::ReadKey($true)

            switch ($key.Key) {
                "UpArrow" { 
                    if ($selection -gt 0) { $selection-- } 
                }
                "DownArrow" { 
                    if ($selection -lt ($Options.Count - 1)) { $selection++ } 
                }
                "Enter" { 
                    [Console]::SetCursorPosition(0, $startTop + $menuHeight)
                    return $Options[$selection] 
                }
            }
        }
    }
    finally {
        [Console]::CursorVisible = $originCursorVisible
    }
}

$myOptions = @(
    "Yes, Start the update",
    "No, Cancel"
)

$result = Invoke-Menu -Title "`nDo you want to continue:" -Options $myOptions
switch ($result) {
    "Yes, Start the update" {
        Write-Host "Starting update...`n" -ForegroundColor Cyan
        git fetch --all
        git reset --hard origin/main
        bun i

        Write-Host "`n`nThis window will automatically close in 5 seconds..."
        Start-Sleep -Seconds 5
    }
    "No, Cancel" {
        Write-Host "Update cancelled" -ForegroundColor Cyan
        exit
    }
}
