/**
 * Garvotsav Tuition Classes - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    const renderFooterTemplate = (template, pathPrefix, pagePrefix) => {
        return template
            .replaceAll('{{pathPrefix}}', pathPrefix)
            .replaceAll('{{pagePrefix}}', pagePrefix);
    };

    // Render shared footer from components/footer.js
    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
        const isNestedPage = location.pathname.includes('/pages/');
        const pathPrefix = isNestedPage ? '../' : '';
        const pagePrefix = isNestedPage ? '' : 'pages/';
        const renderFooter = () => {
            if (window.GARVOTSAV_FOOTER_TEMPLATE) {
                footer.innerHTML = renderFooterTemplate(window.GARVOTSAV_FOOTER_TEMPLATE, pathPrefix, pagePrefix);
            }
        };

        if (window.GARVOTSAV_FOOTER_TEMPLATE) {
            renderFooter();
        } else {
            const footerScript = document.createElement('script');
            footerScript.src = `${pathPrefix}components/footer.js?v=${Date.now()}`;
            footerScript.onload = renderFooter;
            document.head.appendChild(footerScript);
        }
    }

    // 1. Initialize AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            offset: 50
        });
    }

    // 2. Navbar Glass Effect on Scroll
    const navbar = document.querySelector('.navbar-glass');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 3. Active Nav Link based on URL
    const currentLocation = location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentLocation || (currentLocation === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 4. Counter Animation (for achievements/stats)
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                    // Add '+' if specified
                    if(counter.hasAttribute('data-plus')) {
                        counter.innerText += '+';
                    } else if (counter.hasAttribute('data-percent')) {
                        counter.innerText += '%';
                    }
                }
            };
            
            // Only animate when visible
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) {
                    updateCounter();
                    observer.disconnect();
                }
            });
            observer.observe(counter);
        });
    };
    
    if (counters.length > 0) {
        animateCounters();
    }

});

/**
 * Utility functions for rendering Google Apps Script Data
 */

// Show loading skeleton/spinner
const showLoader = (containerId) => {
    const container = document.getElementById(containerId);
    if(container) {
        container.innerHTML = `<div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
    }
};

// Render error message
const showError = (containerId, message = "Failed to load data") => {
    const container = document.getElementById(containerId);
    if(container) {
        container.innerHTML = `<div class="alert alert-danger glass-panel text-center" role="alert">${message}</div>`;
    }
};
