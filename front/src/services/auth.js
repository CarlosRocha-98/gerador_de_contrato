// Frontend auth utilities — integrate with Django REST API (JWT)

window.API_HOST = window.API_HOST || 'http://localhost:8000'; // adjust if backend runs elsewhere

function saveLocal(key, value) {
  // Store strings raw (useful for tokens); JSON.stringify for objects
  if (typeof value === 'string') {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function readLocal(key) {
  const v = localStorage.getItem(key);
  if (v === null) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    // value is a raw string (e.g. token)
    return v;
  }
}

function clearLocal(key) {
  localStorage.removeItem(key);
}

function setSession(user) {
  saveLocal('session', user);
}

function getSession() {
  return readLocal('session');
}

function clearSession() {
  clearLocal('session');
  clearLocal('access_token');
  clearLocal('refresh_token');
}

async function register(dataOrUsername, maybePassword) {
  // Accept either (username, password) or an object with all fields
  let payload = {};
  if (typeof dataOrUsername === 'object') {
    payload = { ...dataOrUsername };
  } else {
    const username = dataOrUsername;
    const password = maybePassword;
    if (!username || !password) return { success: false, message: 'Preencha todos os campos.' };
    const uname = username.includes('@') ? username.split('@')[0] : username;
    payload = {
      username: uname,
      email: username,
      password: password,
      nome: uname,
      cpf: '00000000000'
    };
  }

  // basic required validation
  if (!payload.username || !payload.password) return { success: false, message: 'Preencha todos os campos.' };
  payload.email = payload.email || payload.username;
  payload.nome = payload.nome || payload.username;
  payload.cpf = payload.cpf || '00000000000';

  try {
    const res = await fetch(`${window.API_HOST}/api/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return { success: true, message: 'Cadastro realizado! Redirecionando...' };
    }

    const data = await res.json();
    const msg = data.detail || (data.username || data.non_field_errors || JSON.stringify(data));
    return { success: false, message: String(msg) };
  } catch (err) {
    return { success: false, message: 'Erro de conexão com o servidor.' };
  }
}

async function login(username, password) {
  if (!username || !password) return { success: false, message: 'Preencha todos os campos.' };

  try {
    const res = await fetch(`${window.API_HOST}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.detail || 'Usuário ou senha incorretos.' };
    }

    const data = await res.json();
    // store tokens
    saveLocal('access_token', data.access);
    saveLocal('refresh_token', data.refresh);
    setSession({ username });
    return { success: true, message: 'Login realizado! Redirecionando...' };
  } catch (err) {
    return { success: false, message: 'Erro de conexão com o servidor.' };
  }
}

function logout() {
  clearSession();
  // Also remove any legacy token keys
  clearLocal('access');
  clearLocal('refresh');

  // Compute relative path to front/index.html and redirect there
  try {
    const parts = location.pathname.split('/').filter(Boolean);
    const frontIdx = parts.lastIndexOf('front');
    let redirectTo = 'index.html';
    if (frontIdx !== -1) {
      const ups = parts.length - frontIdx - 1; // segments after 'front'
      redirectTo = '../'.repeat(ups) + 'index.html';
    }
    window.location.href = redirectTo;
    return;
  } catch (e) {
    // fallback
    window.location.href = 'index.html';
    return;
  }
}

function getAccessToken() {
  return readLocal('access_token');
}

async function authFetch(input, init = {}) {
  const token = getAccessToken();
  init.headers = init.headers || {};
  if (token) init.headers['Authorization'] = `Bearer ${token}`;
  return fetch(input, init);
}

// expose to global scope for existing scripts
window.register = register;
window.login = login;
window.logout = logout;
window.getSession = getSession;
window.authFetch = authFetch;
