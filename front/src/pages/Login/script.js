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

async function gerarContratoPDF(html, titulo = "contrato") {
    try {
        const res = await apiFetch('/gerar-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, titulo })
        });

        if (!res.ok) throw new Error('Erro ao gerar PDF');

        // Recebe o PDF como blob
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // Cria link para download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titulo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        showMessage('📄 PDF gerado com sucesso!', 'success');
    } catch (err) {
        showMessage('Erro ao gerar PDF: ' + err.message, 'error');
    }
}

const contratoHTML = "<h2>Contrato de Aluguel</h2><p>Este contrato é válido por 12 meses...</p>";
gerarContratoPDF(contratoHTML, "Contrato_Aluguel");

const contratoServicoHTML = "<h2>Contrato de Servico</h2><p>Este contrato é válido por 12 meses...</p>";
gerarContratoPDF(contratoServicoHTML, "Contrato_Servico");

