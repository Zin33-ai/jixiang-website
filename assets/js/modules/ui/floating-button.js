/**
 * 浮動按鈕功能模組
 * 處理回到頂部按鈕的顯示和行為
 * 優化版本 - 更好的相容性和錯誤處理
 */

import { isSafari } from '../../utils/safari.js';
import { scrollToElement } from '../../utils/ui.js';

export class FloatingButton {
    constructor(options = {}) {
        // 配置選項
        this.config = {
            threshold: 200,           // 顯示按鈕的滾動距離
            className: 'floating-btn',
            title: '回到最上層',
            icon: 'bi bi-arrow-up-circle-fill',
            position: 'bottom-right', // bottom-right, bottom-left
            ...options
        };
        
        this.button = null;
        this.ticking = false;
        this.isVisible = false;
        this.isDestroyed = false;
        
        this.init();
    }

    init() {
        try {
            this.createButton();
            this.setupEventListeners();
            this.setupAccessibility();
        } catch (error) {
            console.error('FloatingButton 初始化失敗:', error);
        }
    }

    createButton() {
        // 檢查是否已有浮動按鈕
        this.button = document.querySelector(`.${this.config.className}`);

        if (!this.button) {
            // 動態建立浮動按鈕
            this.button = document.createElement('button');
            this.button.className = this.config.className;
            this.button.title = this.config.title;
            this.button.innerHTML = `<i class="${this.config.icon}" aria-hidden="true"></i>`;
            
            // 設定初始樣式
            this.setInitialStyles();
            
            // 添加到頁面
            document.body.appendChild(this.button);
        }
    }

    setInitialStyles() {
        // 確保按鈕有基本樣式（防止 CSS 未載入）
        const defaultStyles = {
            position: 'fixed',
            bottom: '20px',
            right: this.config.position === 'bottom-left' ? 'auto' : '20px',
            left: this.config.position === 'bottom-left' ? '20px' : 'auto',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#1E3A8A',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: '9999',
            opacity: '0',
            transform: 'scale(0.9)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };

        Object.assign(this.button.style, defaultStyles);
        
        // Safari 相容性
        if (isSafari()) {
            this.button.style.webkitTransform = 'scale(0.9)';
            this.button.style.webkitTransition = 'all 0.3s ease';
        }
    }

    setupEventListeners() {
        if (!this.button) return;

        // 滾動事件（使用 passive 提升性能）
        this.handleScroll = this.onScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        
        // 點擊事件
        this.handleClick = this.onClick.bind(this);
        this.button.addEventListener('click', this.handleClick);

        // 鍵盤事件支援
        this.handleKeydown = this.onKeydown.bind(this);
        this.button.addEventListener('keydown', this.handleKeydown);

        // 觸控設備支援
        this.handleTouchStart = this.onTouchStart.bind(this);
        this.button.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    }

    setupAccessibility() {
        if (!this.button) return;

        // 設定 ARIA 屬性
        this.button.setAttribute('aria-label', this.config.title);
        this.button.setAttribute('role', 'button');
        this.button.setAttribute('tabindex', '0');
    }

    onScroll() {
        if (!this.ticking && !this.isDestroyed) {
            requestAnimationFrame(this.updateVisibility.bind(this));
            this.ticking = true;
        }
    }

    updateVisibility() {
        if (this.isDestroyed || !this.button) {
            this.ticking = false;
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldShow = scrollTop > this.config.threshold;
        
        if (shouldShow !== this.isVisible) {
            this.isVisible = shouldShow;
            this.animateVisibility(shouldShow);
        }
        
        this.ticking = false;
    }

    animateVisibility(show) {
        if (!this.button) return;

        if (show) {
            this.button.style.opacity = '1';
            this.button.style.transform = 'scale(1)';
            this.button.style.pointerEvents = 'auto';
            if (isSafari()) {
                this.button.style.webkitTransform = 'scale(1)';
            }
        } else {
            this.button.style.opacity = '0';
            this.button.style.transform = 'scale(0.9)';
            this.button.style.pointerEvents = 'none';
            if (isSafari()) {
                this.button.style.webkitTransform = 'scale(0.9)';
            }
        }
    }

    onClick(event) {
        event.preventDefault();
        
        if (this.isDestroyed) return;

        // 點擊效果動畫
        this.animateClick();
        
        // 滾動到頂部
        this.scrollToTop();

        // 追蹤點擊事件
        this.trackClick();
    }

    onKeydown(event) {
        // 支援 Enter 和 Space 鍵
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.onClick(event);
        }
    }

    onTouchStart() {
        // 觸控設備的反饋效果
        if (this.button) {
            this.button.style.transform = 'scale(0.95)';
            if (isSafari()) {
                this.button.style.webkitTransform = 'scale(0.95)';
            }
        }
    }

    animateClick() {
        if (!this.button) return;

        // 點擊縮放效果
        this.button.style.transform = 'scale(0.9)';
        if (isSafari()) {
            this.button.style.webkitTransform = 'scale(0.9)';
        }
        
        setTimeout(() => {
            if (this.button && !this.isDestroyed) {
                this.button.style.transform = 'scale(1)';
                if (isSafari()) {
                    this.button.style.webkitTransform = 'scale(1)';
                }
            }
        }, 150);
    }

    scrollToTop() {
        try {
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                // 舊版瀏覽器後備方案
                this.smoothScrollTo(0, 600);
            }
        } catch (error) {
            console.error('滾動到頂部失敗:', error);
            // 最後的後備方案
            window.scrollTo(0, 0);
        }
    }

