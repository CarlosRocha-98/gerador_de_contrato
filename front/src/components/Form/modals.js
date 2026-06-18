// ── IDs dos campos pré-preenchidos ────────────────────────────────────────────
const PROP_FIELD_IDS = [
    'prop-nome','prop-nacionalidade','prop-profissao','prop-estado-civil',
    'prop-cpf','prop-endereco','prop-numero','prop-bairro','prop-cep','prop-cidade','prop-estado'
];
const INQ_FIELD_IDS = [
    'inq-nome','inq-cpf','inq-nacionalidade','inq-profissao','inq-estado-civil',
    'inq-endereco','inq-numero','inq-bairro','inq-cep','inq-cidade','inq-estado'
];
const IMOVEL_FIELD_IDS = [
    'imovel-endereco',
    'imovel-numero',
    'imovel-complemento',
    'imovel-bairro',
    'imovel-cidade',
    'imovel-estado',
    'imovel-tipo',
    'imovel-caracteristicas'
];

let _selectedClienteId = null;
let _selectedImovelId  = null;

function bloquearCampos(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value) return;
        if (el.tagName === 'SELECT') el.setAttribute('disabled', '');
        else                         el.setAttribute('readonly', '');
        el.classList.add('prefilled');
    });
}

function desbloquearSecao(secao) {
    // Bloqueio permanente — desbloqueio desabilitado
}

// ── Pré-preenchimento dos campos ──────────────────────────────────────────────

function preencherProprietario(perfil, sobrescrever = false) {
    const mapa = {
        'prop-nome':          perfil.nome,
        'prop-nacionalidade': perfil.nacionalidade,
        'prop-profissao':     perfil.profissao,
        'prop-estado-civil':  perfil.estado_civil,
        'prop-cpf':           perfil.cpf,
        'prop-endereco':      perfil.rua,
        'prop-numero':        perfil.numero,
        'prop-bairro':        perfil.bairro,
        'prop-cep':           perfil.cep,
        'prop-cidade':        perfil.cidade,
        'prop-estado':        perfil.estado,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
        if (!valor) return;
        const campo = document.getElementById(id);
        if (campo && (sobrescrever || !campo.value)) campo.value = valor;
    });
    const nomeEl = document.getElementById('prop-nome');
    if (nomeEl && nomeEl.value) bloquearCampos(PROP_FIELD_IDS);
}

function preencherInquilino(cliente) {
    const mapa = {
        'inq-nome':          cliente.nome,
        'inq-cpf':           cliente.cpf,
        'inq-nacionalidade': cliente.nacionalidade,
        'inq-profissao':     cliente.profissao,
        'inq-estado-civil':  cliente.estado_civil || cliente.estadoCivil,
        'inq-endereco':      cliente.rua          || cliente.endereco,
        'inq-numero':        cliente.numero,
        'inq-bairro':        cliente.bairro,
        'inq-cep':           cliente.cep,
        'inq-cidade':        cliente.cidade,
        'inq-estado':        cliente.estado,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
        if (!valor) return;
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
    });
    sincronizarTodosPreview();
    bloquearCampos(INQ_FIELD_IDS);
}

function preencherImovel(imovel) {
    const mapa = {
        'imovel-endereco':     imovel.endereco,
        'imovel-numero':       imovel.numero,
        'imovel-complemento':  imovel.complemento,
        'imovel-bairro':       imovel.bairro,
        'imovel-cidade':       imovel.cidade,
        'imovel-estado':       imovel.estado,
        'imovel-tipo':         imovel.tipo,
        'imovel-caracteristicas': imovel.caracteristicas,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
        if (!valor) return;
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
    });
    sincronizarTodosPreview();
    bloquearCampos(IMOVEL_FIELD_IDS);
}

// ── Captura de dados do inquilino ─────────────────────────────────────────────

function capturarDadosInquilino() {
    return {
        nome:          document.getElementById('inq-nome')?.value.trim()         || '',
        cpf:           document.getElementById('inq-cpf')?.value.trim()          || '',
        nacionalidade: document.getElementById('inq-nacionalidade')?.value.trim() || '',
        profissao:     document.getElementById('inq-profissao')?.value.trim()    || '',
        estadoCivil:   document.getElementById('inq-estado-civil')?.value.trim() || '',
        endereco:      document.getElementById('inq-endereco')?.value.trim()     || '',
        numero:        document.getElementById('inq-numero')?.value.trim()       || '',
        bairro:        document.getElementById('inq-bairro')?.value.trim()       || '',
        cep:           document.getElementById('inq-cep')?.value.trim()          || '',
        cidade:        document.getElementById('inq-cidade')?.value.trim()       || '',
        estado:        document.getElementById('inq-estado')?.value.trim()       || '',
    };
}

