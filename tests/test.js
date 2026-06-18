const API = 'http://localhost:8000/api';

function gerarCPF(seed) {
  const base = String(100000000 + Number(seed)).slice(-9).split('').map(Number);
  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    const soma = base.slice(0, tamanho).reduce((total, digito, i) => total + digito * (tamanho + 1 - i), 0);
    const resto = (soma * 10) % 11;
    base.push(resto === 10 ? 0 : resto);
  }
  const cpf = base.join('');
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

// ── Geração em Massa ──────────────────────────────────────────────────────────

function log(msg, tipo) {
  const el = document.getElementById('bulk-log');
  const linha = document.createElement('span');
  linha.className = 'log-linha log-' + (tipo || 'info');
  linha.textContent = msg + '\n';
  el.appendChild(linha);
  el.scrollTop = el.scrollHeight;
}

function limparLog() {
  document.getElementById('bulk-log').innerHTML = '';
  const prog = document.getElementById('bulk-progress');
  prog.classList.add('bulk-hidden');
  document.getElementById('bulk-bar-inner').style.width = '0%';
}

function setProgresso(atual, total) {
  const prog = document.getElementById('bulk-progress');
  const bar  = document.getElementById('bulk-bar-inner');
  prog.classList.remove('bulk-hidden');
  const pct = Math.round((atual / total) * 100);
  bar.style.width = pct + '%';
  bar.textContent = pct + '%';
}

async function gerarEmMassa() {
  const qty = parseInt(document.getElementById('bulk-qty').value, 10);
  if (!qty || qty < 1 || qty > 50) {
    return log('⚠️  Quantidade inválida (1–50).', 'erro');
  }

  const btn = document.getElementById('btn-bulk');
  btn.disabled = true;
  limparLog();
  log(`Iniciando geração de ${qty} usuário(s)...`, 'info');

  const SENHA = '123456@';
  let ok = 0, erro = 0;
  const total = qty * 3; // cadastro + login + cliente + imóvel = 4 ops, mas agrupamos por usuário
  let passo = 0;

  for (let n = 1; n <= qty; n++) {
    const email = `teste${n}@teste.com`;
    const cpfTeste = gerarCPF(n);
    log(`\n── Usuário ${n}: ${email} ──────────────────`, 'titulo');

    // 1. Cadastrar usuário
    const reg = await request('POST', `${API}/register/`, {
      username: email, email, password: SENHA,
      nome: `TESTE${n}_nome`,
      cpf: cpfTeste,
      telefone: '(11) 99999-0000',
      nacionalidade: `TESTE${n}_nacionalidade`,
      profissao: `TESTE${n}_profissao`,
    });
    passo++;
    setProgresso(passo, total * 4);

    if (reg.ok) {
      log(`  ✅ Cadastro OK  (id: ${reg.data.id})`, 'ok');
    } else {
      const motivo = JSON.stringify(reg.data);
      log(`  ⚠️  Cadastro: ${motivo}`, 'aviso');
    }

    // 2. Login
    const loginRes = await request('POST', `${API}/token/`, { username: email, password: SENHA });
    passo++;
    setProgresso(passo, total * 4);

    if (!loginRes.ok) {
      log(`  ❌ Login falhou: ${JSON.stringify(loginRes.data)}`, 'erro');
      erro++;
      continue;
    }
    const token = loginRes.data.access;
    log(`  ✅ Login OK  (token obtido)`, 'ok');

    // 3. Cadastrar cliente
    const cli = await request('POST', `${API}/clientes/`, {
      nome:          `TESTE${n}_nome`,
      cpf:           cpfTeste,
      email:         `TESTE${n}_email@teste.com`,
      telefone:      '(11) 99999-0000',
      nacionalidade: `TESTE${n}_nacionalidade`,
      profissao:     `TESTE${n}_profissao`,
      estado_civil:  `TESTE${n}_estadocivil`,
      rua:           `TESTE${n}_rua`,
      numero:        `${n}`,
      bairro:        `TESTE${n}_bairro`,
      cep:           `TESTE${n}_cep`,
      cidade:        `TESTE${n}_cidade`,
      estado:        'SP',
    }, token);
    passo++;
    setProgresso(passo, total * 4);

    if (cli.ok) {
      log(`  ✅ Cliente OK  (id: ${cli.data.id})`, 'ok');
    } else {
      log(`  ❌ Cliente falhou: ${JSON.stringify(cli.data)}`, 'erro');
      erro++;
    }

    // 4. Cadastrar imóvel
    const imo = await request('POST', `${API}/imoveis/`, {
      endereco:        `TESTE${n}_endereco`,
      numero:          `${n}`,
      bairro:          `TESTE${n}_bairro`,
      cidade_uf:       `TESTE${n}_cidade/SP`,
      tipo:            'casa',
      caracteristicas: `TESTE${n}_caracteristicas`,
    }, token);
    passo++;
    setProgresso(passo, total * 4);

    if (imo.ok) {
      log(`  ✅ Imóvel OK  (id: ${imo.data.id})`, 'ok');
      ok++;
    } else {
      log(`  ❌ Imóvel falhou: ${JSON.stringify(imo.data)}`, 'erro');
      erro++;
    }
  }

  setProgresso(1, 1);
  log(`\n════════════════════════════════════════`, 'titulo');
  log(`Concluído: ${ok} usuário(s) completos, ${erro} erro(s).`, erro > 0 ? 'aviso' : 'ok');
  btn.disabled = false;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('test_access') || '';
}

