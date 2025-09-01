# AO Shield Extension - Developer Guide

## 📁 Project Structure

```
ao-shield/
├── extension/          # Browser extension codebase
│   ├── src/           # React source code
│   ├── public/        # Static assets (copied to dist)
│   ├── dist/          # Built extension (load this in browser)
│   ├── manifest.json  # Extension manifest
│   └── package.json   # Extension dependencies
├── frontend/          # Landing page/website
├── docs/             # Documentation
└── DEVGUIDE.md       # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome/Edge browser for testing

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/dinahmaccodes/ao-shield.git
cd ao-shield/extension

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Development Workflow

### 1. Making Changes to the Extension

#### File Structure Understanding

- **`src/`** - Your development code (React, TypeScript)
- **`public/`** - Static assets (images, manifest)
- **`dist/`** - Built extension that browser reads

#### Important Concept

🚨 **The browser extension ONLY reads from the `dist/` folder, NOT `src/`**

### 2. Development Process

#### Step 1: Make Code Changes

```bash
# Navigate to extension directory
cd extension/

# Edit files in src/ directory
# - src/pages/ for page components
# - src/components/ for reusable components
# - src/assets/ for development assets
```

#### Step 2: Handle Assets Properly

- **Images/SVGs**: Place in `public/assets/images/`
- **Reference in code**: Use path `/assets/images/filename.svg`
- **Why**: Files in `public/` get copied directly to `dist/`

#### Step 3: Build the Extension | Very Important

```bash
npm run build
```

This compiles your React code and copies public assets to `dist/`

#### Step 4: Test in Browser

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder (NOT `src/`)
5. Test your changes

#### Step 5: Reload Extension After Changes

```bash
# After making changes:
npm run build

# Then in Chrome:
# - Go to chrome://extensions/
# - Click the reload button on your extension
```

### 3. Common Development Tasks

#### Adding New Images

```bash
# 1. Add image to public directory
cp new-image.svg public/assets/images/

# 2. Use in React component
<img src="/assets/images/new-image.svg" alt="Description" />

# 3. Build and test
npm run build
```

#### Modifying Styles

```bash
# 1. Edit CSS/Tailwind classes in components
# 2. For custom styles, edit src/index.css
# 3. Build to see changes
npm run build
```

#### Adding New Pages/Components

```bash
# 1. Create component in src/pages/ or src/components/
# 2. Import and use in src/App.jsx
# 3. Build and test
npm run build
```

## 🛠 Technology Stack

### Core Technologies

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **TypeScript** - Type safety (for .tsx files)

### Extension Specific

- **Manifest V3** - Latest Chrome extension format
- **Content Scripts** - Interact with web pages
- **Background Scripts** - Run in background
- **Popup** - Extension popup interface

## 📂 Key Files & Directories

### Extension Structure

```
extension/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx            # React entry point
│   ├── index.css           # Global styles
│   ├── components/         # Reusable components
│   │   ├── Header.tsx      # Top header with logo
│   │   ├── NavBar.tsx      # Bottom navigation
│   │   └── Card.tsx        # Card component
│   └── pages/              # Page components
│       ├── ConnectWallet.tsx  # Initial connection page
│       ├── Alerts.tsx      # Alerts/threats page
│       ├── Dashboard.tsx   # Threat details
│       ├── History.tsx     # Transaction history
│       └── Settings.tsx    # User settings
├── public/
│   └── assets/
│       └── images/         # Static images (SVGs, PNGs)
├── dist/                   # Built extension (ignored by git)
├── manifest.json          # Extension permissions & config
├── popup.html            # Extension popup HTML
├── background.js         # Background script
├── content_ao.js         # Content script
└── package.json          # Dependencies & scripts
```

### Build Configuration

- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`postcss.config.js`** - PostCSS configuration

## 🔄 Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/your-feature-name

# Create pull request on GitHub
```

### After Rebase/Merge Conflicts

```bash
# If you rebased and have divergent branches:
git push --force-with-lease

# DO NOT pull after rebase - just force push
```

## 🐛 Debugging & Troubleshooting

### Common Issues

#### 1. Images Not Loading

**Problem**: Images show broken/missing
**Solution**:

- Check images are in `public/assets/images/`
- Use correct path: `/assets/images/filename.svg`
- Rebuild: `npm run build`

#### 2. Changes Not Showing

**Problem**: Code changes don't appear in extension
**Solution**:

- Build first: `npm run build`
- Reload extension in Chrome
- Check you're loading `dist/` folder, not `src/`

#### 3. Extension Won't Load

**Problem**: Chrome shows extension errors
**Solution**:

- Check `dist/manifest.json` exists
- Verify build completed successfully
- Check browser console for errors

#### 4. Styling Issues

**Problem**: Tailwind classes not working
**Solution**:

- Ensure Tailwind is imported in `src/index.css`
- Check class names are correct
- Rebuild extension

### Debug Tools

```bash
# Check build output
npm run build

# Validate extension
./validate_extension.sh

# Development server (for testing outside extension)
npm run dev
```

### Browser DevTools

- **Extension popup**: Right-click extension → "Inspect"
- **Content script**: Regular page DevTools
- **Background script**: Extensions page → "Inspect views"

## 📦 Building & Deployment

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build
# Output in dist/ folder ready for Chrome Web Store
```

### Extension Packaging

```bash
# Create extension zip for store
zip -r ao-shield-extension.zip dist/
```

## 🔒 Security Best Practices

### Manifest Permissions

- Only request permissions you need
- Use `activeTab` instead of broad `tabs` permission
- Avoid `<all_urls>` unless necessary

### Content Security Policy

- No inline scripts in manifest
- Use nonce for dynamic content
- Sanitize user inputs

### Asset Handling

- Keep sensitive data out of public/
- Use environment variables for API keys
- Never commit private keys (.pem files)

## 🧪 Testing

### Manual Testing

1. Load extension in Chrome
2. Test all navigation flows
3. Verify responsive design
4. Check error states
5. Test on different websites

### Extension Testing

```bash
# Validate manifest and structure
./validate_extension.sh

# Check for common issues
npm run build && echo "Build successful"
```

## 📚 Resources

### Documentation

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Tools

- [Chrome Extensions Developer Tool](https://chrome.google.com/webstore/detail/chrome-extension-developm/ohmmkhmmmpcnpikjeljgnaoabkaalbgc)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

## 🆘 Getting Help

### When Stuck

1. Check this guide first
2. Look at similar components in the codebase
3. Check browser console for errors
4. Review Git history for similar changes
5. Ask questions in team chat/issues

### Useful Commands

```bash
# Reset to clean state
npm run build && rm -rf dist && npm run build

# Check file structure
ls -la dist/

# Verify assets copied
ls -la dist/assets/images/

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
cd extension/          # Navigate to extension
npm install           # Install dependencies
npm run build         # Build for production
npm run dev           # Development server
```

### File Paths

- **Static assets**: `public/assets/images/`
- **React components**: `src/components/` or `src/pages/`
- **Global styles**: `src/index.css`
- **Built extension**: `dist/` (load this in browser)

### Remember

- Always build before testing: `npm run build`
- Load `dist/` folder in Chrome, not `src/`
- Place images in `public/assets/images/`
- Reference images as `/assets/images/filename.svg`
- Reload extension after each build

Happy coding! 🚀
