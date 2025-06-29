/**
 * 響應式處理模組
 * 處理不同螢幕尺寸的適應性調整
 * 優化版本 - 更精確的斷點、性能優化、自適應圖片
 */

export class ResponsiveManager {
    constructor(options = {}) {
        // 配置選項
        this.config = {
            // 斷點設定（可自訂）
            breakpoints: {
                xs: 480,     // 極小螢幕
                sm: 768,     // 小螢幕（手機）
                md: 992,     // 中等螢幕（平板）
                lg: 1200,    // 大螢幕（桌面）
                xl: 1400     // 超大螢幕
            },
            // 響應式選項
            debounceTime: 250,           // 防抖時間
            enableAutoOptimization: true, // 自動優化
            observeFontSize: true,       // 監控字體變化
            optimizeImages: true,        // 圖片優化
            trackViewportChanges: true,  // 追蹤視窗變化
            // CSS 變數更新
            updateCSSVariables: true,
            ...options
        };

        this.resizeTimeout = null;
        this.currentViewport = null;
        this.observers = [];
        this.isDestroyed = false;
        this.mediaQueries = new Map();

        this.init();
    }

    init() {
        try {
            this.setupBreakpoints();
            this.setupEventListeners();
            this.setupMediaQueries();
            this.handleInitialLoad();
            
            if (this.config.observeFontSize) {
                this.setupFontSizeObserver();
            }
            
            console.log('ResponsiveManager 初始化完成');
        } catch (error) {
            console.error('ResponsiveManager 初始化失敗:', error);
        }
    }

    setupBreakpoints() {
        // 確保斷點有序
        this.breakpoints = Object.fromEntries(
            Object.entries(this.config.breakpoints).sort((a, b) => a[1] - b[1])
        );
    }

