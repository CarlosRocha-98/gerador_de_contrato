// ── Navbar toggle mobile ──────────────────────────────────────────────────────
const navbarToggle  = document.querySelector('.navbar-toggle');
const navbarMenu    = document.querySelector('.navbar-menu');
const navbarOverlay = document.querySelector('.navbar-overlay');

if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        if (navbarOverlay) navbarOverlay.classList.toggle('active');
    });
    if (navbarOverlay) {
        navbarOverlay.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            navbarOverlay.classList.remove('active');
        });
    }
}

// ── Confirmação antes de sair da página ──────────────────────────────────────
const MSG_AVISO = 'As informações não salvas serão perdidas. Deseja continuar?';

document.getElementById('btn-dashboard')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm(MSG_AVISO)) window.location.href = this.getAttribute('href');
});
document.querySelector('a.navbar-cta[href*="ContractType"]')?.addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm(MSG_AVISO)) window.location.href = this.getAttribute('href');
});

// ── Barra divisória ───────────────────────────────────────────────────────────
const contractPage       = document.querySelector('.contract-page');
const btnCollapseForm    = document.getElementById('btn-collapse-form');
const btnCollapsePreview = document.getElementById('btn-collapse-preview');

if (btnCollapseForm && btnCollapsePreview && contractPage) {
    btnCollapseForm.addEventListener('click', () => {
        if (contractPage.classList.contains('form-collapsed')) {
            contractPage.classList.remove('form-collapsed');
            btnCollapseForm.querySelector('span').textContent = '◀';
        } else {
            contractPage.classList.remove('preview-collapsed');
            contractPage.classList.add('form-collapsed');
            btnCollapseForm.querySelector('span').textContent = '▶';
            btnCollapsePreview.querySelector('span').textContent = '▶';
        }
    });
    btnCollapsePreview.addEventListener('click', () => {
        if (contractPage.classList.contains('preview-collapsed')) {
            contractPage.classList.remove('preview-collapsed');
            btnCollapsePreview.querySelector('span').textContent = '▶';
        } else {
            contractPage.classList.remove('form-collapsed');
            contractPage.classList.add('preview-collapsed');
            btnCollapsePreview.querySelector('span').textContent = '◀';
            btnCollapseForm.querySelector('span').textContent = '◀';
        }
    });
}

// ── IDs dos campos bloqueáveis ────────────────────────────────────────────────
const PREST_FIELD_IDS = [
    'prest-nome','prest-nacionalidade','prest-profissao','prest-estado-civil',
    'prest-cpf','prest-telefone','prest-email','prest-endereco',
    'prest-numero','prest-bairro','prest-cep','prest-cidade','prest-estado'
];
const CONT_FIELD_IDS = [
    'cont-nome','cont-nacionalidade','cont-profissao','cont-estado-civil',
    'cont-cpf','cont-telefone','cont-endereco',
    'cont-numero','cont-bairro','cont-cep','cont-cidade','cont-estado'
];

let _selectedContratanteId = null;

function bloquearCampos(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value) return;
        if (el.tagName === 'SELECT') {
            el.disabled = true;
        } else {
            el.readOnly = true;
        }
        el.classList.add('prefilled');
    });
}

