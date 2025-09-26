# PowerShell script to clean merge conflicts from SalesBillScreen.js

$filePath = "screens\SalesBillScreen.js"
$content = Get-Content $filePath -Raw

# Remove Git merge conflict markers and keep the HEAD version (our payment functionality)
$content = $content -replace '<<<<<<< HEAD\r?\n', ''
$content = $content -replace '=======.*?>>>>>>> f6ea705a616112782528a0822e051efde031dfda\r?\n', ''
$content = $content -replace '>>>>>>> f6ea705a616112782528a0822e051efde031dfda\r?\n', ''

# Write the cleaned content back to the file
Set-Content -Path $filePath -Value $content

Write-Host "Merge conflicts cleaned from SalesBillScreen.js"
Write-Host "File is now ready for commit and push to GitHub"
