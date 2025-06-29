/**
 * 聯絡頁面功能模組
 */

export class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupLineAnimations();
        this.setupMapInteractions();
        this.setupContactForm();
        this.setupBusinessHours();
        console.log('聯絡頁面功能已初始化');
    }

    setupLineAnimations() {
        const lineCards = document.querySelectorAll('.line-card.pulse-animation');
        const lineSection = document.querySelector('.line-contact-section');
        
        if (!lineSection || lineCards.length === 0) return;
        
        const lineObserver = new IntersectionObserver((entries) => {
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

    setupMapInteractions() {
        const mapIframe = document.querySelector('.map-container iframe');
        const mapOverlay = document.querySelector('.map-overlay');
        
        if (mapIframe) {
            mapIframe.addEventListener('load', () => {
                console.log('地圖載入完成');
            });
        }

        // 地圖覆蓋層互動
        if (mapOverlay) {
            mapOverlay.addEventListener('click', () => {
                // 點擊覆蓋層時在新視窗開啟 Google Maps
                const mapUrl = 'https://maps.google.com/maps?q=新北市板橋區民權路202巷2弄16號1樓';
                window.open(mapUrl, '_blank');
                
                // 追蹤地圖點擊
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'map_click', {
                        event_category: 'contact',
                        event_label: 'office_location'
                    });
                }
            });
        }

        // 地址點擊功能
        this.setupAddressClick();
    }

    setupAddressClick() {
        const addressElements = document.querySelectorAll('.address-clickable');
        
        addressElements.forEach(element => {
            element.addEventListener('click', () => {
                const address = element.textContent.trim();
                const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
                window.open(mapUrl, '_blank');
                
                // 追蹤地址點擊
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'address_click', {
                        event_category: 'contact',
                        event_label: address
                    });
                }
            });

            // 添加視覺提示
            element.style.cursor = 'pointer';
            element.title = '點擊在 Google Maps 中查看';
        });
    }

    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

        // 表單驗證
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(contactForm);
        });

        // 即時驗證
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 驗證所有欄位
        const isValid = this.validateForm(form);
        
        if (!isValid) {
            this.showFormMessage('請修正表單中的錯誤', 'error');
            return;
        }

        // 這裡可以發送表單資料到後端
        this.submitForm(data);
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // 必填欄位檢查
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = '此欄位為必填';
        }
        // Email 格式檢查
        else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '請輸入有效的 Email 地址';
            }
        }
        // 電話號碼檢查
        else if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\d\-\(\)\+\s]+$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = '請輸入有效的電話號碼';
            }
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    showFieldError(field, isValid, errorMessage) {
        // 移除現有的錯誤訊息
        this.clearFieldError(field);

        if (!isValid) {
            field.classList.add('error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            
            field.parentNode.appendChild(errorElement);
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showFormMessage(message, type = 'success') {
        const messageElement = document.querySelector('.form-message');
        
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `form-message ${type}`;
            messageElement.style.display = 'block';
            
            // 自動隱藏成功訊息
            if (type === 'success') {
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }
    }

    async submitForm(data) {
        try {
            // 顯示提交中狀態
            const submitButton = document.querySelector('.contact-form button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = '提交中...';
            submitButton.disabled = true;

            // 模擬 API 請求
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 這裡應該是實際的 API 請求
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });

            // 成功處理
            this.showFormMessage('感謝您的留言，我們會盡快回覆！', 'success');
            document.querySelector('.contact-form').reset();
            
            // 追蹤表單提交
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_form_submit', {
                    event_category: 'contact',
                    event_label: 'form_submission'
                });
            }

            // 恢復按鈕狀態
            submitButton.textContent = originalText;
            submitButton.disabled = false;

        } catch (error) {
            console.error('表單提交錯誤:', error);
            this.showFormMessage('提交失敗，請稍後再試', 'error');
            
            // 恢復按鈕狀態
            const submitButton = document.querySelector('.contact-form button[type="submit"]');
            submitButton.textContent = '發送訊息';
            submitButton.disabled = false;
        }
    }

    setupBusinessHours() {
        const hoursElement = document.querySelector('.business-hours');
        if (!hoursElement) return;

        // 顯示當前營業狀態
        this.updateBusinessStatus();
        
        // 每分鐘更新一次狀態
        setInterval(() => {
            this.updateBusinessStatus();
        }, 60000);
    }

    updateBusinessStatus() {
        const statusElement = document.querySelector('.business-status');
        if (!statusElement) return;

        const now = new Date();
        const currentDay = now.getDay(); // 0 = 週日, 1 = 週一, ...
        const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM 格式

        // 營業時間：週一到週五 9:00-18:00，週六 9:00-17:00，週日休息
        let isOpen = false;
        let nextOpenTime = '';

        if (currentDay >= 1 && currentDay <= 5) { // 週一到週五
            isOpen = currentTime >= 900 && currentTime < 1800;
            nextOpenTime = isOpen ? '18:00 結束營業' : '明日 9:00 開始營業';
        } else if (currentDay === 6) { // 週六
            isOpen = currentTime >= 900 && currentTime < 1700;
            nextOpenTime = isOpen ? '17:00 結束營業' : '週一 9:00 開始營業';
        } else { // 週日
            isOpen = false;
            nextOpenTime = '週一 9:00 開始營業';
        }

        statusElement.textContent = isOpen ? '營業中' : '休息中';
        statusElement.className = `business-status ${isOpen ? 'open' : 'closed'}`;

        // 更新下次營業時間
        const nextTimeElement = document.querySelector('.next-open-time');
        if (nextTimeElement) {
            nextTimeElement.textContent = nextOpenTime;
        }
    }
}