function inquilinoJaCadastrado() {
    const d = capturarDadosInquilino();
    if (!d.nome) return true;
    return clienteJaExiste(carregarClientes(), d);
}

// ── Quick-add de cliente no modal ─────────────────────────────────────────────

function toggleNovoCliente() {
    const form  = document.getElementById('form-novo-cliente');
    const btn   = document.getElementById('btn-toggle-novo-cliente');
    const aberto = !form.classList.contains('hidden');
    form.classList.toggle('hidden', aberto);
    btn.textContent = aberto ? '+ Novo' : '✕ Fechar';
    if (!aberto) {
        ['nc-nome','nc-nacionalidade','nc-profissao','nc-cpf',
         'nc-telefone','nc-email','nc-cep','nc-rua','nc-numero','nc-complemento','nc-bairro','nc-cidade','nc-estado']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        const ecEl = document.getElementById('nc-estado-civil');
        if (ecEl) ecEl.value = '';
        const msg = document.getElementById('nc-msg');
        msg.className = 'quick-form-msg hidden';
    }
}

async function salvarNovoClienteModal() {
    const nome = document.getElementById('nc-nome')?.value.trim();
    const cpf  = document.getElementById('nc-cpf')?.value.trim();
    const msg  = document.getElementById('nc-msg');
    if (!nome || !cpf) {
        msg.textContent = 'Nome e CPF são obrigatórios.';
        msg.className = 'quick-form-msg error';
        return;
    }
    // CPF-VALIDACAO: valida o CPF no cadastro rápido do inquilino.
    if (!CPF.valido(cpf)) {
        msg.textContent = 'CPF inválido. Verifique os dígitos informados.';
        msg.className = 'quick-form-msg error';
        return;
    }
    const telefone = document.getElementById('nc-telefone')?.value.trim() || '';
    if (!TelefoneBR.valido(telefone)) {
        msg.textContent = 'Telefone inválido. Use celular ou fixo com DDD.';
        msg.className = 'quick-form-msg error';
        return;
    }
    const dados = {
        nome, cpf: CPF.formatar(cpf),
        nacionalidade:  document.getElementById('nc-nacionalidade')?.value.trim()    || '',
        profissao:      document.getElementById('nc-profissao')?.value.trim()        || '',
        estado_civil:   document.getElementById('nc-estado-civil')?.value            || '',
        telefone:       TelefoneBR.formatar(telefone),
        email:          document.getElementById('nc-email')?.value.trim()            || '',
        rua:            document.getElementById('nc-rua')?.value.trim()              || '',
        numero:         document.getElementById('nc-numero')?.value.trim()           || '',
        complemento:    document.getElementById('nc-complemento')?.value.trim()      || '',
        bairro:         document.getElementById('nc-bairro')?.value.trim()           || '',
        cep:            document.getElementById('nc-cep')?.value.trim()              || '',
        cidade:         document.getElementById('nc-cidade')?.value.trim()           || '',
        estado:         (document.getElementById('nc-estado')?.value.trim()          || '').toUpperCase(),
    };
    await adicionarCliente(dados);
    msg.textContent = '✅ Cliente salvo! Atualizando lista…';
    msg.className = 'quick-form-msg success';
    setTimeout(() => {
        renderizarTabela();
        toggleNovoCliente();
        preencherInquilino(dados);
        fecharModal();
    }, 600);
}

// ── Quick-add de imóvel no modal ──────────────────────────────────────────────

function limparNovoImovel() {
    ['ni-cep','ni-endereco','ni-numero','ni-complemento','ni-bairro','ni-cidade',
     'ni-estado','ni-tipo','ni-caracteristicas']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const msg = document.getElementById('ni-msg');
    msg.className = 'quick-form-msg hidden';
}

