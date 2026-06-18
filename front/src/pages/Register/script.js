window.API_HOST = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

console.log('[Register] script loaded');

window.addEventListener('error', function(e) {
  console.error('[Register] uncaught error', e.message, e.error);
  try { document.getElementById('message').textContent = 'Erro no script: ' + e.message; } catch (ex) {}
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('[Register] unhandled rejection', e.reason);
  try { document.getElementById('message').textContent = 'Erro no script: ' + (e.reason && e.reason.message ? e.reason.message : e.reason); } catch (ex) {}
});

const pwdEl = document.getElementById('password');
if (!pwdEl) console.warn('[Register] password input not found');
else pwdEl.addEventListener('input', function() {
  showStrength(this.value);
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email           = document.getElementById('email').value.trim();
  const password        = document.getElementById('password').value;
  const confirm         = document.getElementById('confirm').value;
  const nome            = document.getElementById('nome').value.trim();
  const cpf             = document.getElementById('cpf').value.trim();
  const telefone        = document.getElementById('telefone').value.trim();
  const nacionalidade   = document.getElementById('nacionalidade').value.trim();
  const profissao       = document.getElementById('profissao').value.trim();
  const estado_civil    = document.getElementById('estado_civil').value.trim();
  const orgao_expedidor = document.getElementById('orgao_expedidor').value.trim();
  const rua             = document.getElementById('rua').value.trim();
  const numero          = document.getElementById('numero').value.trim();
  const bairro          = document.getElementById('bairro').value.trim();
  const cep             = document.getElementById('cep').value.trim();
  const cidade          = document.getElementById('cidade').value.trim();
  const estado          = document.getElementById('estado').value.trim();

  if (password !== confirm) {
    return showMessage('As senhas não coincidem!', 'error');
  }
  if (password.length < 6) {
    return showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
  }
  // CPF-VALIDACAO: validação do CPF no cadastro de usuário.
  if (!CPF.valido(cpf)) {
    return showMessage('CPF inválido. Verifique os dígitos informados.', 'error');
  }
  if (!TelefoneBR.valido(telefone)) {
    return showMessage('Telefone inválido. Use celular ou fixo com DDD.', 'error');
  }

    try {
      // collect all form fields to send full perfil to backend
      const username = nome.split(' ')[0].toLowerCase();
      const payload = {
        username: username,
        email: email,
        password: password,
        nome: document.getElementById('nome').value.trim(),
        cpf: CPF.formatar(document.getElementById('cpf').value),
        telefone: TelefoneBR.formatar(document.getElementById('telefone').value),
        nacionalidade: document.getElementById('nacionalidade').value.trim(),
        profissao: document.getElementById('profissao').value.trim(),
        estado_civil: document.getElementById('estado_civil').value.trim(),
        orgao_expedidor: document.getElementById('orgao_expedidor').value.trim(),
        rua: document.getElementById('rua').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        cep: document.getElementById('cep').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        estado: document.getElementById('estado').value.trim(),
      };
      console.log('[Register] Sending payload to', `${window.API_HOST}/api/register/`, payload);
      const res = await fetch(`${window.API_HOST}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[Register] Response status:', res.status);

    if (res.ok) {
      showMessage('Cadastro realizado com sucesso! Faça login.', 'success');
      setTimeout(() => window.location.href = '../../pages/Login/index.html', 1200);
    } else {
      const data = await res.json();
      const msg = data.username?.[0] || data.email?.[0] || data.cpf?.[0] || data.detail || JSON.stringify(data);
      showMessage(msg, 'error');
    }
    } catch (err) {
    console.error('[Register] Fetch error:', err);
    showMessage('Erro de conexão com o servidor. Veja o console para mais detalhes.', 'error');
    // API indisponível: salva só localmente (aguarda função que pode chamar a API alternativa)
    const result = await register(email, password);
    showMessage(result.message + ' (modo offline)', result.success ? 'success' : 'error');
    if (result.success) {
      setTimeout(() => window.location.href = '../../pages/Login/index.html', 1200);
    }
  }
});

  function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  function showMessage(msg, type) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = 'message ' + type;
  }

  function showStrength(password) {
    const bar = document.getElementById('strength');
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
    const labels = ['', '🔴 Fraca', '🟠 Razoável', '🟡 Boa', '🟢 Forte'];
    bar.className = 'strength-bar ' + (levels[strength] || '');
    bar.textContent = password.length ? labels[strength] : '';
  }
