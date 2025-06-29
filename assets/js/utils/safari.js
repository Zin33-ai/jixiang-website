/**
 * Safari 瀏覽器專用工具模組
 * 針對手機 Safari 和桌面 Safari 的兼容性處理
 */

/**
 * 檢測是否為 Safari 瀏覽器
 * @returns {boolean} 是否為 Safari
 */
export function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * 檢測是否為手機 Safari
 * @returns {boolean} 是否為手機 Safari
 */
export function isMobileSafari() {
    const userAgent = navigator.userAgent;
    return /iPhone|iPad/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS/.test(userAgent);
}

/**
 * 檢測是否為桌面 Safari
 * @returns {boolean} 是否為桌面 Safari
 */
export function isDesktopSafari() {
    return isSafari() && !isMobileSafari();
}

/**
 * 取得 Safari 版本號
 * @returns {number} Safari 版本號，無法取得時返回 0
 */
export function getSafariVersion() {
    if (!isSafari()) return 0;
    
    const match = navigator.userAgent.match(/Version\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * 檢查是否為現代 Safari（支援 ES6 模組）
 * @returns {boolean} 是否支援現代功能
 */
export function isModernSafari() {
    if (!isSafari()) return true; // 非 Safari 預設為現代瀏覽器
    
    const version = getSafariVersion();
    return version >= 11; // Safari 11+ 完全支援 ES6 模組
}

/**
 * 應用 Safari 專用的 CSS 修復
 */
export function applySafariCSSFixes() {
    if (!isSafari()) return;
    
    const style = document.createElement('style');
    style.textContent = `
        /* Safari 專用 CSS 修復 */
        * {
            -webkit-text-fill-color: inherit;
            -webkit-background-clip: border-box;
        }
        
        /* Safari 按鈕修復 */
        button, input[type="button"], input[type="submit"] {
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
        }
        
        /* Safari 滾動優化 */
        body {
            -webkit-overflow-scrolling: touch;
        }
        
        /* Safari 圓角修復 */
        .btn, .floating-btn, .navbar-phone {
            -webkit-border-radius: inherit;
        }
        
        /* Safari Transform 修復 */
        .fade-in, .slide-in-left, .slide-in-right,
        .service-card, .news-card, .contact-card {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    `;
    
    document.head.appendChild(style);
    console.log('Safari CSS 修復已應用');
}

/**
 * 手機 Safari 專用優化
 */
export function applyMobileSafariOptimizations() {
    if (!isMobileSafari()) return;
    
    // 防止縮放
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }
    
    // 狀態欄顏色（iOS）
    let statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!statusBarMeta) {
        statusBarMeta = document.createElement('meta');
        statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
        statusBarMeta.content = 'default';
        document.head.appendChild(statusBarMeta);
    }
    
    // 全螢幕應用支援
    let webAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!webAppMeta) {
        webAppMeta = document.createElement('meta');
        webAppMeta.name = 'apple-mobile-web-app-capable';
        webAppMeta.content = 'yes';
        document.head.appendChild(webAppMeta);
    }
    
    // 觸控延遲修復
    document.body.style.touchAction = 'manipulation';
    
    // 避免 Safari 的 bounce 效果
    document.addEventListener('touchmove', function(e) {
        if (e.target === document.body || e.target === document.documentElement) {
            e.preventDefault();
        }
    }, { passive: false });
    
    console.log('手機 Safari 優化已應用');
}

/**
 * Safari backdrop-filter 後備處理
 */
export function handleBackdropFilterFallback() {
    if (!isSafari()) return;
    
    // 檢查是否支援 backdrop-filter
    if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
        const elementsWithBackdrop = document.querySelectorAll('.navbar, .map-overlay, .hours-item');
        elementsWithBackdrop.forEach(el => {
            el.style.background = 'rgba(255, 255, 255, 0.98)';
        });
        
        console.log('Safari backdrop-filter 後備處理已應用');
    }
}

/**
 * Safari CSS Grid 後備處理
 */
