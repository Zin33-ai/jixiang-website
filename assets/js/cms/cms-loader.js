// CMS 內容載入器 - 讀取 Netlify CMS 資料並更新網站內容
class CMSContentLoader {
    constructor() {
        this.loadNewsContent();
    }

    // 載入最新消息
    async loadNewsContent() {
        try {
            // 動態載入新聞檔案
            const newsFiles = await this.getNewsFiles();
            
            const newsContainer = document.querySelector('.news-section .row.g-4');
            if (!newsContainer) {
                console.log('找不到新聞容器');
                return;
            }

            let loadedNews = [];

            for (const fileName of newsFiles) {
                try {
                    // 嘗試載入 JSON 格式
                    let response = await fetch(`/data/news/${fileName.replace('.md', '.json')}`);
                    
                    // 如果 JSON 不存在，嘗試載入 MD 格式
                    if (!response.ok) {
                        response = await fetch(`/data/news/${fileName}`);
                    }
                    
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        let newsData;
                        
                        if (contentType && contentType.includes('application/json')) {
                            newsData = await response.json();
                        } else {
                            const content = await response.text();
                            newsData = this.parseFrontMatter(content);
                        }
                        
                        if (newsData) {
                            loadedNews.push(newsData);
                        }
                    }
                } catch (error) {
                    console.log(`無法載入新聞檔案: ${fileName}`, error);
                }
            }

            if (loadedNews.length > 0) {
                console.log('成功載入', loadedNews.length, '則新聞');
                this.updateNewsSection(loadedNews);
            } else {
                console.log('沒有載入到任何新聞，使用預設內容');
            }
        } catch (error) {
            console.log('載入新聞時發生錯誤，使用預設內容:', error);
        }
    }

    // 動態獲取新聞檔案列表
    async getNewsFiles() {
        // 目前已知的檔案
        const knownFiles = [
            '2025-07-28-你好.md',
            '2024-12-15-social-housing-policy.md'
        ];
        
        // 未來可以實作動態檢索檔案的功能
        return knownFiles;
    }

    // 解析 Markdown Front Matter
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (!match) {
            console.log('無法解析 Front Matter');
            return null;
        }

        const frontMatter = match[1];
        const body = match[2];
        
        const data = {};
        frontMatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // 移除引號
                value = value.replace(/^["'](.*)["']$/, '$1');
                
                data[key] = value;
            }
        });
        
        data.content = body.trim();
        return data;
    }

    // 更新新聞區塊
    updateNewsSection(newsItems) {
        const newsContainer = document.querySelector('.news-section .row.g-4');
        if (!newsContainer) return;

        // 按日期排序（最新的在前）
        newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        const categoryClasses = {
            '政策': 'policy',
            '熱門': 'hot', 
            '最新': 'new',
            '公司動態': 'company'
        };

        const newHTML = newsItems.slice(0, 3).map(news => {
            const categoryClass = categoryClasses[news.category] || 'new';
            const icon = news.icon || 'bi-newspaper';
            const formattedDate = this.formatDate(news.date);

            return `
                <div class="col-lg-4 col-md-6">
                    <div class="news-card fade-in">
                        <div class="news-badge ${categoryClass}">${news.category || '最新'}</div>
                        <div class="news-image">
                            <i class="bi ${icon}"></i>
                        </div>
                        <div class="news-content">
                            <div class="news-date">${formattedDate}</div>
                            <h3 class="news-title">${news.title || '無標題'}</h3>
                            <p class="news-excerpt">${news.excerpt || '無摘要'}</p>
                            <a href="news.html" class="news-link">閱讀更多 <i class="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        newsContainer.innerHTML = newHTML;
        console.log('新聞區塊已更新');
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}年${month}月${day}日`;
        } catch (error) {
            console.log('日期格式化錯誤:', error);
            return dateString;
        }
    }
}

// 當頁面載入完成後啟動 CMS 內容載入器
document.addEventListener('DOMContentLoaded', () => {
    console.log('啟動 CMS 內容載入器');
    new CMSContentLoader();
});

// 導出供其他模組使用
export default CMSContentLoader;
