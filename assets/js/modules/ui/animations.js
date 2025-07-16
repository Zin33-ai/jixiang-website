/**
 * 動畫效果模組
 * 處理滾動動畫、Intersection Observer 和各種視覺效果
 */

import { throttle } from '../../utils/ui.js';
import { isSafari } from '../../utils/safari.js';
import { safeQuerySelectorAll } from '../../utils/dom.js';

// 動畫設定
const ANIMATION_CONFIG = {
    observerOptions: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    },
    delay: 200,
    counterDuration: 2000,
    staggerDelay: 100
};

// 動畫選擇器
const ANIMATION_SELECTORS = {
    fadeIn: '.fade-in',
    slideInLeft: '.slide-in-left',
    slideInRight: '.slide-in-right',
    slideInUp: '.slide-in-up',
    slideInDown: '.slide-in-down',
    scaleIn: '.scale-in',
    rotateIn: '.rotate-in',
    counters: '.counter[data-count]'
};

let observer = null;
let counterObserver = null;
let isInitialized = false;

/**
 * 設定 Intersection Observer 滾動動畫
 */
export function setupIntersectionObserver() {
    // 檢查瀏覽器支援
    if (!window.IntersectionObserver) {
        console.warn('瀏覽器不支援 Intersection Observer，使用後備方案');
        fallbackAnimations();
        return;
    }
    
    // 建立觀察器
    observer = new IntersectionObserver(handleIntersection, ANIMATION_CONFIG.observerOptions);
    
    // 蒐集所有需要動畫的元素
    const animationElements = gatherAnimationElements();
    
    if (animationElements.length === 0) {
        console.log('沒有找到需要動畫的元素');
        return;
    }
    
    // 開始觀察元素
    animationElements.forEach(element => {
        observer.observe(element);
    });
    
    console.log(`開始觀察 ${animationElements.length} 個動畫元素`);
}

/**
 * 蒐集所有需要動畫的元素
 * @returns {Element[]} 動畫元素陣列
 */
function gatherAnimationElements() {
    const elements = [];
    
    Object.values(ANIMATION_SELECTORS).forEach(selector => {
        if (selector !== ANIMATION_SELECTORS.counters) {
            const foundElements = safeQuerySelectorAll(selector);
            elements.push(...foundElements);
        }
    });
    
    return elements;
}

/**
 * 處理元素進入視窗的交集事件
 * @param {IntersectionObserverEntry[]} entries - 交集條目
 */
function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            triggerElementAnimation(entry.target);
            
            // 停止觀察已動畫的元素（性能優化）
            if (observer) {
                observer.unobserve(entry.target);
            }
        }
    });
}

/**
 * 觸發單個元素的動畫
 * @param {Element} element - 目標元素
 */
function triggerElementAnimation(element) {
    // 添加 visible 類別
    element.classList.add('visible');
    
    // Safari 專用處理
    if (isSafari()) {
        applySafariAnimationFix(element);
    }
    
    // 觸發自訂事件
    element.dispatchEvent(new CustomEvent('animation:start', {
        bubbles: true,
        detail: { element }
    }));
}

/**
 * Safari 動畫修復
 * @param {Element} element - 目標元素
 */
function applySafariAnimationFix(element) {
    // 確保 Transform 有 webkit 前綴
    const transform = window.getComputedStyle(element).transform;
    if (transform && transform !== 'none') {
        element.style.webkitTransform = transform;
    }
    
    // 添加硬體加速
    if (!element.style.willChange) {
        element.style.willChange = 'transform, opacity';
    }
}

/**
 * 舊版瀏覽器後備動畫方案
 */
function fallbackAnimations() {
    const allAnimationElements = gatherAnimationElements();
    
    allAnimationElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * ANIMATION_CONFIG.staggerDelay);
    });
    
    console.log('後備動畫已觸發');
}

/**
 * 設定數字計數動畫
 */
export function setupCounterAnimations() {
    const counters = safeQuerySelectorAll(ANIMATION_SELECTORS.counters);
    
    if (counters.length === 0) {
        console.log('沒有找到計數器元素');
        return;
    }
    
    // 檢查瀏覽器支援
    if (!window.IntersectionObserver) {
        // 後備方案：直接顯示最終數字
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            counter.textContent = target;
        });
        return;
    }
    
    // 建立計數器觀察器
    counterObserver = new IntersectionObserver(handleCounterIntersection, {
        threshold: 0.5,
        rootMargin: '0px'
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    console.log(`設定 ${counters.length} 個計數器動畫`);
}

/**
 * 處理計數器進入視窗
 * @param {IntersectionObserverEntry[]} entries - 交集條目
 */
function handleCounterIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            
            // 停止觀察已完成的計數器
            if (counterObserver) {
                counterObserver.unobserve(entry.target);
            }
        }
    });
}