    /**
     * 自定義平滑滾動實現
     * @param {number} targetY - 目標 Y 座標
     * @param {number} duration - 動畫時間
     */
    smoothScrollTo(targetY, duration) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const startTime = performance.now();
        
        function step(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);
            
            window.scrollTo(0, startY + diff * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(step.bind(this));
            }
        }
        
        requestAnimationFrame(step.bind(this));
    }

    /**
     * 緩動函數
     * @param {number} t - 時間進度 (0-1)
     * @returns {number} 緩動後的進度
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    trackClick() {
        // Google Analytics 追蹤
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_to_top', {
                event_category: 'navigation',
                event_label: 'floating_button'
            });
        }

        // 自定義追蹤
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('floating_button', 'click', 'scroll_to_top');
        }
    }

    // 銷毀實例，清理事件監聽器
    destroy() {
        this.isDestroyed = true;

        if (this.handleScroll) {
            window.removeEventListener('scroll', this.handleScroll);
        }

        if (this.button) {
            if (this.handleClick) {
                this.button.removeEventListener('click', this.handleClick);
            }
            if (this.handleKeydown) {
                this.button.removeEventListener('keydown', this.handleKeydown);
            }
            if (this.handleTouchStart) {
                this.button.removeEventListener('touchstart', this.handleTouchStart);
            }

            // 移除按鈕
            if (this.button.parentNode) {
                this.button.parentNode.removeChild(this.button);
            }
        }

        this.button = null;
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.button) {
            this.button.title = this.config.title;
            this.button.setAttribute('aria-label', this.config.title);
        }
    }

    // 手動顯示/隱藏
    show() {
        this.animateVisibility(true);
    }

    hide() {
        this.animateVisibility(false);
    }
}

// 導出全域函數供其他地方使用
export function scrollToTop(options = {}) {
    const { behavior = 'smooth', duration = 600 } = options;
    
    try {
        if ('scrollBehavior' in document.documentElement.style && behavior === 'smooth') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // 自定義平滑滾動
            smoothScrollTo(0, duration);
        }
    } catch (error) {
        console.error('全域 scrollToTop 失敗:', error);
        window.scrollTo(0, 0);
    }
}

/**
 * 自定義平滑滾動實現
 * @param {number} targetY - 目標 Y 座標
 * @param {number} duration - 動畫時間
 */
function smoothScrollTo(targetY, duration) {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const startTime = performance.now();
    
    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);
        
        window.scrollTo(0, startY + diff * easeProgress);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

/**
 * 緩動函數
 * @param {number} t - 時間進度 (0-1)
 * @returns {number} 緩動後的進度
 */
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// 導出創建實例的便利函數
export function createFloatingButton(options) {
    return new FloatingButton(options);
}
