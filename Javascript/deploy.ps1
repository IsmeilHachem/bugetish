# Deployment script for Azure VM
param(
    [string]$Environment = "production"
)

# Stop on error
$ErrorActionPreference = "Stop"

# Build the application
Write-Host "Building application..."
npm run build

# Create deployment package
$deployPath = ".\deploy"
if (Test-Path $deployPath) {
    Remove-Item -Path $deployPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deployPath

# Copy files to deployment directory
Copy-Item -Path ".\dist\*" -Destination $deployPath -Recurse

# Create web.config for IIS
$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Handle History Mode and custom 404/500" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/" />
                </rule>
            </rules>
        </rewrite>
        <staticContent>
            <mimeMap fileExtension=".json" mimeType="application/json" />
        </staticContent>
    </system.webServer>
</configuration>
"@

$webConfig | Out-File -FilePath "$deployPath\web.config" -Encoding UTF8

Write-Host "Deployment package created at $deployPath"
Write-Host "Copy this directory to your Azure VM's wwwroot folder" 