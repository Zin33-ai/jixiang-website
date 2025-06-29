/**
 * 吉翔不動產有限公司 - 主要入口檔案
 * 現代化模組架構版本
 */

// 核心模組導入
import { Navbar } from './modules/navbar.js';
import { AnimationManager } from './modules/animations.js';
import { FloatingButton, scrollToTop } from './modules/floating-button.js';
import { ScrollManager } from './modules/scroll.js';
import { TrackingManager } from './modules/tracking.js';
import { ResponsiveManager } from './modules/responsive.js';

// 頁面特定模組導入
import { HomePage } from './modules/pages/home.js';
import { NewsPage } from './modules/pages/news.js';
import { ContactPage } from './modules/pages/contact.js';
import { ServicesPage } from './modules/pages/services.js';
import { AboutPage } from './modules/pages/about.js';

// CMS 和工具模組導入
import { ContentLoader } from './cms/content-loader.js';
import { getCurrentPage } from './utils/dom.js';
import { showToast } from './utils/ui.js';
import { isSafari, applySafariSpecificFixes } from './utils/safari.js';

/**
 * 主應用程式類別
 */
class JixiangApp {
    constructor() {
        this.modules = new Map();
        this.config = {
            observerOptions: {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            },
            animationDelay: 200,
            counterDuration: 2000
        };
        
        this.currentPage = getCurrentPage();
        this.contentLoader = new ContentLoader();
        
        this.init();
    }

