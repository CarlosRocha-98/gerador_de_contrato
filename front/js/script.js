// ── Redireciona usuário logado para o dashboard ───────────────────────────────
const DASHBOARD = 'pages/Home/index.html';
const BACKEND = 'https://gerador-de-contrato-6uck.onrender.com/api';


// Redireciona usuário logado
if (sessionStorage.getItem('session') || localStorage.getItem('access')) {
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
    sessionStorage.clear();
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = 'index.html';
}

// 1) Verifica sessão local (login por formulário)
if (sessionStorage.getItem('session')) {
    setLoggedIn();
}
// 2) Verifica sessão OAuth (Google/Facebook) — only when frontend and backend share origin
async function checkOAuthSession() {
    try {
        const res = await fetch(BACKEND + '/auth/jwt/', {
            credentials: 'include' // importante se backend usa cookies HttpOnly
        });

        if (res.ok) {
            const user = await res.json();
            if (user) {
                // salva tokens se backend retornar no corpo
                if (user.access) localStorage.setItem('access', user.access);
                if (user.refresh) localStorage.setItem('refresh', user.refresh);

                setLoggedIn();
                window.location.replace(DASHBOARD);
            }
        }
    } catch (err) {
        console.log("Nenhuma sessão OAuth ativa");
    }
}

// Chama logo após verificar sessionStorage
checkOAuthSession();


// Função para renovar token
async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) return null;

    try {
        const res = await fetch(BACKEND + '/auth/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        if (!res.ok) throw new Error('Refresh token inválido');

        const data = await res.json();
        localStorage.setItem('access', data.access); // atualiza o access
        return data.access;
    } catch (err) {
        console.error('Erro ao renovar token:', err);
        logout(); // força logout se refresh falhar
    }
}

// Wrapper para chamadas autenticadas
async function apiFetch(url, options = {}) {
    let access = localStorage.getItem('access');
    if (!access) return logout();

    try {
        // Tenta requisição com token atual
        let res = await fetch(BACKEND + url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${access}`
            }
        });

        // Se deu 401 (token expirado), tenta renovar
        if (res.status === 401) {
            access = await refreshToken();
            if (!access) return logout();

            res = await fetch(BACKEND + url, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${access}`
                }
            });
        }

        return res;

    // Trata erros de rede
    } catch (err) {
        console.error("Erro de rede:", err);
    return logout();
    }
}


// Verifica perfil com JWT
(async () => {
    try {
        const res = await apiFetch('/profile');
        if (!res.ok) throw new Error();
        const user = await res.json();
        if (user) window.location.replace(DASHBOARD);
    } catch {
        console.log('Usuário não está logado');
    }
})();