    setupEventListeners() {
        // 使用防抖處理 resize 事件
        const debouncedResize = this.debounce(this.handleResize.bind(this), this.config.debounceTime);
        window.addEventListener('resize', debouncedResize, { passive: true });

        // 方向變化處理
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

        // 視覺視窗變化（iOS Safari 地址欄）
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                this.handleVisualViewportChange();
            });
        }
    }

    setupMediaQueries() {
        // 建立 CSS 媒體查詢監聽
        Object.entries(this.breakpoints).forEach(([name, width]) => {
            const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
            
            const handler = (e) => {
                if (!this.isDestroyed) {
                    this.handleMediaQueryChange(name, e.matches);
                }
            };

            mediaQuery.addListener(handler);
            this.mediaQueries.set(name, { query: mediaQuery, handler });
        });
    }

    handleMediaQueryChange(breakpoint, matches) {
        // 媒體查詢變化時的處理
        document.documentElement.classList.toggle(`breakpoint-${breakpoint}`, matches);
        
        if (this.config.trackViewportChanges && typeof gtag !== 'undefined') {
            gtag('event', 'viewport_change', {
                event_category: 'responsive',
                event_label: `${breakpoint}_${matches ? 'enter' : 'exit'}`
            });
        }
    }

    setupFontSizeObserver() {
        // 監控用戶字體大小變化
        const testElement = document.createElement('div');
        testElement.style.cssText = 'position:absolute;visibility:hidden;height:1rem;';
        document.body.appendChild(testElement);

        const observer = new ResizeObserver(() => {
            if (!this.isDestroyed) {
                this.handleFontSizeChange();
            }
        });

        observer.observe(testElement);
        this.observers.push({ observer, element: testElement });
    }

    handleFontSizeChange() {
        // 用戶調整瀏覽器字體大小時重新計算
        const viewport = this.getViewportInfo();
        this.applyResponsiveChanges(viewport);
    }

    handleResize() {
        if (this.isDestroyed) return;

        const viewport = this.getViewportInfo();
        
        // 只有在斷點真正改變時才執行優化
        if (this.hasViewportChanged(viewport)) {
            this.applyResponsiveChanges(viewport);
            this.currentViewport = viewport;
        }

        // 更新 CSS 變數
        if (this.config.updateCSSVariables) {
            this.updateCSSVariables(viewport);
        }
    }

    handleOrientationChange() {
        // 等待方向變化動畫完成
        setTimeout(() => {
            if (!this.isDestroyed) {
                const viewport = this.getViewportInfo();
                this.applyResponsiveChanges(viewport);
                this.currentViewport = viewport;
            }
        }, 500);
    }

    handleVisualViewportChange() {
        // 處理 iOS Safari 地址欄顯示/隱藏
        const vh = window.visualViewport.height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    handleInitialLoad() {
        const viewport = this.getViewportInfo();
        this.applyResponsiveChanges(viewport);
        this.currentViewport = viewport;

        // 設定初始 CSS 變數
        if (this.config.updateCSSVariables) {
            this.updateCSSVariables(viewport);
        }
    }

    hasViewportChanged(newViewport) {
        if (!this.currentViewport) return true;
        
        return (
            this.currentViewport.breakpoint !== newViewport.breakpoint ||
            this.currentViewport.orientation !== newViewport.orientation
        );
    }

    getViewportInfo() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // 判斷當前斷點
        let breakpoint = 'xs';
        for (const [name, minWidth] of Object.entries(this.breakpoints)) {
            if (width >= minWidth) {
                breakpoint = name;
            }
        }

        return {
            width,
            height,
            devicePixelRatio,
            breakpoint,
            // 向後相容的屬性
            isMobile: breakpoint === 'xs' || breakpoint === 'sm',
            isTablet: breakpoint === 'md',
            isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
            // 新增的屬性
            isExtraSmall: breakpoint === 'xs',
            isSmall: breakpoint === 'sm',
            isMedium: breakpoint === 'md',
            isLarge: breakpoint === 'lg',
            isExtraLarge: breakpoint === 'xl',
            orientation: width > height ? 'landscape' : 'portrait',
            aspectRatio: width / height,
            // 裝置類型判斷
            isTouchDevice: 'ontouchstart' in window,
            isRetina: devicePixelRatio >= 2
        };
    }

    updateCSSVariables(viewport) {
        const root = document.documentElement;
        
        // 更新視窗相關變數
        root.style.setProperty('--viewport-width', `${viewport.width}px`);
        root.style.setProperty('--viewport-height', `${viewport.height}px`);
        root.style.setProperty('--device-pixel-ratio', viewport.devicePixelRatio);
        root.style.setProperty('--aspect-ratio', viewport.aspectRatio);

        // 更新斷點相關變數
        root.style.setProperty('--current-breakpoint', viewport.breakpoint);
        root.style.setProperty('--is-mobile', viewport.isMobile ? '1' : '0');
        root.style.setProperty('--is-tablet', viewport.isTablet ? '1' : '0');
        root.style.setProperty('--is-desktop', viewport.isDesktop ? '1' : '0');
    }

    applyResponsiveChanges(viewport) {
        if (!this.config.enableAutoOptimization) return;

        try {
            // 核心響應式調整
            this.handleLayoutChanges(viewport);
            this.handleNavigationChanges(viewport);
            this.handleTextSizing(viewport);
            this.handleSpacing(viewport);
            
            // 內容特定調整
            this.handleNewsLayoutChanges(viewport);
            this.handleMapResize(viewport);
            this.handleButtonSizes(viewport);
            this.handleImageOptimization(viewport);
            
            // 性能優化
            this.handlePerformanceOptimizations(viewport);

            // 觸發自訂事件
            this.dispatchViewportChangeEvent(viewport);

        } catch (error) {
            console.error('響應式變更應用失敗:', error);
        }
    }

    handleLayoutChanges(viewport) {
        // 容器寬度調整
        const containers = document.querySelectorAll('.container, .container-fluid');
        
        containers.forEach(container => {
            let maxWidth;
            
            switch (viewport.breakpoint) {
                case 'xs':
                case 'sm':
                    maxWidth = '100%';
                    break;
                case 'md':
                    maxWidth = '750px';
                    break;
                case 'lg':
                    maxWidth = '1200px';
                    break;
                case 'xl':
                    maxWidth = '1400px';
                    break;
                default:
                    maxWidth = '1200px';
            }
            
            container.style.maxWidth = maxWidth;
        });

        // 格線系統調整
        this.adjustGridSystems(viewport);
    }

    adjustGridSystems(viewport) {
        // 動態調整 CSS Grid 和 Flexbox 布局
        const grids = document.querySelectorAll('.auto-grid, .responsive-grid');
        
        grids.forEach(grid => {
            let columns;
            
            if (viewport.isMobile) {
                columns = grid.dataset.mobileCols || '1';
            } else if (viewport.isTablet) {
                columns = grid.dataset.tabletCols || '2';
            } else {
                columns = grid.dataset.desktopCols || '3';
            }
            
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        });
    }

    handleNavigationChanges(viewport) {
        const navbar = document.querySelector('.navbar');
        const navbarBrand = document.querySelector('.navbar-brand');
        
        if (!navbar) return;

        if (viewport.isMobile) {
            navbar.style.padding = '0.5rem 0';
            if (navbarBrand) {
                navbarBrand.style.fontSize = 'clamp(1.1rem, 4vw, 1.3rem)';
            }
        } else {
            navbar.style.padding = '1rem 0';
            if (navbarBrand) {
                navbarBrand.style.fontSize = 'clamp(1.3rem, 3vw, 1.6rem)';
            }
        }
    }

    handleTextSizing(viewport) {
        // 使用 clamp() 實現流暢的文字縮放
        const textElements = {
            '.hero-title': {
                mobile: 'clamp(2rem, 8vw, 2.8rem)',
                desktop: 'clamp(2.8rem, 6vw, 4rem)'
            },
            '.page-title': {
                mobile: 'clamp(1.8rem, 7vw, 2.5rem)',
                desktop: 'clamp(2.5rem, 5vw, 3.5rem)'
            },
            '.section-title': {
                mobile: 'clamp(1.5rem, 6vw, 2rem)',
                desktop: 'clamp(2rem, 4vw, 2.8rem)'
            }
        };

        Object.entries(textElements).forEach(([selector, sizes]) => {
            const elements = document.querySelectorAll(selector);
            const fontSize = viewport.isMobile ? sizes.mobile : sizes.desktop;
            
            elements.forEach(element => {
                element.style.fontSize = fontSize;
            });
        });

        // 根字體大小調整
        const rootSize = viewport.isMobile ? '14px' : 
                        viewport.isTablet ? '15px' : '16px';
        document.documentElement.style.fontSize = rootSize;
    }

    handleSpacing(viewport) {
        // 動態間距系統
        const spacingElements = document.querySelectorAll('[data-spacing]');
        
        spacingElements.forEach(element => {
            const spacing = element.dataset.spacing;
            const [mobile, tablet, desktop] = spacing.split(',');
            
            let currentSpacing;
            if (viewport.isMobile) {
                currentSpacing = mobile || '1rem';
            } else if (viewport.isTablet) {
                currentSpacing = tablet || '2rem';
            } else {
                currentSpacing = desktop || '3rem';
            }
            
            element.style.padding = currentSpacing;
        });

        // 預設 section 間距
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const padding = viewport.isMobile ? '3rem 0' : 
                          viewport.isTablet ? '4rem 0' : '5rem 0';
            section.style.padding = padding;
        });
    }

    handleNewsLayoutChanges(viewport) {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        let columns, gap;
        
        switch (viewport.breakpoint) {
            case 'xs':
                columns = '1fr';
                gap = '1.5rem';
                break;
            case 'sm':
                columns = '1fr';
                gap = '1.5rem';
                break;
            case 'md':
                columns = 'repeat(2, 1fr)';
                gap = '2rem';
                break;
            case 'lg':
            case 'xl':
                columns = 'repeat(3, 1fr)';
                gap = '2.5rem';
                break;
        }

        newsGrid.style.gridTemplateColumns = columns;
        newsGrid.style.gap = gap;
    }

    handleMapResize(viewport) {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;

        const height = viewport.isMobile ? '300px' : 
                     viewport.isTablet ? '400px' : '450px';
        mapContainer.style.height = height;
    }

    handleButtonSizes(viewport) {
        const buttons = document.querySelectorAll('.btn, .line-btn');
        
        buttons.forEach(btn => {
            if (viewport.isMobile) {
                btn.style.padding = '0.75rem 1.5rem';
                btn.style.fontSize = 'clamp(0.9rem, 4vw, 1rem)';
            } else {
                btn.style.padding = '1rem 2rem';
                btn.style.fontSize = 'clamp(1rem, 2vw, 1.2rem)';
            }
        });
    }

    handleImageOptimization(viewport) {
        if (!this.config.optimizeImages) return;

        // 響應式圖片處理
        const images = document.querySelectorAll('img[data-responsive]');
        
        images.forEach(img => {
            const baseSrc = img.dataset.src || img.src;
            let optimizedSrc;

            if (viewport.isMobile) {
                optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '_mobile.$1');
            } else if (viewport.isTablet) {
                optimizedSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/, '_tablet.$1');
            } else {
                optimizedSrc = baseSrc;
            }

            // 高解析度螢幕優化
            if (viewport.isRetina) {
                optimizedSrc = optimizedSrc.replace(/\.(jpg|jpeg|png)$/, '@2x.$1');
            }

            // 延遲載入檢查
            if (img.loading !== 'lazy' && viewport.isMobile) {
                img.loading = 'lazy';
            }

            img.src = optimizedSrc;
        });
    }

    handlePerformanceOptimizations(viewport) {
        // 根據裝置性能調整
        if (viewport.isMobile) {
            // 減少動畫
            document.documentElement.classList.add('reduce-motion');
            
            // 簡化效果
            const complexElements = document.querySelectorAll('.complex-animation');
            complexElements.forEach(el => {
                el.style.animation = 'none';
            });
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }

    dispatchViewportChangeEvent(viewport) {
        const event = new CustomEvent('viewportChange', {
            detail: {
                viewport,
                timestamp: Date.now(),
                previousViewport: this.currentViewport
            }
        });
        
        document.dispatchEvent(event);
    }

    // 工具方法
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 公開 API 方法
    getCurrentViewport() {
        return this.getViewportInfo();
    }

    isMobileDevice() {
        const viewport = this.getViewportInfo();
        return viewport.isMobile;
    }

    isTabletDevice() {
        const viewport = this.getViewportInfo();
        return viewport.isTablet;
    }

    isDesktopDevice() {
        const viewport = this.getViewportInfo();
        return viewport.isDesktop;
    }

    getBreakpoint() {
        return this.getViewportInfo().breakpoint;
    }

    matchesBreakpoint(breakpoint) {
        const current = this.getViewportInfo().breakpoint;
        const breakpointIndex = Object.keys(this.breakpoints).indexOf(breakpoint);
        const currentIndex = Object.keys(this.breakpoints).indexOf(current);
        return currentIndex >= breakpointIndex;
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.breakpoints) {
            this.setupBreakpoints();
            this.setupMediaQueries();
        }
    }

    // 手動觸發響應式更新
    forceUpdate() {
        const viewport = this.getViewportInfo();
        this.applyResponsiveChanges(viewport);
        this.currentViewport = viewport;
    }

    // 銷毀實例
    destroy() {
        this.isDestroyed = true;

        // 清理 resize timeout
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        // 清理媒體查詢監聽
        this.mediaQueries.forEach(({ query, handler }) => {
            query.removeListener(handler);
        });
        this.mediaQueries.clear();

        // 清理觀察器
        this.observers.forEach(({ observer, element }) => {
            observer.disconnect();
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.observers = [];
    }
}

/**
 * 建立 ResponsiveManager 實例的便利函數
 * @param {Object} options - 配置選項
 * @returns {ResponsiveManager} ResponsiveManager 實例
 */
export function createResponsiveManager(options) {
    return new ResponsiveManager(options);
}

/**
 * 快速斷點檢查函數
 * @param {string} breakpoint - 斷點名稱
 * @returns {boolean} 是否匹配斷點
 */
export function matchesBreakpoint(breakpoint) {
    const breakpoints = {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200,
        xl: 1400
    };
    
    return window.innerWidth >= (breakpoints[breakpoint] || 0);
}
