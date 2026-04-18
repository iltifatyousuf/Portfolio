/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DARK GLASSMORPHISM â€” Premium Interactions Engine
   Mouse-tracking glow, magnetic buttons, parallax,
   staggered reveals, luminous skill bars
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

(function () {
'use strict';

// â”€â”€ Utilities â”€â”€
const raf = requestAnimationFrame;
const lerp = (a, b, t) => a + (b - a) * t;
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 1. SCROLL PROGRESS â€” Glowing gradient bar
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const scrollBar = document.querySelector('.scroll-progress');
function updateScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar && h > 0) scrollBar.style.width = (window.scrollY / h * 100) + '%';
}
window.addEventListener('scroll', updateScroll, { passive: true });

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2. NAVBAR â€” Scroll state
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3. MOBILE MENU
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const mobileBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-overlay');

function toggleMobile() {
    const open = mobileMenu.classList.toggle('active');
    mobileBtn.classList.toggle('active', open);
    mobileOverlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
}
if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleMobile);
    mobileOverlay?.addEventListener('click', toggleMobile);
    document.querySelectorAll('.mobile-nav-links a').forEach(a =>
        a.addEventListener('click', () => { if (mobileMenu.classList.contains('active')) toggleMobile(); })
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 4. DYNAMIC HOVER GLOW â€” Mouse tracking on glass cards
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const glowCards = document.querySelectorAll('.glass-card');

glowCards.forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--glow-x', x + 'px');
        card.style.setProperty('--glow-y', y + 'px');
    });
    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--glow-x', '-200px');
        card.style.setProperty('--glow-y', '-200px');
    });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 5. MAGNETIC BUTTONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');

magneticBtns.forEach(btn => {
    let bx = 0, by = 0, tx = 0, ty = 0;
    let animId = null;

    function animate() {
        bx = lerp(bx, tx, 0.15);
        by = lerp(by, ty, 0.15);
        btn.style.transform = `translate(${bx}px, ${by}px)`;
        if (Math.abs(bx - tx) > 0.1 || Math.abs(by - ty) > 0.1) {
            animId = raf(animate);
        }
    }

    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        tx = (e.clientX - cx) * 0.25;
        ty = (e.clientY - cy) * 0.25;
        // Inner glow position for primary buttons
        btn.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        btn.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
        if (!animId) animId = raf(animate);
    });

    btn.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!animId) animId = raf(animate);
        // Clean up once settled
        setTimeout(() => { cancelAnimationFrame(animId); animId = null; }, 400);
    });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 6. STAGGERED SCROLL REVEALS â€” Intersection Observer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            // Find siblings in the same parent to stagger
            const parent = el.parentElement;
            const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [el];
            const idx = siblings.indexOf(el);
            const stagger = idx >= 0 ? idx : 0;

            el.style.transitionDelay = (stagger * 0.08) + 's';
            el.classList.add('visible');
            revealObserver.unobserve(el);
        }
    });
}, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 7. LUMINOUS SKILL BARS â€” Animate on scroll
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const skillBars = document.querySelectorAll('.skill-bar-fill');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const w = bar.getAttribute('data-width');
            if (w) {
                bar.style.width = w;
                // Trigger glowing tip after animation
                setTimeout(() => bar.classList.add('animated'), 1200);
            }
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.2 });

skillBars.forEach(bar => skillObserver.observe(bar));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 8. STAT COUNTER ANIMATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const statEls = document.querySelectorAll('.stat-value');

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.textContent);
            const suffix = el.getAttribute('data-suffix') || '';
            if (isNaN(target)) return;
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 45));
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = current + suffix;
            }, 30);
            statObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statEls.forEach(el => statObserver.observe(el));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 9. PARALLAX BACKGROUND â€” Mouse + Scroll
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const orbs = document.querySelectorAll('.bg-orb');
let orbOffsets = [];
orbs.forEach(() => orbOffsets.push({ x: 0, y: 0, tx: 0, ty: 0 }));

