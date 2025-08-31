#!/bin/bash
# AO Shield Extension Validation Script

echo "🛡️  AO Shield Extension Validation"
echo "=================================="

# Check required files
echo "Checking required files..."

files=("manifest.json" "popup-react.html" "popup.js" "background.js" "content_ao.js" "ao-sdk.js")
missing_files=()

for file in "${files[@]}"; do
    if [ -f "dist/$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
        missing_files+=("$file")
    fi
done

# Check icons
echo -e "\nChecking icons..."
icons=("icon16.png" "icon32.png" "icon48.png" "icon128.png")
missing_icons=()

for icon in "${icons[@]}"; do
    if [ -f "dist/icons/$icon" ]; then
        echo "✅ $icon - Found"
    else
        echo "❌ $icon - Missing"
        missing_icons+=("$icon")
    fi
done

# Summary
echo -e "\n📊 Summary:"
if [ ${#missing_files[@]} -eq 0 ] && [ ${#missing_icons[@]} -eq 0 ]; then
    echo "🎉 All files present! Extension ready for testing."
    echo -e "\n📖 Next steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked' and select the 'dist' folder"
    echo "4. Test the extension popup"
else
    echo "⚠️  Missing files detected. Please resolve before testing."
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo "Missing files: ${missing_files[*]}"
    fi
    if [ ${#missing_icons[@]} -gt 0 ]; then
        echo "Missing icons: ${missing_icons[*]}"
    fi
fi

echo -e "\n🔗 Extension location: $(pwd)/dist"
