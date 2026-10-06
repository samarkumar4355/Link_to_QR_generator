# 📱 QR Studio — Link to QR Code Generator & Downloader

A high-performance, modern web application that converts any web link or URL into a customizable, production-ready QR code with instant multi-format and high-resolution download capabilities.

Built with standard web technologies (Semantic HTML5, Vanilla CSS3, and ES6+ JavaScript) and designed to run **100% offline** with zero server-side dependencies.

---

## ✨ Features

- **⚡ Real-time QR Conversion**: Converts any URL or web link instantly as you type (with smooth debouncing) or on paste.
- **💾 Multi-Format High-Res Download**:
  - **PNG** — Crisp, lossless raster format.
  - **SVG** — Infinitely scalable vector graphics format (ideal for graphic design, print, Illustrator, Figma).
  - **JPEG** — Standard image format for social media and documents.
  - **WebP** — Modern, lightweight format for web optimization.
- **📐 Resolution Control**:
  - **Standard** (300 × 300 px) — Web & mobile friendly.
  - **HD** (600 × 600 px) — Social media & marketing assets.
  - **Ultra HD** (1200 × 1200 px) — High-quality print media & brochures.
  - **Print Quality** (2400 × 2400 px) — Large banners, billboards, and 300 DPI prints.
- **🎨 Visual Customization**:
  - Foreground (dots) color picker & Background color picker.
  - Transparent background toggle.
  - Quick curated color themes (*Monochrome, Indigo Blue, Forest Mint, Cyber Neon, Rose Pink, Sky Cyan, Sunset Amber, Royal Violet*).
  - Margin / Quiet Zone padding slider (0px – 40px).
  - Soft rounded frame corners toggle.
- **🏷️ Center Logo & Icon Overlay**:
  - Built-in presets: Web Globe, Link, Star, GitHub.
  - **Custom Logo Upload**: Upload your own PNG, JPEG, SVG, or WebP brand logo with automatic center badging.
  - High error-correction tolerance (Level H, ~30% recovery) ensuring readability even with center logos.
- **📋 Clipboard Integration**:
  - One-click **Copy Image** directly to system clipboard (using modern `ClipboardItem` API).
  - One-click **Copy Link** to share the URL.
  - One-click **Paste Link** button.
- **🕒 Local History & Persistence**:
  - Automatically preserves recent generations in `localStorage`.
  - 1-click restore from history.
  - Individual delete and clear history controls.
- **🌓 Dark & Light Mode**:
  - Sleek glassmorphism aesthetic with ambient glowing gradients.
  - Automatically persists user theme choice in `localStorage`.

---

## 📁 Project Structure

```
QR_Link/
├── index.html            # Main semantic HTML5 document & user interface
├── css/
│   └── style.css         # Modern vanilla CSS with design tokens & responsive styles
├── js/
│   ├── app.js            # Core application logic, canvas rendering & export engine
│   └── qrcode.min.js     # Standalone offline QR code generation engine
└── README.md             # Project documentation and guide
```

---

## 🚀 How to Run Locally

Because this application uses standard browser APIs and bundled client-side libraries, you can run it in any of the following ways:

### Method 1: Direct File Opening
Double-click `index.html` or open it directly in any modern browser:
```bash
open index.html
```

### Method 2: Local HTTP Server (Recommended for all features)
To test clipboard permissions and full web standards, you can spin up a lightweight local server:

**Using Python 3:**
```bash
python3 -m http.server 3000
```
Then navigate to: `http://localhost:3000`

**Using Node / npx:**
```bash
npx serve .
```

---

## 🛠️ Technical Implementation Details

1. **Pixel-Perfect Canvas Scaling**:
   High-resolution exports (up to 2400×2400 px) use offscreen `<canvas>` context scaling with `ctx.imageSmoothingEnabled = false` to guarantee razor-sharp QR modules without blurriness or compression artifacts.

2. **Native Vector SVG Generation**:
   The SVG exporter inspects the module matrix data and serializes individual `<rect>` elements into an XML SVG document, enabling infinite vector scaling in vector tools.

3. **Smart Naming Convention**:
   Exports automatically generate descriptive, domain-aware file names based on the destination hostname and date:
   `qr-[hostname]-[YYYY-MM-DD].[ext]`

4. **Zero External Tracking & Offline Ready**:
   All processing takes place entirely inside the user's browser. No links, data, or generated images are ever sent to external servers.

---

## 🌐 Browser Compatibility

- **Google Chrome** (v80+)
- **Apple Safari** (v14+)
- **Mozilla Firefox** (v78+)
- **Microsoft Edge** (v80+)
- **Mobile Browsers** (iOS Safari, Android Chrome)
