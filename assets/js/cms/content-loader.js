/**
 * CMS 內容載入器
 * 用於動態載入和管理網站內容
 */

export class ContentLoader {
    constructor() {
        this.contentCache = new Map();
        this.apiBaseUrl = '/api'; // 實際 API 端點
        this.init();
    }

    init() {
        console.log('CMS 內容載入器已初始化');
    }

    /**
     * 載入新聞內容
     * @param {Object} options - 載入選項
     * @returns {Promise<Array>} 新聞列表
     */
    async loadNews(options = {}) {
        const {
            category = 'all',
            limit = 10,
            offset = 0,
            sort = 'date-desc'
        } = options;

        const cacheKey = `news_${category}_${limit}_${offset}_${sort}`;
        
        // 檢查快取
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            // 在實際環境中，這裡會是 API 請求
            // const response = await fetch(`${this.apiBaseUrl}/news?category=${category}&limit=${limit}&offset=${offset}&sort=${sort}`);
            // const newsData = await response.json();

            // 模擬數據
            const newsData = this.getMockNewsData(options);
            
            // 快取結果
            this.contentCache.set(cacheKey, newsData);
            
            return newsData;
        } catch (error) {
            console.error('載入新聞失敗:', error);
            return [];
        }
    }

    /**
     * 載入單篇新聞詳情
     * @param {string} newsId - 新聞 ID
     * @returns {Promise<Object>} 新聞詳情
     */
    async loadNewsDetail(newsId) {
        const cacheKey = `news_detail_${newsId}`;
        
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            // const response = await fetch(`${this.apiBaseUrl}/news/${newsId}`);
            // const newsDetail = await response.json();

            const newsDetail = this.getMockNewsDetail(newsId);
            this.contentCache.set(cacheKey, newsDetail);
            
            return newsDetail;
        } catch (error) {
            console.error('載入新聞詳情失敗:', error);
            return null;
        }
    }

    /**
     * 載入服務內容
     * @returns {Promise<Array>} 服務列表
     */
    async loadServices() {
        const cacheKey = 'services';
        
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            // const response = await fetch(`${this.apiBaseUrl}/services`);
            // const services = await response.json();

            const services = this.getMockServicesData();
            this.contentCache.set(cacheKey, services);
            
            return services;
        } catch (error) {
            console.error('載入服務失敗:', error);
            return [];
        }
    }

    /**
     * 載入團隊成員資訊
     * @returns {Promise<Array>} 團隊成員列表
     */
    async loadTeamMembers() {
        const cacheKey = 'team_members';
        
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            const teamMembers = this.getMockTeamData();
            this.contentCache.set(cacheKey, teamMembers);
            
            return teamMembers;
        } catch (error) {
            console.error('載入團隊成員失敗:', error);
            return [];
        }
    }

    /**
     * 載入見證內容
     * @returns {Promise<Array>} 見證列表
     */
    async loadTestimonials() {
        const cacheKey = 'testimonials';
        
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        try {
            const testimonials = this.getMockTestimonialsData();
            this.contentCache.set(cacheKey, testimonials);
            
            return testimonials;
        } catch (error) {
            console.error('載入見證失敗:', error);
            return [];
        }
    }

    /**
     * 動態渲染新聞列表
     * @param {Array} newsData - 新聞數據
     * @param {string} containerId - 容器 ID
     */
    renderNews(newsData, containerId = 'news-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = newsData.map(news => `
            <article class="news-item" data-category="${news.category}" data-date="${news.date}">
                <div class="news-image">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                    <div class="news-category">${news.categoryName}</div>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-meta">
                        <span class="news-date">${this.formatDate(news.date)}</span>
                        <span class="news-author">${news.author}</span>
                    </div>
                    <div class="news-footer">
                        <a href="news-detail.html?id=${news.id}" class="read-more">閱讀更多</a>
                        <div class="news-actions">
                            <button class="share-btn facebook" onclick="shareToFacebook()" title="分享到 Facebook">
                                <i class="bi bi-facebook"></i>
                            </button>
                            <button class="share-btn line" onclick="shareToLine()" title="分享到 LINE">
                                <i class="bi bi-line"></i>
                            </button>
                            <button class="share-btn copy" onclick="copyLink()" title="複製連結">
                                <i class="bi bi-link-45deg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        // 重新初始化動畫
        this.initializeNewsAnimations();
    }

    /**
     * 動態渲染服務卡片
     * @param {Array} servicesData - 服務數據
     * @param {string} containerId - 容器 ID
     */
    renderServices(servicesData, containerId = 'services-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = servicesData.map(service => `
            <div class="service-card" data-service="${service.id}">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
                <ul class="service-features">
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="service-actions">
                    <button class="inquiry-btn" onclick="openServiceInquiry('${service.title}')">
                        立即諮詢
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 清除快取
     * @param {string} key - 快取鍵（可選，不提供則清除全部）
     */
    clearCache(key = null) {
        if (key) {
            this.contentCache.delete(key);
        } else {
            this.contentCache.clear();
        }
    }

    /**
     * 重新載入內容
     * @param {string} contentType - 內容類型
     */
    async reloadContent(contentType) {
        this.clearCache();
        
        switch (contentType) {
            case 'news':
                return await this.loadNews();
            case 'services':
                return await this.loadServices();
            case 'team':
                return await this.loadTeamMembers();
            case 'testimonials':
                return await this.loadTestimonials();
            default:
                console.warn('未知的內容類型:', contentType);
                return null;
        }
    }

    // 模擬數據方法（在實際環境中會被真實 API 替代）
    getMockNewsData(options) {
        const mockNews = [
            {
                id: 1,
                title: '2025年房地產市場展望分析',
                excerpt: '專家預測明年房市走向，投資者必看重點解析...',
                category: 'market',
                categoryName: '市場分析',
                date: '2025-01-15',
                author: '李專員',
                image: 'assets/images/news/news-1.jpg'
            },
            {
                id: 2,
                title: '政府新政策對首購族的影響',
                excerpt: '最新房貸政策調整，首購族購屋更容易...',
                category: 'policy',
                categoryName: '政策解讀',
                date: '2025-01-10',
                author: '王顧問',
                image: 'assets/images/news/news-2.jpg'
            },
            {
                id: 3,
                title: '板橋地區優質案例分享',
                excerpt: '成功協助客戶找到理想住宅的完整過程...',
                category: 'success',
                categoryName: '成功案例',
                date: '2025-01-05',
                author: '陳經理',
                image: 'assets/images/news/news-3.jpg'
            }
        ];

        return mockNews.filter(news => 
            options.category === 'all' || news.category === options.category
        ).slice(options.offset, options.offset + options.limit);
    }

    getMockNewsDetail(newsId) {
        return {
            id: newsId,
            title: '2025年房地產市場展望分析',
            content: '詳細的新聞內容...',
            category: 'market',
            date: '2025-01-15',
            author: '李專員',
            image: 'assets/images/news/news-1.jpg',
            tags: ['房地產', '市場分析', '投資']
        };
    }

    getMockServicesData() {
        return [
            {
                id: 'rent',
                title: '租屋服務',
                description: '專業租屋仲介，為您找到最適合的租賃物件',
                icon: 'bi bi-house-door',
                features: ['物件篩選', '合約協助', '後續服務']
            },
            {
                id: 'sell',
                title: '買賣服務',
                description: '房屋買賣專業諮詢，讓交易更安心',
                icon: 'bi bi-currency-exchange',
                features: ['市場評估', '議價協商', '過戶協助']
            },
            {