/**
 * 數字計數動畫
 * @param {Element} element - 計數器元素
 */
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = parseInt(element.getAttribute('data-duration')) || ANIMATION_CONFIG.counterDuration;
    const decimals = parseInt(element.getAttribute('data-decimals')) || 0;
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    
    if (isNaN(target)) {
        console.warn('計數器目標值無效:', element);
        return;
    }
    
    // 計算動畫參數
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用緩動函數
        const easeProgress = easeOutCubic(progress);
        const currentValue = startValue + (target - startValue) * easeProgress;
        
        // 格式化數字
        const formattedValue = formatCounterValue(currentValue, decimals);
        element.textContent = prefix + formattedValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // 確保最終值正確
            element.textContent = prefix + formatCounterValue(target, decimals) + suffix;
            
            // 觸發完成事件
            element.dispatchEvent(new CustomEvent('counter:complete', {
                bubbles: true,
                detail: { finalValue: target }
            }));
        }
    }
    
    // 添加計數中的類別
    element.classList.add('counting');
    
    // 開始動畫
    requestAnimationFrame(updateCounter);
}

/**
 * 格式化計數器數值
 * @param {number} value - 數值
 * @param {number} decimals - 小數位數
 * @returns {string} 格式化後的字串
 */
function formatCounterValue(value, decimals) {
    if (decimals > 0) {
        return value.toFixed(decimals);
    }
    return Math.floor(value).toLocaleString();
}

/**
 * 緩動函數：ease-out-cubic
 * @param {number} t - 時間進度 (0-1)
 * @returns {number} 緩動後的進度
 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * 觸發初始動畫（頁面載入時）
 * @param {number} delay - 延遲時間
 */
export function triggerInitialAnimations(delay = 300) {
    setTimeout(() => {
        // 觸發頁面頂部區域的動畫
        const headerElements = safeQuerySelectorAll('.page-header .fade-in, .hero-section .fade-in');
        
        headerElements.forEach((element, index) => {
            setTimeout(() => {
                triggerElementAnimation(element);
            }, index * ANIMATION_CONFIG.delay);
        });
        
        // 觸發其他優先動畫
        const priorityElements = safeQuerySelectorAll('[data-animation-priority="high"]');
        priorityElements.forEach((element, index) => {
            setTimeout(() => {
                triggerElementAnimation(element);
            }, (index * ANIMATION_CONFIG.delay) + 100);
        });
        
        console.log('初始動畫已觸發');
    }, delay);
}

/**
 * 添加動畫到元素
 * @param {Element|string} target - 目標元素或選擇器
 * @param {string} animationType - 動畫類型
 * @param {Object} options - 動畫選項
 */
export function addAnimation(target, animationType, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const {
        delay = 0,
        duration = '0.6s',
        easing = 'ease'
    } = options;
    
    // 設定 CSS 動畫屬性
    element.style.transition = `all ${duration} ${easing}`;
    if (delay > 0) {
        element.style.transitionDelay = `${delay}ms`;
    }
    
    // 添加動畫類別
    element.classList.add(animationType);
    
    // 如果元素已在視窗中，立即觸發動畫
    if (isElementInViewport(element)) {
        setTimeout(() => {
            triggerElementAnimation(element);
        }, delay);
    } else if (observer) {
        // 否則加入觀察列表
        observer.observe(element);
    }
}

/**
 * 檢查元素是否在視窗中
 * @param {Element} element - 目標元素
 * @returns {boolean} 是否在視窗中
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * 移除元素動畫
 * @param {Element|string} target - 目標元素或選擇器
 */
export function removeAnimation(target) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    // 移除所有動畫類別
    Object.values(ANIMATION_SELECTORS).forEach(selector => {
        const className = selector.replace('.', '');
        element.classList.remove(className);
    });
    
    element.classList.remove('visible');
    
    // 停止觀察
    if (observer) {
        observer.unobserve(element);
    }
}

/**
 * 暫停所有動畫（性能優化或減少動畫模式）
 */
