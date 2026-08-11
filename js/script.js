document.addEventListener('DOMContentLoaded', function () {

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------
       1. Carrusel Swiper — breakpoints correctos (mobile-first)
       ------------------------------------------------------------ */
    var plateSwiper = new Swiper('.plate-swiper', {
        slidesPerView: 1.15,
        spaceBetween: 20,
        centeredSlides: true,
        grabCursor: true,
        loop: true,
        speed: 700,
        breakpoints: {
            576: { slidesPerView: 1.6, spaceBetween: 24, centeredSlides: true },
            768: { slidesPerView: 2.2, spaceBetween: 28, centeredSlides: false },
            1200: { slidesPerView: 3, spaceBetween: 36, centeredSlides: false }
        }
    });

    var prevBtn = document.getElementById('plate-prev');
    var nextBtn = document.getElementById('plate-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { plateSwiper.slidePrev(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { plateSwiper.slideNext(); });

    /* ------------------------------------------------------------
       2. Barra de progreso ligada a la posición real del carrusel
       ------------------------------------------------------------ */
    var progressFill = document.getElementById('gallery-progress-fill');
    function updateProgress() {
        if (!progressFill) return;
        var total = plateSwiper.slides.length - (plateSwiper.loopedSlides ? plateSwiper.loopedSlides * 2 : 0);
        var idx = plateSwiper.realIndex + 1;
        var pct = Math.max(8, Math.min(100, (idx / (total || 4)) * 100));
        progressFill.style.width = pct + '%';
    }
    plateSwiper.on('slideChange', updateProgress);
    updateProgress();

    /* ------------------------------------------------------------
       3. Reveal escalonado al entrar en viewport (scroll animation)
       ------------------------------------------------------------ */
    var revealEls = document.querySelectorAll('.reveal-el');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ------------------------------------------------------------
       4. Parallax sutil en las imágenes según scroll de la sección
       ------------------------------------------------------------ */
    var section = document.getElementById('galeria-fotomontajes');
    var images = document.querySelectorAll('.plate-image img');
    var ticking = false;

    function applyParallax() {
        ticking = false;
        if (!section || reduceMotion) return;

        var rect = section.getBoundingClientRect();
        var vh = window.innerHeight;
        // progreso 0 → 1 mientras la sección atraviesa el viewport
        var progress = 1 - (rect.top + rect.height) / (vh + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        var offset = (progress - 0.5) * 46; // rango de desplazamiento en px

        images.forEach(function (img) {
            img.style.setProperty('--parallax', offset.toFixed(1) + 'px');
        });
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }

    if (!reduceMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        applyParallax();
    }
});