function mostrar(elId, data, ok) {
  const el = document.getElementById(elId);
  el.textContent = JSON.stringify(data, null, 2);
  el.className = 'result ' + (ok ? 'ok' : 'erro');
}

async function request(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({ detail: res.statusText }));
  return { ok: res.ok, status: res.status, data };
}

// ── 1. Cadastro de Usuário ────────────────────────────────────────────────────

async function testarCadastro() {
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!email || !password) return mostrar('reg-result', { erro: 'Preencha email e senha.' }, false);

  const { ok, status, data } = await request('POST', `${API}/register/`, {
    username: email, email, password,
  });

  mostrar('reg-result', { status, ...data }, ok);
}

// ── 2. Login ──────────────────────────────────────────────────────────────────

async function testarLogin() {
  const username = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) return mostrar('login-result', { erro: 'Preencha email e senha.' }, false);

  const { ok, status, data } = await request('POST', `${API}/token/`, { username, password });

  if (ok) {
    localStorage.setItem('test_access',  data.access);
    localStorage.setItem('test_refresh', data.refresh);
    document.getElementById('token-info').textContent =
      '✅ Token salvo! Access: ' + data.access.substring(0, 40) + '...';
  }

  mostrar('login-result', { status, ...data }, ok);
}

// ── 3. Cadastro de Cliente ────────────────────────────────────────────────────

async function testarCadastroCliente() {
  const token = getToken();
  if (!token) return mostrar('cli-result', { erro: 'Faça login primeiro (seção 2).' }, false);

  const body = {
    nome:     document.getElementById('cli-nome').value.trim(),
    cpf:      document.getElementById('cli-cpf').value.trim(),
    email:    document.getElementById('cli-email').value.trim(),
    telefone: document.getElementById('cli-telefone').value.trim(),
    cidade:   document.getElementById('cli-cidade').value.trim(),
    estado:   document.getElementById('cli-estado').value.trim().toUpperCase(),
  };

  if (!body.nome || !body.cpf) return mostrar('cli-result', { erro: 'Nome e CPF são obrigatórios.' }, false);
  if (!TelefoneBR.valido(body.telefone)) {
    return mostrar('cli-result', { erro: 'Telefone inválido. Use celular ou fixo com DDD.' }, false);
  }
  body.telefone = TelefoneBR.formatar(body.telefone);

  const { ok, status, data } = await request('POST', `${API}/clientes/`, body, token);
  mostrar('cli-result', { status, ...data }, ok);
}

// ── 4. Cadastro de Imóvel ─────────────────────────────────────────────────────

async function testarCadastroImovel() {
  const token = getToken();
  if (!token) return mostrar('imo-result', { erro: 'Faça login primeiro (seção 2).' }, false);

  const body = {
    endereco:        document.getElementById('imo-endereco').value.trim(),
    numero:          document.getElementById('imo-numero').value.trim(),
    bairro:          document.getElementById('imo-bairro').value.trim(),
    cidade_uf:       document.getElementById('imo-cidadeuf').value.trim(),
    tipo:            document.getElementById('imo-tipo').value,
    caracteristicas: document.getElementById('imo-caract').value.trim(),
  };

  if (!body.endereco || !body.numero) return mostrar('imo-result', { erro: 'Endereço e número são obrigatórios.' }, false);

  const { ok, status, data } = await request('POST', `${API}/imoveis/`, body, token);
  mostrar('imo-result', { status, ...data }, ok);
}

// ── 5. Listar Clientes ────────────────────────────────────────────────────────

async function listarClientes() {
  const token = getToken();
  if (!token) return mostrar('list-cli-result', { erro: 'Faça login primeiro (seção 2).' }, false);

  const { ok, status, data } = await request('GET', `${API}/clientes/`, null, token);
  mostrar('list-cli-result', { status, total: Array.isArray(data) ? data.length : '?', data }, ok);
}

// ── 6. Listar Imóveis ─────────────────────────────────────────────────────────

async function listarImoveis() {
  const token = getToken();
  if (!token) return mostrar('list-imo-result', { erro: 'Faça login primeiro (seção 2).' }, false);

  const { ok, status, data } = await request('GET', `${API}/imoveis/`, null, token);
  mostrar('list-imo-result', { status, total: Array.isArray(data) ? data.length : '?', data }, ok);
}
