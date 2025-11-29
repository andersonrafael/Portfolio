/**
 * Portfolio Professional JavaScript
 * @description Scripts principais com padrões modernos e boas práticas
 * @author Anderson Rafael
 * @version 2.0.0
 */

'use strict';

/* ===================================
   UTILITY FUNCTIONS
=================================== */

/**
 * Utility para selecionar elementos do DOM
 */
const DOM = {
    select: (selector, context = document) => context.querySelector(selector),
    selectAll: (selector, context = document) => Array.from(context.querySelectorAll(selector))
};

/**
 * Debounce function para otimizar eventos
 */
const debounce = (func, wait = 250) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function para otimizar scroll events
 */
const throttle = (func, limit = 100) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/* ===================================
   CONSTANTS & CONFIG
=================================== */

const CONFIG = {
    THEME_STORAGE_KEY: 'portfolio_theme_preference',
    MOBILE_BREAKPOINT: 768,
    SCROLL_OFFSET: 100,
    ANIMATION_DELAY: 150
};

const THEME = {
    DARK: 'dark',
    LIGHT: 'light'
};

/* ===================================
   STATE MANAGEMENT
=================================== */

const AppState = {
    currentTheme: THEME.DARK,
    isMobileMenuOpen: false,
    activeSection: 'home'
};

/* ===================================
   THEME MANAGEMENT
=================================== */

class ThemeManager {
    constructor() {
        this.themeToggle = DOM.select('#themeToggle');
        this.root = document.documentElement;
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.attachEventListeners();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? THEME.DARK : THEME.LIGHT);
        }
    }

    setTheme(theme) {
        this.root.setAttribute('data-theme', theme);
        AppState.currentTheme = theme;
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme);
        this.updateToggleIcon(theme);
    }

    updateToggleIcon(theme) {
        const icon = theme === THEME.DARK ? 'bx-sun' : 'bx-moon';
        this.themeToggle.innerHTML = `<i class='bx ${icon}'></i>`;
        this.themeToggle.setAttribute('aria-label',
            `Alternar para tema ${theme === THEME.DARK ? 'claro' : 'escuro'}`
        );
    }

    toggleTheme() {
        const newTheme = AppState.currentTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
        this.setTheme(newTheme);
    }

    attachEventListeners() {
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }
}

/* ===================================
   NAVIGATION MANAGEMENT
=================================== */

class NavigationManager {
    constructor() {
        this.mobileMenuBtn = DOM.select('#mobileMenuBtn');
        this.mobileNav = DOM.select('#mobileNav');
        this.navLinks = DOM.selectAll('.nav-link, .mobile-nav__link');
        this.sections = DOM.selectAll('main section[id]');
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.initScrollSpy();
    }

    attachEventListeners() {
        // Mobile menu toggle
        this.mobileMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (AppState.isMobileMenuOpen &&
                !this.mobileNav?.contains(e.target) &&
                !this.mobileMenuBtn?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Smooth scroll for navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        // Window resize handler
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && AppState.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        }));
    }

    toggleMobileMenu() {
        AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;

        if (AppState.isMobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileNav.style.display = 'block';
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
        this.mobileMenuBtn.innerHTML = "<i class='bx bx-x'></i>";

        // Animate menu items
        const links = this.mobileNav.querySelectorAll('.mobile-nav__link');
        links.forEach((link, index) => {
            link.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s backwards`;
        });
    }

    closeMobileMenu() {
        this.mobileNav.style.display = 'none';
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        this.mobileMenuBtn.innerHTML = "<i class='bx bx-menu'></i>";
        AppState.isMobileMenuOpen = false;
    }

    handleNavClick(e, link) {
        const href = link.getAttribute('href');

        if (href?.startsWith('#')) {
            e.preventDefault();
            const targetSection = DOM.select(href);

            if (targetSection) {
                this.scrollToSection(targetSection);

                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    this.closeMobileMenu();
                }
            }
        }
    }

    scrollToSection(section) {
        const headerOffset = 70;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    initScrollSpy() {
        const scrollHandler = throttle(() => {
            this.updateActiveSection();
        }, 100);

        window.addEventListener('scroll', scrollHandler);
        this.updateActiveSection(); // Initial call
    }

    updateActiveSection() {
        const scrollPosition = window.scrollY + CONFIG.SCROLL_OFFSET;

        let currentSection = this.sections.find(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            return scrollPosition >= sectionTop && scrollPosition < sectionBottom;
        });

        if (!currentSection) {
            currentSection = this.sections[0];
        }

        if (currentSection && currentSection.id !== AppState.activeSection) {
            AppState.activeSection = currentSection.id;
            this.updateActiveLinks(currentSection.id);
        }
    }

    updateActiveLinks(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${sectionId}`);
        });
    }
}

