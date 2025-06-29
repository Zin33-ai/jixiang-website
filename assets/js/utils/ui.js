/**
 * UI 工具函數模組
 * 提供通用的使用者介面功能和互動效果
 */

import { isSafari } from './safari.js';
import { createElement, safeQuerySelector } from './dom.js';

/**
 * 顯示 Toast 訊息
 * @param {string} message - 要顯示的訊息
 * @param {number} duration - 顯示時間（毫秒）
 * @param {string} type - 訊息類型 ('success', 'error', 'warning', 'info')
 */
export function showToast(message, duration = 2000, type = 'info') {
    // 移除現有的 toast
    const existingToast = safeQuerySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 建立 toast 元素
    const toast = createElement('div', {
        className: `custom-toast toast-${type}`,
        'aria-live': 'polite',
        'aria-atomic': 'true'
    }, message);
    
    // 根據類型設定顏色
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#FF9800',
        info: '#3B82F6'
    };
    
    // Toast 樣式
    Object.assign(toast.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: colors[type] || colors.info,
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        zIndex: '9999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '1rem',
        fontWeight: '500',
        maxWidth: '300px',
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        fontFamily: "'Noto Sans TC', sans-serif"
    });
    
    // Safari 兼容
    if (isSafari()) {
        toast.style.webkitTransform = 'translate(-50%, -50%)';
        toast.style.webkitTransition = 'opacity 0.3s ease';
    }
    
    document.body.appendChild(toast);
    
    // 淡入動畫
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });
    
    // 自動移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * 顯示載入中狀態
 * @param {Element|string} target - 目標元素或選擇器
 * @param {string} message - 載入訊息
 * @returns {Function} 停止載入的函數
 */
export function showLoading(target, message = '載入中...') {
    const element = typeof target === 'string' ? safeQuerySelector(target) : target;
    if (!element) return () => {};
    
    // 保存原始內容
    const originalContent = element.innerHTML;
    const originalStyle = {
        position: element.style.position,
        pointerEvents: element.style.pointerEvents
    };
    
    // 建立載入元素
    const loadingElement = createElement('div', {
        className: 'loading-overlay'
    }, `
        <div class="loading-spinner">
            <i class="bi bi-arrow-clockwise"></i>
        </div>
        <div class="loading-message">${message}</div>
    `);
    
    // 載入樣式
    Object.assign(loadingElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
        borderRadius: 'inherit'
    });
    
    // 調整目標元素樣式
    if (element.style.position === '' || element.style.position === 'static') {
        element.style.position = 'relative';
    }
    element.style.pointerEvents = 'none';
    
    // 添加載入元素
    element.appendChild(loadingElement);
    
    // 載入動畫
    const spinner = loadingElement.querySelector('.loading-spinner i');
    if (spinner) {
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.fontSize = '2rem';
        spinner.style.color = '#3B82F6';
    }
    
    // 返回停止載入的函數
    return function stopLoading() {
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
        
        // 恢復原始樣式
        element.style.position = originalStyle.position;
        element.style.pointerEvents = originalStyle.pointerEvents;
    };
}

/**
 * 建立確認對話框
 * @param {string} message - 確認訊息
 * @param {Object} options - 選項
 * @returns {Promise<boolean>} 使用者選擇結果
 */
export function showConfirm(message, options = {}) {
    const {
        title = '確認',
        confirmText = '確定',
        cancelText = '取消',
        confirmClass = 'btn-primary',
        cancelClass = 'btn-secondary'
    } = options;
    
    return new Promise((resolve) => {
        // 建立遮罩
        const overlay = createElement('div', {
            className: 'confirm-overlay'
        });
        
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '10000'
        });
        
        // 建立對話框
        const dialog = createElement('div', {
            className: 'confirm-dialog'
        }, `
            <div class="confirm-header">
                <h4>${title}</h4>
            </div>
            <div class="confirm-body">
                <p>${message}</p>
            </div>
            <div class="confirm-footer">
                <button class="confirm-cancel ${cancelClass}">${cancelText}</button>
                <button class="confirm-ok ${confirmClass}">${confirmText}</button>
            </div>
        `);
        
        Object.assign(dialog.style, {
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center'
        });
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 按鈕事件
        const cancelBtn = dialog.querySelector('.confirm-cancel');
        const okBtn = dialog.querySelector('.confirm-ok');
        
        function cleanup() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }
        
        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        okBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        // ESC 鍵關閉
        function handleEsc(e) {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
                document.removeEventListener('keydown', handleEsc);
            }
        }
        
        document.addEventListener('keydown', handleEsc);
        
        // 點擊遮罩關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        });
    });
}

/**
 * 平滑滾動到指定元素
 * @param {Element|string} target - 目標元素或選擇器
 * @param {Object} options - 滾動選項
 */
export function scrollToElement(target, options = {}) {
    const element = typeof target === 'string' ? safeQuerySelector(target) : target;
    if (!element) return;
    
    const {
        offset = 80,
        behavior = 'smooth',
        duration = 800
    } = options;
    
    const targetTop = element.offsetTop - offset;
    
    // 現代瀏覽器使用原生滾動
    if ('scrollBehavior' in document.documentElement.style && behavior === 'smooth') {
        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    } else {
        // 自定義平滑滾動（Safari 舊版後備）
        smoothScrollTo(targetTop, duration);
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

/**
 * 回到頂部
 * @param {Object} options - 選項
 */
export function scrollToTop(options = {}) {
    const { behavior = 'smooth', duration = 600 } = options;
    
    if ('scrollBehavior' in document.documentElement.style && behavior === 'smooth') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        smoothScrollTo(0, duration);
    }
}

/**
 * 建立工具提示
 * @param {Element} element - 目標元素
 * @param {string} text - 提示文字
 * @param {string} position - 位置 ('top', 'bottom', 'left', 'right')
 */
export function createTooltip(element, text, position = 'top') {
    if (!element) return;
    
    let tooltip = null;
    
    function showTooltip() {
        // 移除現有提示
        if (tooltip) {
            tooltip.remove();
        }
        
        tooltip = createElement('div', {
            className: `tooltip tooltip-${position}`
        }, text);
        
        Object.assign(tooltip.style, {
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.2s ease'
        });
        
        document.body.appendChild(tooltip);
        
        // 計算位置
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
        }
        
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
        
        // 顯示動畫
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
    }
    
    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip && tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
                tooltip = null;
            }, 200);
        }
    }
    
    // 綁定事件
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);
    
    // 返回清理函數
    return function cleanup() {
        element.removeEventListener('mouseenter', showTooltip);
        element.removeEventListener('mouseleave', hideTooltip);
        element.removeEventListener('focus', showTooltip);
        element.removeEventListener('blur', hideTooltip);
        hideTooltip();
    };
}

/**
 * 複製文字到剪貼簿
 * @param {string} text - 要複製的文字
 * @returns {Promise<boolean>} 是否成功複製
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            return fallbackCopyTextToClipboard(text);
        }
    } catch (error) {
        console.error('複製失敗:', error);
        return fallbackCopyTextToClipboard(text);
    }
}

/**
 * 後備複製方法
 * @param {string} text - 要複製的文字
 * @returns {boolean} 是否成功複製
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 避免滾動到頁面底部
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('後備複製方法失敗:', err);
        document.body.removeChild(textArea);
        return false;
    }
}

/**
 * 節流函數
 * @param {Function} func - 要節流的函數
 * @param {number} limit - 節流間隔（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 防抖函數
 * @param {Function} func - 要防抖的函數
 * @param {number} wait - 等待時間（毫秒）
 * @param {boolean} immediate - 是否立即執行
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}
