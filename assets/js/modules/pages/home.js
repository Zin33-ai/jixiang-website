/**
 * 首頁特定功能模組
 */

import { showToast } from '../../utils/ui.js';
export class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupHeroSection();
        this.setupCounters();
        this.setupServiceCards();
        this.setupTestimonials();
        console.log('首頁功能已初始化');
    }

    setupHeroSection() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        // Hero 區域的特殊動畫
        this.animateHeroElements();
    }

    animateHeroElements() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');

        if (heroTitle) {
            setTimeout(() => {
                heroTitle.classList.add('fade-in', 'visible');
            }, 100);
        }

        if (heroSubtitle) {
            setTimeout(() => {
                heroSubtitle.classList.add('fade-in', 'visible');
            }, 300);
        }

        heroButtons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('fade-in', 'visible');
            }, 500 + (index * 200));
        });
    }

    setupCounters() {
        const counters = document.querySelectorAll('.counter[data-count]');
        if (counters.length === 0) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
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

    setupServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            // 滑鼠懸停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            });

            // 點擊追蹤
            card.addEventListener('click', () => {
                const serviceName = card.querySelector('.service-title')?.textContent;
                if (serviceName && typeof gtag !== 'undefined') {
                    gtag('event', 'service_card_click', {
                        event_category: 'engagement',
                        event_label: serviceName
                    });
                }
            });
        });
    }

    setupTestimonials() {
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (!testimonialSlider) return;

        // 如果有見證輪播，設定自動播放
        this.setupTestimonialSlider();
    }

    setupTestimonialSlider() {
        const slides = document.querySelectorAll('.testimonial-slide');
        if (slides.length <= 1) return;

        let currentSlide = 0;
        const slideInterval = 5000; // 5秒切換

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
                slide.style.opacity = i === index ? '1' : '0';
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };

        // 初始顯示第一張
        showSlide(currentSlide);

        // 自動播放
        setInterval(nextSlide, slideInterval);

        // 添加導航點
        this.createSliderDots(slides.length, currentSlide);
    }

    createSliderDots(slideCount, currentSlide) {
        const dotsContainer = document.querySelector('.slider-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';

        for (let i = 0; i < slideCount; i++) {
            const dot = document.createElement('button');
            dot.className = `slider-dot ${i === currentSlide ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                this.goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.slider-dot');

        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
            slide.style.opacity = i === index ? '1' : '0';
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}
