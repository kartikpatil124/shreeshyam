const manufacturedProducts = [
    { id: 1, title: 'Banquet Table', price: '₹4,500', img: 'assets/images/mandap_banquet_table_1772216245134.png' },
    { id: 2, title: 'Round Table', price: '₹5,200', img: 'assets/images/round_table_1772216265086.png' },
    { id: 3, title: 'Mandap Truss Layer', price: '₹35,000', img: 'assets/images/mandap_truss_1772216283922.png' },
    { id: 4, title: 'Ladder (Ghoda)', price: '₹2,800', img: 'assets/images/mandap_ladder_1772216299004.png' },
    { id: 5, title: 'Stage Reling', price: '₹8,500', img: 'assets/images/reling_1772216313324.png' },
    { id: 6, title: 'Grand Entry Gate', price: '₹45,000', img: 'assets/images/entry_gate_1772216328378.png' },
    { id: 7, title: 'Mandap Seedhi', price: '₹12,000', img: 'assets/images/mandap_seedhi_1772216350803.png' }
];

const tradedProducts = [
    { id: 8, title: 'Melamine Dish Set', price: '₹1,200', img: 'assets/images/melamine_dish_1772216365961.png' },
    { id: 9, title: 'Luxury Sofa', price: '₹25,000', img: 'assets/images/sofa_1772216382565.png' },
    { id: 10, title: 'Event Flooring (sq.ft)', price: '₹85', img: 'assets/images/flooring_1772216397539.png' },
    { id: 11, title: 'Banquet Chairs', price: '₹1,500', img: 'assets/images/chair_1772216412096.png' }
];

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Product Injection --- //
    const renderProducts = (products, containerId) => {
        const container = document.getElementById(containerId);
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-tilt', ''); // for vanilla-tilt
            card.setAttribute('data-tilt-max', '5');
            card.setAttribute('data-tilt-speed', '400');
            card.setAttribute('data-tilt-glare', 'true');
            card.setAttribute('data-tilt-max-glare', '0.2');

            card.innerHTML = `
                <div class="product-img">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${p.title}</h3>
                </div>
                <button class="detail-btn" data-title="${p.title}" data-img="${p.img}">
                    For More Detail <i class="ri-information-line"></i>
                </button>
            `;
            container.appendChild(card);
        });
    };

    renderProducts(manufacturedProducts, 'manufactured-grid');
    renderProducts(tradedProducts, 'traded-grid');

    // Initialize vanilla-tilt for newly added items
    if (window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll(".product-card"));
    }

    // --- 2. Advanced GSAP Preloader & Lenis --- //
    gsap.registerPlugin(ScrollTrigger);

    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // Preloader Animation
    const preloaderAnim = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove('loading');
                initHeroAnim();
            }
        });

        tl.to('.loader-text span', {
            y: '0%', duration: 0.8, stagger: 0.1, ease: 'power4.out', delay: 0.2
        })
            .to('.loader-text span', {
                y: '-100%', duration: 0.6, stagger: 0.05, ease: 'power3.in', delay: 0.5
            })
            .to('.preloader', {
                yPercent: -100, duration: 1, ease: 'expo.inOut'
            }, "-=0.2");

        return tl;
    };
    preloaderAnim();

    // Hero Animation
    function initHeroAnim() {
        gsap.from('.reveal-text', {
            y: 200, opacity: 0, duration: 1.5, stagger: 0.2,
            ease: 'power4.out'
        });
        gsap.from('.hero-subtitle', {
            opacity: 0, y: 30, duration: 1, delay: 0.8, ease: 'power3.out'
        });
        gsap.from('.hero-buttons', {
            opacity: 0, y: 30, duration: 1, delay: 1, ease: 'power3.out'
        });
        gsap.from('.navbar', {
            y: -100, opacity: 0, duration: 1, delay: 1, ease: 'power3.out'
        });
    }

    // --- 3. Scroll Interactions --- //

    // Navbar Background Change on Scroll
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (window.innerWidth > 600) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 });
            gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
        });

        document.querySelectorAll('a, button, .product-card').forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => follower.classList.remove('cursor-hover'));
        });
    }

    // Section Animations (ScrollTriggers)
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
            },
            y: 50, opacity: 0, duration: 1, ease: "power3.out"
        });
    });

    gsap.to(".parallax-bg", {
        scrollTrigger: {
            trigger: ".parallax-divider",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        y: "20%",
        ease: "none"
    });

    // --- 4. Modal Functionality --- //
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalImage = document.getElementById('modalProductImage');
    const modalTitle = document.getElementById('modalProductTitle');

    const toggleModal = (isOpen) => {
        if (isOpen) {
            contactModal.classList.add('open');
            lenis.stop(); // Pause scrolling when modal is open
        } else {
            contactModal.classList.remove('open');
            lenis.start();
        }
    };

    closeModalBtn.addEventListener('click', () => toggleModal(false));
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) toggleModal(false);
    });

    // Detail button click
    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const el = e.currentTarget;
            const title = el.getAttribute('data-title');
            const img = el.getAttribute('data-img');

            modalImage.src = img;
            modalTitle.innerText = title;

            // Button animation feedback
            gsap.to(el, {
                scale: 0.95, duration: 0.1, yoyo: true, repeat: 1,
                onComplete: () => {
                    toggleModal(true);
                }
            });
        });
    });
});