// ── Mapeamento de campos do formulário para o preview ────────────────────────
const fieldMap = {
    'cont-nome':          'pv-cont-nome',
    'cont-nacionalidade': 'pv-cont-nacionalidade',
    'cont-profissao':     'pv-cont-profissao',
    'cont-estado-civil':  'pv-cont-estado-civil',
    'cont-cpf':           'pv-cont-cpf',
    'cont-telefone':      'pv-cont-telefone',
    'cont-endereco':      'pv-cont-endereco',
    'cont-numero':        'pv-cont-numero',
    'cont-bairro':        'pv-cont-bairro',
    'cont-cep':           'pv-cont-cep',
    'cont-cidade':        'pv-cont-cidade',
    'cont-estado':        'pv-cont-estado',
    'prest-nome':          'pv-prest-nome',
    'prest-nacionalidade': 'pv-prest-nacionalidade',
    'prest-profissao':     'pv-prest-profissao',
    'prest-estado-civil':  'pv-prest-estado-civil',
    'prest-cpf':           'pv-prest-cpf',
    'prest-telefone':      'pv-prest-telefone',
    'prest-endereco':      'pv-prest-endereco',
    'prest-numero':        'pv-prest-numero',
    'prest-bairro':        'pv-prest-bairro',
    'prest-cep':           'pv-prest-cep',
    'prest-cidade':        'pv-prest-cidade',
    'prest-estado':        'pv-prest-estado',
    'tipo-servico':           'pv-tipo-servico',
    'especificacao-servico':  'pv-especificacao-servico',
    'atividades-contratadas': 'pv-atividades-contratadas',
    'motivo-contratacao':     'pv-motivo-contratacao',
    'local-execucao':         'pv-local-execucao',
    'disposicoes-seguranca':  'pv-disposicoes-seguranca',
    'prazo-meses':    'pv-prazo-meses',
    'valor-mensal':   'pv-valor-mensal',
    'forma-pagamento':'pv-forma-pagamento',
    'dia-vencimento': 'pv-dia-vencimento',
    'multa-atraso':   'pv-multa-atraso',
    'multa-rescisao': 'pv-multa-rescisao',
    'assinatura-cidade': 'pv-assinatura-cidade',
    'assinatura-estado': 'pv-assinatura-estado',
};

const foro = {
    'assinatura-cidade': 'pv-assinatura-cidade2',
    'assinatura-estado': 'pv-assinatura-estado2',
};

function updatePreview(inputId) {
    const input     = document.getElementById(inputId);
    const previewEl = document.getElementById(fieldMap[inputId]);
    if (!input || !previewEl) return;
    const value = input.value.trim();
    previewEl.textContent = value || '______________';
    if (foro[inputId]) {
        const foroEl = document.getElementById(foro[inputId]);
        if (foroEl) foroEl.textContent = value || '______________';
    }
}

function sincronizarTodosPreview() {
    Object.keys(fieldMap).forEach(updatePreview);
}

function formatDate(dateStr) {
    if (!dateStr) return '______________';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['janeiro','fevereiro','março','abril','maio','junho',
        'julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${parseInt(parts[2])} de ${months[parseInt(parts[1]) - 1]} de ${parts[0]}`;
}

function updateDatePreview(inputId, previewId) {
    const input     = document.getElementById(inputId);
    const previewEl = document.getElementById(previewId);
    if (!input || !previewEl) return;
    previewEl.textContent = formatDate(input.value);
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Listeners de preview para todos os campos texto/select/textarea
    Object.keys(fieldMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input',  () => updatePreview(id));
            el.addEventListener('change', () => updatePreview(id));
        }
    });
    ['data-inicio','data-termino','data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        const pvId = id === 'data-inicio' ? 'pv-data-inicio'
                   : id === 'data-termino' ? 'pv-data-termino' : 'pv-data-assinatura';
        el?.addEventListener('change', () => updateDatePreview(id, pvId));
    });

    // Auto-preencher hoje nas datas
    const hoje = new Date().toISOString().slice(0, 10);
    ['data-inicio','data-termino','data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) {
            el.value = hoje;
            const pvId = id === 'data-inicio' ? 'pv-data-inicio'
                       : id === 'data-termino' ? 'pv-data-termino' : 'pv-data-assinatura';
            updateDatePreview(id, pvId);
        }
    });
});

// ── Checkboxes ────────────────────────────────────────────────────────────────
document.getElementById('executa-nas-dependencias')?.addEventListener('change', function () {
    const localEl = document.getElementById('pv-local-texto');
    if (!localEl) return;
    const local = document.getElementById('pv-local-execucao')?.textContent || '______________';
    if (this.checked) {
        localEl.innerHTML = `Os serviços serão executados nas dependências da CONTRATANTE, situadas em <span class="preview-field" id="pv-local-execucao">${local}</span>.`;
    } else {
        localEl.innerHTML = `Os serviços serão executados fora das dependências da CONTRATANTE, no seguinte local: <span class="preview-field" id="pv-local-execucao">${local}</span>.`;
    }
});

