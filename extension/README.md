# AO Shield Browser Extension

A security-focused browser extension for the AO ecosystem that provides real-time threat detection and transaction monitoring.

## Features

- **Real-time Security Alerts**: Detect and alert users about potentially malicious transactions
- **Fraud Detection**: Advanced algorithms to identify fraudulent activities
- **Transaction Monitoring**: Monitor and analyze blockchain transactions
- **Risk Scoring**: Provide risk assessments for addresses and transactions
- **User-friendly Interface**: Clean, modern UI inspired by mobile security apps

## Design

- **Color Theme**: Dark theme with #0A0A0A background, #FFFFFF text, and #0FF0FC accent
- **Typography**: Inter font family for clean, modern readability
- **Layout**: Mobile-inspired design with bottom navigation

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build extension:

```bash
npm run build
```

4. Load extension in Chrome:
   - Open Chrome Extensions (chrome://extensions/)
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

### Project Structure

```
extension/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── icons/               # Extension icons
├── popup.html          # Extension popup HTML
├── manifest.json       # Extension manifest
├── background.js       # Service worker
├── content_ao.js       # Content script
└── build-extension.js  # Build script
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run validate` - Validate extension structure

## License

MIT License
