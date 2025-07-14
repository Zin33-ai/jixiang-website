// 應用主要配置文件
export const APP_CONFIG = {
    // 應用基本信息
    name: 'My Website',
    version: '1.0.0',
    debug: true, // 開發時設為 true，上線時改為 false
    
    // UI 相關配置
    ui: {
        // 動畫時間 (毫秒)
        animationDuration: 300,
        
        // 響應式斷點
        breakpoints: {
            mobile: '768px',
            tablet: '1024px',
            desktop: '1200px'
        },
        
        // 導航欄配置
        navbar: {
            height: '60px',
            background: '#ffffff',
            sticky: true
        },
        
        // 浮動按鈕配置
        floatingButton: {
            size: '50px',
            position: 'bottom-right',
            offset: '20px'
        }
    },
    
    // 滾動相關配置
    scroll: {
        smoothScrollDuration: 800,
        offsetTop: 80, // 滾動時的偏移量
        threshold: 100 // 顯示回到頂部按鈕的閾值
    }
};