document.getElementById('sem-multa-rescisao')?.addEventListener('change', function () {
    const campo = document.getElementById('multa-rescisao');
    campo.disabled = this.checked;
    if (this.checked) {
        campo.value = '';
        const el = document.getElementById('pv-multa-rescisao');
        if (el) el.textContent = 'isento';
        const textoEl = document.getElementById('pv-rescisao-texto');
        if (textoEl) textoEl.textContent = 'As partes podem rescindir o presente contrato a qualquer momento, sem ônus para nenhuma das partes, mediante aviso prévio de 30 (trinta) dias.';
    }
});

document.getElementById('responsabilidade-subsidiaria')?.addEventListener('change', function () {
    const textoEl = document.getElementById('pv-resp-texto');
    if (!textoEl) return;
    if (this.checked) {
        textoEl.textContent = 'A CONTRATANTE responde subsidiariamente pelas obrigações trabalhistas e previdenciárias decorrentes da execução deste contrato, nos termos da legislação vigente.';
    } else {
        textoEl.textContent = 'A CONTRATANTE não responde subsidiariamente pelas obrigações trabalhistas e previdenciárias do PRESTADOR, sendo este o único responsável pelo cumprimento dessas obrigações.';
    }
});

// ── Pré-preenchimento do Prestador (perfil do usuário logado) ─────────────────
function preencherPrestador(p) {
    const mapa = {
        'prest-nome':          p.nome,
        'prest-nacionalidade': p.nacionalidade,
        'prest-profissao':     p.profissao,
        'prest-cpf':           p.cpf,
        'prest-telefone':      p.telefone,
        'prest-email':         p.email,
        'prest-endereco':      p.rua,
        'prest-numero':        p.numero,
        'prest-bairro':        p.bairro,
        'prest-cep':           p.cep,
        'prest-cidade':        p.cidade,
        'prest-estado':        p.estado,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
        if (!valor) return;
        const el = document.getElementById(id);
        if (el) { el.value = valor; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }
    });
    const selectEC = document.getElementById('prest-estado-civil');
    if (selectEC && p.estado_civil) {
        selectEC.value = p.estado_civil;
        selectEC.dispatchEvent(new Event('change'));
    }
    const nomeEl = document.getElementById('prest-nome');
    if (nomeEl && nomeEl.value) bloquearCampos(PREST_FIELD_IDS);
}

// ── Carregamento do perfil ────────────────────────────────────────────────────
const jwtToken = localStorage.getItem('access') || localStorage.getItem('access');

