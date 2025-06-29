/**
 * DOM 工具函數模組
 * 提供常用的 DOM 操作和頁面資訊功能
 */

/**
 * 獲取當前頁面名稱
 * @returns {string} 頁面名稱 ('index', 'about', 'services', 'news', 'contact')
 */
export function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (page === 'about.html') return 'about';
    if (page === 'services.html') return 'services';
    if (page === 'news.html') return 'news';
    if (page === 'contact.html') return 'contact';
    return 'index';
}

/**
 * 等待 DOM 完全載入
 * @returns {Promise} DOM 載入完成的 Promise
 */
export function waitForDOM() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * 安全的元素選取器（帶錯誤處理）
 * @param {string} selector - CSS 選擇器
 * @param {Element} context - 搜尋上下文，預設為 document
 * @returns {Element|null} 找到的元素或 null
 */
export function safeQuerySelector(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.warn(`無效的選擇器: ${selector}`, error);
        return null;
    }
}

/**
 * 安全的多元素選取器
 * @param {string} selector - CSS 選擇器
 * @param {Element} context - 搜尋上下文，預設為 document
 * @returns {NodeList} 找到的元素列表
 */
export function safeQuerySelectorAll(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.warn(`無效的選擇器: ${selector}`, error);
        return [];
    }
}

/**
 * 檢查元素是否在視窗中可見
 * @param {Element} element - 要檢查的元素
 * @param {number} threshold - 可見度閾值 (0-1)
 * @returns {boolean} 是否可見
 */
export function isElementVisible(element, threshold = 0.1) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const verticalVisible = rect.top < windowHeight && rect.bottom > 0;
    const horizontalVisible = rect.left < windowWidth && rect.right > 0;
    
    if (!verticalVisible || !horizontalVisible) return false;
    
    // 計算可見面積比例
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    
    return (visibleArea / totalArea) >= threshold;
}

/**
 * 建立元素並設定屬性
 * @param {string} tag - HTML 標籤名稱
 * @param {Object} attributes - 屬性物件
 * @param {string|Element} content - 內容（文字或元素）
 * @returns {Element} 建立的元素
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // 設定屬性
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // 設定內容
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * 移除元素的所有事件監聽器（透過 clone）
 * @param {Element} element - 要清理的元素
 * @returns {Element} 清理後的元素
 */
export function removeAllEventListeners(element) {
    if (!element) return null;
    
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
}

/**
 * 取得元素的樣式值
 * @param {Element} element - 目標元素
 * @param {string} property - CSS 屬性名稱
 * @returns {string} 樣式值
 */
export function getComputedStyleValue(element, property) {
    if (!element) return '';
    
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * 檢查元素是否有特定類別
 * @param {Element} element - 目標元素
 * @param {string} className - 類別名稱
 * @returns {boolean} 是否有該類別
 */
export function hasClass(element, className) {
    return element && element.classList && element.classList.contains(className);
}

/**
 * 切換元素的類別
 * @param {Element} element - 目標元素
 * @param {string} className - 類別名稱
 * @param {boolean} force - 強制設定（可選）
 * @returns {boolean} 切換後是否有該類別
 */
export function toggleClass(element, className, force) {
    if (!element || !element.classList) return false;
    
    return element.classList.toggle(className, force);
}

/**
 * 尋找最近的父元素（向上搜尋）
 * @param {Element} element - 起始元素
 * @param {string} selector - 要尋找的選擇器
 * @returns {Element|null} 找到的父元素或 null
 */
export function findParent(element, selector) {
    if (!element) return null;
    
    return element.closest(selector);
}

/**
 * 取得元素在父容器中的索引
 * @param {Element} element - 目標元素
 * @returns {number} 索引值，找不到時返回 -1
 */
export function getElementIndex(element) {
    if (!element || !element.parentNode) return -1;
    
    return Array.from(element.parentNode.children).indexOf(element);
}

/**
 * 檢查是否為觸控裝置
 * @returns {boolean} 是否為觸控裝置
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 取得視窗尺寸資訊
 * @returns {Object} 包含寬度和高度的物件
 */
export function getViewportSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

/**
 * 檢查是否為手機裝置
 * @returns {boolean} 是否為手機
 */
export function isMobile() {
    return getViewportSize().width < 768;
}

/**
 * 檢查是否為平板裝置
 * @returns {boolean} 是否為平板
 */
export function isTablet() {
    const { width } = getViewportSize();
    return width >= 768 && width < 992;
}

/**
 * 檢查是否為桌面裝置
 * @returns {boolean} 是否為桌面
 */
export function isDesktop() {
    return getViewportSize().width >= 992;
}
