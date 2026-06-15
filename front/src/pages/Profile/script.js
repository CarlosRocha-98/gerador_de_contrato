const BACKEND = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
const jwtToken = localStorage.getItem('access_token') || localStorage.getItem('access');
const sessao   = JSON.parse(sessionStorage.getItem('session') || 'null');
const LOCAL_PROFILE_KEY = 'localProfile';

// Usuário está logado se tem JWT ou sessão local
const isLoggedIn = !!(jwtToken || sessao);

// ── Utilitários de UI ─────────────────────────────────────────────────────────
function showMsg(text, type) {
    const el = document.getElementById('msg-area');
    el.textContent = text;
    el.className = 'msg-area ' + type;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setField(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== '') el.value = value;
}

// ── Carrega perfil ────────────────────────────────────────────────────────────
function carregarPerfil() {
    if (!isLoggedIn) {
        showMsg('Você precisa estar logado para acessar esta página.', 'error');
        return;
    }

    // Sempre preenche username da sessão local
    if (sessao?.username) {
        setField('field-username', sessao.username);
    }

    if (jwtToken) {
        // --- Caminho JWT: carrega do Django API ---
        fetch(`${BACKEND}/api/perfil/`, {
            headers: { 'Authorization': 'Bearer ' + jwtToken }
        })
        .then(res => {
            if (res.status === 401) {
                showMsg('Sessão expirada. Faça login novamente.', 'error');
                throw new Error('unauthorized');
            }
            if (!res.ok) throw new Error('server');
            return res.json();
        })
        .then(p => {
            setField('field-username',      p.email || sessao?.username || '');
            setField('field-cpf',           p.cpf);
            setField('field-nome',          p.nome);
                    setField('field-orgao-expedidor', p.orgao_expedidor);
            setField('field-nacionalidade', p.nacionalidade);
            setField('field-profissao',     p.profissao);
            setField('field-estado-civil',  p.estado_civil);

            setField('field-telefone',      p.telefone);
            setField('field-rua',           p.rua);
            setField('field-numero',        p.numero);
            setField('field-bairro',        p.bairro);
            setField('field-cep',           p.cep);
            setField('field-cidade',        p.cidade);
            setField('field-estado',        p.estado);
        })
        .catch(err => {
            if (err.message !== 'unauthorized') {
                showMsg('Não foi possível carregar os dados do perfil.', 'error');
            }
        });
    } else {
        // --- Caminho local: carrega do localStorage ---
        const local = JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || '{}');
        setField('field-nome',          local.nome);
        setField('field-nacionalidade', local.nacionalidade);
        setField('field-profissao',     local.profissao);
        setField('field-estado-civil',  local.estado_civil);

        setField('field-telefone',      local.telefone);
        setField('field-rua',           local.rua);
        setField('field-numero',        local.numero);
        setField('field-bairro',        local.bairro);
        setField('field-cep',           local.cep);
        setField('field-cidade',        local.cidade);
        setField('field-estado',        local.estado);
    }
}

// ── Salva alterações ──────────────────────────────────────────────────────────
document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!isLoggedIn) {
        showMsg('Você precisa estar logado para salvar alterações.', 'error');
        return;
    }

    const btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const dados = {
        nome:            document.getElementById('field-nome').value.trim(),
        nacionalidade:   document.getElementById('field-nacionalidade').value.trim(),
        profissao:       document.getElementById('field-profissao').value.trim(),
        estado_civil:    document.getElementById('field-estado-civil').value,
        orgao_expedidor: document.getElementById('field-orgao-expedidor').value.trim(),

        telefone:        document.getElementById('field-telefone').value.trim(),
        rua:             document.getElementById('field-rua').value.trim(),
        numero:          document.getElementById('field-numero').value.trim(),
        bairro:          document.getElementById('field-bairro').value.trim(),
        cep:             document.getElementById('field-cep').value.trim(),
        cidade:          document.getElementById('field-cidade').value.trim(),
        estado:          document.getElementById('field-estado').value.trim().toUpperCase(),
    };

    if (jwtToken) {
        // --- Caminho JWT: salva no Django API ---
        fetch(BACKEND + '/api/perfil/', {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        })
        .then(res => {
            if (res.status === 401) {
                showMsg('Sessão expirada. Faça login novamente.', 'error');
                throw new Error('unauthorized');
            }
            if (!res.ok) throw new Error('server');
            return res.json();
        })
        .then(() => {
            showMsg('✅ Perfil atualizado com sucesso!', 'success');
        })
        .catch(err => {
            if (err.message !== 'unauthorized') {
                showMsg('Erro ao salvar. Tente novamente.', 'error');
            }
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = '💾 Salvar Alterações';
        });
    } else {
        // --- Caminho local: salva no localStorage ---
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(dados));
        showMsg('✅ Perfil salvo localmente com sucesso!', 'success');
        btn.disabled = false;
        btn.textContent = '💾 Salvar Alterações';
    }
});

