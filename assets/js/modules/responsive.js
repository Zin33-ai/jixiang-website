/**
 * 響應式處理模組
 * 處理不同螢幕尺寸的適應性調整
 */

export class ResponsiveManager {
    constructor() {
        this.resizeTimeout = null;
        this.breakpoints = {
            mobile: 768,
            tablet: 992,
            desktop: 1200
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleInitialLoad();
    }

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const viewport = this.getViewportInfo();
            this.applyResponsiveChanges(viewport);
        }, 250);
    }

    handleOrientationChange() {
        // 等待方向變化完成
        setTimeout(() => {
            const viewport = this.getViewportInfo();
            this.applyResponsiveChanges(viewport);
        }, 500);
    }

    handleInitialLoad() {
        const viewport = this.getViewportInfo();
        this.applyResponsiveChanges(viewport);
    }

    getViewportInfo() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        return {
            width,
            height,
            isMobile: width < this.breakpoints.mobile,
            isTablet: width >= this.breakpoints.mobile && width < this.breakpoints.tablet,
            isDesktop: width >= this.breakpoints.tablet,
            orientation: width > height ? 'landscape' : 'portrait'
        };
    }

    applyResponsiveChanges(viewport) {
        this.handleMobileOptimizations(viewport.isMobile);
        this.handleTabletOptimizations(viewport.isTablet);
        this.handleDesktopOptimizations(viewport.isDesktop);
        this.handleMapResize(viewport.isMobile);
        this.handleNavigationChanges(viewport);
        this.handleTextSizing(viewport);
        this.handleNewsLayoutChanges(viewport);
    }

    handleMobileOptimizations(isMobile) {
        // 文字大小調整
        this.adjustTextSizes(isMobile);
        
        // 新聞頁面 footer 調整
        this.adjustNewsFooter(isMobile);
        
        // 按鈕大小調整
        this.adjustButtonSizes(isMobile);
        
        // 間距調整
        this.adjustSpacing(isMobile);
    }

    handleTabletOptimizations(isTablet) {
        if (isTablet) {
            // 平板特定優化
            this.adjustTabletLayout();
        }
    }

    handleDesktopOptimizations(isDesktop) {
        if (isDesktop) {
            // 桌面特定優化
            this.adjustDesktopLayout();
        }
    }

    adjustTextSizes(isMobile) {
        const heroTitle = document.querySelector('.hero-title');
        const pageTitle = document.querySelector('.page-title');
        
        if (heroTitle) {
            heroTitle.style.fontSize = isMobile ? '2.5rem' : '3.5rem';
        }
        
        if (pageTitle) {
            pageTitle.style.fontSize = isMobile ? '2.5rem' : '3rem';
        }

        // 調整其他標題
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.fontSize = isMobile ? '2rem' : '2.5rem';
        });
    }

    adjustNewsFooter(isMobile) {
        const newsFooters = document.querySelectorAll('.news-footer');
        
        newsFooters.forEach(footer => {
            if (isMobile) {
                footer.style.flexDirection = 'column';
                footer.style.alignItems = 'flex-start';
                footer.style.gap = '1rem';
            } else {
                footer.style.flexDirection = 'row';
                footer.style.alignItems = 'center';
                footer.style.justifyContent = 'space-between';
                footer.style.gap = '0';
            }
        });
    }

    adjustButtonSizes(isMobile) {
        const buttons = document.querySelectorAll('.btn, .line-btn');
        
        buttons.forEach(btn => {
            if (isMobile) {
                btn.style.padding = '0.75rem 1.5rem';
                btn.style.fontSize = '1rem';
            } else {
                btn.style.padding = '1rem 2rem';
                btn.style.fontSize = '1.1rem';
            }
        });
    }

    adjustSpacing(isMobile) {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            if (isMobile) {
                section.style.padding = '3rem 0';
            } else {
                section.style.padding = '5rem 0';
            }
        });
    }

    handleMapResize(isMobile) {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.height = isMobile ? '300px' : '450px';
        }
    }

    handleNavigationChanges(viewport) {
        const navbar = document.querySelector('.navbar');
        const navbarBrand = document.querySelector('.navbar-brand');
        
        if (!navbar) return;

        if (viewport.isMobile) {
            // 手機版導航調整
            navbar.style.padding = '0.5rem 0';
            if (navbarBrand) {
                navbarBrand.style.fontSize = '1.2rem';
            }
        } else {
            // 桌面版導航調整
            navbar.style.padding = '1rem 0';
            if (navbarBrand) {
                navbarBrand.style.fontSize = '1.5rem';
            }
        }
    }

    handleTextSizing(viewport) {
        // 根據螢幕大小調整基礎字體大小
        const root = document.documentElement;
        
        if (viewport.isMobile) {
            root.style.fontSize = '14px';
        } else if (viewport.isTablet) {
            root.style.fontSize = '15px';
        } else {
            root.style.fontSize = '16px';
        }
    }

    handleNewsLayoutChanges(viewport) {
        const newsGrid = document.querySelector('.news-grid');
        const newsItems = document.querySelectorAll('.news-item');
        
        if (!newsGrid) return;

        if (viewport.isMobile) {
            // 手機版：單欄布局
            newsGrid.style.gridTemplateColumns = '1fr';
            newsGrid.style.gap = '1.5rem';
        } else if (viewport.isTablet) {
            // 平板版：雙欄布局
            newsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            newsGrid.style.gap = '2rem';
        } else {
            // 桌面版：三欄布局
            newsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            newsGrid.style.gap = '2.5rem';
        }
    }

    adjustTabletLayout() {
        // 平板特定的布局調整
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.maxWidth = '750px';
        });
    }

    adjustDesktopLayout() {
        // 桌面特定的布局調整
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.maxWidth = '1200px';
        });
    }

    /**
     * 獲取當前視窗資訊
     * @returns {Object} 視窗資訊
     */
    getCurrentViewport() {
        return this.getViewportInfo();
    }

    /**
     * 檢查是否為行動裝置
     * @returns {boolean}
     */
    isMobileDevice() {
        return window.innerWidth < this.breakpoints.mobile;
    }

    /**
     * 檢查是否為平板裝置
     * @returns {boolean}
     */
    isTabletDevice() {
        const width = window.innerWidth;
        return width >= this.breakpoints.mobile && width < this.breakpoints.tablet;
    }

    /**
     * 檢查是否為桌面裝置
     * @returns {boolean}
     */
    isDesktopDevice() {
        return window.innerWidth >= this.breakpoints.tablet;
    }
}
