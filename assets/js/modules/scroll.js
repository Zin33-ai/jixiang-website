/**
 * 滾動功能模組
 * 處理平滑滾動和相關動畫
 */

export class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleAnchorClick.bind(this));
        });
    }

    handleAnchorClick(e) {
        e.preventDefault();
        
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            const offsetTop = targetElement.offsetTop - navbarHeight - 20;
            
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            } else {
                smoothScrollTo(offsetTop, 800);
            }
        }
    }
}

/**
 * 平滑滾動到指定位置（Safari 後備方案）
 * @param {number} targetY - 目標 Y 位置
 * @param {number} duration - 動畫持續時間
 */
export function smoothScrollTo(targetY, duration) {
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
 * @param {number} t - 進度 (0-1)
 * @returns {number} 緩動後的進度
 */
export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
