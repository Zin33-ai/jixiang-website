/**
 * 導航欄模組
 * 處理導航欄的建立、滾動效果和響應式行為
 */

import { getCurrentPage } from '../../utils/dom.js';
import { throttle } from '../../utils/ui.js';
import { isSafari } from '../../utils/safari.js';

// 導航欄設定
const NAVBAR_CONFIG = {
    scrollThreshold: 100,
    transitionDuration: '0.3s',
    phoneNumber: '02-2998-9596'
};

// 導航選單項目
const NAV_ITEMS = [
    { href: 'about.html', text: '關於我們', page: 'about' },
    { href: 'services.html', text: '服務項目', page: 'services' },
    { href: 'news.html', text: '最新消息', page: 'news' },
    { href: 'contact.html', text: '聯絡我們', page: 'contact' }
];

let navbar = null;
let isInitialized = false;

/**
 * 建立導航欄
 * @returns {Element} 建立的導航欄元素
 */
export function createNavbar() {
    // 檢查是否已存在導航欄
    if (document.querySelector('.navbar')) {
        console.log('導航欄已存在，跳過建立');
        return document.querySelector('.navbar');
    }
    
    const currentPage = getCurrentPage();
    
    // 建立導航欄元素
    navbar = document.createElement('nav');
    navbar.className = 'navbar navbar-expand-lg';
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', '主要導航');
    
    navbar.innerHTML = createNavbarHTML(currentPage);
    
    // 插入到頁面開頭
    document.body.insertBefore(navbar, document.body.firstChild);
    
    console.log('導航欄已建立');
    return navbar;
}

/**
 * 建立導航欄 HTML 結構
 * @param {string} currentPage - 當前頁面名稱
 * @returns {string} HTML 字串
 */
function createNavbarHTML(currentPage) {
    const navItemsHTML = NAV_ITEMS.map(item => `
        <li class="nav-item">
            <a class="nav-link ${currentPage === item.page ? 'active' : ''}" 
               href="${item.href}"
               ${currentPage === item.page ? 'aria-current="page"' : ''}>
                ${item.text}
            </a>
        </li>
    `).join('');
    
    // 檢測手機 Safari，決定是否使用 Bootstrap 屬性
    const isMobileSafari = /iPhone|iPad/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    
    const togglerAttributes = isMobileSafari ? `
        type="button"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="切換導航選單"
    ` : `
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav" 
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="切換導航選單"
    `;
    
    return `
        <div class="container">
            <a class="navbar-brand" href="index.html" aria-label="回到首頁">
                <i class="bi bi-house-heart-fill me-2" aria-hidden="true"></i>
                吉翔不動產有限公司
            </a>
            
            <button class="navbar-toggler" ${togglerAttributes}>
                <span class="custom-toggler-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto" role="menubar">
                    ${navItemsHTML}
                </ul>
                
                <a href="tel:${NAVBAR_CONFIG.phoneNumber}" 
                   class="navbar-phone"
                   aria-label="撥打電話 ${NAVBAR_CONFIG.phoneNumber}">
                    <i class="bi bi-telephone-fill me-1" aria-hidden="true"></i>
                    ${NAVBAR_CONFIG.phoneNumber}
                </a>
            </div>
        </div>
    `;
}

/**
 * 設定導航欄滾動效果
 */
export function setupNavbarScrollEffects() {
    if (!navbar) {
        navbar = document.querySelector('.navbar');
    }
    
    if (!navbar) {
        console.warn('找不到導航欄，無法設定滾動效果');
        return;
    }
    
    // 節流處理滾動事件
    const throttledScrollHandler = throttle(updateNavbarOnScroll, 16); // 60fps
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    // 初始狀態
    updateNavbarOnScroll();
    
    console.log('導航欄滾動效果已設定');
}

/**
 * 更新導航欄在滾動時的樣式
 */
function updateNavbarOnScroll() {
    if (!navbar) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isScrolled = scrollTop > NAVBAR_CONFIG.scrollThreshold;
    
    if (isScrolled) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        navbar.classList.add('scrolled');
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        navbar.classList.remove('scrolled');
    }
}

