/**
 * 服務頁面功能模組
 */

export class ServicesPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupServiceTabs();
        this.setupServiceCards();
        this.setupProcessSteps();
        this.setupFAQ();
        this.setupQuoteCalculator();
        console.log('服務頁面功能已初始化');
    }

    setupServiceTabs() {
        const serviceTabs = document.querySelectorAll('.service-tab');
        const serviceContents = document.querySelectorAll('.service-content');
        
        if (serviceTabs.length === 0) return;

        serviceTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 移除所有活動狀態
                serviceTabs.forEach(t => t.classList.remove('active'));
                serviceContents.forEach(c => c.classList.remove('active'));
                
                // 添加活動狀態
                tab.classList.add('active');
                
                const targetId = tab.getAttribute('data-target');
                const targetContent = document.querySelector(targetId);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // 追蹤服務分頁點擊
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_tab_click', {
                        event_category: 'services',
                        event_label: tab.textContent.trim()
                    });
                }
            });
        });
    }

    setupServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            // 滑鼠懸停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                
                // 動畫圖標
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                
                const icon = card.querySelector('.service-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });

            // 點擊詢問功能
            const inquiryBtn = card.querySelector('.inquiry-btn');
            if (inquiryBtn) {
                inquiryBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const serviceName = card.querySelector('.service-title')?.textContent;
                    this.openInquiryModal(serviceName);
                });
            }

            // 卡片點擊展開詳情
            card.addEventListener('click', () => {
                this.toggleServiceDetails(card);
            });
        });
    }

    toggleServiceDetails(card) {
        const details = card.querySelector('.service-details');
        const isExpanded = card.classList.contains('expanded');
        
        if (details) {
            if (isExpanded) {
                card.classList.remove('expanded');
                details.style.maxHeight = '0';
                details.style.opacity = '0';
            } else {
                card.classList.add('expanded');
                details.style.maxHeight = details.scrollHeight + 'px';
                details.style.opacity = '1';
            }
        }
    }

    setupProcessSteps() {
        const processSteps = document.querySelectorAll('.process-step');
        
        if (processSteps.length === 0) return;

        // 步驟動畫觀察器
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stepNumber = entry.target.getAttribute('data-step');
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, stepNumber * 200);
                }
            });
        });

        processSteps.forEach(step => {
            stepObserver.observe(step);
            
            // 步驟點擊展開詳情
            step.addEventListener('click', () => {
                this.toggleStepDetails(step);
            });
        });
    }

    toggleStepDetails(step) {
        const details = step.querySelector('.step-details');
        const isActive = step.classList.contains('active');
        
        // 關閉其他步驟
        document.querySelectorAll('.process-step.active').forEach(activeStep => {
            if (activeStep !== step) {
                activeStep.classList.remove('active');
                const activeDetails = activeStep.querySelector('.step-details');
                if (activeDetails) {
                    activeDetails.style.maxHeight = '0';
                }
            }
        });
        
        if (details) {
            if (isActive) {
                step.classList.remove('active');
                details.style.maxHeight = '0';
            } else {
                step.classList.add('active');
                details.style.maxHeight = details.scrollHeight + 'px';
            }
        }
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // 關閉其他 FAQ
                    faqItems.forEach(faqItem => {
                        faqItem.classList.remove('active');
                        const faqAnswer = faqItem.querySelector('.faq-answer');
                        if (faqAnswer) {
                            faqAnswer.style.maxHeight = '0';
                        }
                    });
                    
                    // 切換當前 FAQ
                    if (!isActive) {
                        item.classList.add('active');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        
                        // 追蹤 FAQ 點擊
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'faq_click', {
                                event_category: 'services',
                                event_label: question.textContent.trim()
                            });
                        }
                    }
                });
            }
        });
    }

    setupQuoteCalculator() {
        const calculator = document.querySelector('.quote-calculator');
        if (!calculator) return;

        const propertyType = calculator.querySelector('#propertyType');
        const propertySize = calculator.querySelector('#propertySize');
        const serviceType = calculator.querySelector('#serviceType');
        const calculateBtn = calculator.querySelector('.calculate-btn');
        const resultDiv = calculator.querySelector('.quote-result');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateQuote(propertyType, propertySize, serviceType, resultDiv);
            });
        }

        // 即時計算
        [propertyType, propertySize, serviceType].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    this.calculateQuote(propertyType, propertySize, serviceType, resultDiv);
                });
            }
        });
    }

    calculateQuote(propertyType, propertySize, serviceType, resultDiv) {
        if (!propertyType || !propertySize || !serviceType || !resultDiv) return;

        const type = propertyType.value;
        const size = parseFloat(propertySize.value);
        const service = serviceType.value;

        if (!type || !size || !service) {
            resultDiv.innerHTML = '<p>請填寫完整資訊以獲得報價</p>';
            return;
        }

        // 簡單的報價計算邏輯（實際應該根據業務需求調整）
        let basePrice = 0;
        
        // 依據房屋類型
        switch (type) {
            case 'apartment':
                basePrice = size * 100;
                break;
            case 'house':
                basePrice = size * 120;
                break;
            case 'commercial':
                basePrice = size * 150;
                break;
        }

        // 依據服務類型調整
        switch (service) {
            case 'rent':
                basePrice *= 0.8;
                break;
            case 'sell':
                basePrice *= 1.2;
                break;
            case 'manage':
                basePrice *= 0.6;
                break;
        }

        const estimatedPrice = Math.round(basePrice);
        
        resultDiv.innerHTML = `
            <div class="quote-estimate">
                <h4>預估服務費用</h4>
                <div class="price">NT$ ${estimatedPrice.toLocaleString()}</div>
                <p class="disclaimer">*此為初步估算，實際費用請洽詢專員</p>
                <button class="contact-btn" onclick="scrollToContact()">立即諮詢</button>
            </div>
        `;

        // 追蹤報價計算
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quote_calculation', {
                event_category: 'services',
                event_label: `${type}_${service}`,
                value: estimatedPrice
            });
        }
    }

    openInquiryModal(serviceName) {
        // 創建詢問彈窗
        const modal = document.createElement('div');
        modal.className = 'inquiry-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>服務諮詢 - ${serviceName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="inquiry-form">
                        <div class="form-group">
                            <label for="inquiryName">姓名 *</label>
                            <input type="text" id="inquiryName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="inquiryPhone">電話 *</label>
                            <input type="tel" id="inquiryPhone" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label for="inquiryEmail">Email</label>
                            <input type="email" id="inquiryEmail" name="email">
                        </div>
                        <div class="form-group">
                            <label for="inquiryMessage">需求說明</label>
                            <textarea id="inquiryMessage" name="message" rows="4" placeholder="請簡述您的需求..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">取消</button>
                            <button type="submit" class="btn-submit">送出諮詢</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 設定事件監聽
        this.setupInquiryModalEvents(modal, serviceName);

        // 顯示動畫
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    setupInquiryModalEvents(modal, serviceName) {
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('.inquiry-form');

        // 關閉事件
        [overlay, closeBtn, cancelBtn].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    this.closeInquiryModal(modal);
                });
            }
        });

        // 表單提交
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInquirySubmit(form, serviceName, modal);
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeInquiryModal(modal);
            }
        });
    }

    closeInquiryModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    async handleInquirySubmit(form, serviceName, modal) {
        const formData = new FormData(form);
        const data = {
            service: serviceName,
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // 簡單驗證
        if (!data.name || !data.phone) {
            alert('請填寫必要資訊');
            return;
        }

        try {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.textContent = '送出中...';
            submitBtn.disabled = true;

            // 模擬 API 請求
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 成功處理
            alert('諮詢已送出，我們會盡快與您聯繫！');
            this.closeInquiryModal(modal);

            // 追蹤詢問
            if (typeof gtag !== 'undefined') {
                gtag('event', 'service_inquiry', {
                    event_category: 'services',
                    event_label: serviceName
                });
            }

        } catch (error) {
            console.error('詢問送出錯誤:', error);
            alert('送出失敗，請稍後再試');
            
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.textContent = '送出諮詢';
            submitBtn.disabled = false;
        }
    }

    // 設定全域函數供 HTML 調用
    setupGlobalFunctions() {
        window.scrollToContact = () => {
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // 如果當前頁面沒有聯絡區段，跳轉到聯絡頁面
                window.location.href = 'contact.html';
            }
        };

        window.openServiceInquiry = (serviceName) => {
            this.openInquiryModal(serviceName);
        };
    }
}
