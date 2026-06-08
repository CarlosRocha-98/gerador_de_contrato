// ── Redireciona usuário logado para o dashboard ───────────────────────────────
const DASHBOARD = 'src/pages/Home/index.html';

// 1) Sessão local (login por formulário)
if (sessionStorage.getItem('session')) {
    window.location.replace(DASHBOARD);
}

// 2) Token JWT (login pela API Django)
if (!sessionStorage.getItem('session') && (localStorage.getItem('access_token') || localStorage.getItem('access'))) {
    window.location.replace(DASHBOARD);
}

// ── Navbar toggle mobile ──────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navActions = document.getElementById('navActions');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navActions.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Fecha o menu ao clicar em qualquer link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navActions.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

// ── Auth: troca botões Entrar ↔ Sair ─────────────────────────────────────────
const BACKEND = window.API_HOST || 'http://localhost:8000';

function setLoggedIn() {
    const btn = document.querySelector('.navbar-auth .login');
    if (btn) {
        btn.textContent = 'Sair';
        btn.removeAttribute('href');
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', logout);
    }
}

function logout() {
    sessionStorage.removeItem('session');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    fetch(BACKEND + '/logout', { credentials: 'include' })
        .catch(() => {})
        .finally(() => {
            window.location.href = 'index.html';
        });
}

// 1) Verifica sessão local (login por formulário)
if (sessionStorage.getItem('session')) {
    setLoggedIn();
}
// 2) Verifica sessão OAuth (Google/Facebook) — only when frontend and backend share origin
if (window.location.origin === (new URL(BACKEND)).origin) {
    fetch(BACKEND + '/profile', { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error('Não autenticado');
            return res.json();
        })
        .then(user => {
            if (user) {
                // Usuário OAuth logado: redireciona para o dashboard
                window.location.replace(DASHBOARD);
            }
        })
        .catch(() => {
            console.log('Usuário não está logado');
        });
} else {
    console.log('Pulando verificação OAuth remota (origem diferente)');
}
