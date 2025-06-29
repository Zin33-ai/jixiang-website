/**
 * 追蹤功能模組
 * 處理各種用戶行為追蹤
 */

export class TrackingManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPhoneTracking();
        this.setupLineTracking();
        this.setupSocialTracking();
        this.setupPerformanceMonitoring();
    }

    /**
     * 設定電話點擊追蹤
     */
    setupPhoneTracking() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        phoneLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('phone_click', {
                    event_category: 'contact',
                    event_label: '02-2998-9596'
                });
            });
        });
    }

    /**
     * 設定 LINE 點擊追蹤
     */
    setupLineTracking() {
        // LINE 連結追蹤
        const lineLinks = document.querySelectorAll('a[href*="lin.ee"]');
        
        lineLinks.forEach(link => {
            link.addEventListener('click', () => {
                const isLandlord = link.href.includes('elZYPEn');
                this.trackLineClick(isLandlord ? 'landlord' : 'tenant');
            });
        });

        // 小版 LINE 按鈕追蹤
        const lineButtons = document.querySelectorAll('.line-btn-small');
        
        lineButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const isLandlord = btn.href.includes('elZYPEn');
                this.trackLineClick(isLandlord ? 'landlord_small' : 'tenant_small');
            });
        });
    }

    /**
     * 設定社群媒體追蹤
     */
    setupSocialTracking() {
        // Facebook 點擊追蹤
        const facebookLinks = document.querySelectorAll('a[href*="facebook.com"]');
        
        facebookLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('facebook_click', {
                    event_category: 'social',
                    event_label: 'facebook_page'
                });
            });
        });
    }

    /**
     * 設定性能監控
     */
    setupPerformanceMonitoring() {
        // 頁面載入時間監控
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (performance && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log(`頁面載入時間: ${loadTime}ms`);
                    
                    this.trackEvent('page_load_time', {
                        event_category: 'performance',
                        value: Math.round(loadTime)
                    });
                }
            }, 0);
        });

        // 錯誤監控
        window.addEventListener('error', (e) => {
            console.error('JavaScript 錯誤:', e.error);
            
            this.trackEvent('js_error', {
                event_category: 'error',
                event_label: e.message,
                value: 1
            });
        });

        // Promise 錯誤監控
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未處理的 Promise 錯誤:', e.reason);
            
            this.trackEvent('promise_error', {
                event_category: 'error',
                event_label: e.reason?.toString() || 'Unknown promise error',
                value: 1
            });
        });
    }

    /**
     * 追蹤 LINE 點擊
     * @param {string} type - 點擊類型
     */
    trackLineClick(type) {
        this.trackEvent('line_click', {
            event_category: 'contact',
            event_label: type
        });
    }

    /**
     * 追蹤社群分享
     * @param {string} platform - 分享平台
     */
    trackSocialShare(platform) {
        this.trackEvent('social_share', {
            event_category: 'social',
            event_label: platform
        });
    }

    /**
     * 通用事件追蹤
     * @param {string} eventName - 事件名稱
     * @param {Object} parameters - 事件參數
     */
    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // 也可以在這裡添加其他分析工具的追蹤代碼
        console.log('Event tracked:', eventName, parameters);
    }
}

// 導出社群分享追蹤函數
export function trackSocialShare(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'social_share', {
            event_category: 'social',
            event_label: platform
        });
    }
}
