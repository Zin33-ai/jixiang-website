/**
 * 滾動功能模組
 * 處理平滑滾動和相關動畫
 * 優化版本 - 更好的相容性和性能
 */

export class ScrollManager {
    constructor(options = {}) {
        // 配置選項
        this.config = {
            offset: 80,           // 導航欄高度偏移
            duration: 800,        // 滾動動畫時間
            easing: 'easeInOutCubic', // 緩動函數
            updateAnchors: true,  // 是否自動處理新增的錨點
            trackClicks: true,    // 是否追蹤點擊事件
            ...options
        };

        this.activeScrolls = new Set(); // 追蹤進行中的滾動
        this.observers = [];           // MutationObserver 實例
        this.isDestroyed = false;

        this.init();
    }

    init() {
        try {
            this.setupSmoothScrolling();
            this.setupDynamicAnchors();
            this.setupScrollSpy();
        } catch (error) {
            console.error('ScrollManager 初始化失敗:', error);
        }
    }

    setupSmoothScrolling() {
        // 處理現有的錨點連結
        this.bindAnchorLinks(document);

        // 處理動態載入的內容
        if (this.config.updateAnchors) {
            this.observeAnchorChanges();
        }
    }

    bindAnchorLinks(container) {
        const anchors = container.querySelectorAll('a[href^="#"]');
        
        anchors.forEach(anchor => {
            // 避免重複綁定
            if (!anchor.dataset.scrollBound) {
                anchor.addEventListener('click', this.handleAnchorClick.bind(this));
                anchor.dataset.scrollBound = 'true';
            }
        });
    }

    observeAnchorChanges() {
        // 觀察 DOM 變化，自動處理新增的錨點
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.bindAnchorLinks(node);
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

    handleAnchorClick(e) {
        if (this.isDestroyed) return;

        e.preventDefault();
        
        const anchor = e.currentTarget;
        const targetId = anchor.getAttribute('href');
        
        // 處理空錨點或無效連結
        if (!targetId || targetId === '#') {
            return;
        }

        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            this.scrollToElement(targetElement, anchor);
        } else {
            console.warn(`ScrollManager: 找不到目標元素 ${targetId}`);
        }
    }

    scrollToElement(targetElement, sourceAnchor = null) {
        try {
            // 計算滾動位置
            const navbarHeight = this.getNavbarHeight();
            const elementTop = this.getElementTop(targetElement);
            const offsetTop = Math.max(0, elementTop - navbarHeight - 20);

            // 追蹤點擊事件
            if (this.config.trackClicks && sourceAnchor) {
                this.trackScrollClick(sourceAnchor, targetElement);
            }

            // 執行滾動
            this.smoothScrollTo(offsetTop, this.config.duration);

            // 更新 URL hash (可選)
            if (targetElement.id && history.pushState) {
                history.pushState(null, null, `#${targetElement.id}`);
            }

        } catch (error) {
            console.error('滾動到元素失敗:', error);
            // 後備方案
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    getNavbarHeight() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            return navbar.offsetHeight || this.config.offset;
        }
        return this.config.offset;
    }

    getElementTop(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.top + scrollTop;
    }

    smoothScrollTo(targetY, duration = this.config.duration) {
        // 防止重複滾動到相同位置
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        const difference = Math.abs(targetY - currentY);
        
        if (difference < 5) {
            return Promise.resolve();
        }

        // 檢查瀏覽器支援
        if ('scrollBehavior' in document.documentElement.style && !this.needsCustomScroll()) {
            return new Promise((resolve) => {
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
                
                // 估算完成時間
                setTimeout(resolve, Math.min(duration, 1000));
            });
        } else {
            // 自訂滾動動畫
            return this.customSmoothScroll(targetY, duration);
        }
    }

    needsCustomScroll() {
        // 某些瀏覽器的 smooth scroll 有問題，需要自訂實作
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('safari') && !userAgent.includes('chrome');
    }

