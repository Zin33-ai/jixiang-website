/**
 * 關於我們頁面功能模組 - 優化版本
 * 支援 Netlify CMS 動態內容和 ES6 模組規範
 */

// 導入依賴模組
import { debounce, throttle } from '../../utils/ui.js';
import { showToast } from '../../utils/ui.js';

export class AboutPage {
    constructor(options = {}) {
        this.config = {
            autoSlideInterval: 6000,
            animationDelay: 200,
            counterDuration: 2000,
            ...options
        };
        
        this.observers = new Map();
        this.timers = new Set();
        this.isDestroyed = false;
        
        this.init();
    }

    init() {
        try {
            this.setupTimelineAnimation();
            this.setupTeamMembers();
            this.setupAchievements();
            this.setupTestimonials();
            this.setupCompanyValues();
            this.setupCompanyHistory();
            this.setupCompanyStats();
            
            console.log('關於我們頁面功能已初始化');
        } catch (error) {
            console.error('AboutPage 初始化失敗:', error);
            this.handleError(error);
        }
    }

    setupTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length === 0) return;

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isDestroyed) {
                    this.animateTimelineItem(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
        
        this.observers.set('timeline', timelineObserver);
    }

    animateTimelineItem(item) {
        try {
            item.classList.add('animate');
            
            // 連接線動畫
            const connector = item.querySelector('.timeline-connector');
            if (connector) {
                const timer = setTimeout(() => {
                    if (!this.isDestroyed) {
                        connector.classList.add('draw');
                    }
                }, 300);
                this.timers.add(timer);
            }
        } catch (error) {
            console.error('時間軸動畫錯誤:', error);
        }
    }

    setupTeamMembers() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            // 使用 throttle 優化滑鼠事件
            const handleMouseEnter = throttle(() => {
                this.animateTeamMemberHover(member, true);
            }, 100);

            const handleMouseLeave = throttle(() => {
                this.animateTeamMemberHover(member, false);
            }, 100);

            const handleClick = (e) => {
                e.preventDefault();
                this.toggleMemberDetails(member);
            };

            member.addEventListener('mouseenter', handleMouseEnter);
            member.addEventListener('mouseleave', handleMouseLeave);
            member.addEventListener('click', handleClick);
            
            // 鍵盤支援
            member.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMemberDetails(member);
                }
            });

            // 設定 ARIA 屬性
            member.setAttribute('role', 'button');
            member.setAttribute('tabindex', '0');
            member.setAttribute('aria-expanded', 'false');
        });
    }

    animateTeamMemberHover(member, isHovering) {
        try {
            const avatar = member.querySelector('.member-avatar');
            const info = member.querySelector('.member-info');
            
            if (isHovering) {
                if (avatar) avatar.style.transform = 'scale(1.1)';
                if (info) info.style.transform = 'translateY(-10px)';
                member.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            } else {
                if (avatar) avatar.style.transform = 'scale(1)';
                if (info) info.style.transform = 'translateY(0)';
                member.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }
        } catch (error) {
            console.error('團隊成員懸停動畫錯誤:', error);
        }
    }

    toggleMemberDetails(member) {
        try {
            const details = member.querySelector('.member-details');
            const isExpanded = member.classList.contains('expanded');
            
            // 關閉其他展開的成員詳情
            document.querySelectorAll('.team-member.expanded').forEach(expandedMember => {
                if (expandedMember !== member) {
                    this.collapseMemberDetails(expandedMember);
                }
            });
            
            if (details) {
                if (isExpanded) {
                    this.collapseMemberDetails(member);
                } else {
                    this.expandMemberDetails(member);
                }
            }
        } catch (error) {
            console.error('切換成員詳情錯誤:', error);
        }
    }

    expandMemberDetails(member) {
        const details = member.querySelector('.member-details');
        if (!details) return;

        member.classList.add('expanded');
        member.setAttribute('aria-expanded', 'true');
        
        details.style.maxHeight = details.scrollHeight + 'px';
        details.style.opacity = '1';
        
        // 平滑滾動到成員位置
        const timer = setTimeout(() => {
            if (!this.isDestroyed) {
                member.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }, 300);
        this.timers.add(timer);
    }

    collapseMemberDetails(member) {
        const details = member.querySelector('.member-details');
        if (!details) return;

        member.classList.remove('expanded');
        member.setAttribute('aria-expanded', 'false');
        
        details.style.maxHeight = '0';
        details.style.opacity = '0';
    }

    setupAchievements() {
        const achievementCounters = document.querySelectorAll('.achievement-counter');
        if (achievementCounters.length === 0) return;

        const achievementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isDestroyed) {
                    this.animateAchievementCounter(entry.target);
                    achievementObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        achievementCounters.forEach(counter => {
            achievementObserver.observe(counter);
        });
        
        this.observers.set('achievements', achievementObserver);
    }

    animateAchievementCounter(element) {
        try {
            const target = parseInt(element.getAttribute('data-count') || element.textContent);
            if (isNaN(target)) return;

            const duration = this.config.counterDuration;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                if (this.isDestroyed) return;
                
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用 easeOutCubic 緩動函數
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * easeProgress);
                
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = target;
                    element.classList.add('count-complete');
                }
            };
            
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('成就計數器動畫錯誤:', error);
        }
    }

    setupTestimonials() {
        const testimonialSlider = document.querySelector('.testimonials-slider');
        if (!testimonialSlider) return;

        const testimonials = testimonialSlider.querySelectorAll('.testimonial-item');
        if (testimonials.length <= 1) return;

        this.testimonialState = {
            current: 0,
            total: testimonials.length,
            autoSlide: null
        };

        // 創建指示器
        this.createTestimonialIndicators(testimonials.length);

        // 初始化見證輪播
        this.initTestimonialSlider(testimonials);
    }

    initTestimonialSlider(testimonials) {
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

        const nextTestimonial = () => {
            if (this.isDestroyed) return;
            this.testimonialState.current = (this.testimonialState.current + 1) % this.testimonialState.total;
            showTestimonial(this.testimonialState.current);
        };

        // 初始顯示
        showTestimonial(this.testimonialState.current);

        // 自動播放
        this.startTestimonialAutoPlay(nextTestimonial);

        // 事件監聽
        this.setupTestimonialEvents(showTestimonial, nextTestimonial);
    }

    startTestimonialAutoPlay(nextTestimonial) {
        this.testimonialState.autoSlide = setInterval(nextTestimonial, this.config.autoSlideInterval);
        this.timers.add(this.testimonialState.autoSlide);
    }

    stopTestimonialAutoPlay() {
        if (this.testimonialState?.autoSlide) {
            clearInterval(this.testimonialState.autoSlide);
            this.timers.delete(this.testimonialState.autoSlide);
            this.testimonialState.autoSlide = null;
        }
    }

    setupTestimonialEvents(showTestimonial, nextTestimonial) {
        const testimonialSlider = document.querySelector('.testimonials-slider');
        if (!testimonialSlider) return;

        // 滑鼠懸停控制
        testimonialSlider.addEventListener('mouseenter', () => {
            this.stopTestimonialAutoPlay();
        });

        testimonialSlider.addEventListener('mouseleave', () => {
            this.startTestimonialAutoPlay(nextTestimonial);
        });

        // 指示器點擊事件
        const handleIndicatorClick = (e) => {
            if (e.target.classList.contains('testimonial-indicator')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                if (!isNaN(index)) {
                    this.testimonialState.current = index;
                    showTestimonial(this.testimonialState.current);
                    
                    // 重置自動播放
                    this.stopTestimonialAutoPlay();
                    this.startTestimonialAutoPlay(nextTestimonial);
                }
            }
        };

        document.addEventListener('click', handleIndicatorClick);
    }

    createTestimonialIndicators(count) {
        try {
            let indicatorsContainer = document.querySelector('.testimonial-indicators');
            
            if (!indicatorsContainer) {
                indicatorsContainer = document.createElement('div');
                indicatorsContainer.className = 'testimonial-indicators';
                indicatorsContainer.setAttribute('role', 'tablist');
                indicatorsContainer.setAttribute('aria-label', '客戶見證導航');
                
                const slider = document.querySelector('.testimonials-slider');
                if (slider?.parentNode) {
                    slider.parentNode.appendChild(indicatorsContainer);
                }
            }

            indicatorsContainer.innerHTML = '';

            for (let i = 0; i < count; i++) {
                const indicator = document.createElement('button');
                indicator.className = `testimonial-indicator ${i === 0 ? 'active' : ''}`;
                indicator.setAttribute('data-index', i);
                indicator.setAttribute('role', 'tab');
                indicator.setAttribute('aria-label', `見證 ${i + 1}`);
                indicator.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                indicatorsContainer.appendChild(indicator);
            }
        } catch (error) {
            console.error('創建見證指示器錯誤:', error);
        }
    }

    setupCompanyValues() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach((card, index) => {
            const valueObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isDestroyed) {
                        const timer = setTimeout(() => {
                            if (!this.isDestroyed) {
                                entry.target.classList.add('animate');
                            }
                        }, index * this.config.animationDelay);
                        this.timers.add(timer);
                        valueObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3
            });

            valueObserver.observe(card);

            // 互動效果
            this.setupValueCardInteraction(card);
        });
    }

    setupValueCardInteraction(card) {
        const handleMouseEnter = () => {
            card.style.transform = 'translateY(-15px) rotateY(5deg)';
            
            const icon = card.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        };

        const handleMouseLeave = () => {
            card.style.transform = 'translateY(0) rotateY(0deg)';
            
            const icon = card.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
    }

    setupCompanyHistory() {
        const historyItems = document.querySelectorAll('.history-item');
        
        historyItems.forEach(item => {
            const handleClick = () => {
                const isActive = item.classList.contains('active');
                
                // 關閉其他歷史項目
                historyItems.forEach(historyItem => {
                    historyItem.classList.remove('active');
                    historyItem.setAttribute('aria-expanded', 'false');
                });
                
                // 切換當前項目
                if (!isActive) {
                    item.classList.add('active');
                    item.setAttribute('aria-expanded', 'true');
                    
                    // 滾動到項目位置
                    const timer = setTimeout(() => {
                        if (!this.isDestroyed) {
                            item.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                        }
                    }, 100);
                    this.timers.add(timer);
                }
            };

            item.addEventListener('click', handleClick);
            
            // 鍵盤支援
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            });

            // 設定 ARIA 屬性
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-expanded', 'false');
        });
    }

    setupCompanyStats() {
        const statsSection = document.querySelector('.company-stats');
        if (!statsSection) return;

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isDestroyed) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach((statNumber, index) => {
                        const timer = setTimeout(() => {
                            if (!this.isDestroyed) {
                                this.animateStatNumber(statNumber);
                            }
                        }, index * this.config.animationDelay);
                        this.timers.add(timer);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        statsObserver.observe(statsSection);
        this.observers.set('stats', statsObserver);
    }

    animateStatNumber(element) {
        try {
            const finalValue = parseInt(element.getAttribute('data-value') || element.textContent);
            if (isNaN(finalValue)) return;

            const duration = 1500;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                if (this.isDestroyed) return;
                
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用 easeOutQuart 緩動函數
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(finalValue * easeProgress);
                
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = finalValue;
                    element.classList.add('stat-complete');
                }
            };
            
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('統計數字動畫錯誤:', error);
        }
    }

    // 錯誤處理
    handleError(error) {
        console.error('AboutPage 錯誤:', error);
        
        // 可選：顯示用戶友好的錯誤訊息
        if (typeof showToast === 'function') {
            showToast('頁面載入時發生錯誤，請重新整理頁面', 'error');
        }
    }

    // 清理資源
    destroy() {
        this.isDestroyed = true;
        
        // 清理 observers
        this.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        this.observers.clear();
        
        // 清理 timers
        this.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.timers.clear();
        
        // 停止見證自動播放
        this.stopTestimonialAutoPlay();
        
        console.log('AboutPage 資源已清理');
    }
}

// 導出預設實例建立函數
export function createAboutPage(options = {}) {
    return new AboutPage(options);
}

// 導出單例模式
let aboutPageInstance = null;

export function getAboutPageInstance(options = {}) {
    if (!aboutPageInstance) {
        aboutPageInstance = new AboutPage(options);
    }
    return aboutPageInstance;
}

// 頁面卸載時自動清理
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (aboutPageInstance) {
            aboutPageInstance.destroy();
            aboutPageInstance = null;
        }
    });
}