export function handleGridFallback() {
    if (!isSafari()) return;
    
    // 檢查是否支援 CSS Grid
    if (!CSS.supports('display', 'grid')) {
        const gridElements = document.querySelectorAll('.services-grid, .benefits-grid, .hours-grid');
        gridElements.forEach(el => {
            el.style.display = 'flex';
            el.style.flexWrap = 'wrap';
            el.style.justifyContent = 'center';
            el.style.gap = '1rem';
        });
        
        console.log('Safari CSS Grid 後備處理已應用');
    }
}

/**
 * Safari 動畫性能優化
 */
export function optimizeSafariAnimations() {
    if (!isSafari()) return;
    
    // 為動畫元素添加硬體加速
    const animatedElements = document.querySelectorAll(`
        .fade-in, .slide-in-left, .slide-in-right,
        .service-card, .news-card, .contact-card,
        .floating-btn, .team-card
    `);
    
    animatedElements.forEach(el => {
        el.style.webkitTransform = 'translateZ(0)';
        el.style.transform = 'translateZ(0)';
        el.style.willChange = 'transform';
    });
    
    console.log('Safari 動畫性能優化已應用');
}

/**
 * Safari 表單元素修復
 */
export function fixSafariFormElements() {
    if (!isSafari()) return;
    
    const formElements = document.querySelectorAll('button, input, select, textarea');
    formElements.forEach(el => {
        el.style.webkitAppearance = 'none';
        el.style.webkitBorderRadius = '0';
        
        // 保持原有的 border-radius
        const borderRadius = window.getComputedStyle(el).borderRadius;
        if (borderRadius && borderRadius !== '0px') {
            el.style.borderRadius = borderRadius;
            el.style.webkitBorderRadius = borderRadius;
        }
    });
    
    console.log('Safari 表單元素修復已應用');
}

/**
 * Safari 字體渲染優化
 */
export function optimizeSafariFontRendering() {
    if (!isSafari()) return;
    
    document.body.style.webkitFontSmoothing = 'antialiased';
    document.body.style.mozOsxFontSmoothing = 'grayscale';
    
    console.log('Safari 字體渲染優化已應用');
}

/**
 * Safari 滾動性能優化
 */
export function optimizeSafariScrolling() {
    if (!isSafari()) return;
    
    // 滾動容器優化
    const scrollContainers = document.querySelectorAll('.scroll-container, .news-list, .services-section');
    scrollContainers.forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
    });
    
    // 整體頁面滾動優化
    document.body.style.webkitOverflowScrolling = 'touch';
    
    console.log('Safari 滾動性能優化已應用');
}

/**
 * 綜合應用所有 Safari 優化
 */
export function applySafariOptimizations() {
    if (!isSafari()) {
        console.log('非 Safari 瀏覽器，跳過 Safari 優化');
        return;
    }
    
    console.log('開始應用 Safari 優化...', {
        isSafari: isSafari(),
        isMobileSafari: isMobileSafari(),
        isDesktopSafari: isDesktopSafari(),
        version: getSafariVersion(),
        isModern: isModernSafari()
    });
    
    // 應用各種優化
    applySafariCSSFixes();
    handleBackdropFilterFallback();
    handleGridFallback();
    optimizeSafariAnimations();
    fixSafariFormElements();
    optimizeSafariFontRendering();
    optimizeSafariScrolling();
    
    // 手機專用優化
    if (isMobileSafari()) {
        applyMobileSafariOptimizations();
    }
    
    console.log('Safari 優化完成');
}

/**
 * Safari 錯誤處理
 */
export function setupSafariErrorHandling() {
    if (!isSafari()) return;
    
    // Safari 特殊錯誤處理
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('webkit')) {
            console.warn('Safari 專用錯誤:', e.message);
            // 可以在這裡添加 Safari 特殊錯誤的處理邏輯
        }
    });
    
    // Promise 錯誤處理
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Safari Promise 錯誤:', e.reason);
    });
    
    console.log('Safari 錯誤處理已設定');
}
