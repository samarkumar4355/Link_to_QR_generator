/**
 * QR Studio - Application Logic
 * High-resolution QR code generator, multi-format exporter & interactive studio
 */

(function () {
  'use strict';

  // DOM Elements
  const urlInput = document.getElementById('urlInput');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fgColorInput = document.getElementById('fgColorInput');
  const bgColorInput = document.getElementById('bgColorInput');
  const fgColorLabel = document.getElementById('fgColorLabel');
  const bgColorLabel = document.getElementById('bgColorLabel');
  const themePresetsList = document.getElementById('themePresetsList');
  const errorCorrectionSelect = document.getElementById('errorCorrectionSelect');
  const marginSlider = document.getElementById('marginSlider');
  const marginValLabel = document.getElementById('marginValLabel');
  const transparentBgToggle = document.getElementById('transparentBgToggle');
  const roundedFrameToggle = document.getElementById('roundedFrameToggle');
  const logoUploadInput = document.getElementById('logoUploadInput');
  const removeLogoBtn = document.getElementById('removeLogoBtn');
  const logoBtns = document.querySelectorAll('.logo-btn');

  const qrCanvasHolder = document.getElementById('qrCanvasHolder');
  const qrCenterLogoOverlay = document.getElementById('qrCenterLogoOverlay');
  const qrDisplayCard = document.getElementById('qrDisplayCard');
  const linkBadgeText = document.getElementById('linkBadgeText');
  const openLinkExternal = document.getElementById('openLinkExternal');

  const exportFormatSelect = document.getElementById('exportFormatSelect');
  const exportSizeSelect = document.getElementById('exportSizeSelect');
  const downloadQrBtn = document.getElementById('downloadQrBtn');
  const downloadBtnLabel = document.getElementById('downloadBtnLabel');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');

  const historyGrid = document.getElementById('historyGrid');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconDark = document.getElementById('themeIconDark');
  const themeIconLight = document.getElementById('themeIconLight');
  const themeBtnText = document.getElementById('themeBtnText');
  const toastContainer = document.getElementById('toastContainer');

  // SVG Preset Templates
  const LOGO_SVGS = {
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="#0f172a" stroke="none"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`
  };

  // State Management
  let state = {
    url: 'https://github.com',
    fgColor: '#000000',
    bgColor: '#ffffff',
    isTransparentBg: false,
    errorCorrection: 'H', // L, M, Q, H
    margin: 10,
    roundedFrame: true,
    logoType: 'none', // 'none' | 'link' | 'globe' | 'star' | 'github' | 'custom'
    customLogoDataUrl: null,
    exportFormat: 'png',
    exportSize: 600,
    debounceTimer: null,
    history: []
  };

  const STORAGE_KEY_HISTORY = 'qr_link_history_v1';
  const STORAGE_KEY_THEME = 'qr_link_theme_v1';

  // Initialize
  function init() {
    loadTheme();
    loadHistory();
    bindEvents();
    renderQRCode();
  }

  // Bind Event Listeners
  function bindEvents() {
    // URL Input & Actions
    urlInput.addEventListener('input', () => {
      debounceRender();
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveToHistory();
        renderQRCode();
      }
    });

    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      urlInput.focus();
      debounceRender();
    });

    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          saveToHistory();
          renderQRCode();
          showToast('Link pasted from clipboard!', 'info');
        }
      } catch (err) {
        showToast('Clipboard access was blocked. Paste using Ctrl+V or Cmd+V.', 'info');
      }
    });

    // Quick chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sample = chip.getAttribute('data-sample');
        if (sample) {
          urlInput.value = sample;
          saveToHistory();
          renderQRCode();
        }
      });
    });

    // Color Pickers
    fgColorInput.addEventListener('input', (e) => {
      state.fgColor = e.target.value;
      fgColorLabel.textContent = e.target.value;
      deactivateThemePresets();
      debounceRender();
    });

    bgColorInput.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      bgColorLabel.textContent = e.target.value;
      deactivateThemePresets();
      debounceRender();
    });

    // Theme Preset Chips
    themePresetsList.addEventListener('click', (e) => {
      const target = e.target.closest('.preset-chip');
      if (!target) return;
      const fg = target.getAttribute('data-fg');
      const bg = target.getAttribute('data-bg');
      if (fg && bg) {
        state.fgColor = fg;
        state.bgColor = bg;
        fgColorInput.value = fg;
        bgColorInput.value = bg;
        fgColorLabel.textContent = fg;
        bgColorLabel.textContent = bg;

        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        renderQRCode();
      }
    });

    // Error Correction
    errorCorrectionSelect.addEventListener('change', (e) => {
      state.errorCorrection = e.target.value;
      renderQRCode();
    });

    // Margin Slider
    marginSlider.addEventListener('input', (e) => {
      state.margin = parseInt(e.target.value, 10);
      marginValLabel.textContent = `${state.margin}px`;
      debounceRender();
    });

    // Transparent Background Toggle
    transparentBgToggle.addEventListener('change', (e) => {
      state.isTransparentBg = e.target.checked;
      renderQRCode();
    });

    // Rounded Frame Toggle
    roundedFrameToggle.addEventListener('change', (e) => {
      state.roundedFrame = e.target.checked;
      renderQRCode();
    });

    // Logo Buttons
    logoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        logoBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.logoType = btn.getAttribute('data-logo');
        renderQRCode();
      });
    });

    // Custom Logo File Upload
    logoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        state.customLogoDataUrl = event.target.result;
        state.logoType = 'custom';
        logoBtns.forEach(b => b.classList.remove('active'));
        removeLogoBtn.style.display = 'inline-flex';
        renderQRCode();
        showToast('Custom logo uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    });

    removeLogoBtn.addEventListener('click', () => {
      state.customLogoDataUrl = null;
      state.logoType = 'none';
      removeLogoBtn.style.display = 'none';
      logoUploadInput.value = '';
      logoBtns.forEach(b => {
        if (b.getAttribute('data-logo') === 'none') b.classList.add('active');
        else b.classList.remove('active');
      });
      renderQRCode();
    });

    // Export Selectors
    exportFormatSelect.addEventListener('change', (e) => {
      state.exportFormat = e.target.value;
    });

    exportSizeSelect.addEventListener('change', (e) => {
      state.exportSize = parseInt(e.target.value, 10);
    });

    // Download Button
    downloadQrBtn.addEventListener('click', () => {
      handleDownload();
    });

    // Copy Image Button
    copyImageBtn.addEventListener('click', () => {
      handleCopyImage();
    });

    // Copy Link Button
    copyLinkBtn.addEventListener('click', () => {
      const text = urlInput.value.trim() || 'https://github.com';
      navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy link.', 'info');
      });
    });

    // Clear History Button
    clearHistoryBtn.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      renderHistoryUI();
      showToast('History cleared', 'info');
    });

    // Theme Toggle Button
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  function deactivateThemePresets() {
    document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
  }

  function debounceRender() {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      renderQRCode();
    }, 150);
  }

  /**
   * Helper to normalize link for href and display
   */
  function normalizeUrl(input) {
    let clean = input.trim();
    if (!clean) return 'https://github.com';
    // If it looks like a web link without protocol (e.g. google.com or mywebsite.io)
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(clean)) {
      return 'https://' + clean;
    }
    return clean;
  }

  /**
   * Core QR Generation for the Preview pane
   */
  function renderQRCode() {
    let rawInput = urlInput.value.trim();
    const activeUrl = rawInput ? normalizeUrl(rawInput) : 'https://github.com';

    // Update link pill and test anchor
    linkBadgeText.textContent = activeUrl;
    openLinkExternal.href = activeUrl;

    // Clear previous QR element
    qrCanvasHolder.innerHTML = '';

    // Error Correction mapping
    const levelMap = {
      L: QRCode.CorrectLevel.L,
      M: QRCode.CorrectLevel.M,
      Q: QRCode.CorrectLevel.Q,
      H: QRCode.CorrectLevel.H
    };

    const previewBg = state.isTransparentBg ? 'rgba(0,0,0,0)' : state.bgColor;

    // Use internal hidden div for QRCode library rendering
    const tempContainer = document.createElement('div');

    try {
      new QRCode(tempContainer, {
        text: activeUrl,
        width: 256,
        height: 256,
        colorDark: state.fgColor,
        colorLight: previewBg,
        correctLevel: levelMap[state.errorCorrection] || QRCode.CorrectLevel.H
      });

      // Extract generated canvas or image from tempContainer
      const generatedCanvas = tempContainer.querySelector('canvas');
      const generatedImg = tempContainer.querySelector('img');

      if (generatedCanvas) {
        // Draw onto custom canvas with margin & transparency & frame styling
        const previewCanvas = document.createElement('canvas');
        const previewMargin = state.margin;
        const totalSize = 256 + (previewMargin * 2);
        previewCanvas.width = totalSize;
        previewCanvas.height = totalSize;
        const ctx = previewCanvas.getContext('2d');

        if (!state.isTransparentBg) {
          ctx.fillStyle = state.bgColor;
          if (state.roundedFrame) {
            drawRoundedRect(ctx, 0, 0, totalSize, totalSize, 12);
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, totalSize, totalSize);
          }
        }

        ctx.drawImage(generatedCanvas, previewMargin, previewMargin, 256, 256);

        // Append to holder
        qrCanvasHolder.appendChild(previewCanvas);
      } else if (generatedImg) {
        qrCanvasHolder.appendChild(generatedImg);
      }

      // Handle Center Logo Overlay
      updateCenterLogo();

    } catch (e) {
      console.error('QR Code render error:', e);
      qrCanvasHolder.innerHTML = `<span style="color:var(--accent-rose); font-size:0.85rem;">Error generating QR: Content too long or invalid.</span>`;
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Update center logo overlay in preview
   */
  function updateCenterLogo() {
    if (state.logoType === 'none') {
      qrCenterLogoOverlay.style.display = 'none';
      qrCenterLogoOverlay.innerHTML = '';
      return;
    }

    qrCenterLogoOverlay.style.display = 'flex';
    qrCenterLogoOverlay.innerHTML = '';

    if (state.logoType === 'custom' && state.customLogoDataUrl) {
      const img = document.createElement('img');
      img.src = state.customLogoDataUrl;
      img.alt = 'Logo';
      qrCenterLogoOverlay.appendChild(img);
    } else if (LOGO_SVGS[state.logoType]) {
      qrCenterLogoOverlay.innerHTML = LOGO_SVGS[state.logoType];
    }
  }

  /**
   * Generates a high-resolution export Canvas with all custom styles & logo embedded
   */
  function generateHighResCanvas(targetResolution) {
    return new Promise((resolve, reject) => {
      const rawInput = urlInput.value.trim();
      const activeUrl = rawInput ? normalizeUrl(rawInput) : 'https://github.com';

      const tempContainer = document.createElement('div');
      const levelMap = {
        L: QRCode.CorrectLevel.L,
        M: QRCode.CorrectLevel.M,
        Q: QRCode.CorrectLevel.Q,
        H: QRCode.CorrectLevel.H
      };

      try {
        // Base QR code matrix rendered at crisp base size
        const baseSize = 512;
        new QRCode(tempContainer, {
          text: activeUrl,
          width: baseSize,
          height: baseSize,
          colorDark: state.fgColor,
          colorLight: state.isTransparentBg ? 'rgba(0,0,0,0)' : state.bgColor,
          correctLevel: levelMap[state.errorCorrection] || QRCode.CorrectLevel.H
        });

        const sourceCanvas = tempContainer.querySelector('canvas');
        if (!sourceCanvas) {
          reject(new Error('Canvas could not be created'));
          return;
        }

        // Create export canvas at requested resolution (e.g. 300, 600, 1200, 2400)
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = targetResolution;
        exportCanvas.height = targetResolution;
        const ctx = exportCanvas.getContext('2d');

        // Crisp pixelated scaling for QR modules
        ctx.imageSmoothingEnabled = false;

        // Calculate margin relative to resolution
        const marginRatio = (state.margin / 256);
        const marginPx = Math.round(targetResolution * marginRatio);
        const qrDrawSize = targetResolution - (marginPx * 2);

        // Fill background
        if (!state.isTransparentBg) {
          ctx.fillStyle = state.bgColor;
          if (state.roundedFrame) {
            const frameRadius = Math.round(targetResolution * 0.05);
            drawRoundedRect(ctx, 0, 0, targetResolution, targetResolution, frameRadius);
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, targetResolution, targetResolution);
          }
        }

        // Draw QR modules
        ctx.drawImage(sourceCanvas, marginPx, marginPx, qrDrawSize, qrDrawSize);

        // Draw Center Logo badge if active
        if (state.logoType !== 'none') {
          const logoBadgeSize = Math.round(targetResolution * 0.22);
          const logoBadgeX = Math.round((targetResolution - logoBadgeSize) / 2);
          const logoBadgeY = Math.round((targetResolution - logoBadgeSize) / 2);
          const badgeRadius = Math.round(logoBadgeSize * 0.22);

          // Center badge background container (pure white with subtle shadow)
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = Math.round(targetResolution * 0.015);
          ctx.shadowOffsetY = Math.round(targetResolution * 0.005);
          ctx.fillStyle = '#ffffff';
          drawRoundedRect(ctx, logoBadgeX, logoBadgeY, logoBadgeSize, logoBadgeSize, badgeRadius);
          ctx.fill();
          ctx.restore();

          // Border for the badge
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = Math.max(1, Math.round(targetResolution * 0.003));
          drawRoundedRect(ctx, logoBadgeX, logoBadgeY, logoBadgeSize, logoBadgeSize, badgeRadius);
          ctx.stroke();

          // Draw the logo icon
          const iconPadding = Math.round(logoBadgeSize * 0.16);
          const iconDrawSize = logoBadgeSize - (iconPadding * 2);
          const iconX = logoBadgeX + iconPadding;
          const iconY = logoBadgeY + iconPadding;

          if (state.logoType === 'custom' && state.customLogoDataUrl) {
            const logoImg = new Image();
            logoImg.onload = () => {
              ctx.drawImage(logoImg, iconX, iconY, iconDrawSize, iconDrawSize);
              resolve(exportCanvas);
            };
            logoImg.onerror = () => {
              resolve(exportCanvas);
            };
            logoImg.src = state.customLogoDataUrl;
            return;
          } else if (LOGO_SVGS[state.logoType]) {
            const svgString = LOGO_SVGS[state.logoType];
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const logoImg = new Image();
            logoImg.onload = () => {
              ctx.drawImage(logoImg, iconX, iconY, iconDrawSize, iconDrawSize);
              URL.revokeObjectURL(svgUrl);
              resolve(exportCanvas);
            };
            logoImg.onerror = () => {
              URL.revokeObjectURL(svgUrl);
              resolve(exportCanvas);
            };
            logoImg.src = svgUrl;
            return;
          }
        }

        resolve(exportCanvas);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a fully scalable vector SVG string
   */
  function generateVectorSvg(resolution) {
    const rawInput = urlInput.value.trim();
    const activeUrl = rawInput ? normalizeUrl(rawInput) : 'https://github.com';

    const tempContainer = document.createElement('div');
    const levelMap = {
      L: QRCode.CorrectLevel.L,
      M: QRCode.CorrectLevel.M,
      Q: QRCode.CorrectLevel.Q,
      H: QRCode.CorrectLevel.H
    };

    new QRCode(tempContainer, {
      text: activeUrl,
      width: 256,
      height: 256,
      colorDark: state.fgColor,
      colorLight: '#ffffff',
      correctLevel: levelMap[state.errorCorrection] || QRCode.CorrectLevel.H
    });

    const canvas = tempContainer.querySelector('canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;

    let svgRects = '';
    const margin = state.margin;
    const totalSize = 256 + (margin * 2);

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const idx = (y * 256 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // If dark module pixel
        if (a > 128 && (r + g + b) < 380) {
          svgRects += `<rect x="${x + margin}" y="${y + margin}" width="1" height="1" fill="${state.fgColor}" />\n`;
        }
      }
    }

    const bgRect = !state.isTransparentBg 
      ? `<rect width="${totalSize}" height="${totalSize}" fill="${state.bgColor}" ${state.roundedFrame ? 'rx="12"' : ''} />` 
      : '';

    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${resolution}" height="${resolution}">
  ${bgRect}
  ${svgRects}
</svg>`;
  }

  /**
   * Clean filename based on URL domain and timestamp
   */
  function generateFileName(extension) {
    const raw = urlInput.value.trim() || 'link';
    let slug = 'qrcode';
    try {
      const parsed = new URL(normalizeUrl(raw));
      slug = parsed.hostname.replace(/[^a-zA-Z0-9]/g, '-');
    } catch (e) {
      slug = raw.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '-');
    }
    const timestamp = new Date().toISOString().slice(0, 10);
    return `qr-${slug}-${timestamp}.${extension}`;
  }

  /**
   * Download Handler with button animation feedback
   */
  async function handleDownload() {
    const format = state.exportFormat;
    const resolution = state.exportSize;

    // Button loading state
    const originalText = downloadBtnLabel.textContent;
    downloadBtnLabel.textContent = 'Preparing Download...';
    downloadQrBtn.disabled = true;

    try {
      saveToHistory();

      if (format === 'svg') {
        const svgContent = generateVectorSvg(resolution);
        if (!svgContent) throw new Error('SVG generation failed');

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, generateFileName('svg'));
      } else {
        const canvas = await generateHighResCanvas(resolution);
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const quality = format === 'jpeg' ? 0.95 : 1.0;

        canvas.toBlob((blob) => {
          if (!blob) {
            showToast('Export failed. Please try again.', 'info');
            return;
          }
          triggerDownload(blob, generateFileName(format));
        }, mimeType, quality);
      }

      downloadBtnLabel.textContent = '✓ Downloaded!';
      showToast(`QR Code saved as ${format.toUpperCase()} (${resolution}×${resolution}px)`, 'success');
      setTimeout(() => {
        downloadBtnLabel.textContent = originalText;
        downloadQrBtn.disabled = false;
      }, 1800);

    } catch (err) {
      console.error('Download error:', err);
      showToast('Could not complete download. Check console for details.', 'info');
      downloadBtnLabel.textContent = originalText;
      downloadQrBtn.disabled = false;
    }
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Copy high-res image to clipboard
   */
  async function handleCopyImage() {
    try {
      const canvas = await generateHighResCanvas(800);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to create image blob', 'info');
          return;
        }

        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('QR Code image copied to clipboard!', 'success');
        } catch (copyErr) {
          showToast('Copy image is not supported in this browser. Please use Download.', 'info');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy QR code image', 'info');
    }
  }

  /**
   * Save entry into localStorage history
   */
  function saveToHistory() {
    const raw = urlInput.value.trim();
    if (!raw) return;
    const clean = normalizeUrl(raw);

    // Prevent duplicates at the top
    const filtered = state.history.filter(item => item.url !== clean);
    filtered.unshift({
      url: clean,
      fgColor: state.fgColor,
      bgColor: state.bgColor,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Keep max 8
    state.history = filtered.slice(0, 8);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
    renderHistoryUI();
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) {
        state.history = JSON.parse(raw);
        renderHistoryUI();
      }
    } catch (e) {
      state.history = [];
    }
  }

  function renderHistoryUI() {
    if (!state.history || state.history.length === 0) {
      historyGrid.innerHTML = `<p class="empty-history-text">No previous QR codes generated yet. Enter a link above to get started!</p>`;
      return;
    }

    historyGrid.innerHTML = '';
    state.history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-thumb">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${item.fgColor}" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="3" height="3"></rect>
          </svg>
        </div>
        <div class="history-info">
          <div class="history-url" title="${item.url}">${item.url}</div>
          <div class="history-time">Generated at ${item.timestamp || 'recently'}</div>
        </div>
        <button type="button" class="history-action-btn" data-index="${index}" title="Remove item">
          ✕
        </button>
      `;

      // Click card to reload
      card.addEventListener('click', (e) => {
        if (e.target.closest('.history-action-btn')) return;
        urlInput.value = item.url;
        state.fgColor = item.fgColor;
        state.bgColor = item.bgColor;
        fgColorInput.value = item.fgColor;
        bgColorInput.value = item.bgColor;
        fgColorLabel.textContent = item.fgColor;
        bgColorLabel.textContent = item.bgColor;
        renderQRCode();
        showToast('Restored from history', 'info');
      });

      // Delete action
      const delBtn = card.querySelector('.history-action-btn');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.history.splice(index, 1);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
        renderHistoryUI();
        showToast('History item removed', 'info');
      });

      historyGrid.appendChild(card);
    });
  }

  /**
   * Theme Management (Dark / Light)
   */
  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    applyTheme(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      themeIconDark.style.display = 'block';
      themeIconLight.style.display = 'none';
      themeBtnText.textContent = 'Dark Mode';
    } else {
      themeIconDark.style.display = 'none';
      themeIconLight.style.display = 'block';
      themeBtnText.textContent = 'Light Mode';
    }
  }

  /**
   * Toast notification feedback
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Self Init
  window.addEventListener('DOMContentLoaded', init);
})();