function updateParallax() {
    const scrollY = window.scrollY;
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const nx = (mouseX / ww - 0.5) * 2;  // -1 to 1
    const ny = (mouseY / wh - 0.5) * 2;

    orbs.forEach((orb, i) => {
        const depth = (i + 1) * 12;
        const scrollShift = scrollY * (i + 1) * 0.015;
        const o = orbOffsets[i];

        o.tx = nx * depth;
        o.ty = ny * depth - scrollShift;
        o.x = lerp(o.x, o.tx, 0.04);
        o.y = lerp(o.y, o.ty, 0.04);

        orb.style.transform = `translate(${o.x}px, ${o.y}px)`;
    });

    raf(updateParallax);
}
if (orbs.length) raf(updateParallax);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 10. TYPED EFFECT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const typedEl = document.getElementById('typedRole');
if (typedEl) {
    const roles = ['Front-End Developer', 'React & TypeScript Engineer', 'UI/UX Engineering', 'Performance Specialist'];
    let roleIdx = 0, charIdx = 0, deleting = false;

    function typeEffect() {
        const current = roles[roleIdx];
        if (deleting) {
            charIdx--;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                setTimeout(typeEffect, 400);
                return;
            }
            setTimeout(typeEffect, 35);
        } else {
            charIdx++;
            typedEl.textContent = current.substring(0, charIdx);
            if (charIdx === current.length) {
                deleting = true;
                setTimeout(typeEffect, 2200);
                return;
            }
            setTimeout(typeEffect, 65);
        }
    }
    setTimeout(typeEffect, 1000);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 11. SCROLL TO TOP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 12. CONTACT FORM â€” Simulated Handler
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const form = document.querySelector('#contactForm');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            btn.style.background = 'linear-gradient(135deg,rgb(52,211,153),rgb(16,185,129))';
            setTimeout(() => {
                btn.innerHTML = origText;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 2500);
        }, 1800);
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 13. SMOOTH NAV SCROLL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 14. HOLOGRAPHIC NAME BADGE â€” 3D Tilt + Shimmer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const holoBadge = document.getElementById('holoBadge');
if (holoBadge) {
    const holoInner = holoBadge.querySelector('.holo-badge-inner');
    const holoLayers = holoBadge.querySelectorAll('.holo-layer');
    const maxTilt = 12;

    holoBadge.addEventListener('mouseenter', () => {
        holoLayers.forEach(l => l.style.animation = 'none');
    });

    holoBadge.addEventListener('mousemove', (e) => {
        const rect = holoBadge.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * maxTilt;
        const tiltY = (x - 0.5) * maxTilt;
        holoInner.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;

        const angle = (Math.abs(0.5 - x) + Math.abs(0.5 - y)) * 60;
        holoLayers.forEach((l) => {
            const speed = parseFloat(l.getAttribute('data-speed') || '1');
            l.style.transform = `rotate(${angle * speed}deg)`;
        });
    });

    holoBadge.addEventListener('mouseleave', () => {
        holoInner.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        setTimeout(() => {
            holoLayers.forEach((l) => { l.style.transform = ''; l.style.animation = ''; });
        }, 350);
    });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 15. PREMIUM WIREFRAME GLOBE â€” D3 orthographic
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const wireGlobeCanvas = document.getElementById('wireframeGlobe');
if (wireGlobeCanvas && typeof d3 !== 'undefined') {
    function initWireGlobe() {
        const container = wireGlobeCanvas.parentElement;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight || containerWidth;
        if (containerWidth === 0) return;

        const baseRadius = Math.min(containerWidth, containerHeight) / 2.4;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cx = containerWidth / 2, cy = containerHeight / 2;

        wireGlobeCanvas.width = containerWidth * dpr;
        wireGlobeCanvas.height = containerHeight * dpr;
        wireGlobeCanvas.style.width = containerWidth + 'px';
        wireGlobeCanvas.style.height = containerHeight + 'px';

        const ctx = wireGlobeCanvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const projection = d3.geoOrthographic()
            .scale(baseRadius)
            .translate([cx, cy])
            .clipAngle(90);

        const pathGen = d3.geoPath().projection(projection).context(ctx);

        // City markers
        const cities = [
            { name: 'San Francisco', coords: [-122.44, 37.78] },
            { name: 'New York', coords: [-74.01, 40.71] },
            { name: 'London', coords: [-0.13, 51.51] },
            { name: 'Tokyo', coords: [139.65, 35.68] },
            { name: 'Dubai', coords: [55.30, 25.28] },
            { name: 'Singapore', coords: [103.82, 1.35] },
            { name: 'Sydney', coords: [151.21, -33.87] },
            { name: 'Delhi', coords: [77.23, 28.61] },
            { name: 'Paris', coords: [2.35, 48.86] },
            { name: 'SÃ£o Paulo', coords: [-46.63, -23.55] },
        ];

        // Connection arcs between cities
        const arcs = [
            [0, 1], [1, 2], [2, 3], [3, 5], [5, 6],
            [2, 4], [4, 7], [7, 3], [1, 8], [0, 9],
        ];

        // Point in polygon
        function pip(pt, poly) {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const [xi, yi] = poly[i], [xj, yj] = poly[j];
                if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi)
                    inside = !inside;
            }
            return inside;
        }

        function pointInFeature(pt, feature) {
            const geom = feature.geometry;
            if (geom.type === 'Polygon') {
                if (!pip(pt, geom.coordinates[0])) return false;
                for (let i = 1; i < geom.coordinates.length; i++)
                    if (pip(pt, geom.coordinates[i])) return false;
                return true;
            } else if (geom.type === 'MultiPolygon') {
                for (const poly of geom.coordinates) {
                    if (pip(pt, poly[0])) {
                        let inHole = false;
                        for (let i = 1; i < poly.length; i++)
                            if (pip(pt, poly[i])) { inHole = true; break; }
                        if (!inHole) return true;
                    }
                }
            }
            return false;
        }

        function generateDots(feature, spacing) {
            const dots = [];
            const bounds = d3.geoBounds(feature);
            const step = spacing * 0.1;
            for (let lng = bounds[0][0]; lng <= bounds[1][0]; lng += step)
                for (let lat = bounds[0][1]; lat <= bounds[1][1]; lat += step)
                    if (pointInFeature([lng, lat], feature)) dots.push([lng, lat]);
            return dots;
        }

        let landData = null;
        const allDots = [];
        let time = 0;

        function render() {
            time += 0.016;
            ctx.clearRect(0, 0, containerWidth, containerHeight);
            const scale = projection.scale();
            const sf = scale / baseRadius;

            // Atmospheric glow (outer halo)
            const atmosGrad = ctx.createRadialGradient(cx, cy, scale * 0.92, cx, cy, scale * 1.25);
            atmosGrad.addColorStop(0, 'rgba(56,189,248,0.0)');
            atmosGrad.addColorStop(0.3, 'rgba(56,189,248,0.04)');
            atmosGrad.addColorStop(0.6, 'rgba(139,92,246,0.02)');
            atmosGrad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(cx, cy, scale * 1.25, 0, 2 * Math.PI);
            ctx.fillStyle = atmosGrad;
            ctx.fill();

            // Globe sphere with gradient
            const sphereGrad = ctx.createRadialGradient(cx - scale * 0.3, cy - scale * 0.3, 0, cx, cy, scale);
            sphereGrad.addColorStop(0, 'rgba(15,20,30,1)');
            sphereGrad.addColorStop(0.7, 'rgba(8,10,18,1)');
            sphereGrad.addColorStop(1, 'rgba(3,5,10,1)');
            ctx.beginPath();
            ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
            ctx.fillStyle = sphereGrad;
            ctx.fill();

            // Cyan edge glow ring
            const edgeGrad = ctx.createRadialGradient(cx, cy, scale * 0.96, cx, cy, scale * 1.02);
            edgeGrad.addColorStop(0, 'rgba(56,189,248,0.0)');
            edgeGrad.addColorStop(0.5, 'rgba(56,189,248,0.12)');
            edgeGrad.addColorStop(1, 'rgba(56,189,248,0.0)');
            ctx.beginPath();
            ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
            ctx.strokeStyle = edgeGrad;
            ctx.lineWidth = 2.5 * sf;
            ctx.stroke();

            if (!landData) return;

            // Graticule grid
            const grat = d3.geoGraticule10();
            ctx.beginPath();
            pathGen(grat);
            ctx.strokeStyle = 'rgba(56,189,248,0.06)';
            ctx.lineWidth = 0.4 * sf;
            ctx.stroke();

            // Land outlines (cyan-tinted)
            ctx.beginPath();
            landData.features.forEach(f => pathGen(f));
            ctx.strokeStyle = 'rgba(56,189,248,0.18)';
            ctx.lineWidth = 0.7 * sf;
            ctx.stroke();

            // Halftone dots with depth-based size & opacity
            const rot = projection.rotate();
            allDots.forEach(coords => {
                const p = projection(coords);
                if (!p) return;
                if (p[0] < 0 || p[0] > containerWidth || p[1] < 0 || p[1] > containerHeight) return;

                const dx = p[0] - cx, dy = p[1] - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) / scale;
                const alpha = Math.max(0.15, 1 - dist * 1.2);
                const dotSize = (0.6 + (1 - dist) * 0.8) * sf;

                ctx.beginPath();
                ctx.arc(p[0], p[1], dotSize, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(56,189,248,${alpha * 0.5})`;
                ctx.fill();
            });

            // Connection arcs (animated dashes)
            ctx.save();
            arcs.forEach(([a, b], idx) => {
                const c1 = cities[a].coords, c2 = cities[b].coords;
                const p1 = projection(c1), p2 = projection(c2);
                if (!p1 || !p2) return;
                const d1 = d3.geoDistance(c1, [-rot[0], -rot[1]]);
                const d2 = d3.geoDistance(c2, [-rot[0], -rot[1]]);
                if (d1 > Math.PI / 2 || d2 > Math.PI / 2) return;

                const midX = (p1[0] + p2[0]) / 2, midY = (p1[1] + p2[1]) / 2;
                const dist = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
                const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) - Math.PI / 2;
                const cpX = midX + Math.cos(angle) * dist * 0.25;
                const cpY = midY + Math.sin(angle) * dist * 0.25;
                const dashOff = (time * 30 + idx * 50) % 200;

                ctx.beginPath();
                ctx.moveTo(p1[0], p1[1]);
                ctx.quadraticCurveTo(cpX, cpY, p2[0], p2[1]);
                ctx.strokeStyle = 'rgba(168,85,247,0.22)';
                ctx.lineWidth = 0.8 * sf;
                ctx.setLineDash([4 * sf, 6 * sf]);
                ctx.lineDashOffset = -dashOff;
                ctx.stroke();
                ctx.setLineDash([]);
            });
            ctx.restore();

            // City markers with pulsing glow
            cities.forEach((city, i) => {
                const p = projection(city.coords);
                if (!p) return;
                const gd = d3.geoDistance(city.coords, [-rot[0], -rot[1]]);
                if (gd > Math.PI / 2) return;

                const pulse = 1 + Math.sin(time * 2.5 + i * 0.7) * 0.3;
                const glowGrad = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 6 * sf * pulse);
                glowGrad.addColorStop(0, 'rgba(56,189,248,0.35)');
                glowGrad.addColorStop(0.5, 'rgba(56,189,248,0.08)');
                glowGrad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p[0], p[1], 6 * sf * pulse, 0, 2 * Math.PI);
                ctx.fillStyle = glowGrad;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p[0], p[1], 1.8 * sf, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(56,189,248,0.9)';
                ctx.fill();
            });
        }

        // Load GeoJSON
        fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json')
            .then(r => r.json())
            .then(data => {
                landData = data;
                data.features.forEach(f => {
                    generateDots(f, 14).forEach(d => allDots.push(d));
                });
                render();
                wireGlobeCanvas.style.opacity = '1';
            })
            .catch(() => {
                render();
                wireGlobeCanvas.style.opacity = '1';
            });

        // Smooth auto-rotation with momentum
        const rotation = [0, -15];
        let autoRotate = true;
        let velocity = { x: 0, y: 0 };

        const timer = d3.timer(() => {
            if (autoRotate) {
                rotation[0] += 0.2;
                projection.rotate(rotation);
            } else if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
                velocity.x *= 0.95;
                velocity.y *= 0.95;
                rotation[0] += velocity.x;
                rotation[1] = Math.max(-60, Math.min(60, rotation[1] - velocity.y));
                projection.rotate(rotation);
            }
            render();
        });

        // Drag with momentum
        wireGlobeCanvas.addEventListener('mousedown', (e) => {
            autoRotate = false;
            velocity = { x: 0, y: 0 };
            const startX = e.clientX, startY = e.clientY;
            const startRot = [...rotation];
            let lastX = e.clientX, lastY = e.clientY;

            const onMove = (me) => {
                velocity.x = (me.clientX - lastX) * 0.3;
                velocity.y = (me.clientY - lastY) * 0.3;
                lastX = me.clientX; lastY = me.clientY;
                rotation[0] = startRot[0] + (me.clientX - startX) * 0.3;
                rotation[1] = startRot[1] - (me.clientY - startY) * 0.3;
                rotation[1] = Math.max(-60, Math.min(60, rotation[1]));
                projection.rotate(rotation);
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                setTimeout(() => {
                    if (Math.abs(velocity.x) < 0.05) autoRotate = true;
                }, 2000);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Touch support
        wireGlobeCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            autoRotate = false;
            const touch = e.touches[0];
            const startX = touch.clientX, startY = touch.clientY;
            const startRot = [...rotation];
            const onTouchMove = (te) => {
                te.preventDefault();
                const t = te.touches[0];
                rotation[0] = startRot[0] + (t.clientX - startX) * 0.3;
                rotation[1] = startRot[1] - (t.clientY - startY) * 0.3;
                rotation[1] = Math.max(-60, Math.min(60, rotation[1]));
                projection.rotate(rotation);
            };
            const onTouchEnd = () => {
                wireGlobeCanvas.removeEventListener('touchmove', onTouchMove);
                wireGlobeCanvas.removeEventListener('touchend', onTouchEnd);
                setTimeout(() => { autoRotate = true; }, 1500);
            };
            wireGlobeCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
            wireGlobeCanvas.addEventListener('touchend', onTouchEnd);
        }, { passive: false });

        // Zoom disabled — prevents glitches
    }

    if (wireGlobeCanvas.offsetWidth > 0) {
        initWireGlobe();
    } else {
        const ro = new ResizeObserver((entries) => {
            if (entries[0]?.contentRect.width > 0) {
                ro.disconnect();
                initWireGlobe();
            }
        });
        ro.observe(wireGlobeCanvas);
    }
}

})();

