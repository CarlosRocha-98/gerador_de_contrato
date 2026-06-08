window.API_BASE = window.API_BASE || 'http://localhost:8000';

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

        // If initial attempt failed and user provided an email, try username before the @
        if (!res.ok && username.includes && username.includes('@')) {
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
            // Save tokens using the same keys used by services/auth.js
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            if (typeof window.setSession === 'function') {
                window.setSession({ username });
            }
            showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => window.location.href = '../../pages/Home/index.html', 1000);
        } else {
            // try to read API error message
            const err = await res.json().catch(() => ({}));
            const msg = err.detail || err.non_field_errors || 'Usuário ou senha incorretos.';
            // Fallback: tenta login local
            const result = login(username, password);
            showMessage(result.success ? result.message : String(msg), result.success ? 'success' : 'error');
            if (result.success) {
                setTimeout(() => window.location.href = '../../pages/Home/index.html', 1000);
            }
        }
    } catch (err) {
        // API offline: usa login local
        const result = login(username, password);
        showMessage(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            setTimeout(() => window.location.href = '../../pages/Home/index.html', 1000);
        }
    }
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

function openForgot() {
    document.getElementById('forgotModal').classList.remove('hidden');
    document.getElementById('forgotMessage').className = 'message hidden';
    document.getElementById('forgotEmail').value = '';
    document.getElementById('forgotNewPass').value = '';
    document.getElementById('forgotConfirm').value = '';
}

function closeForgot() {
    document.getElementById('forgotModal').classList.add('hidden');
}

function showForgotMessage(msg, type) {
    const el = document.getElementById('forgotMessage');
    el.textContent = msg;
    el.className = 'message ' + type;
}

function resetPassword() {
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

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx   = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase());

    if (idx === -1) {
      return showForgotMessage('Email não encontrado.', 'error');
    }

    users[idx].password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    showForgotMessage('✅ Senha redefinida! Você já pode fazer login.', 'success');
    setTimeout(closeForgot, 1800);
}

function loginGoogle() {
    window.location.href = "https://modelo-de-contrato-backend.onrender.com/auth/google";
}