/* ===================================
   PROJECTS RENDERING
=================================== */

class ProjectsManager {
    constructor() {
        this.projectsGrid = DOM.select('#projectsGrid');
        this.projects = this.getProjectsData();
        this.init();
    }

    getProjectsData() {
        return [
            {
                id: 'project_001',
                title: 'E-commerce Platform',
                description: 'Plataforma completa de e-commerce com carrinho, pagamentos e painel administrativo.',
                technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
                link: '#',
                githubLink: 'https://github.com'
            },
            {
                id: 'project_002',
                title: 'Dashboard Analytics',
                description: 'Dashboard interativo com visualização de dados em tempo real e métricas customizadas.',
                technologies: ['React', 'D3.js', 'Tailwind CSS'],
                link: '#',
                githubLink: 'https://github.com'
            },
            {
                id: 'project_003',
                title: 'Task Management App',
                description: 'Aplicação de gerenciamento de tarefas com drag & drop, filtros e colaboração em tempo real.',
                technologies: ['React', 'TypeScript', 'Firebase'],
                link: '#',
                githubLink: 'https://github.com'
            },
            {
                id: 'project_004',
                title: 'Portfolio Generator',
                description: 'Sistema que gera portfolios personalizados com templates customizáveis e exportação.',
                technologies: ['React', 'Next.js', 'Styled Components'],
                link: '#',
                githubLink: 'https://github.com'
            },
            {
                id: 'project_005',
                title: 'Social Media Dashboard',
                description: 'Dashboard para gerenciamento de múltiplas redes sociais com agendamento de posts.',
                technologies: ['React', 'Redux', 'REST API'],
                link: '#',
                githubLink: 'https://github.com'
            },
            {
                id: 'project_006',
                title: 'Weather Forecast App',
                description: 'Aplicativo de previsão do tempo com geolocalização e alertas personalizados.',
                technologies: ['React', 'OpenWeather API', 'Charts.js'],
                link: '#',
                githubLink: 'https://github.com'
            }
        ];
    }

    init() {
        if (this.projectsGrid) {
            this.renderProjects();
        }
    }

    renderProjects() {
        const fragment = document.createDocumentFragment();

        this.projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            fragment.appendChild(projectCard);
        });

        this.projectsGrid.innerHTML = '';
        this.projectsGrid.appendChild(fragment);
    }

    createProjectCard(project, index) {
        const article = document.createElement('article');
        article.className = 'project-card';
        article.setAttribute('role', 'listitem');
        article.style.animationDelay = `${index * 0.1}s`;

        const technologies = project.technologies
            .map(tech => `<span class="tag">${tech}</span>`)
            .join('');

        article.innerHTML = `
            <div class="project-card__header">
                <h3 class="project-card__title">${project.title}</h3>
            </div>
            <p class="project-card__description">${project.description}</p>
            <div class="project-card__tech">
                ${technologies}
            </div>
            <div class="project-card__footer">
                <a href="${project.link}" 
                   class="project-card__link" 
                   data-project-id="${project.id}"
                   aria-label="Ver detalhes do projeto ${project.title}">
                    Ver projeto <i class='bx bx-right-arrow-alt'></i>
                </a>
            </div>
        `;

        // Add click event
        const viewLink = article.querySelector('.project-card__link');
        viewLink.addEventListener('click', (e) => this.handleProjectClick(e, project));

        return article;
    }

    handleProjectClick(e, project) {
        e.preventDefault();
        console.log('Opening project:', project.title);

        // Aqui você pode implementar um modal ou redirecionamento
        alert(`Abrindo projeto: ${project.title}\n\nTecnologias: ${project.technologies.join(', ')}`);
    }
}

