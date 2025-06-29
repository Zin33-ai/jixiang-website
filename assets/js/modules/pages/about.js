/**
 * 關於我們頁面功能模組
 */

export class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupTimelineAnimation();
        this.setupTeamMembers();
        this.setupAchievements();
        this.setupTestimonials();
        this.setupCompanyValues();
        console.log('關於我們頁面功能已初始化');
    }

    setupTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length === 0) return;

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // 連接線動畫
                    const connector = entry.target.querySelector('.timeline-connector');
                    if (connector) {
                        setTimeout(() => {
                            connector.classList.add('draw');
                        }, 300);
                    }
                }
            });
        }, {
            threshold: 0.3
        });

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }

    setupTeamMembers() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            // 滑鼠懸停效果
            member.addEventListener('mouseenter', () => {
                const avatar = member.querySelector('.member-avatar');
                const info = member.querySelector('.member-info');
                
                if (avatar) {
                    avatar.style.transform = 'scale(1.1)';
                }
                
                if (info) {
                    info.style.transform = 'translateY(-10px)';
                }
                
                member.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            });

            member.addEventListener('mouseleave', () => {
                const avatar = member.querySelector('.member-avatar');
                const info = member.querySelector('.member-info');
                
                if (avatar) {
                    avatar.style.transform = 'scale(1)';
                }
                
                if (info) {
                    info.style.transform = 'translateY(0)';
                }
                
                member.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            });

            // 團隊成員詳情展開
            member.addEventListener('click', () => {
                this.toggleMemberDetails(member);
            });
        });
    }

    toggleMemberDetails(member) {
        const details = member.querySelector('.member-details');
        const isExpanded = member.classList.contains('expanded');
        
        // 關閉其他展開的成員詳情
        document.querySelectorAll('.team-member.expanded').forEach(expandedMember => {
            if (expandedMember !== member) {
                expandedMember.classList.remove('expanded');
                const expandedDetails = expandedMember.querySelector('.member-details');
                if (expandedDetails) {
                    expandedDetails.style.maxHeight = '0';
                    expandedDetails.style.opacity = '0';
                }
            }
        });
        
        if (details) {
            if (isExpanded) {
                member.classList.remove('expanded');
                details.style.maxHeight = '0';
                details.style.opacity = '0';
            } else {
                member.classList.add('expanded');
                details.style.maxHeight = details.scrollHeight + 'px';
                details.style.opacity = '1';
                
                // 滾動到成員位置
                setTimeout(() => {
                    member.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }, 300);
            }
        }
    }

    setupAchievements() {
        const achievementCounters = document.querySelectorAll('.achievement-counter');
        if (achievementCounters.length === 0) return;

        const achievementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateAchievementCounter(entry.target);
                    achievementObserver.unobserve(entry.target);
                }
            });
        });

        achievementCounters.forEach(counter => {
            achievementObserver.observe(counter);
        });
    }

    animateAchievementCounter(element) {
        const target = parseInt(element.getAttribute('data-count') || element.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
                
                // 添加完成動畫
                element.classList.add('count-complete');
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    setupTestimonials() {
        const testimonialSlider = document.querySelector('.testimonials-slider');
        if (!testimonialSlider) return;

        const testimonials = testimonialSlider.querySelectorAll('.testimonial-item');
        if (testimonials.length <= 1) return;

        let currentTestimonial = 0;
        const autoSlideInterval = 6000;

        // 創建指示器
        this.createTestimonialIndicators(testimonials.length);

        // 顯示指定見證
        const showTestimonial = (index) => {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });

            // 更新指示器
            const indicators = document.querySelectorAll('.testimonial-indicator');
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        };

        // 下一個見證
        const nextTestimonial = () => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        };

        // 初始顯示
        showTestimonial(currentTestimonial);

        // 自動播放
        let autoSlide = setInterval(nextTestimonial, autoSlideInterval);

        // 滑鼠懸停暫停自動播放
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });

        testimonialSlider.addEventListener('mouseleave', () => {
            autoSlide = setInterval(nextTestimonial, autoSlideInterval);
        });

        // 指示器點擊事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('testimonial-indicator')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                currentTestimonial = index;
                showTestimonial(currentTestimonial);
                
                // 重置自動播放
                clearInterval(autoSlide);
                autoSlide = setInterval(nextTestimonial, autoSlideInterval);
            }
        });
    }

    createTestimonialIndicators(count) {
        let indicatorsContainer = document.querySelector('.testimonial-indicators');
        
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'testimonial-indicators';
            
            const slider = document.querySelector('.testimonials-slider');
            if (slider && slider.parentNode) {
                slider.parentNode.appendChild(indicatorsContainer);
            }
        }

        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const indicator = document.createElement('button');
            indicator.className = `testimonial-indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', i);
            indicator.setAttribute('aria-label', `見證 ${i + 1}`);
            indicatorsContainer.appendChild(indicator);
        }
    }

    setupCompanyValues() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach((card, index) => {
            // 延遲動畫
            const valueObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('animate');
                        }, index * 200);
                        valueObserver.unobserve(entry.target);
                    }
                });
            });

            valueObserver.observe(card);

            // 互動效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) rotateY(5deg)';
                
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) rotateY(0deg)';
                
                const icon = card.querySelector('.value-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    // 設定公司歷史互動時間軸
    setupCompanyHistory() {
        const historyItems = document.querySelectorAll('.history-item');
        
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // 關閉其他歷史項目
                historyItems.forEach(historyItem => {
                    historyItem.classList.remove('active');
                });
                
                // 切換當前項目
                if (!isActive) {
                    item.classList.add('active');
                    
                    // 滾動到項目位置
                    item.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            });
        });
    }

    // 設定公司統計動畫
    setupCompanyStats() {
        const statsSection = document.querySelector('.company-stats');
        if (!statsSection) return;

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach((statNumber, index) => {
                        setTimeout(() => {
                            this.animateStatNumber(statNumber);
                        }, index * 200);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        });

        statsObserver.observe(statsSection);
    }

    animateStatNumber(element) {
        const finalValue = parseInt(element.getAttribute('data-value') || element.textContent);
        const duration = 1500;
        const increment = finalValue / (duration / 16);
        let currentValue = 0;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                element.textContent = finalValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue);
            }
        }, 16);
    }
}