// ── Inicializa ────────────────────────────────────────────────────────────────
carregarPerfil();

// ── Gerenciar Clientes e Imóveis ─────────────────────────────────────────────

const CLIENTES_LS = 'clientes';
const IMOVEIS_LS  = 'imoveis';
let _tabAtual = 'clientes';

function carregarClientesLocais() {
    return JSON.parse(localStorage.getItem(CLIENTES_LS) || '[]');
}

function salvarClientesLocais(lista) {
    localStorage.setItem(CLIENTES_LS, JSON.stringify(lista));
}

function mesclarClientes(backendLista, localLista) {
    const vistos = new Set();
    const resultado = [];

    [...backendLista, ...localLista].forEach(cliente => {
        const chave = cliente.id
            ? `id:${cliente.id}`
            : `cpf:${cliente.cpf || ''}:nome:${(cliente.nome || '').toLowerCase()}`;

        if (vistos.has(chave)) return;
        vistos.add(chave);
        resultado.push(cliente);
    });

    return resultado;
}

function abrirTab(tipo) {
    _tabAtual = tipo;
    document.getElementById('tab-clientes').classList.toggle('hidden', tipo !== 'clientes');
    document.getElementById('tab-imoveis').classList.toggle('hidden',  tipo !== 'imoveis');
    document.getElementById('btn-tab-clientes').classList.toggle('active', tipo === 'clientes');
    document.getElementById('btn-tab-imoveis').classList.toggle('active',  tipo === 'imoveis');
    if (tipo === 'clientes') carregarListaClientes();
    else                     carregarListaImoveis();
}

// ──────────── CLIENTES ────────────

async function carregarListaClientes() {
    const loading = document.getElementById('clientes-loading');
    const vazio   = document.getElementById('clientes-vazio');
    const table   = document.getElementById('clientes-table');
    loading.classList.remove('hidden');
    vazio.classList.add('hidden');
    table.classList.add('hidden');

    let lista = carregarClientesLocais();
    if (jwtToken) {
        try {
            const res = await fetch(`${BACKEND}/api/clientes/`, {
                headers: { 'Authorization': 'Bearer ' + jwtToken }
            });
            if (res.ok) {
                const backendLista = await res.json();
                lista = mesclarClientes(backendLista, lista);
                salvarClientesLocais(lista);
            }
        } catch (e) {
            console.warn('Falha ao carregar clientes do backend. Usando clientes locais.', e);
        }
    }

    loading.classList.add('hidden');
    if (lista.length === 0) { vazio.classList.remove('hidden'); return; }

    renderizarClientes(lista);
    table.classList.remove('hidden');
}

function renderizarClientes(lista) {
    const tbody = document.getElementById('clientes-tbody');
    tbody.innerHTML = '';
    lista.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome || '—'}</td>
            <td>${c.cpf  || '—'}</td>
            <td>${c.cidade || '—'}${c.estado ? '/' + c.estado : ''}</td>
            <td class="table-actions">
                <button class="btn-edit"   onclick='abrirModalEditCliente(${JSON.stringify(c)})'>✏️ Editar</button>
                <button class="btn-delete" onclick="excluirCliente(${c.id}, '${(c.nome||'').replace(/'/g,"\\'")}')">🗑 Excluir</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

async function excluirCliente(id, nome) {
    if (!confirm(`Excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) return;

    if (jwtToken) {
        try {
            const res = await fetch(`${BACKEND}/api/clientes/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + jwtToken }
            });
            if (!res.ok && res.status !== 204) throw new Error();
        } catch (e) {
            alert('Erro ao excluir no servidor. Removendo localmente.');
        }
    }
    // Remove do localStorage também
    const lista = carregarClientesLocais().filter(c => c.id !== id);
    salvarClientesLocais(lista);
    carregarListaClientes();
}

let _clienteEditando = null;

