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
        
        [cite_start]// 從 news.html.txt 整合過來的熱門新聞點擊事件 [cite: 287]
        document.querySelectorAll('.popular-news-item').forEach(item => {
            item.addEventListener('click', function() {
                [cite_start]console.log('點擊熱門新聞:', this.querySelector('.popular-news-title').textContent); // [cite: 287]
                // 這裡可以加入跳轉到對應新聞的邏輯
            });
        });

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
    
    [cite_start]window.handleSearch = function(query) { // [cite: 260]
        const newsItems = document.querySelectorAll('.news-item');
        const searchQuery = query.toLowerCase().trim(); [cite_start]// [cite: 261]
        
        newsItems.forEach(item => {
            [cite_start]const title = item.querySelector('.news-title')?.textContent.toLowerCase() || ''; // [cite: 261]
            const excerpt = item.querySelector('.news-excerpt')?.textContent.toLowerCase() || ''; [cite_start]// [cite: 261]
            
            const matches = searchQuery === '' || 
                           title.includes(searchQuery) || 
                           excerpt.includes(searchQuery);
            
            item.style.display = matches ? 'block' : 'none'; [cite_start]// [cite: 262]
        });
    };
    
    function setupNewsFiltering() {
        // 日期篩選
        [cite_start]window.handleDateFilter = function(period) { // [cite: 264]
            const newsItems = document.querySelectorAll('.news-item');
            const now = new Date(); [cite_start]// [cite: 264]
            
            newsItems.forEach(item => {
                [cite_start]const itemDateStr = item.getAttribute('data-date'); // [cite: 264]
                if (!itemDateStr) return;
                
                const itemDate = new Date(itemDateStr); [cite_start]// [cite: 264]
                let shouldShow = true;
 
                
                [cite_start]switch (period) { // [cite: 265, 266, 267, 268]
                    [cite_start]case 'month': // [cite: 265]
                        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); [cite_start]// [cite: 265]
                        shouldShow = itemDate >= oneMonthAgo; [cite_start]// [cite: 265]
                        break;
                    [cite_start]case 'quarter': // [cite: 266]
                        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); [cite_start]// [cite: 266]
                        shouldShow = itemDate >= threeMonthsAgo; [cite_start]// [cite: 266]
                        break;
                    [cite_start]case 'year': // [cite: 267]
                        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); [cite_start]// [cite: 267]
                        shouldShow = itemDate >= oneYearAgo; [cite_start]// [cite: 267]
                        break;
                    [cite_start]default: // [cite: 268]
                        shouldShow = true; [cite_start]// [cite: 268]
                }
                
                item.style.display = shouldShow ? 'block' : 'none'; [cite_start]// [cite: 269]
            });
        };
        
        // 排序功能
        [cite_start]window.handleSort = function(sortType) { // [cite: 270]
            const newsList = document.querySelector('.news-list'); [cite_start]// [cite: 270]
            const newsItems = Array.from(document.querySelectorAll('.news-item')); [cite_start]// [cite: 270]
            const paginationSection = document.querySelector('.pagination-section'); [cite_start]// [cite: 273]
            
            [cite_start]newsItems.sort((a, b) => { // [cite: 271]
                const dateA = new Date(a.getAttribute('data-date')); [cite_start]// [cite: 271]
                const dateB = new Date(b.getAttribute('data-date')); [cite_start]// [cite: 271]
                
                [cite_start]switch (sortType) { // [cite: 271]
                    [cite_start]case 'date-desc': // [cite: 271]
                        return dateB - dateA; [cite_start]// [cite: 271]
                    [cite_start]case 'date-asc': // [cite: 271]
                        return dateA - dateB; [cite_start]// [cite: 271]
                    [cite_start]case 'popular': // [cite: 271]
                        // 暫時使用隨機排序作為示例
                        return Math.random() - 0.5; [cite_start]// [cite: 272]
                    [cite_start]default: // [cite: 272]
                        return 0; [cite_start]// [cite: 272]
                }
            });
            // 重新排列 DOM 元素
            [cite_start]newsItems.forEach(item => { // [cite: 274]
                newsList.insertBefore(item, paginationSection); [cite_start]// [cite: 274]
            });
        };
    }
    
    function setupSocialSharing() {
        // Facebook 分享
        [cite_start]window.shareToFacebook = function() { // [cite: 278]
            const url = encodeURIComponent(window.location.href); [cite_start]// [cite: 279]
            const title = encodeURIComponent(document.title); [cite_start]// [cite: 279]
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
            openShareWindow(shareUrl);
            trackSocialShare('facebook');
        };
        // LINE 分享
        [cite_start]window.shareToLine = function() { // [cite: 280]
            const url = encodeURIComponent(window.location.href); [cite_start]// [cite: 280]
            const title = encodeURIComponent(document.title); [cite_start]// [cite: 280]
            const shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}&text=${title}`;
            openShareWindow(shareUrl);
            trackSocialShare('line');
        };
        // 複製連結
        [cite_start]window.copyLink = function() { // [cite: 280]
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('連結已複製到剪貼簿');
                }).catch(() => {
                    fallbackCopyTextToClipboard(window.location.href);
                });
            } else {
                fallbackCopyTextToClipboard(window.location.href); [cite_start]// [cite: 285]
            }
            trackSocialShare('copy');
        };
        function openShareWindow(url) {
            const width = 600; [cite_start]// [cite: 718]
            const height = 400; [cite_start]// [cite: 718]
            const left = (window.innerWidth - width) / 2; [cite_start]// [cite: 718]
            const top = (window.innerHeight - height) / 2; [cite_start]// [cite: 718]
            window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`); [cite_start]// [cite: 719]
        }
        
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement('textarea'); [cite_start]// [cite: 720]
            textArea.value = text; [cite_start]// [cite: 720]
            textArea.style.position = 'fixed'; [cite_start]// [cite: 720]
            textArea.style.top = '0'; [cite_start]// [cite: 720]
            textArea.style.left = '0'; [cite_start]// [cite: 720]
            textArea.style.width = '2em'; [cite_start]// [cite: 720]
            textArea.style.height = '2em'; [cite_start]// [cite: 721]
            textArea.style.padding = '0'; [cite_start]// [cite: 721]
            textArea.style.border = 'none'; [cite_start]// [cite: 721]
            textArea.style.outline = 'none'; [cite_start]// [cite: 721]
            textArea.style.boxShadow = 'none'; [cite_start]// [cite: 721]
            textArea.style.background = 'transparent'; [cite_start]// [cite: 721]
            
            document.body.appendChild(textArea); [cite_start]// [cite: 722]
            textArea.focus(); [cite_start]// [cite: 722]
            textArea.select(); [cite_start]// [cite: 722]
            try {
                document.execCommand('copy'); [cite_start]// [cite: 722]
                showToast('連結已複製到剪貼簿'); [cite_start]// [cite: 723]
            } catch (err) {
                showToast('複製失敗，請手動複製連結'); [cite_start]// [cite: 724]
            }
            
            document.body.removeChild(textArea); [cite_start]// [cite: 725]
        }
        
        [cite_start]function trackSocialShare(platform) { // [cite: 725]
            [cite_start]if (typeof gtag !== 'undefined') { // [cite: 725]
                [cite_start]gtag('event', 'social_share', { // [cite: 726]
                    [cite_start]'event_category': 'social', // [cite: 726]
                    [cite_start]'event_label': platform // [cite: 726]
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
        
        [cite_start]// 新聞頁面 footer 調整 [cite: 288, 289, 290, 291, 292]
        if (isMobile) {
            [cite_start]document.querySelectorAll('.news-footer').forEach(footer => { // [cite: 289]
                footer.style.flexDirection = 'column'; [cite_start]// [cite: 289]
                footer.style.alignItems = 'flex-start'; [cite_start]// [cite: 289]
                footer.style.gap = '1rem'; [cite_start]// [cite: 290]
            });
        } else {
            [cite_start]document.querySelectorAll('.news-footer').forEach(footer => { // [cite: 291]
                footer.style.flexDirection = 'row'; [cite_start]// [cite: 291]
                footer.style.alignItems = 'center'; [cite_start]// [cite: 291]
                footer.style.justifyContent = 'space-between'; [cite_start]// [cite: 292]
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
        
        // Toast 樣式 (已移至 style.css，這裡保留以防萬一或作為動態調整後備)
        Object.assign(toast.style, {
            [cite_start]// 從 news.html.txt 的 copyLink 函數中整合過來的樣式 [cite: 281, 282, 283]
            [cite_start]position: 'fixed', // [cite: 281]
            [cite_start]top: '50%', // [cite: 281]
            [cite_start]left: '50%', // [cite: 281]
            [cite_start]transform: 'translate(-50%, -50%)', // [cite: 281]
            [cite_start]background: 'var(--primary-blue, #1E3A8A)', // [cite: 282]
            [cite_start]color: 'white', // [cite: 282]
            [cite_start]padding: '1rem 2rem', // [cite: 282]
            [cite_start]borderRadius: '8px', // [cite: 282]
            [cite_start]zIndex: '9999', // [cite: 283]
            [cite_start]boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // [cite: 283]
            [cite_start]fontSize: '1rem', // 從 style.css.txt 定義 [cite: 764]
            [cite_start]fontWeight: '500', // 從 style.css.txt 定義 [cite: 765]
            [cite_start]maxWidth: '300px', // 從 style.css.txt 定義 [cite: 765]
            [cite_start]textAlign: 'center', // 從 style.css.txt 定義 [cite: 765]
            [cite_start]opacity: '0', // [cite: 765]
            [cite_start]transition: 'opacity 0.3s ease' // [cite: 765]
        });
        // Safari 兼容
        [cite_start]if (isSafari) { // [cite: 766]
            toast.style.webkitTransform = 'translate(-50%, -50%)'; [cite_start]// [cite: 766]
            toast.style.webkitTransition = 'opacity 0.3s ease'; [cite_start]// [cite: 767]
        }
        
        document.body.appendChild(toast); [cite_start]// [cite: 768]
        // 淡入
        [cite_start]requestAnimationFrame(() => { // [cite: 768]
            toast.style.opacity = '1'; [cite_start]// [cite: 768]
        });
        // 自動移除
        [cite_start]setTimeout(() => { // [cite: 769]
            toast.style.opacity = '0'; [cite_start]// [cite: 769]
            [cite_start]setTimeout(() => { // [cite: 769]
                [cite_start]if (toast.parentNode) { // [cite: 769]
                    toast.parentNode.removeChild(toast); [cite_start]// [cite: 770]
                }
            }, 300); [cite_start]// [cite: 770]
        }, duration); [cite_start]// [cite: 771]
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
                    [cite_start]const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart; // [cite: 780]
                    console.log(`頁面載入時間: ${loadTime}ms`);
                    
                    [cite_start]if (typeof gtag !== 'undefined') { // [cite: 781]
                        [cite_start]gtag('event', 'page_load_time', { // [cite: 781]
                            [cite_start]'event_category': 'performance', // [cite: 781]
                            [cite_start]'value': Math.round(loadTime) // [cite: 782]
                        });
                    }
                }
            }, 0);
        });
        // 錯誤監控
        window.addEventListener('error', function(e) {
            console.error('JavaScript 錯誤:', e.error);
            
            [cite_start]if (typeof gtag !== 'undefined') { // [cite: 783]
                [cite_start]gtag('event', 'js_error', { // [cite: 784]
                    [cite_start]'event_category': 'error', // [cite: 784]
                    [cite_start]'event_label': e.message, // [cite: 784]
                    [cite_start]'value': 1 // [cite: 784]
                });
            }
        });
        // Promise 錯誤監控
        window.addEventListener('unhandledrejection', function(e) {
            console.error('未處理的 Promise 錯誤:', e.reason);
            
            [cite_start]if (typeof gtag !== 'undefined') { // [cite: 785]
                [cite_start]gtag('event', 'promise_error', { // [cite: 786]
                    [cite_start]'event_category': 'error', // [cite: 786]
                    'event_label': e.reason?.toString() || [cite_start]'Unknown promise error', // [cite: 786]
                    [cite_start]'value': 1 // [cite: 786]
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
