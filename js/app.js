/*  ============================================================
    Portfolio App — Tyler Carpenter
    
    Table of Contents:
    1.  Theme Toggle
    2.  Mobile Navigation
    3.  Scroll Spy (updates active nav dot as user scrolls)
    4.  Smooth Scroll (handles nav dot and mobile link clicks)
    5.  Scroll Animations (fade-up on section entry)
    6.  Init (runs everything on DOMContentLoaded)
    ============================================================ */


/* ============================================================
   1. THEME TOGGLE
   - Reads saved preference from localStorage on load
   - Toggles data-theme attribute on <html>
   - Saves preference so it persists between visits
============================================================ */

function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    const html   = document.documentElement;

    /* Toggle data-theme between dark and light on each click.
       localStorage removed — blocked by Firefox on file:// protocol. 
       When hosted on GitHub Pages, localStorage can be safely re-added. */
    toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
    });
}


/* ============================================================
   2. MOBILE NAVIGATION
   - Hamburger button toggles the full-screen overlay menu
   - Clicking any mobile link closes the menu and scrolls to section
   - Escape key also closes the menu
============================================================ */

function initMobileNav() {
    const hamburger  = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    /* Toggle menu open/closed */
    function toggleMenu(forceClose = false) {
        const isOpen = hamburger.classList.contains('open');

        if (forceClose || isOpen) {
            /* Close */
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';   /* re-enable scroll */
        } else {
            /* Open */
            hamburger.classList.add('open');
            mobileMenu.classList.add('open');
            hamburger.setAttribute('aria-expanded', 'true');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';  /* lock scroll behind menu */
        }
    }

    hamburger.addEventListener('click', () => toggleMenu());

    /* Close menu when a link is clicked */
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    /* Close menu on Escape key */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(true);
    });
}


/* ============================================================
   3. SCROLL SPY
   - Uses IntersectionObserver to watch all sections
   - When a section is >= 40% visible, marks its nav dot as active
   - Much more reliable than calculating scroll position manually
============================================================ */

function initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navDots  = document.querySelectorAll('.nav-dot');

    /* Map each section id to its corresponding nav dot */
    function getNavDotForSection(sectionId) {
        return document.querySelector(`.nav-dot[href="#${sectionId}"]`);
    }

    /* Remove active from all dots, then set the correct one */
    function setActiveDot(sectionId) {
        navDots.forEach(dot => dot.classList.remove('active'));
        const activeDot = getNavDotForSection(sectionId);
        if (activeDot) activeDot.classList.add('active');
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveDot(entry.target.id);
            }
        });
    }, {
        /* Fire when 40% of the section is visible.
           Lowering this value makes the switch happen earlier. */
        threshold: 0.4
    });

    sections.forEach(section => observer.observe(section));
}


/* ============================================================
   4. SMOOTH SCROLL
   - Handles clicks on side nav dots and mobile menu links
   - Uses native smooth scroll behavior (already set in CSS)
   - Prevents default anchor jump and offsets for any fixed headers
============================================================ */

function initSmoothScroll() {
    /* Select both nav dots and mobile links */
    const allNavLinks = document.querySelectorAll('.nav-dot, .mobile-link');

    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href');   /* e.g. "#about" */
            const target   = document.querySelector(targetId);

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* Also handle in-page buttons like the "Get In Touch" hero CTA */
    const inPageButtons = document.querySelectorAll('a[href^="#"]');
    inPageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('href');

            /* Skip if it's already handled above or is just "#" */
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}


/* ============================================================
   5. SCROLL ANIMATIONS
   - Adds .fade-up class to animatable elements on page load
   - IntersectionObserver adds .visible when element enters viewport
   - CSS handles the actual transition (see styles.css section 16)
   - staggerDelay applies increasing delays to children of a parent
============================================================ */

function initScrollAnimations() {

    /* Elements to animate — add selectors here as needed */
    const animatableSelectors = [
        '.section-header',
        '.about-text',
        '.about-facts',
        '.fact-item',
        '.timeline-item',
        '.skill-category',
        '.credential-card',
        '.project-card',
        '.contact-content'
    ];

    /* Gather all matching elements */
    const animatables = document.querySelectorAll(animatableSelectors.join(', '));

    /* Apply base class — elements start invisible */
    animatables.forEach(el => el.classList.add('fade-up'));

    /* Apply stagger delays to card-type siblings */
    const staggerParents = [
        '.about-facts',
        '.credentials-grid',
        '.projects-grid',
        '.skills-grid',
        '.timeline'
    ];

    staggerParents.forEach(parentSelector => {
        const parent = document.querySelector(parentSelector);
        if (!parent) return;

        /* Get direct children that are animatable */
        const children = parent.querySelectorAll('.fade-up');
        children.forEach((child, index) => {
            /* Cap at delay-5 so nothing waits too long */
            const delayClass = `delay-${Math.min(index + 1, 5)}`;
            child.classList.add(delayClass);
        });
    });

    /* Observer triggers .visible when element is 15% in view */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                /* Stop observing once animated — no need to re-trigger */
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    animatables.forEach(el => observer.observe(el));
}


/* ============================================================
   6. EMAIL COPY INTERACTION
   - Clicking the email contact item copies it to clipboard
   - Shows a brief "Copied!" confirmation in place of the address
   - Purely a nice-to-have UX touch
============================================================ */

function initEmailCopy() {
    /* Find the email contact-item anchor */
    const emailItem = document.querySelector('a[href^="mailto:"]');
    if (!emailItem) return;

    const emailText  = emailItem.querySelector('span');
    const original   = emailText ? emailText.textContent : '';

    emailItem.addEventListener('click', (e) => {
        e.preventDefault();

        navigator.clipboard.writeText(original).then(() => {
            if (emailText) {
                emailText.textContent = 'Copied to clipboard!';
                emailItem.style.color = 'var(--accent)';

                /* Reset after 2 seconds */
                setTimeout(() => {
                    emailText.textContent = original;
                    emailItem.style.color = '';
                }, 2000);
            }
        }).catch(() => {
            /* Fallback — just open the mailto if clipboard fails */
            window.location.href = emailItem.href;
        });
    });
}


/* ============================================================
   6. INIT
   - Wait for the DOM to be fully loaded, then run everything
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileNav();
    initScrollSpy();
    initSmoothScroll();
    initScrollAnimations();
    initEmailCopy();
});