export function pauseAnimations() {
    if (observer) {
        observer.disconnect();
    }
    
    if (counterObserver) {
        counterObserver.disconnect();
    }
    
    // 為所有動畫元素添加無動畫類別
    const allElements = gatherAnimationElements();
    allElements.forEach(element => {
        element.style.animation = 'none';
        element.style.transition = 'none';
    });
    
    console.log('所有動畫已暫停');
}

/**
 * 恢復動畫
 */
export function resumeAnimations() {
    // 重新設定觀察器
    setupIntersectionObserver();
    setupCounterAnimations();
    
    // 移除無動畫樣式
    const allElements = gatherAnimationElements();
    allElements.forEach(element => {
        element.style.animation = '';
        element.style.transition = '';
    });
    
    console.log('動畫已恢復');
}

/**
 * 支援減少動畫偏好設定
 */
export function handleReducedMotionPreference() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        console.log('使用者偏好減少動畫，使用簡化動畫');
        
        // 簡化動畫設定
        ANIMATION_CONFIG.delay = 0;
        ANIMATION_CONFIG.counterDuration = 100;
        
        // 為所有動畫元素應用即時動畫
        const style = document.createElement('style');
        style.textContent = `
            .fade-in, .slide-in-left, .slide-in-right,
            .slide-in-up, .slide-in-down, .scale-in, .rotate-in {
                transition: none !important;
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // 立即顯示所有元素
        fallbackAnimations();
    }
}

/**
 * 初始化動畫系統（主要入口）
 * @param {Object} options - 初始化選項
 */
export function initAnimations(options = {}) {
    if (isInitialized) {
        console.log('動畫系統已初始化，跳過');
        return;
    }
    
    console.log('開始初始化動畫系統...');
    
    try {
        // 檢查減少動畫偏好
        handleReducedMotionPreference();
        
        // 設定動畫觀察器
        setupIntersectionObserver();
        setupCounterAnimations();
        
        // 監聽動畫偏好變更
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener(handleReducedMotionPreference);
        
        isInitialized = true;
        
        console.log('動畫系統初始化完成');
        
    } catch (error) {
        console.error('動畫系統初始化失敗:', error);
        
        // 使用後備方案
        fallbackAnimations();
    }
}

/**
 * 初始化計數器
 */
export function initializeCounters() {
    setupCounterAnimations();
}

/**
 * 觀察元素
 */
export function observeElements() {
    setupIntersectionObserver();
}

/**
 * 銷毀動畫系統（清理功能）
 */
export function destroyAnimations() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    
    if (counterObserver) {
        counterObserver.disconnect();
        counterObserver = null;
    }
    
    isInitialized = false;
    
    console.log('動畫系統已銷毀');
}

/**
 * 檢查動畫系統是否已初始化
 * @returns {boolean} 是否已初始化
 */
export function isAnimationsInitialized() {
    return isInitialized;
}

/**
 * AnimationManager 類別 - 包裝所有動畫功能
 */
export class AnimationManager {
    constructor(observerOptions = {}) {
        this.config = { ...ANIMATION_CONFIG, observerOptions: { ...ANIMATION_CONFIG.observerOptions, ...observerOptions } };
        this.isInitialized = false;
        
        // 自動初始化
        this.init();
    }
    
    /**
     * 初始化動畫管理器
     */
    init() {
        if (this.isInitialized) {
            console.log('AnimationManager 已初始化');
            return;
        }
        
        try {
            initAnimations(this.config);
            this.isInitialized = true;
            console.log('✅ AnimationManager 類別初始化完成');
        } catch (error) {
            console.error('❌ AnimationManager 初始化失敗:', error);
        }
    }
    
    /**
     * 初始化計數器
     */
    initializeCounters() {
        initializeCounters();
    }
    
    /**
     * 觀察元素
     */
    observeElements() {
        observeElements();
    }
    
    /**
     * 觸發初始動畫
     */
    triggerInitial(delay) {
        triggerInitialAnimations(delay);
    }
    
    /**
     * 添加動畫
     */
    addAnimation(target, type, options) {
        addAnimation(target, type, options);
    }
    
    /**
     * 移除動畫
     */
    removeAnimation(target) {
        removeAnimation(target);
    }
    
    /**
     * 暫停動畫
     */
    pause() {
        pauseAnimations();
    }
    
    /**
     * 恢復動畫
     */
    resume() {
        resumeAnimations();
    }
    
    /**
     * 銷毀動畫管理器
     */
    destroy() {
        destroyAnimations();
        this.isInitialized = false;
    }
    
    /**
     * 檢查是否已初始化
     */
    isReady() {
        return this.isInitialized;
    }
}
