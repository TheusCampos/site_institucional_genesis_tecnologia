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
        });
    }
    
    // Alternar modo escuro com persistência no localStorage
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;
    
    if (darkModeToggle && body) {
        // Verificar preferência do usuário
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = localStorage.getItem('theme');
        
        if (currentTheme === 'dark' || (!currentTheme && prefersDarkMode)) {
            body.setAttribute('data-theme', 'dark');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-sun');
                icon.classList.remove('fa-moon');
            }
        }
        
        darkModeToggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                if (icon) {
                    icon.classList.add('fa-moon');
                    icon.classList.remove('fa-sun');
                }
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (icon) {
                    icon.classList.add('fa-sun');
                    icon.classList.remove('fa-moon');
                }
            }
            
            // Força o redesenho para garantir a transição suave (se necessário)
            document.querySelectorAll('.logo-img').forEach(img => {
                img.style.display = 'none';
                setTimeout(() => {
                    img.style.display = 'inline-block';
                }, 15);
            });
        });
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