if (jwtToken) {
    const API_BASE = window.API_HOST || 'http://localhost:8000';
    fetch(`${API_BASE}/api/perfil/`, { headers: { 'Authorization': 'Bearer ' + jwtToken } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(p => preencherPrestador(p))
        .catch(() => {
            const local = JSON.parse(localStorage.getItem('localProfile') || 'null');
            if (local) preencherPrestador(local);
        });
} else {
    const local = JSON.parse(localStorage.getItem('localProfile') || 'null');
    if (local) preencherPrestador(local);
}

// ── Gestão de Clientes ────────────────────────────────────────────────────────
const CLIENTES_KEY = 'clientes';

function carregarClientes() {
    return JSON.parse(localStorage.getItem(CLIENTES_KEY) || '[]');
}

function salvarClientesLS(lista) {
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(lista));
}

function clienteJaExiste(lista, novo) {
    if (!novo) return false;
    const nome = (novo.nome || '').trim().toLowerCase();
    const cpf  = (novo.cpf  || '').trim();
    return lista.some(c =>
        (nome && (c.nome || '').toLowerCase() === nome) ||
        (cpf  && c.cpf === cpf)
    );
}

function clienteSimilarExiste(lista, novo) {
    const nome = (novo.nome || '').trim().toLowerCase();
    const cpf  = (novo.cpf  || '').trim();
    return lista.filter(c =>
        (nome && (c.nome || '').toLowerCase() === nome) ||
        (cpf  && c.cpf === cpf)
    );
}

async function adicionarCliente(dados) {
    const lista = carregarClientes();
    const jwt   = localStorage.getItem('access') || localStorage.getItem('access');
    if (jwt) {
        try {
            const API_BASE = window.API_HOST || 'http://localhost:8000';
            const payload = {
                nome: dados.nome, cpf: dados.cpf, telefone: dados.telefone || '',
                email: dados.email || '', rua: dados.endereco || dados.rua || '',
                numero: dados.numero || '', bairro: dados.bairro || '',
                cep: dados.cep || '', cidade: dados.cidade || '', estado: dados.estado || '',
                nacionalidade: dados.nacionalidade || '', profissao: dados.profissao || '',
                estado_civil: dados.estadoCivil || dados.estado_civil || '',
            };
            const res = await fetch(`${API_BASE}/api/clientes/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                lista.push(saved);
                salvarClientesLS(lista);
                return saved;
            }
        } catch (err) {
            console.warn('Falha ao salvar cliente no backend, salvando localmente', err);
        }
    }
    if (!clienteJaExiste(lista, dados)) {
        lista.push({ id: Date.now(), ...dados });
        salvarClientesLS(lista);
    }
    return null;
}

async function sincronizarClientesDoBackend() {
    const jwt = localStorage.getItem('access') || localStorage.getItem('access');
    if (!jwt) return;
    try {
        const API_BASE = window.API_HOST || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/api/clientes/`, {
            headers: { 'Authorization': 'Bearer ' + jwt }
        });
        if (!res.ok) return;
        const lista      = await res.json();
        const backendIds = new Set(lista.map(c => c.id));
        const locais     = carregarClientes().filter(c => !c.id || (!backendIds.has(c.id) && c.id > 1e9));
        salvarClientesLS([...lista, ...locais]);
    } catch (e) { /* ignora */ }
}

// ── Pré-preenchimento do Contratante (cliente selecionado) ────────────────────
function preencherContratante(c) {
    const mapa = {
        'cont-nome':          c.nome,
        'cont-cpf':           c.cpf,
        'cont-nacionalidade': c.nacionalidade,
        'cont-profissao':     c.profissao,
        'cont-telefone':      c.telefone,
        'cont-endereco':      c.rua || c.endereco,
        'cont-numero':        c.numero,
        'cont-bairro':        c.bairro,
        'cont-cep':           c.cep,
        'cont-cidade':        c.cidade,
        'cont-estado':        c.estado,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
        if (!valor) return;
        const el = document.getElementById(id);
        if (el) { el.value = valor; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }
    });
    const selectEC = document.getElementById('cont-estado-civil');
    if (selectEC && (c.estado_civil || c.estadoCivil)) {
        selectEC.value = c.estado_civil || c.estadoCivil;
        selectEC.dispatchEvent(new Event('change'));
    }
    sincronizarTodosPreview();
    bloquearCampos(CONT_FIELD_IDS);
}

// ── Modal de Clientes ─────────────────────────────────────────────────────────
function renderizarListaClientes(lista) {
    const tbody     = document.getElementById('modal-clientes-tbody');
    const semMsg    = document.getElementById('modal-sem-clientes');
    tbody.innerHTML = '';
    if (!lista.length) { semMsg.style.display = 'block'; return; }
    semMsg.style.display = 'none';
    lista.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome     || '—'}</td>
            <td>${c.cpf      || '—'}</td>
            <td>${c.telefone || '—'}</td>
            <td>${c.cidade   || '—'}</td>
            <td>${c.estado   || '—'}</td>
            <td><button class="btn-selecionar-linha" type="button">Selecionar</button></td>
        `;
        tr.querySelector('.btn-selecionar-linha').addEventListener('click', () => {
            _selectedContratanteId = (c.id && c.id < 1e9) ? c.id : null;
            preencherContratante(c);
            fecharModalClientes();
        });
        tbody.appendChild(tr);
    });
}

function filtrarClientes() {
    const termo     = document.getElementById('modal-busca-cliente').value.toLowerCase().trim();
    const filtrados = carregarClientes().filter(c =>
        !termo ||
        (c.nome     || '').toLowerCase().includes(termo) ||
        (c.cpf      || '').toLowerCase().includes(termo) ||
        (c.telefone || '').toLowerCase().includes(termo)
    );
    renderizarListaClientes(filtrados);
}

function abrirModalClientes() {
    const modal = document.getElementById('modal-clientes');
    modal.classList.remove('hidden');
    const busca = document.getElementById('modal-busca-cliente');
    busca.value = '';
    renderizarListaClientes(carregarClientes());
    busca.focus();
    sincronizarClientesDoBackend().then(() => filtrarClientes());
}

function fecharModalClientes() {
    document.getElementById('modal-clientes').classList.add('hidden');
}

document.getElementById('btn-selecionar-contratante')?.addEventListener('click', abrirModalClientes);
document.getElementById('modal-clientes-close')?.addEventListener('click', fecharModalClientes);
document.getElementById('modal-busca-cliente')?.addEventListener('input', filtrarClientes);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal-clientes');
        if (modal && !modal.classList.contains('hidden')) fecharModalClientes();
    }
});

// ── Quick-add de contratante no modal ─────────────────────────────────────────
function toggleNovoContratante() {
    const form  = document.getElementById('form-novo-contratante');
    const btn   = document.getElementById('btn-toggle-novo-contratante');
    const aberto = !form.classList.contains('hidden');
    form.classList.toggle('hidden', aberto);
    btn.textContent = aberto ? '+ Novo' : '✕ Fechar';
    if (!aberto) {
        ['nc-nome','nc-nacionalidade','nc-profissao','nc-cpf','nc-rg','nc-orgao-expedidor',
         'nc-telefone','nc-email','nc-rua','nc-numero','nc-bairro','nc-cep','nc-cidade','nc-estado']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const ecEl = document.getElementById('nc-estado-civil');
        if (ecEl) ecEl.value = '';
        const msg = document.getElementById('nc-msg');
        msg.className = 'quick-form-msg hidden';
    }
}

async function salvarNovoContratanteModal() {
    const nome = document.getElementById('nc-nome')?.value.trim();
    const cpf  = document.getElementById('nc-cpf')?.value.trim();
    const msg  = document.getElementById('nc-msg');
    if (!nome || !cpf) {
        msg.textContent = 'Nome e CPF são obrigatórios.';
        msg.className = 'quick-form-msg error';
        return;
    }
    const dados = {
        nome, cpf,
        nacionalidade:   document.getElementById('nc-nacionalidade')?.value.trim()    || '',
        profissao:       document.getElementById('nc-profissao')?.value.trim()        || '',
        estado_civil:    document.getElementById('nc-estado-civil')?.value            || '',
        rg:              document.getElementById('nc-rg')?.value.trim()               || '',
        orgao_expedidor: document.getElementById('nc-orgao-expedidor')?.value.trim()  || '',
        telefone:        document.getElementById('nc-telefone')?.value.trim()         || '',
        email:           document.getElementById('nc-email')?.value.trim()            || '',
        rua:             document.getElementById('nc-rua')?.value.trim()              || '',
        numero:          document.getElementById('nc-numero')?.value.trim()           || '',
        bairro:          document.getElementById('nc-bairro')?.value.trim()           || '',
        cep:             document.getElementById('nc-cep')?.value.trim()              || '',
        cidade:          document.getElementById('nc-cidade')?.value.trim()           || '',
        estado:          (document.getElementById('nc-estado')?.value.trim()          || '').toUpperCase(),
    };
    await adicionarCliente(dados);
    msg.textContent = '✅ Cliente salvo! Atualizando lista…';
    msg.className = 'quick-form-msg success';
    setTimeout(() => {
        filtrarClientes();
        toggleNovoContratante();
        preencherContratante(dados);
        fecharModalClientes();
    }, 600);
}

document.getElementById('btn-toggle-novo-contratante')?.addEventListener('click', toggleNovoContratante);

// ── Verificar se contratante já está cadastrado ───────────────────────────────
function contratanteJaCadastrado() {
    const nome = document.getElementById('cont-nome')?.value.trim() || '';
    const cpf  = document.getElementById('cont-cpf')?.value.trim()  || '';
    if (!nome) return true;
    return clienteJaExiste(carregarClientes(), { nome, cpf });
}

// ── Modal: Salvar Contratante ──────────────────────────────────────────────────
function abrirModalSalvar() {
    document.getElementById('modal-salvar-cliente').classList.remove('hidden');
}
function fecharModalSalvar() {
    document.getElementById('modal-salvar-cliente').classList.add('hidden');
}
function fecharModalSeClicouFora(e, id) {
    if (e.target.id === id) document.getElementById(id).classList.add('hidden');
}

let _pendingNovoCliente = null;

function confirmarSalvarCliente() {
    const novo = {
        nome:          document.getElementById('cont-nome')?.value.trim()          || '',
        cpf:           document.getElementById('cont-cpf')?.value.trim()           || '',
        nacionalidade: document.getElementById('cont-nacionalidade')?.value.trim() || '',
        profissao:     document.getElementById('cont-profissao')?.value.trim()     || '',
        estadoCivil:   document.getElementById('cont-estado-civil')?.value         || '',
        telefone:      document.getElementById('cont-telefone')?.value.trim()      || '',
        endereco:      document.getElementById('cont-endereco')?.value.trim()      || '',
        numero:        document.getElementById('cont-numero')?.value.trim()        || '',
        bairro:        document.getElementById('cont-bairro')?.value.trim()        || '',
        cep:           document.getElementById('cont-cep')?.value.trim()           || '',
        cidade:        document.getElementById('cont-cidade')?.value.trim()        || '',
        estado:        document.getElementById('cont-estado')?.value.trim()        || '',
    };
    const lista     = carregarClientes();
    const similares = clienteSimilarExiste(lista, novo);
    if (similares.length > 0) {
        _pendingNovoCliente = novo;
        fecharModalSalvar();
        abrirModalDuplicadoCliente(similares);
        return;
    }
    adicionarCliente(novo);
    fecharModalSalvar();
    gerarPDF();
}

function abrirModalDuplicadoCliente(similares) {
    const info = document.getElementById('duplicado-cliente-info');
    info.innerHTML = similares.map(c =>
        `<div class="duplicado-item">
            <strong>${c.nome || '—'}</strong>
            <span>CPF: ${c.cpf || '—'}</span>
            <span>${c.cidade || '—'}/${c.estado || '—'}</span>
        </div>`
    ).join('');
    document.getElementById('modal-duplicado-cliente').classList.remove('hidden');
}

function fecharModalDuplicadoCliente() {
    document.getElementById('modal-duplicado-cliente').classList.add('hidden');
    _pendingNovoCliente = null;
}

function salvarClienteMesmoAssim() {
    if (!_pendingNovoCliente) return;
    adicionarCliente(_pendingNovoCliente);
    _pendingNovoCliente = null;
    fecharModalDuplicadoCliente();
    gerarPDF();
}

function cancelarSalvarDuplicadoCliente() {
    fecharModalDuplicadoCliente();
}

function naoSalvarCliente() {
    fecharModalSalvar();
    gerarPDF();
}

// ── Limpar formulário ─────────────────────────────────────────────────────────
function limparFormulario() {
    document.getElementById('contractForm').reset();
    Object.values(fieldMap).forEach(pvId => {
        const el = document.getElementById(pvId);
        if (el) el.textContent = '______________';
    });
    ['pv-assinatura-cidade2','pv-assinatura-estado2',
     'pv-data-inicio','pv-data-termino','pv-data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '______________';
    });
    document.getElementById('multa-rescisao').disabled = false;
    [...PREST_FIELD_IDS, ...CONT_FIELD_IDS].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.removeAttribute('readonly');
        el.removeAttribute('disabled');
        el.classList.remove('prefilled');
    });
    _selectedContratanteId = null;
    // Restaurar hoje nas datas
    const hoje = new Date().toISOString().slice(0, 10);
    ['data-inicio','data-termino','data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = hoje;
            const pvId = id === 'data-inicio' ? 'pv-data-inicio'
                       : id === 'data-termino' ? 'pv-data-termino' : 'pv-data-assinatura';
            updateDatePreview(id, pvId);
        }
    });
}

document.getElementById('btn-limpar')?.addEventListener('click', limparFormulario);

// ── Validação do formulário ───────────────────────────────────────────────────
function validarFormulario() {
    const campos = [
        { id: 'prest-nome',        label: 'Nome do prestador' },
        { id: 'prest-cpf',         label: 'CPF do prestador' },
        { id: 'cont-nome',         label: 'Nome do contratante' },
        { id: 'cont-cpf',          label: 'CPF do contratante' },
        { id: 'tipo-servico',      label: 'Tipo de serviço' },
        { id: 'especificacao-servico', label: 'Especificação do serviço' },
        { id: 'atividades-contratadas', label: 'Atividades contratadas' },
        { id: 'prazo-meses',       label: 'Prazo (meses)' },
        { id: 'valor-mensal',      label: 'Valor mensal' },
        { id: 'data-inicio',       label: 'Data de início' },
        { id: 'data-termino',      label: 'Data de término' },
        { id: 'assinatura-cidade', label: 'Cidade de assinatura' },
        { id: 'assinatura-estado', label: 'Estado de assinatura' },
    ];
    const faltando = campos
        .filter(c => { const el = document.getElementById(c.id); return !el || !el.value.trim(); })
        .map(c => c.label);
    if (faltando.length > 0) {
        alert('Preencha os campos obrigatórios antes de continuar:\n\n• ' + faltando.join('\n• '));
        return false;
    }
    return true;
}

if (faltando.length > 0) {
    campos.forEach(c => {
        const el = document.getElementById(c.id);
        if (el && (!el.value.trim())) {
            el.classList.add('campo-erro');
        } else if (el) {
            el.classList.remove('campo-erro');
        }
    });
    alert('Preencha os campos obrigatórios antes de continuar:\n\n• ' + faltando.join('\n• '));
    return false;
}


// ── Geração de PDF ────────────────────────────────────────────────────────────
async function gerarPDF() {
    if (!validarFormulario()) return;
    const preview = document.getElementById('contract-preview');
    const html    = preview ? preview.innerHTML : '';
    const jwt     = localStorage.getItem('access') || localStorage.getItem('access');

    if (jwt) {
        const API_BASE      = window.API_HOST || 'http://localhost:8000';
        const btnPDF        = document.getElementById('btn-gerar-pdf');
        const textoOriginal = btnPDF ? btnPDF.textContent : '';
        if (btnPDF) { btnPDF.disabled = true; btnPDF.textContent = 'Gerando PDF…'; }
        try {
            const res = await fetch(`${API_BASE}/api/contratos/gerar-pdf/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                body: JSON.stringify({ html, titulo: 'Contrato_de_Servicos' })
            });
            if (res.ok) {
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = 'Contrato_de_Servicos.pdf';
                document.body.appendChild(a); a.click(); a.remove();
                URL.revokeObjectURL(url);
                await salvarContratoNoSistema(true);
                return;
            } else {
                console.error('Erro backend PDF:', await res.text());
                alert('Falha ao gerar PDF no servidor. Abrindo visualização para impressão.');
            }
        } catch (e) {
            console.error('Erro ao chamar backend PDF:', e);
            alert('Não foi possível conectar ao servidor. Abrindo visualização para impressão.');
        } finally {
            if (btnPDF) { btnPDF.disabled = false; btnPDF.textContent = textoOriginal; }
        }
    }

    // Fallback: janela de impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Contrato de Prestação de Serviços</title>
