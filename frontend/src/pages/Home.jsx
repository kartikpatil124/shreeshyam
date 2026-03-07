import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const manufacturedProducts = [
    { id: 1, title: 'Banquet Table', price: '₹4,500', img: '/assets/images/mandap_banquet_table_1772216245134.png' },
    { id: 2, title: 'Round Table', price: '₹5,200', img: '/assets/images/round_table_1772216265086.png' },
    { id: 3, title: 'Mandap Truss Layer', price: '₹35,000', img: '/assets/images/mandap_truss_1772216283922.png' },
    { id: 4, title: 'Ladder (Ghoda)', price: '₹2,800', img: '/assets/images/mandap_ladder_1772216299004.png' },
    { id: 5, title: 'Stage Reling', price: '₹8,500', img: '/assets/images/reling_1772216313324.png' },
    { id: 6, title: 'Grand Entry Gate', price: '₹45,000', img: '/assets/images/entry_gate_1772216328378.png' },
    { id: 7, title: 'Mandap Seedhi', price: '₹12,000', img: '/assets/images/mandap_seedhi_1772216350803.png' }
];

const tradedProducts = [
    { id: 8, title: 'Melamine Dish Set', price: '₹1,200', img: '/assets/images/melamine_dish_1772216365961.png' },
    { id: 9, title: 'Luxury Sofa', price: '₹25,000', img: '/assets/images/sofa_1772216382565.png' },
    { id: 10, title: 'Event Flooring (sq.ft)', price: '₹85', img: '/assets/images/flooring_1772216397539.png' },
    { id: 11, title: 'Banquet Chairs', price: '₹1,500', img: '/assets/images/chair_1772216412096.png' }
];

function ProductCard({ product, onDetail }) {
    return (
        <div className="product-card">
            <div className="product-img">
                <img src={product.img} alt={product.title} loading="lazy" />
            </div>
            <div className="product-info">
                <h3>{product.title}</h3>
            </div>
            <button className="detail-btn" onClick={() => onDetail(product)}>
                For More Detail <i className="ri-information-line" />
            </button>
        </div>
    );
}