function abrirModalEditCliente(c) {
    _clienteEditando = c;
    document.getElementById('edit-cli-id').value            = c.id         || '';
    document.getElementById('edit-cli-nome').value          = c.nome       || '';
    document.getElementById('edit-cli-cpf').value           = c.cpf        || '';
    document.getElementById('edit-cli-orgao').value         = c.orgao_expedidor || '';
    document.getElementById('edit-cli-telefone').value      = c.telefone   || '';
    document.getElementById('edit-cli-nacionalidade').value = c.nacionalidade || '';
    document.getElementById('edit-cli-profissao').value     = c.profissao  || '';
    document.getElementById('edit-cli-estado-civil').value  = c.estado_civil || '';
    document.getElementById('edit-cli-email').value         = c.email      || '';
    document.getElementById('edit-cli-rua').value           = c.rua        || '';
    document.getElementById('edit-cli-numero').value        = c.numero     || '';
    document.getElementById('edit-cli-bairro').value        = c.bairro     || '';
    document.getElementById('edit-cli-cep').value           = c.cep        || '';
    document.getElementById('edit-cli-cidade').value        = c.cidade     || '';
    document.getElementById('edit-cli-estado').value        = c.estado     || '';
    const msgEl = document.getElementById('modal-edit-cliente-msg');
    msgEl.className = 'msg-area hidden';
    document.getElementById('modal-edit-cliente').classList.remove('hidden');
}

function fecharModalEditCliente() {
    document.getElementById('modal-edit-cliente').classList.add('hidden');
    _clienteEditando = null;
}

async function salvarEdicaoCliente() {
    const id = document.getElementById('edit-cli-id').value;
    const dados = {
        nome:            document.getElementById('edit-cli-nome').value.trim(),
        cpf:             document.getElementById('edit-cli-cpf').value.trim(),
        orgao_expedidor: document.getElementById('edit-cli-orgao').value.trim(),
        telefone:        document.getElementById('edit-cli-telefone').value.trim(),
        nacionalidade:   document.getElementById('edit-cli-nacionalidade').value.trim(),
        profissao:       document.getElementById('edit-cli-profissao').value.trim(),
        estado_civil:    document.getElementById('edit-cli-estado-civil').value,
        email:           document.getElementById('edit-cli-email').value.trim(),
        rua:             document.getElementById('edit-cli-rua').value.trim(),
        numero:          document.getElementById('edit-cli-numero').value.trim(),
        bairro:          document.getElementById('edit-cli-bairro').value.trim(),
        cep:             document.getElementById('edit-cli-cep').value.trim(),
        cidade:          document.getElementById('edit-cli-cidade').value.trim(),
        estado:          document.getElementById('edit-cli-estado').value.trim().toUpperCase(),
    };
    const msgEl = document.getElementById('modal-edit-cliente-msg');

    if (jwtToken && id) {
        try {
            const res = await fetch(`${BACKEND}/api/clientes/${id}/`, {
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + jwtToken, 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!res.ok) throw new Error(await res.text());
            const salvo = await res.json();
            // Atualiza localStorage
            const lista = carregarClientesLocais().map(c =>
                String(c.id) === String(id) ? salvo : c
            );
            salvarClientesLocais(lista);
            msgEl.textContent = '✅ Salvo com sucesso!';
            msgEl.className = 'msg-area success';
            setTimeout(() => { fecharModalEditCliente(); carregarListaClientes(); }, 800);
            return;
        } catch (e) {
            msgEl.textContent = 'Erro ao salvar no servidor: ' + e.message;
            msgEl.className = 'msg-area error';
            return;
        }
    }
    // Fallback local
    const lista = carregarClientesLocais().map(c =>
        String(c.id) === String(id) ? { ...c, ...dados } : c
    );
    salvarClientesLocais(lista);
    fecharModalEditCliente();
    carregarListaClientes();
}

// ──────────── IMÓVEIS ────────────

async function carregarListaImoveis() {
    const loading = document.getElementById('imoveis-loading');
    const vazio   = document.getElementById('imoveis-vazio');
    const table   = document.getElementById('imoveis-table');
    loading.classList.remove('hidden');
    vazio.classList.add('hidden');
    table.classList.add('hidden');

    let lista = [];
    if (jwtToken) {
        try {
            const res = await fetch(`${BACKEND}/api/imoveis/`, {
                headers: { 'Authorization': 'Bearer ' + jwtToken }
            });
            if (res.ok) {
                lista = await res.json();
                localStorage.setItem(IMOVEIS_LS, JSON.stringify(lista));
            }
        } catch (e) {
            lista = JSON.parse(localStorage.getItem(IMOVEIS_LS) || '[]');
        }
    } else {
        lista = JSON.parse(localStorage.getItem(IMOVEIS_LS) || '[]');
    }

    loading.classList.add('hidden');
    if (lista.length === 0) { vazio.classList.remove('hidden'); return; }

    renderizarImoveis(lista);
    table.classList.remove('hidden');
}

function renderizarImoveis(lista) {
    const tbody = document.getElementById('imoveis-tbody');
    tbody.innerHTML = '';
    lista.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i.endereco || '—'}${i.numero ? ', ' + i.numero : ''}</td>
            <td>${i.cidade || '—'}${i.estado ? '/' + i.estado : ''}</td>
            <td>${i.tipo || '—'}</td>
            <td class="table-actions">
                <button class="btn-edit"   onclick='abrirModalEditImovel(${JSON.stringify(i)})'>✏️ Editar</button>
                <button class="btn-delete" onclick="excluirImovel(${i.id}, '${(i.endereco||'').replace(/'/g,"\\'")}')">🗑 Excluir</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

