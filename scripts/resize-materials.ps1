# One-off: resize selected Materials photos for web use (max 1600px, JPEG q80).
Add-Type -AssemblyName System.Drawing

$root = "C:\Users\jcuad\OneDrive\Documents\offgrid-lifestyle"
$materials = Join-Path $root "Materials-20260708T053438Z-3-001\Materials"
$outDir = Join-Path $root "public\images\community"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$jobs = @(
    @{ src = "Discfest 2025\497837886_1246542507477786_5218110058154658238_n.jpg"; out = "community-ultimate-catch.jpg" },
    @{ src = "Discfest 2025\497754847_1246543627477674_7273228095405253412_n.jpg"; out = "community-ultimate-skyball.jpg" },
    @{ src = "Discfest 2025\496134551_1246540387477998_3077483076864044637_n.jpg"; out = "community-ultimate-field.jpg" },
    @{ src = "Mixed Masters Fundraiser\IMG_8045.JPG"; out = "community-pilipinas-portrait.jpg" },
    @{ src = "Mixed Masters Fundraiser\IMG_8071.JPG"; out = "community-pilipinas-cap.jpg" },
    @{ src = "Mixed Masters Fundraiser\IMG_8092.JPG"; out = "community-laces.jpg" },
    @{ src = "The Greatest x OG\IMG_9023.JPG"; out = "product-og-backpack.jpg" },
    @{ src = "The Greatest x OG\IMG_9055.JPG"; out = "product-pilipinas-duffel.jpg" },
    @{ src = "OG Lifestyle Towels\IMG_0405.JPG"; out = "product-towel-flag.jpg" },
    @{ src = "OG Lifestyle Towels\IMG_0449.JPG"; out = "product-towel-bench.jpg" },
    @{ src = "OG Lifestyle Towels\IMG_0530.JPG"; out = "community-towels-walk.jpg" }
)

$maxDim = 1600
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80)

foreach ($job in $jobs) {
    $srcPath = Join-Path $materials $job.src
    $outPath = Join-Path $outDir $job.out
    $img = [System.Drawing.Image]::FromFile($srcPath)
    try {
        # Apply EXIF orientation (tag 0x0112) so portraits stay upright after re-encode.
        if ($img.PropertyIdList -contains 0x0112) {
            $orientation = $img.GetPropertyItem(0x0112).Value[0]
            switch ($orientation) {
                3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        }
        $scale = [Math]::Min(1.0, $maxDim / [Math]::Max($img.Width, $img.Height))
        $w = [int]($img.Width * $scale)
        $h = [int]($img.Height * $scale)
        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        try {
            $gfx = [System.Drawing.Graphics]::FromImage($bmp)
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.DrawImage($img, 0, 0, $w, $h)
            $gfx.Dispose()
            $bmp.Save($outPath, $encoder, $encParams)
        } finally {
            $bmp.Dispose()
        }
    } finally {
        $img.Dispose()
    }
    $size = [Math]::Round((Get-Item $outPath).Length / 1KB)
    Write-Output ("{0} -> {1} ({2} KB, {3}x{4})" -f $job.src, $job.out, $size, $w, $h)
}
