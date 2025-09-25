document.addEventListener('DOMContentLoaded', () => {

    // --- אפקטים ואנימציות כלליות ---

    // Preloader עם אנימציית Fade-Out
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loaderWrapper.style.opacity = '0';
                loaderWrapper.addEventListener('transitionend', () => loaderWrapper.remove());
            }, 800);
        });
    }

    // אתחול AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1200,
            once: true,
            offset: 150,
        });
    }

    // Sparkles
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.left = `${Math.random() * 100}%`;
        const size = Math.random() * 3 + 1;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        document.getElementById('sparkles-container').appendChild(sparkle);
    }
    const sparklesContainer = document.getElementById('sparkles-container');
    if (sparklesContainer) {
        for (let i = 0; i < 50; i++) createSparkle();
    }

    // --- פונקציות ניווט ואינטראקציה ---

    // Hamburger Menu
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('change', () => {
            if (navToggle.checked) {
                navLinks.classList.add('active');
            } else {
                navLinks.classList.remove('active');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.checked = false;
                navLinks.classList.remove('active');
            });
        });
    }

    // Navbar Sticky
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            siteHeader.classList.toggle('scrolled', window.scrollY > 80);
        });
    }

    // Scroll-to-Top
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) {
        window.addEventListener('scroll', () => {
            scrollButton.classList.toggle('visible', window.scrollY > 300);
        });
        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- אינטראקציות עם תוכן דינמי ---

    // Accordion FAQ
    document.querySelectorAll('.faq summary').forEach(summary => {
        summary.addEventListener('click', (event) => {
            const parentDetails = summary.parentElement;
            if (parentDetails.hasAttribute('open')) {
                event.preventDefault(); // מונע סגירה אוטומטית
                parentDetails.removeAttribute('open');
            } else {
                document.querySelectorAll('.faq[open]').forEach(openFaq => {
                    openFaq.removeAttribute('open');
                });
            }
        });
    });

    // Accordion Grid
    document.querySelectorAll('.accordion-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const accordionItem = toggle.closest('.accordion-item');
            const accordionContent = accordionItem.querySelector('.accordion-content');
            const isActive = accordionItem.classList.contains('active');

            // סגור את כל שאר הפריטים
            document.querySelectorAll('.accordion-item.active').forEach(otherItem => {
                if (otherItem !== accordionItem) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // פתח או סגור את הפריט הנוכחי
            accordionItem.classList.toggle('active', !isActive);
            accordionContent.style.maxHeight = isActive ? null : `${accordionContent.scrollHeight}px`;
        });
    });

    // Counter
    const counters = document.querySelectorAll('.counter');
    const animateCounter = (element) => {
        const target = +element.dataset.target;
        const speed = +element.dataset.speed || 200;
        let count = 0;
        const increment = target / speed;

        const updateCount = () => {
            if (count < target) {
                count += increment;
                element.textContent = Math.ceil(count);
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        };
        updateCount();
    };
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));

    // Swiper לפרויקטים ועדויות
    if (typeof Swiper !== 'undefined') {
        new Swiper('.mySwiper', {
            slidesPerView: 1, spaceBetween: 30, loop: true, grabCursor: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            autoplay: { delay: 3500, disableOnInteraction: false },
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
        new Swiper('.testimonials-swiper', {
            slidesPerView: 1, spaceBetween: 30, loop: true, grabCursor: true,
            autoplay: { delay: 4000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
    }

    // On-Scroll fade-in
    const fadeInElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    fadeInElements.forEach(el => fadeObserver.observe(el));


    // --- טיפול בטפסים ובמודאל ---

    // פונקציית פתיחת מודאל
    window.openModal = async function(projectId) {
        const modal = document.getElementById("project-modal");
        const modalTitle = document.getElementById("modal-title");
        const modalSubtitle = document.getElementById("modal-subtitle");
        const modalProjectDetails = document.getElementById("modal-project-details");

        try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (!response.ok) {
                throw new Error('Project not found');
            }
            const data = await response.json();

            // Clear previous content
            if (modalTitle) modalTitle.innerHTML = '';
            if (modalSubtitle) modalSubtitle.innerHTML = '';
            if (modalProjectDetails) modalProjectDetails.innerHTML = '';

            // Populate with new data
            if (modalTitle) modalTitle.textContent = data.title;
            if (modalSubtitle) modalSubtitle.textContent = data.subtitle;

            if (modalProjectDetails) {
                const detailsHtml = `
                    <p class="modal-description">${data.description}</p>
                    <div class="modal-info">
                        <p><strong><i class="fa-solid fa-location-dot"></i> כתובת:</strong> ${data.address}</p>
                        <p><strong><i class="fa-solid fa-compass-drafting"></i> אדריכל:</strong> ${data.architect}</p>
                    </div>
                    <h4>מה כולל הפרויקט?</h4>
                    <ul class="modal-details-list">
                        ${data.details.map(item => `<li><i class="fa-solid fa-check"></i> ${item}</li>`).join('')}
                    </ul>
                `;
                modalProjectDetails.innerHTML = detailsHtml;
            }

            if (modal) modal.classList.add("open");
        } catch (error) {
            console.error("Error fetching project data:", error);
            alert("אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.");
        }
    }

    // סגירת מודאל
    const modal = document.getElementById("project-modal");
    if (modal) {
        const closeModalBtn = document.getElementById("close-modal-btn");
        if (closeModalBtn) {
            closeModalBtn.onclick = () => modal.classList.remove("open");
        }
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.classList.remove("open");
            }
        };
    }

    // שליחת טופס יצירת קשר לשרת
    const form = document.getElementById('contactForm');
    const statusMessage = document.getElementById('statusMessage');

    // מנע שליחה כפולה אם הטופס נשלח כבר
    if (form && statusMessage) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            // מנע שליחה כפולה
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }

            statusMessage.textContent = 'שולח...';
            statusMessage.className = 'status-message loading';

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    statusMessage.textContent = '✅ הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.';
                    statusMessage.className = 'status-message success';
                    form.reset();
                } else {
                    statusMessage.textContent = result.message || '❌ אירעה שגיאה בשליחת הפנייה.';
                    statusMessage.className = 'status-message error';
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                statusMessage.textContent = '⚠️ בעיה בחיבור לשרת. נסה שוב מאוחר יותר.';
                statusMessage.className = 'status-message error';
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                setTimeout(() => statusMessage.classList.add('hidden'), 5000);
            }
        });
    }

});