async function excluirImovel(id, endereco) {
    if (!confirm(`Excluir o imóvel "${endereco}"? Esta ação não pode ser desfeita.`)) return;

    if (jwtToken) {
        try {
            const res = await fetch(`${BACKEND}/api/imoveis/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + jwtToken }
            });
            if (!res.ok && res.status !== 204) throw new Error();
        } catch (e) {
            alert('Erro ao excluir no servidor. Removendo localmente.');
        }
    }
    const lista = JSON.parse(localStorage.getItem(IMOVEIS_LS) || '[]').filter(i => i.id !== id);
    localStorage.setItem(IMOVEIS_LS, JSON.stringify(lista));
    carregarListaImoveis();
}

let _imovelEditando = null;

function abrirModalEditImovel(i) {
    _imovelEditando = i;
    document.getElementById('edit-imo-id').value            = i.id               || '';
    document.getElementById('edit-imo-endereco').value      = i.endereco         || '';
    document.getElementById('edit-imo-numero').value        = i.numero           || '';
    document.getElementById('edit-imo-bairro').value        = i.bairro           || '';
    document.getElementById('edit-imo-cidade').value     = i.cidade || '';
    document.getElementById('edit-imo-estado').value = i.estado || '';
    document.getElementById('edit-imo-tipo').value          = i.tipo             || 'casa';
    document.getElementById('edit-imo-caracteristicas').value = i.caracteristicas || '';
    const msgEl = document.getElementById('modal-edit-imovel-msg');
    msgEl.className = 'msg-area hidden';
    document.getElementById('modal-edit-imovel').classList.remove('hidden');
}

function fecharModalEditImovel() {
    document.getElementById('modal-edit-imovel').classList.add('hidden');
    _imovelEditando = null;
}

async function salvarEdicaoImovel() {
    const id = document.getElementById('edit-imo-id').value;
    const dados = {
        endereco:        document.getElementById('edit-imo-endereco').value.trim(),
        numero:          document.getElementById('edit-imo-numero').value.trim(),
        bairro:          document.getElementById('edit-imo-bairro').value.trim(),
        cidade:          document.getElementById('edit-imo-cidade').value.trim(),
        estado:          document.getElementById('edit-imo-estado').value.trim().toUpperCase(),
        tipo:            document.getElementById('edit-imo-tipo').value,
        caracteristicas: document.getElementById('edit-imo-caracteristicas').value.trim(),
    };
    const msgEl = document.getElementById('modal-edit-imovel-msg');

    if (jwtToken && id) {
        try {
            const res = await fetch(`${BACKEND}/api/imoveis/${id}/`, {
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + jwtToken, 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            if (!res.ok) throw new Error(await res.text());
            const salvo = await res.json();
            const lista = JSON.parse(localStorage.getItem(IMOVEIS_LS) || '[]').map(i =>
                String(i.id) === String(id) ? salvo : i
            );
            localStorage.setItem(IMOVEIS_LS, JSON.stringify(lista));
            msgEl.textContent = '✅ Salvo com sucesso!';
            msgEl.className = 'msg-area success';
            setTimeout(() => { fecharModalEditImovel(); carregarListaImoveis(); }, 800);
            return;
        } catch (e) {
            msgEl.textContent = 'Erro ao salvar no servidor: ' + e.message;
            msgEl.className = 'msg-area error';
            return;
        }
    }
    const lista = JSON.parse(localStorage.getItem(IMOVEIS_LS) || '[]').map(i =>
        String(i.id) === String(id) ? { ...i, ...dados } : i
    );
    localStorage.setItem(IMOVEIS_LS, JSON.stringify(lista));
    fecharModalEditImovel();
    carregarListaImoveis();
}

// Fecha modais ao clicar fora
document.getElementById('modal-edit-cliente')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-edit-cliente')) fecharModalEditCliente();
});
document.getElementById('modal-edit-imovel')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-edit-imovel')) fecharModalEditImovel();
});

// Carrega clientes ao entrar na página
carregarListaClientes();
