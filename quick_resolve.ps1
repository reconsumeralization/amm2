# Quick conflict resolver for simple cases
Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css" -Exclude "*.d.ts" |
Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -notlike "*.git*" } |
ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match '^<<<<<<< HEAD') {
        Write-Host "Checking: $filePath"

        # Simple pattern: description changes
        if ($content -match '<<<<<<< HEAD.*?description.*?:.*?"[^"]*barber[^"]*"=======.*?description.*?:.*?"[^"]*BarberShop[^"]*">>>>>>> clean-merge') {
            $resolved = $content -replace '(<<<<<<< HEAD.*?description.*?:.*?"[^"]*barber[^"]*").*?(=======).*?(description.*?:.*?"[^"]*BarberShop[^"]*").*?(>>>>>>> clean-merge)', '$3'
            Set-Content $filePath $resolved -ErrorAction SilentlyContinue
            Write-Host "✓ Resolved description conflict in: $filePath"
        }
        # Simple pattern: title changes
        elseif ($content -match '<<<<<<< HEAD.*?title.*?:.*?"[^"]*barber[^"]*"=======.*?title.*?:.*?"[^"]*BarberShop[^"]*">>>>>>> clean-merge') {
            $resolved = $content -replace '(<<<<<<< HEAD.*?title.*?:.*?"[^"]*barber[^"]*").*?(=======).*?(title.*?:.*?"[^"]*BarberShop[^"]*").*?(>>>>>>> clean-merge)', '$3'
            Set-Content $filePath $resolved -ErrorAction SilentlyContinue
            Write-Host "✓ Resolved title conflict in: $filePath"
        }
    }
}

Write-Host "Quick resolution completed!"