/* ===================================
   SKILLS ANIMATION
=================================== */

class SkillsAnimator {
    constructor() {
        this.skillBars = DOM.selectAll('.skill-item__bar');
        this.skillsSection = DOM.select('#skills');
        this.animated = false;
        this.init();
    }

    init() {
        if (this.skillsSection) {
            this.observeSkillsSection();
        }
    }

    observeSkillsSection() {
        const options = {
            root: null,
            threshold: 0.3,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateSkills();
                    this.animated = true;
                }
            });
        }, options);

        observer.observe(this.skillsSection);
    }

    animateSkills() {
        this.skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const percentage = bar.getAttribute('data-percent');
                bar.style.width = `${percentage}%`;
            }, index * CONFIG.ANIMATION_DELAY);
        });
    }
}

/* ===================================
   INTERSECTION OBSERVER (Scroll Animations)
=================================== */

class ScrollAnimator {
    constructor() {
        this.elements = DOM.selectAll('[class*="fadeUp"], [class*="fadeIn"]');
        this.init();
    }

    init() {
        if (this.elements.length === 0) return;

        const options = {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(element);
        });
    }
}

/* ===================================
   CONTACT FORM HANDLING
=================================== */

class ContactForm {
    constructor() {
        this.form = DOM.select('#contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Validate all fields
        const isValid = this.validateForm(data);

        if (!isValid) {
            return;
        }

        // Simulate form submission
        this.submitForm(data);
    }

    validateForm(data) {
        let isValid = true;

        // Validate name
        if (!data.name || data.name.trim().length < 3) {
            this.showError('name', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showError('email', 'Digite um e-mail válido');
            isValid = false;
        }

        // Validate message
        if (!data.message || data.message.trim().length < 10) {
            this.showError('message', 'Mensagem deve ter pelo menos 10 caracteres');
            isValid = false;
        }

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;

        switch (fieldName) {
            case 'name':
                if (value.length < 3) {
                    this.showError(fieldName, 'Nome deve ter pelo menos 3 caracteres');
                    return false;
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showError(fieldName, 'Digite um e-mail válido');
                    return false;
                }
                break;
            case 'message':
                if (value.length < 10) {
                    this.showError(fieldName, 'Mensagem deve ter pelo menos 10 caracteres');
                    return false;
                }
                break;
        }

        this.clearError(input);
        return true;
    }

    showError(fieldName, message) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        const errorElement = input.parentElement.querySelector('.form-error');

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
    }

    clearError(input) {
        const errorElement = input.parentElement.querySelector('.form-error');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        }
    }

    async submitForm(data) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Enviando...</span>';

        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', data);

            // Show success message
            this.showSuccessMessage(data.name);

            // Reset form
            this.form.reset();

            // Restore button
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1500);
    }

    showSuccessMessage(name) {
        const firstName = name.split(' ')[0];
        alert(`✅ Obrigado ${firstName}! Sua mensagem foi enviada com sucesso.\n\nRetornarei o contato em breve.`);
    }
}

/* ===================================
   APPLICATION INITIALIZATION
=================================== */

class PortfolioApp {
    constructor() {
        this.components = [];
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        console.log('🚀 Portfolio initialized');

        try {
            // Initialize all components
            this.components = [
                new ThemeManager(),
                new NavigationManager(),
                new ProjectsManager(),
                new SkillsAnimator(),
                new ScrollAnimator(),
                new ContactForm()
            ];

            // Add smooth scroll behavior to all anchor links
            this.initSmoothScroll();

            // Log success
            console.log('✅ All components loaded successfully');
        } catch (error) {
            console.error('❌ Error initializing components:', error);
        }
    }

    initSmoothScroll() {
        const links = DOM.selectAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && DOM.select(href)) {
                    e.preventDefault();
                    DOM.select(href).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

/* ===================================
   START APPLICATION
=================================== */

const app = new PortfolioApp();
app.init();