/**
 * 設定導航欄互動事件
 */
export function setupNavbarInteractions() {
    if (!navbar) {
        navbar = document.querySelector('.navbar');
    }
    
    if (!navbar) {
        console.warn('找不到導航欄，無法設定互動事件');
        return;
    }
    
    // 漢堡選單點擊效果
    setupToggleAnimation();
    
    // 導航連結點擊處理
    setupNavLinkHandlers();
    
    // 電話號碼點擊追蹤
    setupPhoneTracking();
    
    // 鍵盤導航支援
    setupKeyboardNavigation();
    
    console.log('導航欄互動事件已設定');
}

/**
 * 設定漢堡選單動畫（手機 Safari 優化版）
 */
function setupToggleAnimation() {
    const toggler = navbar.querySelector('.navbar-toggler');
    const collapse = navbar.querySelector('.navbar-collapse');
    
    if (!toggler || !collapse) return;
    
    // 檢查是否為手機 Safari
    const isMobileSafari = /iPhone|iPad/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    
    if (isMobileSafari) {
        // 手機 Safari 專用處理 - 不依賴 Bootstrap
        setupMobileSafariToggle(toggler, collapse);
    } else {
        // 其他瀏覽器使用 Bootstrap
        setupBootstrapToggle(toggler, collapse);
    }
}

/**
 * 手機 Safari 專用選單切換（修復版）
 */
function setupMobileSafariToggle(toggler, collapse) {
    let isOpen = false;
    let isAnimating = false;
    
    // 強制重置選單狀態
    function resetMenu() {
        isOpen = false;
        isAnimating = false;
        collapse.style.display = 'none';
        collapse.style.opacity = '';
        collapse.style.transform = '';
        collapse.style.transition = '';
        collapse.classList.remove('show');
        toggler.setAttribute('aria-expanded', 'false');
        toggler.classList.add('collapsed');
        
        console.log('選單狀態已重置');
    }
    
    // 初始狀態
    resetMenu();
    
    // 切換功能（防止重複觸發）
    function toggleMenu() {
        if (isAnimating) {
            console.log('動畫進行中，跳過切換');
            return;
        }
        
        isAnimating = true;
        isOpen = !isOpen;
        
        console.log('切換選單:', isOpen ? '開啟' : '關閉');
        
        if (isOpen) {
            // 開啟選單
            collapse.style.display = 'block';
            collapse.classList.add('show');
            toggler.setAttribute('aria-expanded', 'true');
            toggler.classList.remove('collapsed');
            
            // 添加動畫
            collapse.style.opacity = '0';
            collapse.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
                collapse.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                collapse.style.opacity = '1';
                collapse.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    isAnimating = false;
                    console.log('開啟動畫完成');
                }, 350);
            });
            
        } else {
            // 關閉選單
            collapse.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            collapse.style.opacity = '0';
            collapse.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                collapse.style.display = 'none';
                collapse.classList.remove('show');
                toggler.setAttribute('aria-expanded', 'false');
                toggler.classList.add('collapsed');
                isAnimating = false;
                console.log('關閉動畫完成');
            }, 350);
        }
    }
    
    // 移除現有的事件監聽器並重新綁定
    const newToggler = toggler.cloneNode(true);
    toggler.parentNode.replaceChild(newToggler, toggler);
    
    // 綁定點擊事件
    newToggler.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('漢堡按鈕被點擊');
        toggleMenu();
    });
    
    // 添加長按重置功能（Safari 救援）
    let pressTimer = null;
    newToggler.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            console.log('長按檢測到，重置選單狀態');
            resetMenu();
        }, 2000);
    });
    
    newToggler.addEventListener('touchend', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });
    
    // 點擊選單項目後關閉
    const navLinks = collapse.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('選單項目被點擊');
            if (isOpen && !isAnimating) {
                setTimeout(() => toggleMenu(), 100);
            }
        });
    });
    
    // 點擊外部關閉選單
    document.addEventListener('click', (e) => {
        if (isOpen && !navbar.contains(e.target) && !isAnimating) {
            console.log('點擊外部，關閉選單');
            toggleMenu();
        }
    });
    
    // 視窗調整大小時重置選單
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            console.log('視窗變大，重置選單');
            resetMenu();
        }
    });
    
    // 全域重置函數（調試用）
    window.resetNavbarMenu = resetMenu;
    
    // 全域切換函數（調試用）
    window.toggleNavbarMenu = toggleMenu;
    
    console.log('手機 Safari 選單切換已設定（修復版）');
    console.log('調試功能: window.resetNavbarMenu() 和 window.toggleNavbarMenu()');
}

