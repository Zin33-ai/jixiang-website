/**
 * 新聞頁面功能模組
 */

import { isSafari } from '../../utils/safari.js';
import { showToast } from '../../utils/ui.js';
import { trackSocialShare } from '../tracking.js';

export class NewsPage {
    constructor() {
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.setupCategoryFiltering();
        this.setupSearchFunctionality();
        this.setupNewsFiltering();
        this.setupSocialSharing();
        this.setupNewsInteractions();
        console.log('新聞頁面功能已初始化');
    }

    setupCategoryFiltering() {
        const categoryTabs = document.querySelectorAll('.category-tab');
        
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 更新活動狀態
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.getAttribute('data-category');
                this.filterNewsByCategory(category);
            });
        });
    }

    filterNewsByCategory(category) {
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

        // 追蹤分類點擊
        if (typeof gtag !== 'undefined') {
            gtag('event', 'news_category_filter', {
                event_category: 'news',
                event_label: category
            });
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
        
        // 支援鍵盤搜尋
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(this.searchTimeout);
                this.handleSearch(e.target.value);
            }
        });
    }

    handleSearch(query) {
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

        // 追蹤搜尋行為
        if (searchQuery && typeof gtag !== 'undefined') {
            gtag('event', 'news_search', {
                event_category: 'news',
                event_label: searchQuery
            });
        }
    }

    setupNewsFiltering() {
        // 設定全域函數供 HTML 調用
        window.handleDateFilter = this.handleDateFilter.bind(this);
        window.handleSort = this.handleSort.bind(this);
    }

    handleDateFilter(period) {
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

        // 追蹤日期篩選
        if (typeof gtag !== 'undefined') {
            gtag('event', 'news_date_filter', {
                event_category: 'news',
                event_label: period
            });
        }
    }

    handleSort(sortType) {
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

        // 追蹤排序行為
        if (typeof gtag !== 'undefined') {
            gtag('event', 'news_sort', {
                event_category: 'news',
                event_label: sortType
            });
        }
    }

    setupSocialSharing() {
        // 設定全域函數供 HTML 調用
        window.shareToFacebook = this.shareToFacebook.bind(this);
        window.shareToLine = this.shareToLine.bind(this);
        window.copyLink = this.copyLink.bind(this);
    }

    shareToFacebook() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
        this.openShareWindow(shareUrl);
        trackSocialShare('facebook');
    }

    shareToLine() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}&text=${title}`;
        this.openShareWindow(shareUrl);
        trackSocialShare('line');
    }

    copyLink() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('連結已複製到剪貼簿');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(window.location.href);
            });
        } else {
            this.fallbackCopyTextToClipboard(window.location.href);
        }
        trackSocialShare('copy');
    }

    openShareWindow(url) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
    }

    fallbackCopyTextToClipboard(text) {
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

    setupNewsInteractions() {
        const newsItems = document.querySelectorAll('.news-item');
        
        newsItems.forEach(item => {
            // 新聞項目點擊追蹤
            item.addEventListener('click', () => {
                const title = item.querySelector('.news-title')?.textContent;
                if (title && typeof gtag !== 'undefined') {
                    gtag('event', 'news_item_click', {
                        event_category: 'news',
                        event_label: title
                    });
                }
            });

            // 滑鼠懸停效果
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-5px)';
                item.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            });
        });

        // 設定分享按鈕事件
        this.setupShareButtons();
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止觸發父元素事件
                
                const platform = btn.classList.contains('facebook') ? 'facebook' : 
                                btn.classList.contains('line') ? 'line' : 'copy';
                
                switch (platform) {
                    case 'facebook':
                        this.shareToFacebook();
                        break;
                    case 'line':
                        this.shareToLine();
                        break;
                    case 'copy':
                        this.copyLink();
                        break;
                }
            });
        });
    }
}