async function salvarNovoImovelModal() {
    const endereco = document.getElementById('ni-endereco')?.value.trim();
    const numero   = document.getElementById('ni-numero')?.value.trim();
    const cidade   = document.getElementById('ni-cidade')?.value.trim();
    const estado   = document.getElementById('ni-estado')?.value.trim();
    const tipo     = document.getElementById('ni-tipo')?.value;
    const msg      = document.getElementById('ni-msg');
    if (!endereco || !numero || !cidade || !estado || !tipo) {
        msg.textContent = 'Rua, número, cidade, estado e tipo são obrigatórios.';
        msg.className = 'quick-form-msg error';
        return;
    }
    const imovel = {
        cep:             document.getElementById('ni-cep')?.value.trim()             || '',
        endereco, numero, cidade, estado,
        complemento:    document.getElementById('ni-complemento')?.value.trim()      || '',
        bairro:          document.getElementById('ni-bairro')?.value.trim()          || '',
        tipo,
        caracteristicas: document.getElementById('ni-caracteristicas')?.value.trim() || '',
    };
    await adicionarImovel(imovel);
    msg.textContent = 'Imóvel salvo! Atualizando lista…';
    msg.className = 'quick-form-msg success';
    setTimeout(() => {
        renderizarTabelaImoveis();
        limparNovoImovel();
        preencherImovel(imovel);
        fecharModalImoveis();
    }, 600);
}

// ── Modal de Clientes ─────────────────────────────────────────────────────────
const modalClientes    = document.getElementById('modal-clientes');
const btnAbrirModal    = document.getElementById('btn-selecionar-inquilino');
const btnFecharModal   = document.getElementById('modal-clientes-close');
const campoBusca       = document.getElementById('modal-busca-cliente');
const tbody            = document.getElementById('modal-clientes-tbody');
const semClientes      = document.getElementById('modal-sem-clientes');

