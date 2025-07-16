/**
 * CMS 內容載入器 - 修復版本
 */

export class ContentLoader {
    constructor() {
        this.contentCache = new Map();
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        console.log('CMS 內容載入器已初始化');
    }

    /**
     * 載入新聞內容
     */
    async loadNews(options = {}) {
        const {
            category = 'all',
            limit = 10,
            offset = 0,
            sort = 'date-desc'
        } = options;

        try {
            // 模擬數據
            const newsData = this.getMockNewsData(options);
            return newsData;
        } catch (error) {
            console.error('載入新聞失敗:', error);
            return [];
        }
    }

    /**
     * 載入服務內容
     */
    async loadServices() {
        try {
            const services = this.getMockServicesData();
            return services;
        } catch (error) {
            console.error('載入服務失敗:', error);
            return [];
        }
    }

    /**
     * 載入團隊成員
     */
    async loadTeamMembers() {
        try {
            const teamMembers = this.getMockTeamData();
            return teamMembers;
        } catch (error) {
            console.error('載入團隊成員失敗:', error);
            return [];
        }
    }

    /**
     * 載入見證內容
     */
    async loadTestimonials() {
        try {
            const testimonials = this.getMockTestimonialsData();
            return testimonials;
        } catch (error) {
            console.error('載入見證失敗:', error);
            return [];
        }
    }

    /**
     * 獲取統計資料
     */
    async getStatistics() {
        return {
            experience: 15,
            cases: 500,
            clients: 1000,
            satisfaction: 98
        };
    }

    /**
     * 渲染新聞
     */
    renderNews(newsData, containerId = 'news-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = newsData.map(news => `
            <div class="news-item">
                <h3>${news.title}</h3>
                <p>${news.excerpt}</p>
                <span class="news-date">${news.date}</span>
            </div>
        `).join('');
    }

    /**
     * 渲染服務
     */
    renderServices(servicesData, containerId = 'services-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = servicesData.map(service => `
            <div class="service-item">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
        `).join('');
    }

    /**
     * 重新載入內容
     */
    async reloadContent(contentType) {
        switch (contentType) {
            case 'news':
                return await this.loadNews();
            case 'services':
                return await this.loadServices();
            default:
                return null;
        }
    }

    /**
     * 模擬新聞數據
     */
    getMockNewsData(options) {
        const mockNews = [
            {
                id: 1,
                title: '2025年房地產市場展望',
                excerpt: '專家預測明年房市走向...',
                date: '2025-01-15',
                category: 'market'
            },
            {
                id: 2,
                title: '政府新政策解讀',
                excerpt: '最新房貸政策調整...',
                date: '2025-01-10',
                category: 'policy'
            },
            {
                id: 3,
                title: '成功案例分享',
                excerpt: '協助客戶購屋成功...',
                date: '2025-01-05',
                category: 'success'
            }
        ];

        return mockNews.slice(options.offset, options.offset + options.limit);
    }

    /**
     * 模擬服務數據
     */
    getMockServicesData() {
        return [
            {
                id: 'rent',
                title: '租屋服務',
                description: '專業租屋仲介服務',
                features: ['物件篩選', '合約協助']
            },
            {
                id: 'sell',
                title: '買賣服務',
                description: '房屋買賣專業諮詢',
                features: ['市場評估', '議價協商']
            }
        ];
    }

    /**
     * 模擬團隊數據
     */
    getMockTeamData() {
        return [
            {
                id: 1,
                name: '團隊成員',
                position: '建置中',
                description: '資訊建置中'
            }
        ];
    }

    /**
     * 模擬見證數據
     */
    getMockTestimonialsData() {
        return [
            {
                id: 1,
                name: '客戶見證',
                content: '見證內容建置中',
                rating: 5
            }
        ];
    }

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }
}
