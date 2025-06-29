/**
 * 追蹤功能模組
 * 處理各種用戶行為追蹤
 * 優化版本 - 支援多平台、隱私保護、動態追蹤
 */

export class TrackingManager {
    constructor(options = {}) {
        // 配置選項
        this.config = {
            // 啟用的追蹤平台
            platforms: {
                googleAnalytics: true,
                facebookPixel: false,
                customEvents: true
            },
            // 隱私設定
            respectDNT: true,        // 尊重 Do Not Track
            requireConsent: false,   // 是否需要同意
            anonymizeIP: true,       // IP 匿名化
            // 追蹤選項
            trackOutbound: true,     // 追蹤外部連結
            trackDownloads: true,    // 追蹤下載
            trackFormSubmits: true,  // 追蹤表單提交
            trackScrollDepth: true,  // 追蹤滾動深度
            // 動態內容追蹤
            observeChanges: true,    // 監控 DOM 變化
            debounceTime: 300,       // 防抖時間
            ...options
        };

        this.consentGiven = false;
        this.trackingQueue = [];     // 同意前的事件佇列
        this.observers = [];         // MutationObserver 實例
        this.scrollDepthMarks = [];  // 滾動深度標記
        this.isDestroyed = false;

        this.init();
    }

    init() {
        try {
            // 檢查隱私設定
            if (this.shouldRespectPrivacy()) {
                console.log('TrackingManager: 尊重用戶隱私設定，停用追蹤');
                return;
            }

            this.setupTrackingPlatforms();
            this.setupEventTracking();
            this.setupDynamicTracking();
            this.setupScrollDepthTracking();
            
            console.log('TrackingManager 初始化完成');
        } catch (error) {
            console.error('TrackingManager 初始化失敗:', error);
        }
    }

    shouldRespectPrivacy() {
        // 檢查 Do Not Track
        if (this.config.respectDNT && navigator.doNotTrack === '1') {
            return true;
        }

        // 檢查用戶同意
        if (this.config.requireConsent && !this.hasUserConsent()) {
            return true;
        }

        return false;
    }

    hasUserConsent() {
        // 檢查 localStorage 中的同意狀態
        try {
            return localStorage.getItem('tracking_consent') === 'true';
        } catch {
            return false;
        }
    }

    giveConsent() {
        this.consentGiven = true;
        
        try {
            localStorage.setItem('tracking_consent', 'true');
        } catch (error) {
            console.warn('無法儲存追蹤同意狀態:', error);
        }

        // 處理佇列中的事件
        this.processQueuedEvents();
    }

    revokeConsent() {
        this.consentGiven = false;
        
        try {
            localStorage.removeItem('tracking_consent');
        } catch (error) {
            console.warn('無法移除追蹤同意狀態:', error);
        }

        this.trackingQueue = [];
    }