    customSmoothScroll(targetY, duration) {
        return new Promise((resolve) => {
            const startY = window.pageYOffset || document.documentElement.scrollTop;
            const diff = targetY - startY;
            const startTime = performance.now();
            const scrollId = Date.now();

            // 取消進行中的滾動
            this.cancelActiveScrolls();
            this.activeScrolls.add(scrollId);

            const step = (timestamp) => {
                // 檢查是否被取消
                if (!this.activeScrolls.has(scrollId)) {
                    resolve();
                    return;
                }

                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = this.getEasingFunction(this.config.easing)(progress);
                
                const newPosition = startY + diff * easeProgress;
                window.scrollTo(0, newPosition);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    this.activeScrolls.delete(scrollId);
                    resolve();
                }
            };
            
            requestAnimationFrame(step);
        });
    }

    cancelActiveScrolls() {
        this.activeScrolls.clear();
    }

    getEasingFunction(easingName) {
        const easings = {
            linear: (t) => t,
            easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
            easeInCubic: (t) => t * t * t,
            easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeOutQuart: (t) => 1 - (--t) * t * t * t
        };

        return easings[easingName] || easings.easeInOutCubic;
    }

    setupScrollSpy() {
        // 簡單的 scroll spy 實作，高亮當前章節
        let ticking = false;
        const sections = document.querySelectorAll('[id]');
        const navLinks = document.querySelectorAll('a[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        const updateActiveSection = () => {
            if (this.isDestroyed) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navbarHeight = this.getNavbarHeight();
            
            let activeSection = null;

            // 找到當前可見的章節
            sections.forEach((section) => {
                const sectionTop = this.getElementTop(section) - navbarHeight - 50;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
                    activeSection = section;
                }
            });

            // 更新導航連結狀態
            navLinks.forEach((link) => {
                const href = link.getAttribute('href');
                const isActive = activeSection && href === `#${activeSection.id}`;
                
                link.classList.toggle('active', isActive);
                
                // 更新父元素狀態（如果需要）
                const parent = link.closest('.nav-item, li');
                if (parent) {
                    parent.classList.toggle('active', isActive);
                }
            });

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateActiveSection);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    trackScrollClick(anchor, target) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_to_section', {
                event_category: 'navigation',
                event_label: target.id || target.className,
                value: 1
            });
        }

        // 自訂追蹤
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('scroll', 'anchor_click', target.id || 'unknown');
        }
    }

    // 公開 API 方法
    scrollTo(target, options = {}) {
        const config = { ...this.config, ...options };
        
        if (typeof target === 'string') {
            const element = document.querySelector(target);
            if (element) {
                return this.scrollToElement(element);
            }
        } else if (typeof target === 'number') {
            return this.smoothScrollTo(target, config.duration);
        } else if (target instanceof Element) {
            return this.scrollToElement(target);
        }
        
        return Promise.reject(new Error('無效的滾動目標'));
    }

    scrollToTop(options = {}) {
        return this.smoothScrollTo(0, options.duration || this.config.duration);
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // 銷毀實例
    destroy() {
        this.isDestroyed = true;
        this.cancelActiveScrolls();

        // 清理 MutationObserver
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];

        // 移除事件綁定標記
        document.querySelectorAll('a[data-scroll-bound]').forEach(anchor => {
            delete anchor.dataset.scrollBound;
        });
    }
}

/**
 * 平滑滾動到指定位置（獨立函數）
 * @param {number} targetY - 目標 Y 位置
 * @param {number} duration - 動畫持續時間
 * @returns {Promise} 滾動完成的 Promise
 */
export function smoothScrollTo(targetY, duration = 800) {
    return new Promise((resolve) => {
        const startY = window.pageYOffset || document.documentElement.scrollTop;
        const diff = targetY - startY;
        const startTime = performance.now();
        
        if (Math.abs(diff) < 5) {
            resolve();
            return;
        }

        const step = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startY + diff * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        };
        
        requestAnimationFrame(step);
    });
}

/**
 * 緩動函數集合
 */
export const easingFunctions = {
    linear: (t) => t,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInCubic: (t) => t * t * t,
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t
};

/**
 * 主要緩動函數（向後相容）
 * @param {number} t - 進度 (0-1)
 * @returns {number} 緩動後的進度
 */
export function easeInOutCubic(t) {
    return easingFunctions.easeInOutCubic(t);
}

/**
 * 創建 ScrollManager 實例的便利函數
 * @param {Object} options - 配置選項
 * @returns {ScrollManager} ScrollManager 實例
 */
export function createScrollManager(options) {
    return new ScrollManager(options);
}