/**
 * Bootstrap 選單切換（非手機 Safari）
 */
function setupBootstrapToggle(toggler, collapse) {
    // 確保 Bootstrap 可用
    if (typeof bootstrap === 'undefined') {
        console.warn('Bootstrap 未載入，使用簡化選單');
        setupMobileSafariToggle(toggler, collapse);
        return;
    }
    
    // Bootstrap 收合事件監聽
    collapse.addEventListener('show.bs.collapse', () => {
        toggler.setAttribute('aria-expanded', 'true');
        toggler.classList.remove('collapsed');
    });
    
    collapse.addEventListener('hide.bs.collapse', () => {
        toggler.setAttribute('aria-expanded', 'false');
        toggler.classList.add('collapsed');
    });
    
    // 點擊外部關閉選單
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && collapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
            bsCollapse.hide();
        }
    });
    
    console.log('Bootstrap 選單切換已設定');
}

/**
 * 設定導航連結處理
 */
function setupNavLinkHandlers() {
    const navLinks = navbar.querySelectorAll('.nav-link');
    const isMobileSafari = /iPhone|iPad/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // 追蹤導航點擊
            trackNavigation(link.textContent, link.getAttribute('href'));
            
            // 手機版自動收合選單
            if (window.innerWidth < 992) {
                const collapse = navbar.querySelector('.navbar-collapse');
                if (collapse && collapse.classList.contains('show')) {
                    
                    if (isMobileSafari) {
                        // 手機 Safari：使用全域切換函數
                        if (typeof window.toggleNavbarMenu === 'function') {
                            setTimeout(() => window.toggleNavbarMenu(), 150);
                        }
                    } else if (typeof bootstrap !== 'undefined') {
                        // 其他瀏覽器：使用 Bootstrap
                        const bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
                        bsCollapse.hide();
                    }
                }
            }
        });
        
        // 增強無障礙性
        link.addEventListener('focus', () => {
            link.style.outline = '2px solid #FF9800';
            link.style.outlineOffset = '2px';
        });
        
        link.addEventListener('blur', () => {
            link.style.outline = '';
            link.style.outlineOffset = '';
        });
    });
}

/**
 * 設定電話號碼點擊追蹤
 */
function setupPhoneTracking() {
    const phoneLink = navbar.querySelector('.navbar-phone');
    
    if (phoneLink) {
        phoneLink.addEventListener('click', () => {
            // Google Analytics 追蹤
            if (typeof gtag !== 'undefined') {
                gtag('event', 'phone_click', {
                    'event_category': 'contact',
                    'event_label': NAVBAR_CONFIG.phoneNumber,
                    'event_source': 'navbar'
                });
            }
            
            console.log('電話點擊追蹤:', NAVBAR_CONFIG.phoneNumber);
        });
    }
}

/**
 * 設定鍵盤導航支援
 */
function setupKeyboardNavigation() {
    navbar.addEventListener('keydown', (e) => {
        const focusableElements = navbar.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
                focusableElements[prevIndex].focus();
                break;
                
            case 'Home':
                e.preventDefault();
                focusableElements[0].focus();
                break;
                
            case 'End':
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
                break;
                
            case 'Escape':
                // ESC 鍵關閉選單
                if (typeof window.resetNavbarMenu === 'function') {
                    window.resetNavbarMenu();
                }
                break;
        }
    });
}

/**
 * 追蹤導航點擊
 * @param {string} linkText - 連結文字
 * @param {string} href - 連結地址
 */
