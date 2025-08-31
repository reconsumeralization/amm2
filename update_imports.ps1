# PowerShell script to update all component import paths
$oldPaths = @(
    '@/components/admin/',
    '@/components/barber/',
    '@/components/booking/',
    '@/components/charts/',
    '@/components/chatbot/',
    '@/components/documentation/',
    '@/components/editor/',
    '@/components/monitoring/',
    '@/components/portal/',
    '@/components/search/',
    '@/components/sections/',
    '@/components/telemetry/'
)

$newPaths = @(
    '@/components/features/admin/',
    '@/components/features/barber/',
    '@/components/features/booking/',
    '@/components/features/charts/',
    '@/components/features/chatbot/',
    '@/components/features/documentation/',
    '@/components/features/editor/',
    '@/components/features/monitoring/',
    '@/components/features/portal/',
    '@/components/features/search/',
    '@/components/features/sections/',
    '@/components/features/telemetry/'
)

Get-ChildItem -Recurse -Path "src" -Include "*.tsx", "*.ts", "*.md" -Exclude "*node_modules*" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw

    for ($i = 0; $i -lt $oldPaths.Length; $i++) {
        $content = $content -replace [regex]::Escape($oldPaths[$i]), $newPaths[$i]
    }

    if ($content -ne (Get-Content $file -Raw)) {
        $content | Set-Content $file -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "Import path updates completed!"