function renderizarTabela(filtro = '') {
    const lista     = carregarClientes();
    const termo     = filtro.toLowerCase();
    const filtrados = lista.filter(c =>
        (c.nome     || '').toLowerCase().includes(termo) ||
        (c.cpf      || '').toLowerCase().includes(termo) ||
        (c.telefone || '').toLowerCase().includes(termo)
    );
    tbody.innerHTML = '';
    if (filtrados.length === 0) { semClientes.style.display = 'block'; return; }
    semClientes.style.display = 'none';
    filtrados.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.nome     || '—'}</td>
            <td>${cliente.cpf      || '—'}</td>
            <td>${cliente.telefone || '—'}</td>
            <td>${cliente.cidade   || '—'}</td>
            <td>${cliente.estado   || '—'}</td>
            <td><button class="btn-selecionar-linha" type="button">Selecionar</button></td>
        `;
        tr.querySelector('.btn-selecionar-linha').addEventListener('click', () => {
            _selectedClienteId = (cliente.id && cliente.id < 1e9) ? cliente.id : null;
            preencherInquilino(cliente);
            fecharModal();
        });
        tbody.appendChild(tr);
    });
}

function abrirModal() {
    campoBusca.value = '';
    renderizarTabela();
    modalClientes.classList.add('aberto');
    modalClientes.setAttribute('aria-hidden', 'false');
    campoBusca.focus();
    sincronizarClientesDoBackend().then(() => renderizarTabela(campoBusca.value));
}

function fecharModal() {
    modalClientes.classList.remove('aberto');
    modalClientes.setAttribute('aria-hidden', 'true');
}

if (btnAbrirModal)  btnAbrirModal.addEventListener('click', abrirModal);
if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
modalClientes?.addEventListener('click', e => { if (e.target === modalClientes) fecharModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalClientes?.classList.contains('aberto')) fecharModal();
});
campoBusca?.addEventListener('input', () => renderizarTabela(campoBusca.value));

// ── Modal de Imóveis ──────────────────────────────────────────────────────────
const modalImoveis        = document.getElementById('modal-imoveis');
const btnAbrirModalImovel = document.getElementById('btn-selecionar-imovel');
const btnFecharModalImovel= document.getElementById('modal-imoveis-close');
const campoBuscaImovel    = document.getElementById('modal-busca-imovel');
const tbodyImoveis        = document.getElementById('modal-imoveis-tbody');
const semImoveis          = document.getElementById('modal-sem-imoveis');

function renderizarTabelaImoveis(filtro = '') {
    const lista     = carregarImoveis();
    const termo     = filtro.toLowerCase();
    const filtrados = lista.filter(i =>
        (i.endereco               || '').toLowerCase().includes(termo) ||
        (i.cidadeUf || i.cidade_uf|| `${i.cidade || ''}/${i.estado || ''}`).toLowerCase().includes(termo) ||
        (i.bairro                 || '').toLowerCase().includes(termo)
    );
    tbodyImoveis.innerHTML = '';
    if (filtrados.length === 0) { semImoveis.style.display = 'block'; return; }
    semImoveis.style.display = 'none';
    filtrados.forEach(imovel => {
        const tr        = document.createElement('tr');
        const endDisplay = imovel.endereco + (imovel.numero ? ', ' + imovel.numero : '');
        const cidadeUf   = 
            imovel.cidadeUf || 
            imovel.cidade_uf || 
            (imovel.cidade && imovel.estado 
                ? `${imovel.cidade}/${imovel.estado}` 
                : '—');
        tr.innerHTML = `
            <td>${endDisplay || '—'}</td>
            <td>${cidadeUf}</td>
            <td>${imovel.tipo || '—'}</td>
            <td><button class="btn-selecionar-linha" type="button">Selecionar</button></td>
        `;
        tr.querySelector('.btn-selecionar-linha').addEventListener('click', () => {
            _selectedImovelId = (imovel.id && imovel.id < 1e9) ? imovel.id : null;
            preencherImovel(imovel);
            fecharModalImoveis();
        });
        tbodyImoveis.appendChild(tr);
    });
}

function abrirModalImoveis() {
    campoBuscaImovel.value = '';
    renderizarTabelaImoveis();
    modalImoveis.classList.add('aberto');
    modalImoveis.setAttribute('aria-hidden', 'false');
    campoBuscaImovel.focus();
    sincronizarImoveisDoBackend().then(() => renderizarTabelaImoveis(campoBuscaImovel.value));
}

function fecharModalImoveis() {
    modalImoveis.classList.remove('aberto');
    modalImoveis.setAttribute('aria-hidden', 'true');
}

if (btnAbrirModalImovel)  btnAbrirModalImovel.addEventListener('click', abrirModalImoveis);
if (btnFecharModalImovel) btnFecharModalImovel.addEventListener('click', fecharModalImoveis);
modalImoveis?.addEventListener('click', e => { if (e.target === modalImoveis) fecharModalImoveis(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalImoveis?.classList.contains('aberto')) fecharModalImoveis();
});
campoBuscaImovel?.addEventListener('input', () => renderizarTabelaImoveis(campoBuscaImovel.value));

// ── Modal: Salvar Inquilino ────────────────────────────────────────────────────

function abrirModalSalvarInquilino() {
    document.getElementById('modal-salvar-inquilino').classList.remove('hidden');
}
function fecharModalSalvarInquilino() {
    document.getElementById('modal-salvar-inquilino').classList.add('hidden');
}
document.getElementById('modal-salvar-inquilino')
    ?.addEventListener('click', e => { if (e.target.id === 'modal-salvar-inquilino') fecharModalSalvarInquilino(); });

let _pendingNovoInquilino = null;

function abrirModalDuplicadoInquilino(similares) {
    const info = document.getElementById('duplicado-inquilino-info');
    info.innerHTML = similares.map(c =>
        `<div class="duplicado-item">
            <strong>${c.nome || '—'}</strong>
            <span>CPF: ${c.cpf || '—'}</span>
            <span>${c.cidade || '—'}/${c.estado || '—'}</span>
        </div>`
    ).join('');
    document.getElementById('modal-duplicado-inquilino').classList.remove('hidden');
}

function fecharModalDuplicadoInquilino() {
    document.getElementById('modal-duplicado-inquilino').classList.add('hidden');
    _pendingNovoInquilino = null;
}

function salvarInquilinoMesmoAssim() {
    if (!_pendingNovoInquilino) return;
    adicionarCliente(_pendingNovoInquilino);
    _pendingNovoInquilino = null;
    fecharModalDuplicadoInquilino();
    gerarPDF(true);
}

function cancelarSalvarDuplicadoInquilino() {
    fecharModalDuplicadoInquilino();
}

function confirmarSalvarInquilino() {
    const dados    = capturarDadosInquilino();
    if (!dados.nome) { fecharModalSalvarInquilino(); gerarPDF(true); return; }
    const lista    = carregarClientes();
    const similares = clienteSimilarExiste(lista, dados);
    if (similares.length > 0) {
        _pendingNovoInquilino = dados;
        fecharModalSalvarInquilino();
        abrirModalDuplicadoInquilino(similares);
        return;
    }
    adicionarCliente(dados);
    fecharModalSalvarInquilino();
    gerarPDF(true);
}

function naoSalvarInquilino() {
    fecharModalSalvarInquilino();
    gerarPDF(true);
}