    setupTrackingPlatforms() {
        // Google Analytics 設定
        if (this.config.platforms.googleAnalytics && typeof gtag !== 'undefined') {
            if (this.config.anonymizeIP) {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    anonymize_ip: true,
                    allow_google_signals: false
                });
            }
        }

        // Facebook Pixel 設定 (如果啟用)
        if (this.config.platforms.facebookPixel && typeof fbq !== 'undefined') {
            fbq('init', 'FB_PIXEL_ID');
        }
    }

    setupEventTracking() {
        this.setupPhoneTracking();
        this.setupLineTracking();
        this.setupSocialTracking();
        this.setupLinkTracking();
        this.setupFormTracking();
        this.setupPerformanceMonitoring();
    }

    setupDynamicTracking() {
        if (!this.config.observeChanges) return;

        // 監控 DOM 變化，自動追蹤新元素
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.bindTrackingEvents(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);
    }

    bindTrackingEvents(container) {
        // 綁定電話連結
        container.querySelectorAll('a[href^="tel:"]:not([data-tracked])').forEach(link => {
            this.bindPhoneTracking(link);
        });

        // 綁定 LINE 連結
        container.querySelectorAll('a[href*="lin.ee"]:not([data-tracked])').forEach(link => {
            this.bindLineTracking(link);
        });

        // 綁定社群媒體連結
        container.querySelectorAll('a[href*="facebook.com"]:not([data-tracked])').forEach(link => {
            this.bindSocialTracking(link, 'facebook');
        });

        // 綁定外部連結
        if (this.config.trackOutbound) {
            container.querySelectorAll('a[href^="http"]:not([data-tracked])').forEach(link => {
                if (!link.href.includes(window.location.hostname)) {
                    this.bindOutboundTracking(link);
                }
            });
        }
    }

    setupPhoneTracking() {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            this.bindPhoneTracking(link);
        });
    }

    bindPhoneTracking(link) {
        link.addEventListener('click', () => {
            const phoneNumber = link.href.replace('tel:', '');
            this.trackEvent('phone_click', {
                event_category: 'contact',
                event_label: phoneNumber,
                transport_type: 'beacon'
            });
        });
        link.dataset.tracked = 'true';
    }

    setupLineTracking() {
        document.querySelectorAll('a[href*="lin.ee"]').forEach(link => {
            this.bindLineTracking(link);
        });

        document.querySelectorAll('.line-btn-small').forEach(btn => {
            this.bindLineTracking(btn);
        });
    }

    bindLineTracking(element) {
        element.addEventListener('click', () => {
            const href = element.href || element.dataset.href || '';
            const isLandlord = href.includes('elZYPEn');
            const type = element.classList.contains('line-btn-small') ? 
                        `${isLandlord ? 'landlord' : 'tenant'}_small` :
                        isLandlord ? 'landlord' : 'tenant';
            
            this.trackLineClick(type);
        });
        element.dataset.tracked = 'true';
    }

    setupSocialTracking() {
        document.querySelectorAll('a[href*="facebook.com"]').forEach(link => {
            this.bindSocialTracking(link, 'facebook');
        });
    }

    bindSocialTracking(link, platform) {
        link.addEventListener('click', () => {
            this.trackEvent(`${platform}_click`, {
                event_category: 'social',
                event_label: `${platform}_page`,
                transport_type: 'beacon'
            });
        });
        link.dataset.tracked = 'true';
    }

    setupLinkTracking() {
        if (!this.config.trackOutbound) return;

        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                this.bindOutboundTracking(link);
            }
        });
    }

    bindOutboundTracking(link) {
        link.addEventListener('click', () => {
            const url = new URL(link.href);
            this.trackEvent('outbound_click', {
                event_category: 'outbound',
                event_label: url.hostname,
                transport_type: 'beacon'
            });
        });
        link.dataset.tracked = 'true';
    }

    setupFormTracking() {
        if (!this.config.trackFormSubmits) return;

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const formId = form.id || form.className || 'unknown';
                this.trackEvent('form_submit', {
                    event_category: 'engagement',
                    event_label: formId,
                    transport_type: 'beacon'
                });
            });
        });
    }

    setupScrollDepthTracking() {
        if (!this.config.trackScrollDepth) return;

        this.scrollDepthMarks = [25, 50, 75, 100];
        let maxDepthTracked = 0;
        let ticking = false;

        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            // 找到達到的最大深度標記
            const depthMark = this.scrollDepthMarks.find(mark => 
                scrollPercent >= mark && mark > maxDepthTracked
            );

            if (depthMark) {
                maxDepthTracked = depthMark;
                this.trackEvent('scroll_depth', {
                    event_category: 'engagement',
                    event_label: `${depthMark}%`,
                    value: depthMark
                });
            }

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(trackScrollDepth);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    setupPerformanceMonitoring() {
        // 頁面載入時間監控
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPagePerformance();
            }, 100);
        });

        // 錯誤監控
        window.addEventListener('error', (e) => {
            this.trackError('js_error', e.message, e.filename, e.lineno);
        });

        // Promise 錯誤監控
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('promise_error', e.reason?.toString() || 'Unknown promise error');
        });

        // Core Web Vitals
        this.trackWebVitals();
    }

    trackPagePerformance() {
        if (!performance || !performance.timing) return;

        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const firstPaint = timing.responseStart - timing.navigationStart;

        this.trackEvent('page_timing', {
            event_category: 'performance',
            custom_map: {
                custom_parameter_1: loadTime,
                custom_parameter_2: domReady,
                custom_parameter_3: firstPaint
            }
        });

        console.log(`頁面性能: 載入時間 ${loadTime}ms, DOM就緒 ${domReady}ms, 首次繪製 ${firstPaint}ms`);
    }

    trackWebVitals() {
        // 需要 web-vitals 套件或自訂實作
        if (typeof getCLS !== 'undefined') {
            getCLS((metric) => this.trackVital('CLS', metric));
            getFID((metric) => this.trackVital('FID', metric));
            getFCP((metric) => this.trackVital('FCP', metric));
            getLCP((metric) => this.trackVital('LCP', metric));
            getTTFB((metric) => this.trackVital('TTFB', metric));
        }
    }

    trackVital(name, metric) {
        this.trackEvent('web_vital', {
            event_category: 'performance',
            event_label: name,
            value: Math.round(metric.value),
            custom_parameter_1: metric.delta
        });
    }

    trackError(type, message, filename = '', lineno = 0) {
        // 避免追蹤太多相同錯誤
        const errorKey = `${type}_${message}`;
        if (this.recentErrors && this.recentErrors.has(errorKey)) {
            return;
        }

        if (!this.recentErrors) {
            this.recentErrors = new Set();
        }
        this.recentErrors.add(errorKey);

        // 5分鐘後清除錯誤記錄
        setTimeout(() => this.recentErrors.delete(errorKey), 300000);

        this.trackEvent(type, {
            event_category: 'error',
            event_label: message,
            custom_parameter_1: filename,
            custom_parameter_2: lineno,
            non_interaction: true
        });

        console.error(`追蹤錯誤 [${type}]:`, message);
    }

    /**
     * 追蹤 LINE 點擊
     * @param {string} type - 點擊類型
     */
    trackLineClick(type) {
        this.trackEvent('line_click', {
            event_category: 'contact',
            event_label: type,
            transport_type: 'beacon'
        });
    }

    /**
     * 追蹤社群分享
     * @param {string} platform - 分享平台
     */
    trackSocialShare(platform) {
        this.trackEvent('social_share', {
            event_category: 'social',
            event_label: platform,
            transport_type: 'beacon'
        });
    }

    /**
     * 追蹤自訂事件
     * @param {string} eventName - 事件名稱
     * @param {Object} parameters - 事件參數
     */
    trackCustomEvent(eventName, parameters = {}) {
        this.trackEvent(eventName, {
            event_category: 'custom',
            ...parameters
        });
    }

    /**
     * 通用事件追蹤
     * @param {string} eventName - 事件名稱
     * @param {Object} parameters - 事件參數
     */
    trackEvent(eventName, parameters = {}) {
        // 檢查同意狀態
        if (this.config.requireConsent && !this.consentGiven) {
            this.trackingQueue.push({ eventName, parameters, timestamp: Date.now() });
            return;
        }

        // 檢查隱私設定
        if (this.shouldRespectPrivacy()) {
            return;
        }

        // 添加通用參數
        const enhancedParameters = {
            page_title: document.title,
            page_location: window.location.href,
            ...parameters
        };

        // Google Analytics
        if (this.config.platforms.googleAnalytics && typeof gtag !== 'undefined') {
            gtag('event', eventName, enhancedParameters);
        }

        // Facebook Pixel
        if (this.config.platforms.facebookPixel && typeof fbq !== 'undefined') {
            fbq('track', eventName, enhancedParameters);
        }

        // 自訂事件處理
        if (this.config.platforms.customEvents) {
            this.handleCustomEvent(eventName, enhancedParameters);
        }

        console.log('Event tracked:', eventName, enhancedParameters);
    }

    handleCustomEvent(eventName, parameters) {
        // 發送到自訂分析平台
        if (typeof window.customAnalytics === 'object') {
            window.customAnalytics.track(eventName, parameters);
        }

        // 觸發自訂事件
        const customEvent = new CustomEvent('trackingEvent', {
            detail: { eventName, parameters }
        });
        document.dispatchEvent(customEvent);
    }

    processQueuedEvents() {
        const currentTime = Date.now();
        
        this.trackingQueue.forEach(({ eventName, parameters, timestamp }) => {
            // 只處理 5 分鐘內的事件
            if (currentTime - timestamp < 300000) {
                this.trackEvent(eventName, parameters);
            }
        });

        this.trackingQueue = [];
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * 獲取追蹤統計
     */
    getStats() {
        return {
            queuedEvents: this.trackingQueue.length,
            consentGiven: this.consentGiven,
            platformsEnabled: this.config.platforms,
            observersActive: this.observers.length
        };
    }

    /**
     * 銷毀實例
     */
    destroy() {
        this.isDestroyed = true;

        // 清理 MutationObserver
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

        // 清理事件佇列
        this.trackingQueue = [];

        // 移除追蹤標記
        document.querySelectorAll('[data-tracked]').forEach(element => {
            delete element.dataset.tracked;
        });
    }
}

/**
 * 導出社群分享追蹤函數（向後相容）
 * @param {string} platform - 分享平台
 */
export function trackSocialShare(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'social_share', {
            event_category: 'social',
            event_label: platform,
            transport_type: 'beacon'
        });
    }
}

/**
 * 建立 TrackingManager 實例的便利函數
 * @param {Object} options - 配置選項
 * @returns {TrackingManager} TrackingManager 實例
 */
export function createTrackingManager(options) {
    return new TrackingManager(options);
}