function trackNavigation(linkText, href) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'navigation_click', {
            'event_category': 'navigation',
            'event_label': linkText,
            'event_destination': href
        });
    }
    
    console.log('導航追蹤:', { linkText, href });
}

/**
 * 更新導航欄當前頁面狀態
 * @param {string} newPage - 新的頁面名稱
 */
export function updateActiveNavItem(newPage) {
    if (!navbar) return;
    
    const navLinks = navbar.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = NAV_ITEMS.some(item => 
            item.page === newPage && item.href === href
        );
        
        if (isActive) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * 設定導航欄響應式行為
 */
export function setupNavbarResponsive() {
    const throttledResizeHandler = throttle(handleNavbarResize, 250);
    
    window.addEventListener('resize', throttledResizeHandler);
    
    // 初始執行
    handleNavbarResize();
    
    console.log('導航欄響應式行為已設定');
}

/**
 * 處理導航欄響應式調整
 */
function handleNavbarResize() {
    if (!navbar) return;
    
    const isMobile = window.innerWidth < 768;
    const phoneLink = navbar.querySelector('.navbar-phone');
    
    if (phoneLink) {
        phoneLink.style.display = isMobile ? 'none' : 'flex';
    }
    
    // 手機版時自動收合展開的選單
    if (!isMobile) {
        const collapse = navbar.querySelector('.navbar-collapse');
        if (collapse && collapse.classList.contains('show')) {
            if (typeof window.resetNavbarMenu === 'function') {
                window.resetNavbarMenu();
            } else if (typeof bootstrap !== 'undefined') {
                const bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
                bsCollapse.hide();
            }
        }
    }
}

/**
 * 初始化導航欄（主要入口）
 * @param {Object} options - 初始化選項
 */
export function initNavbar(options = {}) {
    if (isInitialized) {
        console.log('導航欄已初始化，跳過');
        return navbar;
    }
    
    console.log('開始初始化導航欄...');
    
    try {
        // 建立導航欄
        const navbarElement = createNavbar();
        
        // 設定各種功能
        setupNavbarScrollEffects();
        setupNavbarInteractions();
        setupNavbarResponsive();
        
        isInitialized = true;
        
        console.log('導航欄初始化完成');
        return navbarElement;
        
    } catch (error) {
        console.error('導航欄初始化失敗:', error);
        return null;
    }
}

/**
 * 銷毀導航欄（清理功能）
 */
export function destroyNavbar() {
    if (navbar && navbar.parentNode) {
        navbar.parentNode.removeChild(navbar);
    }
    
    navbar = null;
    isInitialized = false;
    
    console.log('導航欄已銷毀');
}

/**
 * 取得導航欄元素
 * @returns {Element|null} 導航欄元素
 */
export function getNavbar() {
    return navbar || document.querySelector('.navbar');
}

/**
 * 檢查導航欄是否已初始化
 * @returns {boolean} 是否已初始化
 */
export function isNavbarInitialized() {
    return isInitialized;
}

/**
 * Navbar 類別 - 包裝所有導航欄功能
 */
export class Navbar {
    constructor(config = {}) {
        this.config = { ...NAVBAR_CONFIG, ...config };
        this.navbar = null;
        this.isInitialized = false;
        
        // 自動初始化
        this.init();
    }
    
    /**
     * 初始化導航欄
     */
    init() {
        if (this.isInitialized) {
            console.log('Navbar 已初始化');
            return this.navbar;
        }
        
        try {
            this.navbar = initNavbar(this.config);
            this.isInitialized = true;
            console.log('✅ Navbar 類別初始化完成');
            return this.navbar;
        } catch (error) {
            console.error('❌ Navbar 初始化失敗:', error);
            return null;
        }
    }
    
    /**
     * 銷毀導航欄
     */
    destroy() {
        destroyNavbar();
        this.navbar = null;
        this.isInitialized = false;
    }
    
    /**
     * 獲取導航欄元素
     */
    getElement() {
        return getNavbar();
    }
    
    /**
     * 更新當前頁面
     */
    updateActivePage(page) {
        updateActiveNavItem(page);
    }
    
    /**
     * 檢查是否已初始化
     */
    isReady() {
        return this.isInitialized;
    }
}
