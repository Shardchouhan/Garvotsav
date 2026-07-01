/**
 * Garvotsav Tuition Classes - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Render shared footer
    const footer = document.querySelector('[data-site-footer]');
    if (footer) {
        const isNestedPage = location.pathname.includes('/pages/');
        const pathPrefix = isNestedPage ? '../' : '';
        const pagePrefix = isNestedPage ? '' : 'pages/';
        footer.innerHTML = `
            <div class="container">
                <div class="footer-main">
                    <div class="footer-brand">
                        <div>
                            <a class="navbar-brand mb-3" href="${pathPrefix}index.html">
                                <i class="fa-solid fa-graduation-cap text-primary-accent"></i>
                                Garvotsav Tuition Classes
                            </a>
                            <p class="text-muted mb-0">Garvotsav Tuition Classes provides quality Mathematics and Science coaching for Classes 8, 9, and 10 with experienced teachers and result-oriented learning.</p>
                        </div>
                        <div class="social-icons">
                            <a class="whatsapp-link" href="https://wa.me/919828635378" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                <i class="fa-brands fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>

                    <div class="footer-links">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><a href="${pathPrefix}index.html">Home</a></li>
                            <li><a href="${pagePrefix}about.html">About</a></li>
                            <li><a href="${pagePrefix}courses.html">Courses</a></li>
                            <li><a href="${pagePrefix}contact.html">Contact</a></li>
                        </ul>
                    </div>

                    <div class="footer-links">
                        <h5>Courses</h5>
                        <ul>
                            <li><a href="${pagePrefix}courses.html#grade8">Class 8 Mathematics</a></li>
                            <li><a href="${pagePrefix}courses.html#grade8">Class 8 Science</a></li>
                            <li><a href="${pagePrefix}courses.html#grade9">Class 9 Mathematics</a></li>
                            <li><a href="${pagePrefix}courses.html#grade9">Class 9 Science</a></li>
                            <li><a href="${pagePrefix}courses.html#grade10">Class 10 Mathematics</a></li>
                            <li><a href="${pagePrefix}courses.html#grade10">Class 10 Science</a></li>
                        </ul>
                    </div>

                    <div class="footer-links footer-contact">
                        <h5>Contact Information</h5>
                        <ul>
                            <li>
                                <i class="fa-solid fa-location-dot"></i>
                                <a href="https://maps.app.goo.gl/ACLhyN8BBNVjornv9" target="_blank" rel="noopener noreferrer">Garvotsav Computers And Tuition Classes, Sani Gaon, Mount Abu, Rajasthan 307501</a>
                            </li>
                            <li>
                                <i class="fa-solid fa-phone"></i>
                                <a href="tel:+919828635378">+91 98286 35378</a>
                            </li>
                            <li>
                                <i class="fa-solid fa-envelope"></i>
                                <a href="mailto:info@garvotsav.com">info@garvotsav.com</a>
                            </li>
                            <li>
                                <i class="fa-solid fa-clock"></i>
                                <span>Monday - Saturday<br>8:00 AM - 8:00 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <p class="mb-0">&copy; 2026 Garvotsav Tuition Classes. All Rights Reserved.</p>
                </div>
            </div>
        `;
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
