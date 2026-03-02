// Scripts gerais do site (menu, tema, animações)
document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile: abre/fecha navegação
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-times');
                icon.classList.toggle('fa-bars');
            }
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
    }
    
    const root = document.documentElement;
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    function readPref() {
        try { return localStorage.getItem('theme'); } catch (e) {
            const m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
            return m && decodeURIComponent(m[1]);
        }
    }
    function writePref(val) {
        try { localStorage.setItem('theme', val); } catch (e) {
            document.cookie = 'theme=' + encodeURIComponent(val) + ';path=/;max-age=31536000';
        }
    }
    function applyTheme(t) {
        root.setAttribute('data-theme', t);
        if (darkModeToggle) {
            darkModeToggle.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-sun', t === 'dark');
                icon.classList.toggle('fa-moon', t !== 'dark');
            }
        }
    }
    const stored = readPref();
    const prefers = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    applyTheme(stored || prefers);
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            writePref(next);
        });
    }
    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = function(ev) {
            const userSet = !!readPref();
            if (!userSet) applyTheme(ev.matches ? 'dark' : 'light');
        };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }

    if (new URLSearchParams(location.search).has('themeTest')) {
        (function runThemeTests() {
            const results = [];
            function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
            const initial = root.getAttribute('data-theme');
            const before = cssVar('--bg-color');
            applyTheme(initial === 'dark' ? 'light' : 'dark');
            const after = cssVar('--bg-color');
            results.push({ test: 'CSS var change', ok: before !== after });
            const lightLogo = document.querySelector('.light-logo');
            const darkLogo = document.querySelector('.dark-logo');
            if (lightLogo && darkLogo) {
                const dl = getComputedStyle(darkLogo).display;
                const ll = getComputedStyle(lightLogo).display;
                results.push({ test: 'Logo visibility', ok: dl === 'inline-block' || ll === 'inline-block' });
            } else {
                results.push({ test: 'Logo presence', ok: !!(lightLogo && darkLogo) });
            }
            applyTheme(initial);
            console.table(results);
        })();
    }
    
    // Animações de entrada ao rolar a página
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-in');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

        animatedElements.forEach(el => observer.observe(el));
        animatedElements.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.9) {
                el.classList.add('is-visible');
            }
        });
    } else {
        const animateOnScroll = function() {
            animatedElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight * 0.85;
                if (elementPosition < screenPosition) {
                    element.classList.add('is-visible');
                }
            });
        };
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll();
    }

    // Header transparente no topo para desktop
    const header = document.querySelector('.header');
    const desktopMinWidth = 993;
    const toggleHeaderVisibility = () => {
        if (!header) return;
        const isDesktop = window.innerWidth >= desktopMinWidth;
        if (isDesktop) {
            if (window.scrollY <= 10) {
                header.classList.add('header--transparent');
            } else {
                header.classList.remove('header--transparent');
            }
        } else {
            header.classList.remove('header--transparent');
        }
    };
    window.addEventListener('scroll', toggleHeaderVisibility);
    window.addEventListener('resize', toggleHeaderVisibility);
    toggleHeaderVisibility();

    function totalNavWidth() {
        if (!navList) return 0;
        let w = 0;
        const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-gap')) || 0;
        const items = Array.from(navList.children);
        items.forEach((li, i) => { w += li.offsetWidth; if (i > 0) w += gap; });
        return w;
    }
    function headerInnerWidth() {
        if (!header) return window.innerWidth;
        const c = header.querySelector('.container');
        return c ? c.clientWidth : header.clientWidth;
    }
    function logoWidth() {
        const logo = header && header.querySelector('.logo');
        return logo ? logo.offsetWidth : 0;
    }
    function menuAvailableWidth() {
        const pad = 64;
        return headerInnerWidth() - logoWidth() - pad;
    }
    function setNavClass(cls) {
        const nav = header && header.querySelector('.nav');
        if (!nav) return;
        nav.classList.remove('nav--normal','nav--compact','nav--tight','nav--collapsed');
        nav.classList.add(cls);
    }
    function recalcNavLayout() {
        if (!header || !navList) return;
        const MOBILE_BP = 768;
        if (window.innerWidth <= MOBILE_BP) {
            setNavClass('nav--collapsed');
            return;
        }
        document.documentElement.style.setProperty('--nav-gap','30px');
        setNavClass('nav--normal');
        const avail = menuAvailableWidth();
        let width = totalNavWidth();
        if (width <= avail) return;
        document.documentElement.style.setProperty('--nav-gap','22px');
        setNavClass('nav--compact');
        width = totalNavWidth();
        if (width <= avail) return;
        document.documentElement.style.setProperty('--nav-gap','12px');
        setNavClass('nav--tight');
        width = totalNavWidth();
        if (width <= avail) return;
        setNavClass('nav--collapsed');
    }
    let rafId = null;
    function scheduleRecalc() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => { rafId = null; recalcNavLayout(); });
    }
    window.addEventListener('resize', scheduleRecalc);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(scheduleRecalc);
        if (header) ro.observe(header);
        if (navList) ro.observe(navList);
    }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(recalcNavLayout).catch(recalcNavLayout);
    } else {
        window.addEventListener('load', recalcNavLayout);
    }
    recalcNavLayout();

    if (new URLSearchParams(location.search).has('menuTest')) {
        const results = [];
        document.documentElement.style.setProperty('--nav-gap','30px');
        setNavClass('nav--normal');
        results.push({state:'normal', fits: totalNavWidth() <= menuAvailableWidth()});
        document.documentElement.style.setProperty('--nav-gap','22px');
        setNavClass('nav--compact');
        results.push({state:'compact', fits: totalNavWidth() <= menuAvailableWidth()});
        document.documentElement.style.setProperty('--nav-gap','12px');
        setNavClass('nav--tight');
        results.push({state:'tight', fits: totalNavWidth() <= menuAvailableWidth()});
        setNavClass('nav--collapsed');
        results.push({state:'collapsed', menuToggleVisible: !!document.querySelector('.nav.nav--collapsed .menu-toggle')});
        console.table(results);
        recalcNavLayout();
    }
    
    // Contador de clientes com IntersectionObserver
    const clientCount = document.querySelector('.count');
    if (clientCount) {
        let count = 0;
        const target = parseInt(clientCount.textContent);
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                clientCount.textContent = Math.floor(count);
                requestAnimationFrame(updateCount);
            } else {
                clientCount.textContent = target + '+';
            }
        };
        
        // Disparar a animação quando o elemento estiver visível
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCount();
                observer.unobserve(clientCount);
            }
        });
        
        observer.observe(clientCount);
    }
    
    // Suave rolagem para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile se estiver aberto
                if (navList && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-times');
                        icon.classList.toggle('fa-bars');
                    }
                }
            }
        });
    });

    const techIcons = document.querySelector('.tech-icons');
    const techTrack = techIcons ? techIcons.querySelector('.tech-track') : null;
    if (techIcons && techTrack) {
        const originals = Array.from(techTrack.children).map(el => el.cloneNode(true));
        const buildMarquee = () => {
            techTrack.innerHTML = '';
            originals.forEach(el => techTrack.appendChild(el.cloneNode(true)));
            void techTrack.offsetWidth;
            const baseWidth = techTrack.scrollWidth;
            let repeat = 1;
            while ((baseWidth * repeat) < techIcons.clientWidth * 1.1) {
                originals.forEach(el => techTrack.appendChild(el.cloneNode(true)));
                repeat++;
            }
            originals.forEach(el => techTrack.appendChild(el.cloneNode(true)));
            techTrack.querySelectorAll('.tech-icon').forEach(el => el.classList.add('is-visible'));
            const speed = 60; // px/s
            techTrack.style.setProperty('--duration', (baseWidth / speed) + 's');
            techTrack.style.setProperty('--scroll-end', baseWidth + 'px');
        };
        const init = () => buildMarquee();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(init).catch(init);
        } else {
            window.addEventListener('load', init);
        }
        window.addEventListener('resize', init);
    }

    
    // Mosaicos do sistema com deslocamento aleatório
    document.querySelectorAll('.sys-tile').forEach(tile => {
        const dx = (Math.random() * 15 - 5).toFixed(1) + '%';
        const dy = (Math.random() * 15 - 5).toFixed(1) + '%';
        tile.style.setProperty('--dx', dx);
        tile.style.setProperty('--dy', dy);
    });
    
});
