window.API_BASE = 'https://gerador-de-contrato-6uck.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let username = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const base = ((window.API_HOST || window.API_BASE) || '').replace(/\/$/, '');
        const tokenUrl = base.endsWith('/api') ? `${base}/token/` : `${base}/api/token/`;

        let res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        // Fallback: tenta username antes do @
        if (!res.ok && username.includes('@')) {
            const altUsername = username.split('@')[0];
            res = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: altUsername, password }),
            });
            if (res.ok) username = altUsername;
        }

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            if (typeof window.setSession === 'function') {
                window.setSession({ username });
            }

            showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => window.location.href = '../../pages/Home/index.html', 1000);
        } else {
            showMessage('Usuário ou senha incorretos.', 'error');
        }
    } catch (err) {
        showMessage('Erro de conexão com o servidor.', 'error');
    }
});

document.getElementById('btnGoogleLogin')?.addEventListener('click', () => {
    showMessage('Login com Google temporariamente indisponível. Use email e senha.', 'error');
});

document.getElementById('btnFacebookLogin')?.addEventListener('click', () => {
    showMessage('Login com Facebook temporariamente indisponível. Use email e senha.', 'error');
});

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function showMessage(msg, type) {
    const el = document.getElementById('message');
    if(el) {
        el.textContent = msg;
        el.className = 'message ' + type;
    }
}

function openForgot(event) {
    event?.preventDefault();

    const modal = document.getElementById('forgotModal');
    const emailInput = document.getElementById('forgotEmail');
    const loginEmail = document.getElementById('email')?.value.trim();

    if (emailInput && loginEmail) {
        emailInput.value = loginEmail;
    }

    showForgotMessage('', 'hidden');
    modal?.classList.remove('hidden');
    emailInput?.focus();
}

function closeForgot() {
    document.getElementById('forgotModal')?.classList.add('hidden');
}

function showForgotMessage(msg, type) {
    const el = document.getElementById('forgotMessage');
    if (!el) return;

    el.textContent = msg;
    el.className = msg ? `message ${type}` : 'message hidden';
}

async function resetPassword() {
    const email    = document.getElementById('forgotEmail').value.trim();
    const newPass  = document.getElementById('forgotNewPass').value;
    const confirm  = document.getElementById('forgotConfirm').value;

    if (!email || !newPass || !confirm) {
      return showForgotMessage('Preencha todos os campos.', 'error');
    }
    if (newPass !== confirm) {
      return showForgotMessage('As senhas não coincidem!', 'error');
    }
    if (newPass.length < 6) {
      return showForgotMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
    }

    try {
        const base = ((window.API_HOST || window.API_BASE) || '').replace(/\/$/, '');
        const url = base.endsWith('/api') ? `${base}/reset-password/` : `${base}/api/reset-password/`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, new_password: newPass })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return showForgotMessage(err.detail || 'Erro ao redefinir senha.', 'error');
        }

        showForgotMessage('✅ Senha redefinida! Você já pode fazer login.', 'success');
        setTimeout(closeForgot, 1800);
    } catch (err) {
        showForgotMessage('Erro de conexão com o servidor.', 'error');
    }
}