    /**
     * 初始化應用程式
     */
    async init() {
        try {
            // 等待 DOM 完全載入
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.runInitialization());
            } else {
                this.runInitialization();
            }
        } catch (error) {
            console.error('應用程式初始化失敗:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 執行初始化流程
     */
    async runInitialization() {
        try {
            // 第一階段：核心功能初始化
            await this.initializeCoreModules();
            
            // 第二階段：頁面特定功能初始化
            await this.initializePageModules();
            
            // 第三階段：內容載入
            await this.loadPageContent();
            
            // 第四階段：最終設定
            this.finalizeInitialization();
            
            console.log('🎉 吉翔不動產網站初始化完成', {
                page: this.currentPage,
                isSafari: isSafari,
                modules: Array.from(this.modules.keys()),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('初始化過程中發生錯誤:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 初始化核心模組
     */
    async initializeCoreModules() {
        // 導航欄
        this.modules.set('navbar', new Navbar());
        
        // 動畫管理器
        this.modules.set('animations', new AnimationManager(this.config.observerOptions));
        
        // 浮動按鈕
        this.modules.set('floatingButton', new FloatingButton());
        
        // 滾動管理器
        this.modules.set('scroll', new ScrollManager());
        
        // 追蹤管理器
        this.modules.set('tracking', new TrackingManager());
        
        // 響應式管理器
        this.modules.set('responsive', new ResponsiveManager());
        
        console.log('✅ 核心模組初始化完成');
    }

    /**
     * 初始化頁面特定模組
     */
    async initializePageModules() {
        let pageModule = null;
        
        switch (this.currentPage) {
            case 'home':
            case 'index':
                pageModule = new HomePage();
                break;
                
            case 'news':
                pageModule = new NewsPage();
                break;
                
            case 'contact':
                pageModule = new ContactPage();
                break;
                
            case 'services':
                pageModule = new ServicesPage();
                break;
                
            case 'about':
                pageModule = new AboutPage();
                break;
                
            default:
                console.warn('未知的頁面類型:', this.currentPage);
        }
        
        if (pageModule) {
            this.modules.set('page', pageModule);
        }
        
        console.log(`✅ 頁面模組 (${this.currentPage}) 初始化完成`);
    }

    /**
     * 載入頁面內容
     */
    async loadPageContent() {
        try {
            // 根據頁面類型載入對應內容
            switch (this.currentPage) {
                case 'news':
                    await this.loadNewsContent();
                    break;
                    
                case 'services':
                    await this.loadServicesContent();
                    break;
                    
                case 'about':
                    await this.loadAboutContent();
                    break;
                    
                case 'home':
                case 'index':
                    await this.loadHomeContent();
                    break;
            }
            
            console.log('✅ 頁面內容載入完成');
        } catch (error) {
            console.warn('內容載入失敗:', error);
            // 內容載入失敗不應阻止其他功能
        }
    }

    /**
     * 載入新聞頁面內容
     */
    async loadNewsContent() {
        const newsContainer = document.getElementById('dynamic-news-container');
        if (newsContainer) {
            const newsData = await this.contentLoader.loadNews();
            this.contentLoader.renderNews(newsData, 'dynamic-news-container');
        }
    }

    /**
     * 載入服務頁面內容
     */
    async loadServicesContent() {
        const servicesContainer = document.getElementById('dynamic-services-container');
        if (servicesContainer) {
            const servicesData = await this.contentLoader.loadServices();
            this.contentLoader.renderServices(servicesData, 'dynamic-services-container');
        }
    }

    /**
     * 載入關於我們頁面內容
     */
    async loadAboutContent() {
        // 載入團隊成員
        const teamData = await this.contentLoader.loadTeamMembers();
        // 載入見證
        const testimonialsData = await this.contentLoader.loadTestimonials();
        // 載入統計資料
        const statsData = await this.contentLoader.getStatistics();
        
        // 更新統計數字
        this.updateStatistics(statsData);
    }

    /**
     * 載入首頁內容
     */
    async loadHomeContent() {
        // 載入最新新聞
        const latestNews = await this.contentLoader.loadNews({ limit: 3 });
        
        // 載入服務概覽
        const services = await this.contentLoader.loadServices();
        
        // 載入統計資料
        const stats = await this.contentLoader.getStatistics();
        this.updateStatistics(stats);
    }

    /**
     * 更新統計數字
     */
    updateStatistics(statsData) {
        Object.entries(statsData).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element && typeof value === 'number') {
                element.setAttribute('data-count', value);
                element.textContent = '0'; // 重置為 0，讓動畫從 0 開始
            }
        });
    }

    /**
     * 最終初始化設定
     */
    finalizeInitialization() {
        // 設定全域函數
        this.setupGlobalFunctions();
        
        // 應用 Safari 特殊修復
        applySafariSpecificFixes();
        
        // 設定輔助功能
        this.setupAccessibilityFeatures();
        
        // 延遲執行初始動畫
        setTimeout(() => this.triggerInitialAnimations(), 300);
        
        // 設定錯誤處理
        this.setupErrorHandling();
    }

    /**
     * 設定全域函數
     */
    setupGlobalFunctions() {
        // 導出到全域範圍供 HTML 調用
        window.JixiangApp = {
            showToast,
            scrollToTop,
            version: '2.0.0',
            app: this
        };

        // 設定常用的全域函數
        window.scrollToTop = scrollToTop;
        window.showToast = showToast;
        
        // 頁面特定的全域函數會由各頁面模組自行設定
    }

    /**
     * 觸發初始動畫
     */
    triggerInitialAnimations() {
        // 頁面頂部區域的動畫
        const headerElements = document.querySelectorAll('.page-header .fade-in, .hero-section .fade-in');
        headerElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * this.config.animationDelay);
        });

        // 如果有計數器，觸發計數動畫
        const animationManager = this.modules.get('animations');
        if (animationManager) {
            animationManager.initializeCounters();
        }
    }

    /**
     * 設定輔助功能支援
     */
    setupAccessibilityFeatures() {
        // 鍵盤導航支援
        document.addEventListener('keydown', (e) => {
            // ESC 鍵關閉任何彈出內容
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.show, .dropdown.show, .inquiry-modal.show');
                activeModals.forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });

        // 為動態內容添加適當的 ARIA 標籤
        this.setupAriaLabels();
        
        // 焦點管理
        this.setupFocusManagement();
    }

    /**
     * 設定 ARIA 標籤
     */
    setupAriaLabels() {
        // 新聞項目
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach((item, index) => {
            if (!item.getAttribute('role')) {
                item.setAttribute('role', 'article');
            }
            if (!item.getAttribute('aria-label')) {
                const title = item.querySelector('.news-title')?.textContent;
                if (title) {
                    item.setAttribute('aria-label', `新聞文章: ${title}`);
                }
            }
        });

        // 分享按鈕
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            const platform = btn.classList.contains('facebook') ? 'Facebook' : 
                            btn.classList.contains('line') ? 'LINE' : '複製連結';
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', `分享到 ${platform}`);
            }
        });
    }

    /**
     * 設定焦點管理
     */
    setupFocusManagement() {
        // 跳過連結支援
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = '跳至主要內容';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 9999;
            border-radius: 4px;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * 設定錯誤處理
     */
    setupErrorHandling() {
        // 全域錯誤處理
        window.addEventListener('error', (e) => {
            console.error('全域錯誤:', e.error);
            
            // 不要向用戶顯示技術錯誤，只記錄
            if (typeof gtag !== 'undefined') {
                gtag('event', 'js_error', {
                    event_category: 'error',
                    event_label: e.message,
                    value: 1
                });
            }
        });

        // Promise 錯誤處理
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未處理的 Promise 錯誤:', e.reason);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'promise_error', {
                    event_category: 'error',
                    event_label: e.reason?.toString() || 'Unknown promise error',
                    value: 1
                });
            }
        });
    }

    /**
     * 處理初始化錯誤
     */
    handleInitializationError(error) {
        console.error('初始化失敗:', error);
        
        // 顯示友善的錯誤訊息
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f8d7da;
            color: #721c24;
            padding: 1rem 2rem;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
            z-index: 9999;
            max-width: 400px;
            text-align: center;
        `;
        errorMessage.innerHTML = `
            <h4>載入中遇到問題</h4>
            <p>請重新整理頁面，或稍後再試。</p>
            <button onclick="window.location.reload()" style="
                background: #721c24;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 0.5rem;
            ">重新載入</button>
        `;
        
        document.body.appendChild(errorMessage);
        
        // 5秒後自動移除錯誤訊息
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 5000);
    }

    /**
     * 獲取模組實例
     * @param {string} moduleName - 模組名稱
     * @returns {Object|null} 模組實例
     */
    getModule(moduleName) {
        return this.modules.get(moduleName) || null;
    }

    /**
     * 重新載入頁面內容
     * @param {string} contentType - 內容類型
     */
    async reloadContent(contentType) {
        try {
            const newContent = await this.contentLoader.reloadContent(contentType);
            
            // 重新渲染內容
            switch (contentType) {
                case 'news':
                    this.contentLoader.renderNews(newContent);
                    break;
                case 'services':
                    this.contentLoader.renderServices(newContent);
                    break;
            }
            
            // 重新初始化動畫
            const animationManager = this.modules.get('animations');
            if (animationManager) {
                animationManager.observeElements();
            }
            
        } catch (error) {
            console.error('重新載入內容失敗:', error);
            showToast('載入失敗，請重新整理頁面', 3000);
        }
    }
}

// 創建並啟動應用程式
const app = new JixiangApp();

// 導出應用程式實例供其他地方使用
export default app;
