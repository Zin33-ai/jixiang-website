/**
 * 吉翔不動產有限公司 - 主要 JavaScript 檔案
 * Safari 兼容優化版本
 */

(function() {
    'use strict';
    
    // Safari 兼容性檢查
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // ==========================================================================
    // 全域變數與設定
    // ==========================================================================
    
    const config = {
        observerOptions: {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        },
        animationDelay: 200,
        counterDuration: 2000
    };
    
    // ==========================================================================
    // 核心功能：頁面載入與初始化
    // ==========================================================================
    
    function initializeApp() {
        // 等待 DOM 完全載入
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runInitialization);
        } else {
            runInitialization();
        }
    }
    
    function runInitialization() {
        try {
            setupIntersectionObserver();
            setupNavbarEffects();
            setupFloatingButton();
            setupSmoothScrolling();
            initializePageSpecificFeatures();
            setupPhoneTracking();
            setupLineTracking();
            setupResponsiveHandling();
            
            // 延遲執行初始動畫
            setTimeout(triggerInitialAnimations, 300);
            
            console.log('吉翔不動產網站初始化完成');
        } catch (error) {
            console.error('初始化過程中發生錯誤:', error);
        }
    }
    
    // ==========================================================================
    // 滾動動畫觀察器
    // ==========================================================================
    
    function setupIntersectionObserver() {
        // 檢查瀏覽器支援
        if (!window.IntersectionObserver) {
            // 舊版瀏覽器後備方案
            document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }
        
        const observer = new IntersectionObserver(handleIntersection, config.observerOptions);
        
        // 觀察所有需要動畫的元素
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    }
    
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }
    
    // ==========================================================================
    // 導航欄效果
    // ==========================================================================
    
    function setupNavbarEffects() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let ticking = false;
        
        function updateNavbar() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            }
            
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    
    // ==========================================================================
    // 浮動按鈕功能
    // ==========================================================================
    
    function setupFloatingButton() {
        const floatingBtn = document.querySelector('.floating-btn');
        if (!floatingBtn) return;
        
        let ticking = false;
        
        function updateFloatingButton() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 200) {
                floatingBtn.style.opacity = '1';
                floatingBtn.style.transform = 'scale(1)';
                if (isSafari) {
                    floatingBtn.style.webkitTransform = 'scale(1)';
                }
            } else {
                floatingBtn.style.opacity = '0.7';
                floatingBtn.style.transform = 'scale(0.9)';
                if (isSafari) {
                    floatingBtn.style.webkitTransform = 'scale(0.9)';
                }
            }
            
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateFloatingButton);
                ticking = true;
            }
        }
        
        // 滾動事件
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // 點擊效果
        floatingBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.9)';
            if (isSafari) {
                this.style.webkitTransform = 'scale(0.9)';
            }
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                if (isSafari) {
                    this.style.webkitTransform = 'scale(1)';
                }
            }, 150);
        });
    }
    
    // ==========================================================================
    // 回到頂部功能
    // ==========================================================================
    
    window.scrollToTop = function() {
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Safari 舊版後備方案
            smoothScrollTo(0, 600);
        }
    };
    
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
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    // ==========================================================================
    // 平滑滾動功能
    // ==========================================================================
    
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
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
            });
        });
    }
    
    // ==========================================================================
    // 數字計數動畫
    // ==========================================================================
    
    function initializeCounters() {
        const counters = document.querySelectorAll('.counter[data-count]');
        
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = config.counterDuration;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
    
    // ==========================================================================
    // 初始動畫觸發
    // ==========================================================================
    
    function triggerInitialAnimations() {
        // 頁面頂部區域的動畫
        const headerElements = document.querySelectorAll('.page-header .fade-in, .hero-section .fade-in');
        headerElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * config.animationDelay);
        });
        
        // 初始化計數器
        if (document.querySelector('.counter[data-count]')) {
            initializeCounters();
        }
    }
    
    // ==========================================================================
    // 頁面特定功能初始化
    // ==========================================================================
    
    function initializePageSpecificFeatures() {
        const currentPage = getCurrentPage();
        
        switch (currentPage) {
            case 'news':
                initializeNewsFeatures();
                break;
            case 'contact':
                initializeContactFeatures();
                break;
            case 'services':
                initializeServicesFeatures();
                break;
            case 'about':
                initializeAboutFeatures();
                break;
            default:
                initializeHomeFeatures();
        }
    }
    
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('news')) return 'news';
        if (path.includes('contact')) return 'contact';
        if (path.includes('services')) return 'services';
        if (path.includes('about')) return 'about';
        return 'home';
    }
    
    // ==========================================================================
    // 首頁特定功能
    // ==========================================================================
    
    function initializeHomeFeatures() {
        // 首頁特有功能可在此添加
        console.log('首頁功能已初始化');
    }
    
    // ==========================================================================
    // 新聞頁面功能
    // ==========================================================================
    
    function initializeNewsFeatures() {
        setupCategoryFiltering();
        setupSearchFunctionality();
        setupNewsFiltering();
        setupSocialSharing();
        
        console.log('新聞頁面功能已初始化');
    }
    
    function setupCategoryFiltering() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 更新活動狀態
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                filterNewsByCategory(category);
            });
        });
    }
    
    function filterNewsByCategory(category) {
        const newsItems = document.querySelectorAll('.news-item');
        
        newsItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const shouldShow = category === 'all' || itemCategory === category;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    if (isSafari) {
                        item.style.webkitTransform = 'translateY(0)';
                    }
                }, 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                if (isSafari) {
                    item.style.webkitTransform = 'translateY(20px)';
                }
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
    
    function setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(this.value);
            }, 300);
        });
        
        // 支援鍵盤搜尋
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                handleSearch(this.value);
            }
        });
    }
    
    window.handleSearch = function(query) {
        const newsItems = document.querySelectorAll('.news-item');
        const searchQuery = query.toLowerCase().trim();
        
        newsItems.forEach(item => {
            const title = item.querySelector('.news-title')?.textContent.toLowerCase() || '';
            const excerpt = item.querySelector('.news-excerpt')?.textContent.toLowerCase() || '';
            
            const matches = searchQuery === '' || 
                           title.includes(searchQuery) || 
                           excerpt.includes(searchQuery);
            
            item.style.display = matches ? 'block' : 'none';
        });
    };
    
    function setupNewsFiltering() {
        // 日期篩選
        window.handleDateFilter = function(period) {
            const newsItems = document.querySelectorAll('.news-item');
            const now = new Date();
            
            newsItems.forEach(item => {
                const itemDateStr = item.getAttribute('data-date');
                if (!itemDateStr) return;
                
                const itemDate = new Date(itemDateStr);
                let shouldShow = true;
                
                switch (period) {
                    case 'month':
                        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        shouldShow = itemDate >= oneMonthAgo;
                        break;
                    case 'quarter':
                        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        shouldShow = itemDate >= threeMonthsAgo;
                        break;
                    case 'year':
                        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                        shouldShow = itemDate >= oneYearAgo;
                        break;
                    default:
                        shouldShow = true;
                }
                
                item.style.display = shouldShow ? 'block' : 'none';
            });
        };
        
        // 排序功能
        window.handleSort = function(sortType) {
            const newsList = document.querySelector('.news-list');
            const newsItems = Array.from(document.querySelectorAll('.news-item'));
            const paginationSection = document.querySelector('.pagination-section');
            
            newsItems.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-date'));
                const dateB = new Date(b.getAttribute('data-date'));
                
                switch (sortType) {
                    case 'date-desc':
                        return dateB - dateA;
                    case 'date-asc':
                        return dateA - dateB;
                    case 'popular':
                        // 暫時使用隨機排序作為示例
                        return Math.random() - 0.5;
                    default:
                        return 0;
                }
            });
            
            // 重新排列 DOM 元素
            newsItems.forEach(item => {
                newsList.insertBefore(item, paginationSection);
            });
        };
    }
    
    function setupSocialSharing() {
        // Facebook 分享
        window.shareToFacebook = function() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
            openShareWindow(shareUrl);
            trackSocialShare('facebook');
        };
        
        // LINE 分享
        window.shareToLine = function() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}&text=${title}`;
            openShareWindow(shareUrl);
            trackSocialShare('line');
        };
        
        // 複製連結
        window.copyLink = function() {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('連結已複製到剪貼簿');
                }).catch(() => {
                    fallbackCopyTextToClipboard(window.location.href);
                });
            } else {
                fallbackCopyTextToClipboard(window.location.href);
            }
            trackSocialShare('copy');
        };
        
        function openShareWindow(url) {
            const width = 600;
            const height = 400;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            
            window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
        }
        
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
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
                document.execCommand('copy');
                showToast('連結已複製到剪貼簿');
            } catch (err) {
                showToast('複製失敗，請手動複製連結');
            }
            
            document.body.removeChild(textArea);
        }
        
        function trackSocialShare(platform) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'social_share', {
                    'event_category': 'social',
                    'event_label': platform
                });
            }
        }
    }
    
    // ==========================================================================
    // 聯絡頁面功能
    // ==========================================================================
    
    function initializeContactFeatures() {
        setupLineAnimations();
        setupMapInteractions();
        
        console.log('聯絡頁面功能已初始化');
    }
    
    function setupLineAnimations() {
        const lineCards = document.querySelectorAll('.line-card.pulse-animation');
        const lineSection = document.querySelector('.line-contact-section');
        
        if (!lineSection || lineCards.length === 0) return;
        
        const lineObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 進入視窗後延遲停止脈衝動畫
                    setTimeout(() => {
                        lineCards.forEach(card => {
                            card.classList.remove('pulse-animation');
                        });
                    }, 3000);
                }
            });
        });
        
        lineObserver.observe(lineSection);
    }
    
    function setupMapInteractions() {
        const mapIframe = document.querySelector('.map-container iframe');
        
        if (mapIframe) {
            mapIframe.addEventListener('load', function() {
                console.log('地圖載入完成');
            });
        }
    }
    
    // ==========================================================================
    // 服務頁面功能
    // ==========================================================================
    
    function initializeServicesFeatures() {
        // 服務頁面特有功能
        console.log('服務頁面功能已初始化');
    }
    
    // ==========================================================================
    // 關於我們頁面功能
    // ==========================================================================
    
    function initializeAboutFeatures() {
        // 關於我們頁面特有功能
        console.log('關於我們頁面功能已初始化');
    }
    
    // ==========================================================================
    // 電話點擊追蹤
    // ==========================================================================
    
    function setupPhoneTracking() {
        function trackPhoneClick() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'phone_click', {
                    'event_category': 'contact',
                    'event_label': '02-2998-9596'
                });
            }
        }
        
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', trackPhoneClick);
        });
    }
    
    // ==========================================================================
    // LINE 點擊追蹤
    // ==========================================================================
    
    function setupLineTracking() {
        function trackLineClick(type) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'line_click', {
                    'event_category': 'contact',
                    'event_label': type
                });
            }
        }
        
        document.querySelectorAll('a[href*="lin.ee"]').forEach(link => {
            link.addEventListener('click', function() {
                const isLandlord = this.href.includes('elZYPEn');
                trackLineClick(isLandlord ? 'landlord' : 'tenant');
            });
        });
        
        // Facebook 點擊追蹤
        document.querySelectorAll('a[href*="facebook.com"]').forEach(link => {
            link.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'facebook_click', {
                        'event_category': 'social',
                        'event_label': 'facebook_page'
                    });
                }
            });
        });
        
        // 小版 LINE 按鈕追蹤
        document.querySelectorAll('.line-btn-small').forEach(btn => {
            btn.addEventListener('click', function() {
                const isLandlord = this.href.includes('elZYPEn');
                trackLineClick(isLandlord ? 'landlord_small' : 'tenant_small');
            });
        });
    }
    
    // ==========================================================================
    // 響應式處理
    // ==========================================================================
    
    function setupResponsiveHandling() {
        let resizeTimeout;
        
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const isMobile = window.innerWidth < 768;
                const isTablet = window.innerWidth < 992;
                
                handleMobileOptimizations(isMobile);
                handleTabletOptimizations(isTablet);
                handleMapResize(isMobile);
                
            }, 250);
        }
        
        window.addEventListener('resize', handleResize);
        
        // 初始執行
        handleResize();
    }
    
    function handleMobileOptimizations(isMobile) {
        const heroTitle = document.querySelector('.hero-title');
        const pageTitle = document.querySelector('.page-title');
        
        if (heroTitle) {
            heroTitle.style.fontSize = isMobile ? '2.5rem' : '3.5rem';
        }
        
        if (pageTitle) {
            pageTitle.style.fontSize = isMobile ? '2.5rem' : '3rem';
        }
        
        // 新聞頁面 footer 調整
        if (isMobile) {
            document.querySelectorAll('.news-footer').forEach(footer => {
                footer.style.flexDirection = 'column';
                footer.style.alignItems = 'flex-start';
                footer.style.gap = '1rem';
            });
        } else {
            document.querySelectorAll('.news-footer').forEach(footer => {
                footer.style.flexDirection = 'row';
                footer.style.alignItems = 'center';
                footer.style.justifyContent = 'space-between';
                footer.style.gap = '0';
            });
        }
    }
    
    function handleTabletOptimizations(isTablet) {
        // 平板優化邏輯
    }
    
    function handleMapResize(isMobile) {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.height = isMobile ? '300px' : '450px';
        }
    }
    
    // ==========================================================================
    // 工具函數
    // ==========================================================================
    
    function showToast(message, duration = 2000) {
        // 檢查是否已有 toast
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.textContent = message;
        
        // Toast 樣式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--primary-blue, #1E3A8A)',
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
            transition: 'opacity 0.3s ease'
        });
        
        // Safari 兼容
        if (isSafari) {
            toast.style.webkitTransform = 'translate(-50%, -50%)';
            toast.style.webkitTransition = 'opacity 0.3s ease';
        }
        
        document.body.appendChild(toast);
        
        // 淡入
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
    
    function debounce(func, wait, immediate) {
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
    
    function throttle(func, limit) {
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
    
    // ==========================================================================
    // 性能監控
    // ==========================================================================
    
    function setupPerformanceMonitoring() {
        // 頁面載入時間監控
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (performance && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log(`頁面載入時間: ${loadTime}ms`);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'page_load_time', {
                            'event_category': 'performance',
                            'value': Math.round(loadTime)
                        });
                    }
                }
            }, 0);
        });
        
        // 錯誤監控
        window.addEventListener('error', function(e) {
            console.error('JavaScript 錯誤:', e.error);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'js_error', {
                    'event_category': 'error',
                    'event_label': e.message,
                    'value': 1
                });
            }
        });
        
        // Promise 錯誤監控
        window.addEventListener('unhandledrejection', function(e) {
            console.error('未處理的 Promise 錯誤:', e.reason);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'promise_error', {
                    'event_category': 'error',
                    'event_label': e.reason?.toString() || 'Unknown promise error',
                    'value': 1
                });
            }
        });
    }
    
    // ==========================================================================
    // Safari 特殊處理
    // ==========================================================================
    
    function applySafariSpecificFixes() {
        if (!isSafari) return;
        
        // Safari 中的 backdrop-filter 後備處理
        const elementsWithBackdrop = document.querySelectorAll('.navbar, .map-overlay, .hours-item');
        elementsWithBackdrop.forEach(el => {
            if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
                el.style.background = 'rgba(255, 255, 255, 0.98)';
            }
        });
        
        // Safari 中的 CSS Grid 後備處理
        const gridElements = document.querySelectorAll('.hours-grid, .benefits-grid');
        gridElements.forEach(el => {
            if (!CSS.supports('display', 'grid')) {
                el.style.display = 'flex';
                el.style.flexWrap = 'wrap';
            }
        });
        
        // Safari 滾動性能優化
        document.body.style.webkitOverflowScrolling = 'touch';
        
        console.log('Safari 特殊修復已應用');
    }
    
    // ==========================================================================
    // 輔助功能支援
    // ==========================================================================
    
    function setupAccessibilityFeatures() {
        // 鍵盤導航支援
        document.addEventListener('keydown', function(e) {
            // ESC 鍵關閉任何彈出內容
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.show, .dropdown.show');
                activeModals.forEach(modal => {
                    // 觸發關閉事件或移除 show 類別
                    modal.classList.remove('show');
                });
            }
            
            // Tab 鍵焦點管理
            if (e.key === 'Tab') {
                // 確保焦點在可見元素上
                const focusableElements = document.querySelectorAll(
                    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
                );
                
                // 可以在此處添加更多的焦點管理邏輯
            }
        });
        
        // 為動態內容添加適當的 ARIA 標籤
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach((item, index) => {
            if (!item.getAttribute('role')) {
                item.setAttribute('role', 'article');
            }
            if (!item.getAttribute('aria-label')) {
                const title = item.querySelector('.news-title')?.textContent;
                if (title) {
                    item.setAttribute('aria-label', `新聞文章: ${title}`);
                }
            }
        });
        
        // 為分享按鈕添加更好的標籤
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            const platform = btn.classList.contains('facebook') ? 'Facebook' : 
                            btn.classList.contains('line') ? 'LINE' : '複製連結';
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', `分享到 ${platform}`);
            }
        });
    }
    
    // ==========================================================================
    // 應用初始化
    // ==========================================================================
    
    // 立即執行初始化
    initializeApp();
    
    // 設定性能監控
    setupPerformanceMonitoring();
    
    // 應用 Safari 特殊修復
    applySafariSpecificFixes();
    
    // 設定輔助功能
    setupAccessibilityFeatures();
    
    // 對外公開的 API
    window.JixiangApp = {
        showToast: showToast,
        scrollToTop: window.scrollToTop,
        handleSearch: window.handleSearch,
        shareToFacebook: window.shareToFacebook,
        shareToLine: window.shareToLine,
        copyLink: window.copyLink,
        version: '1.0.0'
    };
    
    console.log('吉翔不動產網站腳本載入完成', {
        isSafari: isSafari,
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
    
})();
