/**
 * 浮動按鈕功能模組
 * 處理回到頂部按鈕的顯示和行為
 */

import { isSafari } from '../utils/safari.js';
import { smoothScrollTo, easeInOutCubic } from './scroll.js';

export class FloatingButton {
    constructor() {
        this.button = null;
        this.ticking = false;
        this.init();
    }

    init() {
        this.createButton();
        this.setupEventListeners();
    }

    createButton() {
        // 檢查是否已有浮動按鈕
        this.button = document.querySelector('.floating-btn');

        if (!this.button) {
            // 動態建立浮動按鈕
            this.button = document.createElement('div');
            this.button.className = 'floating-btn';
            this.button.title = '回到最上層';
            this.button.innerHTML = '<i class="bi bi-arrow-up-circle-fill"></i>';
            
            // 添加到頁面
            document.body.appendChild(this.button);
        }
    }

    setupEventListeners() {
        // 滾動事件
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
        
        // 點擊事件
        this.button.addEventListener('click', this.onClick.bind(this));
    }

    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateVisibility.bind(this));
            this.ticking = true;
        }
    }

    updateVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 200) {
            this.button.style.opacity = '1';
            this.button.style.transform = 'scale(1)';
            if (isSafari) {
                this.button.style.webkitTransform = 'scale(1)';
            }
        } else {
            this.button.style.opacity = '0.7';
            this.button.style.transform = 'scale(0.9)';
            if (isSafari) {
                this.button.style.webkitTransform = 'scale(0.9)';
            }
        }
        
        this.ticking = false;
    }

    onClick() {
        // 點擊效果動畫
        this.button.style.transform = 'scale(0.9)';
        if (isSafari) {
            this.button.style.webkitTransform = 'scale(0.9)';
        }
        
        setTimeout(() => {
            this.button.style.transform = 'scale(1)';
            if (isSafari) {
                this.button.style.webkitTransform = 'scale(1)';
            }
        }, 150);

        // 滾動到頂部
        this.scrollToTop();
    }

    scrollToTop() {
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Safari 舊版後備方案
            smoothScrollTo(0, 600);
        }
    }
}

// 導出全域函數供其他地方使用
export function scrollToTop() {
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        smoothScrollTo(0, 600);
    }
}
