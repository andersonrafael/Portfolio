// ===== Portfolio Professional JS (Separated Version) =====
// Helper selectors
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ==========================
   MOBILE MENU
========================== */
const mobileBtn = $('#mobileMenuBtn');
const mobileNav = $('#mobileNav');

if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
        mobileBtn.setAttribute('aria-expanded', String(!expanded));
        const shown = mobileNav.style.display !== 'block';
        mobileNav.style.display = shown ? 'block' : 'none';
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth < 720 && mobileNav && !mobileNav.contains(e.target) && !mobileBtn.contains(e.target)) {
        mobileNav.style.display = 'none';
    }
});

/* ==========================
   SCROLL SPY
========================== */
const sections = Array.from(document.querySelectorAll('main section'));
const navLinks = $$('.nav-link');

const onScroll = () => {
    const y = window.scrollY + 120;
    let current = sections.find((s) => s.offsetTop <= y && s.offsetTop + s.offsetHeight > y);
    if (!current) current = sections[0];

    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
    });
};

window.addEventListener('scroll', onScroll);
onScroll();

/* ==========================
   SMOOTH SCROLL NAV LINKS
========================== */
navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (window.innerWidth < 720) mobileNav.style.display = 'none';
        }
    });
});

/* ==========================
   THEME TOGGLE (LIGHT/DARK)
========================== */
const themeToggle = $('#themeToggle');
const root = document.documentElement;
const THEME_KEY = 'portfolio.theme';

const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggle.innerHTML = theme === 'dark' ? "<i class='bx bx-sun'></i>" : "<i class='bx bx-moon'></i>";
};

const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return setTheme(saved);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
};

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
}

initTheme();

/* ==========================
   PROJECTS RENDERING
========================== */
const projects = [
    { id: 'p1', title: 'Hamburgueria Digital', desc: 'Sistema de pedidos com painel administrativo.', tech: ['HTML', 'CSS', 'JS'], link: '#' },
    { id: 'p2', title: 'Sistema para Cafeteria', desc: 'Plataforma com personalização de produtos.', tech: ['React', 'Tailwind'], link: '#' },
    { id: 'p3', title: 'Hotel Paraíso', desc: 'Site institucional com reservas e galeria.', tech: ['HTML', 'Bootstrap'], link: '#' },
    { id: 'p4', title: 'Portfolio Pessoal', desc: 'Design elegante focado em UI/UX.', tech: ['React', 'TS'], link: '#' },
    { id: 'p5', title: 'Dashboard de Vendas', desc: 'SPA com métricas em tempo real.', tech: ['React', 'D3'], link: '#' }
];

const renderProjects = () => {
    const grid = $('#projectsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    projects.forEach((p) => {
        const card = document.createElement('article');
        card.className = 'card fadeUp';
        card.innerHTML = `
      <h4>${p.title}</h4>
      <p class='muted'>${p.desc}</p>
      <div class='project-actions'>
        <div style='display:flex;gap:.5rem'>
          ${p.tech.map((t) => `<span class='tag'>${t}</span>`).join('')}
        </div>
        <a href='${p.link}' onclick='event.preventDefault(); alert("Abrir projeto: ${p.title}")'>Ver</a>
      </div>
    `;
        grid.appendChild(card);
    });
};

renderProjects();

/* ==========================
   INTERSECTION OBSERVER
========================== */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('inView');

                // animate skill bars
                if (entry.target.classList.contains('skills')) {
                    $$('.progress').forEach((el) => {
                        const percent = el.getAttribute('data-percent');
                        el.querySelector('span').style.width = percent + '%';
                    });
                }
            }
        });
    },
    { threshold: 0.15 }
);

$$('.fadeUp, .skills').forEach((el) => observer.observe(el));

/* ==========================
   CONTACT FORM HANDLING
========================== */
const form = $('#contactForm');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const name = data.get('name');

        if (!name) {
            alert('Por favor, preencha seu nome.');
            return;
        }

        alert('Mensagem enviada com sucesso! Em breve retornarei.');
        form.reset();
    });
}