function ProductModal({ product, onClose }) {
    if (!product) return null;
    return (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <button className="close-modal" onClick={onClose}><i className="ri-close-line" /></button>
                <div className="modal-body">
                    <div className="modal-image">
                        <img src={product.img} alt={product.title} loading="lazy" />
                    </div>
                    <div className="modal-info">
                        <h3>{product.title}</h3>
                        <p className="modal-desc">Interested in this product? Get in touch with us for more details, bulk pricing, and custom requirements.</p>
                        <div className="contact-options">
                            <a href="tel:+919998777474" className="modal-contact-btn btn-phone">
                                <i className="ri-phone-line" /> +91 9998777474
                            </a>
                            <a href="https://wa.me/919998777474" target="_blank" rel="noopener noreferrer" className="modal-contact-btn btn-whatsapp">
                                <i className="ri-whatsapp-line" /> WhatsApp Us
                            </a>
                            <a href="mailto:sandeep.patil3100@gmail.com" className="modal-contact-btn btn-email">
                                <i className="ri-mail-line" /> Email Inquiry
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [preloaderDone, setPreloaderDone] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => {
        // Simulate preloader
        const timer = setTimeout(() => {
            setPreloaderDone(true);
            document.body.classList.remove('loading');
        }, 2000);
        document.body.classList.add('loading');
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!preloaderDone) return;

        // Dynamic GSAP import
        const loadGsap = async () => {
            try {
                const gsapModule = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm');
                const gsap = gsapModule.default || gsapModule.gsap;

                const stModule = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm');
                const ScrollTrigger = stModule.default || stModule.ScrollTrigger;
                gsap.registerPlugin(ScrollTrigger);

                // Hero animation
                gsap.from('.reveal-text', { y: 200, opacity: 0, duration: 1.5, stagger: 0.2, ease: 'power4.out' });
                gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.8, ease: 'power3.out' });
                gsap.from('.hero-buttons', { opacity: 0, y: 30, duration: 1, delay: 1, ease: 'power3.out' });

                // Section titles
                document.querySelectorAll('.home-section-title').forEach(title => {
                    gsap.from(title, {
                        scrollTrigger: { trigger: title, start: 'top 80%' },
                        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
                    });
                });

                // Parallax
                const parallaxBg = document.querySelector('.parallax-bg');
                if (parallaxBg) {
                    gsap.to('.parallax-bg', {
                        scrollTrigger: { trigger: '.parallax-divider', start: 'top bottom', end: 'bottom top', scrub: true },
                        y: '20%', ease: 'none'
                    });
                }
            } catch (err) {
                console.warn('GSAP load failed, animations skipped:', err);
            }
        };
        loadGsap();
    }, [preloaderDone]);

    return (
        <>
            {/* Preloader */}
            {!preloaderDone && (
                <div className="preloader">
                    <div className="loader-text">
                        {'SHREESHYAM'.split('').map((c, i) => (
                            <span key={i} style={{ animation: `preloaderChar 0.8s ease-out forwards ${0.2 + i * 0.1}s` }}>{c}</span>
                        ))}
                    </div>
                </div>
            )}

            <Navbar />

            <main>
                {/* Hero Section */}
                <section id="home" className="hero" ref={heroRef}>
                    <div className="hero-bg" />
                    <div className="hero-content">
                        <h1 className="hero-title">
                            <span className="reveal-text">ELEVATING</span>
                            <span className="reveal-text highlight">EVENTS</span>
                            <span className="reveal-text">FOREVER.</span>
                        </h1>
                        <p className="hero-subtitle">Premium manufacturers of banquet and mandap setups. Trading the finest event goods.</p>
                        <div className="hero-buttons">
                            <a href="#manufactured" className="btn btn-primary"><span>Explore Collection</span> <i className="ri-arrow-right-up-line" /></a>
                            <a href="#contact" className="btn btn-secondary"><span>Contact Us</span></a>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <p>Scroll to unwrap</p>
                        <div className="mouse"><div className="wheel" /></div>
                    </div>
                </section>

                {/* Marquee */}
                <section className="marquee-section">
                    <div className="marquee-inner">
                        <span>MANDAP SETUPS • BANQUET TABLES • EVENT SUPPLIES • LUXURY SOFAS • PREMIUM FLOORING • </span>
                        <span>MANDAP SETUPS • BANQUET TABLES • EVENT SUPPLIES • LUXURY SOFAS • PREMIUM FLOORING • </span>
                        <span>MANDAP SETUPS • BANQUET TABLES • EVENT SUPPLIES • LUXURY SOFAS • PREMIUM FLOORING • </span>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="about">
                    <div className="about-container">
                        <div className="about-flex">
                            <div className="about-text">
                                <h2 className="section-title home-section-title">Crafting <br /> <span className="gradient-text">Masterpieces</span></h2>
                                <p>At Shree Shyam Steel, we visualize, craft, and engineer the core structures that turn simple gatherings into majestic celebrations. From robust mandap trusses to elegant entry gates, our manufacturing speaks precision. We also curate premium trading goods like melamine dishes and luxury seating to complete your vision.</p>
                                <div className="stats-container">
                                    <div className="stat">
                                        <h3 className="stat-number">20+</h3>
                                        <p className="stat-label">Years of Mastery</p>
                                    </div>
                                    <div className="stat">
                                        <h3 className="stat-number">10K+</h3>
                                        <p className="stat-label">Events Elevated</p>
                                    </div>
                                </div>
                            </div>
                            <div className="about-image">
                                <div className="image-wrapper">
                                    <img src="/assets/images/entry_gate_1772216328378.png" alt="Grand Entry Gate" loading="lazy" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Manufactured Products */}
                <section id="manufactured" className="products-section dark-section">
                    <div className="section-header">
                        <h2 className="section-title home-section-title">Our <span className="outline-text">Manufactured</span> Core</h2>
                        <p>Engineered for strength, designed for grace. The robust foundation of your grand events.</p>
                    </div>
                    <div className="products-grid">
                        {manufacturedProducts.map(p => (
                            <ProductCard key={p.id} product={p} onDetail={setSelectedProduct} />
                        ))}
                    </div>
                </section>

                {/* Parallax Divider */}
                <section className="parallax-divider">
                    <div className="parallax-bg" style={{ backgroundImage: "url('/assets/images/flooring_1772216397539.png')" }} />
                    <div className="parallax-content">
                        <h2>BEYOND BOUNDARIES</h2>
                        <p>Providing end-to-end setups to build memories.</p>
                    </div>
                </section>

                {/* Traded Products */}
                <section id="traded" className="products-section light-section">
                    <div className="section-header">
                        <h2 className="section-title home-section-title">Curated <span className="gradient-text">Trading</span> Goods</h2>
                        <p>Finishing touches sourced to perfection. Dining, seating, and ambiance essentials.</p>
                    </div>
                    <div className="products-grid">
                        {tradedProducts.map(p => (
                            <ProductCard key={p.id} product={p} onDetail={setSelectedProduct} />
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="footer">
                    <div className="footer-top">
                        <div className="footer-cta">
                            <h2>READY TO BUILD<br />A <span className="highlight">LEGACY?</span></h2>
                            <a href="mailto:sandeep.patil3100@gmail.com" className="huge-btn">Let's Talk <i className="ri-arrow-right-line" /></a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="footer-col brand-col">
                            <a href="#" className="footer-logo">Shree Shyam <span>Steel</span></a>
                            <p>Pioneers in banquet & event setups globally.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Navigate</h4>
                            <a href="#home">Home</a>
                            <a href="#about">About</a>
                            <a href="#manufactured">Manufacturing</a>
                            <a href="#traded">Trading</a>
                        </div>
                        <div className="footer-col">
                            <h4>Connect</h4>
                            <a href="#">Instagram</a>
                            <a href="#">Facebook</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">Twitter</a>
                        </div>
                        <div className="footer-col">
                            <h4>Address</h4>
                            <p>123 Steel Avenue, Industrial Phase I</p>
                            <p>New Delhi, India 110020</p>
                            <p>+91 9998777474</p>
                        </div>
                    </div>
                    <div className="footer-copyright">
                        <p>&copy; 2026 Shree Shyam Steel. Designed for the Future.</p>
                    </div>
                </footer>
            </main>

            <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
    );
}