<style>
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#333}
h2{text-align:center;font-size:18px;text-decoration:underline;margin-bottom:24px}
h3{font-size:14px;margin-top:20px;margin-bottom:10px}
p{font-size:13px;line-height:1.8;text-align:justify;margin-bottom:10px}
.signature-lines{display:flex;justify-content:space-around;margin-top:60px}
.signature-line{text-align:center;flex:1}
.signature-line hr{border:none;border-top:1px solid #333;margin-bottom:8px;width:80%;margin:0 auto}
</style></head><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

document.getElementById('btn-gerar-pdf')?.addEventListener('click', () => {
    if (!contratanteJaCadastrado()) abrirModalSalvar();
    else gerarPDF();
});

// ── Salvar contrato no banco ──────────────────────────────────────────────────
async function resolverIdContratante(dados) {
    const jwt = localStorage.getItem('access') || localStorage.getItem('access');
    if (!jwt) return null;
    const API_BASE = window.API_HOST || 'http://localhost:8000';
    const cpf = (dados.cpf || '').trim();

    if (_selectedContratanteId) return _selectedContratanteId;

    if (cpf) {
        const local = carregarClientes().find(c => c.cpf === cpf && c.id && c.id < 1e9);
        if (local) return local.id;
    }

    const saved = await adicionarCliente(dados);
    if (saved?.id) return saved.id;

    try {
        const res = await fetch(`${API_BASE}/api/clientes/`, { headers: { 'Authorization': 'Bearer ' + jwt } });
        if (res.ok) {
            const lista = await res.json();
            const found = cpf ? lista.find(c => c.cpf === cpf) : null;
            if (found) {
                salvarClientesLS([...carregarClientes().filter(c => c.cpf !== cpf), found]);
                return found.id;
            }
        }
    } catch (e) { /* ignora */ }
    return null;
}

async function salvarContratoNoSistema(silent = false) {
    if (!silent && !validarFormulario()) return;
    try {
        const jwt      = localStorage.getItem('access') || localStorage.getItem('access');
        const API_BASE = window.API_HOST || 'http://localhost:8000';

        const contratanteData = {
            nome:     document.getElementById('cont-nome')?.value.trim() || '',
            cpf:      document.getElementById('cont-cpf')?.value.trim()  || '',
            telefone: document.getElementById('cont-telefone')?.value.trim() || '',
            cidade:   document.getElementById('cont-cidade')?.value.trim()   || '',
            estado:   document.getElementById('cont-estado')?.value.trim()   || '',
        };

        if (!jwt) {
            if (!silent) alert('Faça login para salvar o contrato no servidor.');
            return;
        }

        // O modelo espera o ID do "prestador" (= contratante do formulário, que é um Cliente)
        const prestadorId = await resolverIdContratante(contratanteData);
        if (!prestadorId) {
            alert('Não foi possível identificar o contratante no banco.\nPreencha os dados do contratante ou selecione um cliente cadastrado.');
            return;
        }

        const payload = {
            prestador:                  prestadorId,
            tipo_servico:               document.getElementById('tipo-servico')?.value.trim()            || '',
            especificacao_servico:      document.getElementById('especificacao-servico')?.value.trim()   || '',
            atividades_contratadas:     document.getElementById('atividades-contratadas')?.value.trim()  || '',
            motivo_contratacao:         document.getElementById('motivo-contratacao')?.value.trim()      || '',
            data_inicio:                document.getElementById('data-inicio')?.value                    || '',
            data_termino:               document.getElementById('data-termino')?.value                   || '',
            prazo_meses:                parseInt(document.getElementById('prazo-meses')?.value)          || 1,
            valor_mensal:               parseFloat(document.getElementById('valor-mensal')?.value)       || 0,
            forma_pagamento:            document.getElementById('forma-pagamento')?.value.trim()         || '',
            dia_vencimento:             parseInt(document.getElementById('dia-vencimento')?.value)       || 10,
            local_execucao:             document.getElementById('local-execucao')?.value.trim()          || '',
            executa_nas_dependencias:   document.getElementById('executa-nas-dependencias')?.checked     ?? true,
            disposicoes_seguranca:      document.getElementById('disposicoes-seguranca')?.value.trim()   || '',
            multa_atraso:               parseFloat(document.getElementById('multa-atraso')?.value)       || 0,
            multa_rescisao:             parseFloat(document.getElementById('multa-rescisao')?.value)     || 0,
            responsabilidade_subsidiaria: document.getElementById('responsabilidade-subsidiaria')?.checked ?? true,
        };

        const res = await fetch(`${API_BASE}/api/contratoservico/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            if (!silent) alert('Contrato salvo com sucesso!');
            limparFormulario();
        } else {
            const erro = await res.json().catch(() => ({}));
            console.error('Erro ao salvar contrato de serviço:', erro);
            alert('Erro ao salvar no servidor: ' + JSON.stringify(erro));
        }
    } catch (err) {
        console.error('Erro ao salvar contrato:', err);
        alert('Não foi possível salvar o contrato. Veja o console para detalhes.');
    }
}

window.salvarContratoNoSistema     = salvarContratoNoSistema;
window.fecharModalSeClicouFora     = fecharModalSeClicouFora;
window.confirmarSalvarCliente      = confirmarSalvarCliente;
window.naoSalvarCliente            = naoSalvarCliente;
window.salvarClienteMesmoAssim     = salvarClienteMesmoAssim;
window.cancelarSalvarDuplicadoCliente = cancelarSalvarDuplicadoCliente;
window.toggleNovoContratante       = toggleNovoContratante;
window.salvarNovoContratanteModal  = salvarNovoContratanteModal;
