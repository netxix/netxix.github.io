// Navegación mejorada
document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const nav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuDropdown = document.querySelector('.menu-dropdown');
    let isMenuOpen = false;

    // Función para actualizar los atributos ARIA
    function updateARIA() {
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
        menuDropdown.setAttribute('aria-hidden', !isMenuOpen);
    }

    // Toggle del menú móvil
    menuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        menuDropdown.style.opacity = isMenuOpen ? '1' : '0';
        menuDropdown.style.visibility = isMenuOpen ? 'visible' : 'hidden';
        menuDropdown.style.transform = isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(-15px) scale(0.95)';
        menuToggle.querySelector('i').style.transform = isMenuOpen ? 'rotate(180deg)' : 'rotate(0)';
        updateARIA();
    });

    // Efecto de scroll en la navegación
    let lastScroll = 0;
    let scrollTimer;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(() => {
            const currentScroll = window.pageYOffset;
            
            // Aplicar clase scrolled
            if (currentScroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, 50);
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        const isClickInside = menuToggle.contains(e.target) || menuDropdown.contains(e.target);
        
        if (!isClickInside && isMenuOpen) {
            isMenuOpen = false;
            menuDropdown.style.opacity = '0';
            menuDropdown.style.visibility = 'hidden';
            menuDropdown.style.transform = 'translateY(-15px) scale(0.95)';
            menuToggle.querySelector('i').style.transform = 'rotate(0)';
            updateARIA();
        }
    });

    // Gestionar tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            isMenuOpen = false;
            menuDropdown.style.opacity = '0';
            menuDropdown.style.visibility = 'hidden';
            menuDropdown.style.transform = 'translateY(-15px) scale(0.95)';
            menuToggle.querySelector('i').style.transform = 'rotate(0)';
            updateARIA();
        }
    });

    // Marcar enlace activo
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a, .menu-dropdown a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Animaciones de hover para los iconos
    document.querySelectorAll('.nav-links a, .menu-dropdown a').forEach(link => {
        const icon = link.querySelector('i');
        if (icon) {
            link.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.2) rotate(8deg)';
            });
            link.addEventListener('mouseleave', () => {
                icon.style.transform = 'scale(1) rotate(0)';
            });
        }
    });

    // Detectar si es móvil para ajustar comportamiento
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        menuDropdown.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // Ajustar al redimensionar ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobileNow = window.innerWidth <= 768;
            if (isMobileNow !== isMobile) {
                location.reload();
            }
        }, 250);
    });
});
