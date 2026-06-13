// 1. Verifica login local
const session = getSession();
const jwtToken = localStorage.getItem('access_token') || localStorage.getItem('access');

function setWelcome(name) {
    document.getElementById('welcome-msg').textContent =
        `Olá, ${name}! O que vamos fazer hoje?`;
}

if (session || jwtToken) {
    // Tenta obter o nome real: localProfile > API Django > fallback session.username
    const localProfile = JSON.parse(localStorage.getItem('localProfile') || 'null');

    if (jwtToken) {
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
        fetch(`${API_BASE}/api/perfil/`, {
            headers: { 'Authorization': 'Bearer ' + jwtToken }
        })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(p => setWelcome(p.nome || session?.username || 'Usuário'))
        .catch(() => setWelcome(localProfile?.nome || session?.username || 'Usuário'));
    } else if (localProfile?.nome) {
        setWelcome(localProfile.nome);
    } else {
        setWelcome(session.username);
    }
    } else {
        // 2. Tenta verificar backend OAuth apenas quando mesmo host (evita CORS)
        const BACKEND = API_BASE;
        try {
            if (window.location.origin === (new URL(BACKEND)).origin) {
                fetch(BACKEND + '/profile', { credentials: 'include' })
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(user => {
                    setWelcome(user.displayName || 'Usuário');

                    const div = document.getElementById("userInfo");
                    if (div && user.photos) {
                        div.innerHTML = `<img src="${user.photos[0].value}" width="60" style="border-radius:50%; margin-bottom:10px;" />`;
                    }
                })
                .catch(() => {
                    document.getElementById('welcome-msg').textContent = "Modo Desenvolvedor: Login não detectado.";
                });
            } else {
                document.getElementById('welcome-msg').textContent = "Modo Desenvolvedor: Login não detectado.";
            }
        } catch (e) {
            document.getElementById('welcome-msg').textContent = "Modo Desenvolvedor: Login não detectado.";
        }
    }

function logout() {
    clearSession();
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    // Caminho para voltar à Landing Page principal
    window.location.href = "../../../index.html";
}