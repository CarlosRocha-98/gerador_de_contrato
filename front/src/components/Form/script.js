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

// ── Barra de colapso ──────────────────────────────────────────────────────────
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

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
let _editingContratoId = null;
let _editingInquilinoId = null;
let _editingImovelId = null;

document.addEventListener('DOMContentLoaded', () => {
    Object.keys(fieldMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => updatePreview(id));
        if (el && el.tagName === 'SELECT') el.addEventListener('change', () => updatePreview(id));
        const cidadeEl = document.getElementById('imovel-cidade');
        const estadoEl = document.getElementById('imovel-estado');
        cidadeEl?.addEventListener('input', updateCidadeEstadoPreview);
        estadoEl?.addEventListener('change', updateCidadeEstadoPreview);
    });

    const hoje = new Date().toISOString().slice(0, 10);
    ['data-inicio', 'data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value) { el.value = hoje; atualizarPreviewData(id); }
        el?.addEventListener('change', () => atualizarPreviewData(id));
    });

    carregarContratoAluguelParaEdicao();
});

// ── Campos opcionais ──────────────────────────────────────────────────────────
document.getElementById('sem-multa-infracao')?.addEventListener('change', function () {
    const campo = document.getElementById('multa-infracao');
    campo.disabled = this.checked;
    if (this.checked) { campo.value = ''; document.getElementById('pv-multa-infracao').textContent = 'isento'; }
});

document.getElementById('sem-multa-rescisao')?.addEventListener('change', function () {
    const campo = document.getElementById('multa-rescisao');
    campo.disabled = this.checked;
    if (this.checked) { campo.value = ''; document.getElementById('pv-multa-rescisao').textContent = 'isento'; }
});

// ── Limpar formulário ─────────────────────────────────────────────────────────
function limparFormulario() {
    document.getElementById('contractForm').reset();
    Object.values(fieldMap).forEach(pvId => {
        const el = document.getElementById(pvId);
        if (el) el.textContent = '______________';
    });
    document.getElementById('pv-data-inicio').textContent    = '______________';
    document.getElementById('pv-data-assinatura').textContent = '______________';
    document.getElementById('valor-caucao').disabled   = false;
    document.getElementById('multa-infracao').disabled = false;
    document.getElementById('multa-rescisao').disabled = false;
    [...PROP_FIELD_IDS, ...INQ_FIELD_IDS, ...IMOVEL_FIELD_IDS].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.removeAttribute('readonly');
        el.removeAttribute('disabled');
        el.classList.remove('prefilled');
    });
    _selectedClienteId = null;
    _selectedImovelId  = null;
    _editingContratoId = null;
    _editingInquilinoId = null;
    _editingImovelId = null;
    sessionStorage.removeItem('contratoEdicao');
    const hoje = new Date().toISOString().slice(0, 10);
    ['data-inicio', 'data-assinatura'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = hoje; atualizarPreviewData(id); }
    });
}

document.getElementById('btn-limpar')?.addEventListener('click', limparFormulario);

// ── Carregamento do perfil do proprietário ────────────────────────────────────
const jwtToken = localStorage.getItem('access_token') || localStorage.getItem('access');

if (jwtToken) {
    const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
    fetch(`${API_BASE}/api/perfil/`, { headers: { 'Authorization': 'Bearer ' + jwtToken } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(perfil => { preencherProprietario(perfil, true); sincronizarTodosPreview(); })
        .catch(() => {});
}

const localProfile = JSON.parse(localStorage.getItem('localProfile') || 'null');
if (localProfile) preencherProprietario(localProfile);

const sessaoLocal = JSON.parse(sessionStorage.getItem('session') || 'null');
if (sessaoLocal?.username) preencherProprietario({ nome: sessaoLocal.username });

try {
    const BACKEND = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
    if (window.location.origin === (new URL(BACKEND)).origin) {
        fetch(BACKEND + '/profile', { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(user => {
                if (user?.displayName) { preencherProprietario({ nome: user.displayName }); sincronizarTodosPreview(); }
            })
            .catch(() => {});
    }
} catch (e) {}

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

// ── Validação do formulário ───────────────────────────────────────────────────
function validarFormulario() {
    const campos = [
        { id: 'prop-nome',         label: 'Nome do proprietário' },
        { id: 'prop-cpf',          label: 'CPF do proprietário' },
        { id: 'inq-nome',          label: 'Nome do inquilino' },
        { id: 'inq-cpf',           label: 'CPF do inquilino' },
        { id: 'imovel-endereco',   label: 'Endereço do imóvel' },
        { id: 'imovel-numero',     label: 'Número do imóvel' },
        { id: 'imovel-cidade',     label: 'Cidade do imóvel' },
        { id: 'imovel-estado',     label: 'Estado do imóvel' },
        { id: 'prazo',             label: 'Prazo (meses)' },
        { id: 'valor-aluguel',     label: 'Valor do aluguel' },
        { id: 'dia-vencimento',    label: 'Dia de vencimento' },
        { id: 'data-inicio',       label: 'Data de início' },
        { id: 'data-assinatura',   label: 'Data de assinatura' },
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
    const diaVencimento = Number(document.getElementById('dia-vencimento')?.value);
    if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 28) {
        alert('O dia do vencimento deve ser um número inteiro entre 1 e 28.');
        document.getElementById('dia-vencimento')?.focus();
        return false;
    }
    // CPF-VALIDACAO: valida proprietário e inquilino antes de gerar o contrato.
    const cpfsInvalidos = [
        { id: 'prop-cpf', label: 'CPF do proprietário' },
        { id: 'inq-cpf', label: 'CPF do inquilino' },
    ].filter(c => !cpfTemTamanhoValido(document.getElementById(c.id)?.value || ''));

    if (cpfsInvalidos.length > 0) {
        alert('Informe um CPF válido. Verifique os dígitos:\n\n• ' + cpfsInvalidos.map(c => c.label).join('\n• '));
        return false;
    }
    return true;
}

// ── Geração de PDF ────────────────────────────────────────────────────────────
async function gerarPDF() {
    if (!validarFormulario()) return;
    const preview = document.getElementById('contract-preview');
    const html    = preview ? preview.innerHTML : '';
    const jwt     = localStorage.getItem('access_token') || localStorage.getItem('access');

    if (jwt) {
        const API_BASE     = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
        const btnPDF       = document.getElementById('btn-gerar-pdf');
        const textoOriginal = btnPDF ? btnPDF.textContent : '';
        if (btnPDF) { btnPDF.disabled = true; btnPDF.textContent = 'Gerando PDF…'; }
        try {
            const res = await fetch(`${API_BASE}/api/contratos/gerar-pdf/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
                body: JSON.stringify({ html, titulo: 'Contrato_de_Locacao' })
            });
            if (res.ok) {
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = 'Contrato_de_Locacao.pdf';
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

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Contrato de Locação Residencial</title>
<style>
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#333}
h2{text-align:center;font-size:18px;text-decoration:underline;margin-bottom:24px}
h3{font-size:14px;margin-top:20px;margin-bottom:10px}
p{font-size:13px;line-height:1.8;text-align:justify;margin-bottom:10px}
.signature-lines{width:100%;border-collapse:collapse;margin-top:60px}
.signature-line{width:42%;border-top:1px solid #333;text-align:center;vertical-align:top;padding-top:8px}
.signature-spacer{width:16%}
</style></head><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.print();
}

document.getElementById('btn-gerar-pdf')?.addEventListener('click', () => {
    if (!inquilinoJaCadastrado()) abrirModalSalvarInquilino();
    else gerarPDF();
});

// ── Salvar contrato no banco ──────────────────────────────────────────────────
async function resolverIdCliente(dados) {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt) return null;
    const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
    const cpf = normalizarCPF(dados.cpf);

    // CPF-VALIDACAO: valida o CPF antes de salvar/sincronizar o inquilino.
    if (!cpfTemTamanhoValido(dados.cpf)) {
        return { id: null, erro: 'CPF do inquilino inválido. Verifique os dígitos informados.' };
    }

    if (_selectedClienteId) return { id: _selectedClienteId };

    if (cpf) {
        const local = carregarClientes().find(c => normalizarCPF(c.cpf) === cpf);
        if (local?.id && local.id < 1e9) return { id: local.id };
        if (local) {
            const savedLocal = await adicionarCliente({ ...local, ...dados });
            if (savedLocal?.id) return { id: savedLocal.id };
        }
    }

    const saved = await adicionarCliente(dados);
    if (saved?.id) return { id: saved.id };

    try {
        const res = await fetch(`${API_BASE}/api/clientes/`, { headers: { 'Authorization': 'Bearer ' + jwt } });
        if (res.ok) {
            const lista = await res.json();
            const found = cpf ? lista.find(c => normalizarCPF(c.cpf) === cpf) : null;
            if (found) {
                salvarClientes([...carregarClientes().filter(c => normalizarCPF(c.cpf) !== cpf), found]);
                return { id: found.id };
            }
        }
    } catch (e) { /* ignora */ }
    return {
        id: null,
        erro: saved?.erroBackend || 'Não foi possível salvar ou localizar o inquilino no backend.'
    };
}

async function resolverIdImovel(dados) {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt) return null;
    const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
    const end = (dados.endereco || '').trim();
    const num = (dados.numero   || '').trim();

    if (_selectedImovelId) return { id: _selectedImovelId };

    if (end) {
        const local = carregarImoveis().find(i => i.endereco === end && i.numero === num);
        if (local?.id && local.id < 1e9) return { id: local.id };
        if (local) {
            const savedLocal = await adicionarImovel({ ...local, ...dados, tipo: local.tipo || dados.tipo || 'casa' });
            if (savedLocal?.id) return { id: savedLocal.id };
        }
    }

    const imovelPayload = { ...dados, cidade: dados.cidade || '', estado: dados.estado || '', tipo: dados.tipo || 'casa' };
    const saved = await adicionarImovel(imovelPayload);
    if (saved?.id) return { id: saved.id };

    try {
        const res = await fetch(`${API_BASE}/api/imoveis/`, { headers: { 'Authorization': 'Bearer ' + jwt } });
        if (res.ok) {
            const lista = await res.json();
            const found = end ? lista.find(i => i.endereco === end && i.numero === num) : null;
            if (found) return { id: found.id };
        }
    } catch (e) { /* ignora */ }
    return {
        id: null,
        erro: saved?.erroBackend || 'Não foi possível salvar ou localizar o imóvel no backend.'
    };
}

async function salvarContratoNoSistema(silent = false) {
    if (!silent && !validarFormulario()) return;
    try {
        const jwt      = localStorage.getItem('access_token') || localStorage.getItem('access');
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

        const inquilinoData = capturarDadosInquilino();
        const imovelData    = {
            endereco:        document.getElementById('imovel-endereco')?.value.trim()        || '',
            numero:          document.getElementById('imovel-numero')?.value.trim()          || '',
            bairro:          document.getElementById('imovel-bairro')?.value.trim()          || '',
            cidade:          document.getElementById('imovel-cidade')?.value.trim()       || '',
            estado:          document.getElementById('imovel-estado')?.value.trim()       || '',
            caracteristicas: document.getElementById('imovel-caracteristicas')?.value.trim() || '',
        };

        const contratoLocal = {
            id: Date.now(),
            proprietario: { nome: document.getElementById('prop-nome')?.value.trim() || '', cpf: document.getElementById('prop-cpf')?.value.trim() || '' },
            inquilino: inquilinoData, imovel: imovelData,
            prazo:        document.getElementById('prazo')?.value        || '',
            valorAluguel: document.getElementById('valor-aluguel')?.value || '',
            criadoEm:     new Date().toISOString()
        };

        function salvarContratoLocal(extra = {}) {
            const lista = JSON.parse(localStorage.getItem('contratos') || '[]');
            lista.push({ ...contratoLocal, ...extra });
            localStorage.setItem('contratos', JSON.stringify(lista));
        }

        if (!jwt) {
            salvarContratoLocal();
            if (!silent) alert('Contrato salvo localmente (faça login para salvar no servidor).');
            limparFormulario();
            return;
        }

        const inquilinoResultado = _editingInquilinoId
            ? { id: _editingInquilinoId }
            : await resolverIdCliente(inquilinoData);
        const imovelResultado = _editingImovelId
            ? { id: _editingImovelId }
            : await resolverIdImovel(imovelData);
        const inquilinoId = inquilinoResultado.id;
        const imovelId    = imovelResultado.id;
        const idsBackend  = { inquilinoId, imovelId };

        if (!inquilinoId) {
            console.warn('Inquilino sem ID no backend.');
            if (!silent) alert('Não foi possível vincular o inquilino ao backend.\n\n' + (inquilinoResultado.erro || 'Verifique os dados do inquilino e tente novamente.'));
            return;
        }
        if (!imovelId) {
            console.warn('Imóvel sem ID no backend.');
            if (!silent) alert('Não foi possível vincular o imóvel ao backend.\n\n' + (imovelResultado.erro || 'Verifique os dados do imóvel e tente novamente.'));
            return;
        }

        if (_editingContratoId) {
            const inquilinoAtualizado = await atualizarClienteBackend(inquilinoId, inquilinoData);
            if (!inquilinoAtualizado.ok) {
                alert('Não foi possível atualizar os dados do inquilino:\n\n' + inquilinoAtualizado.erro);
                return;
            }

            const imovelAtualizado = await atualizarImovelBackend(imovelId, { ...imovelData, tipo: 'casa' });
            if (!imovelAtualizado.ok) {
                alert('Não foi possível atualizar os dados do imóvel:\n\n' + imovelAtualizado.erro);
                return;
            }
        }

        const payload = {
            inquilino:         inquilinoId,
            imovel:            imovelId,
            prazo_meses:       parseInt(document.getElementById('prazo')?.value)             || 12,
            valor_aluguel:     parseFloat(document.getElementById('valor-aluguel')?.value)   || 0,
            dia_vencimento:    parseInt(document.getElementById('dia-vencimento')?.value)    || 10,
            valor_caucao:      parseFloat(document.getElementById('valor-caucao')?.value)    || 0,
            multa_infracao:    parseFloat(document.getElementById('multa-infracao')?.value)  || 0,
            multa_rescisao:    parseFloat(document.getElementById('multa-rescisao')?.value)  || 0,
            cidade_assinatura: document.getElementById('assinatura-cidade')?.value.trim()   || '',
            estado_assinatura: document.getElementById('assinatura-estado')?.value.trim()   || '',
            data_inicio:       document.getElementById('data-inicio')?.value                || '',
            data_assinatura:   document.getElementById('data-assinatura')?.value            || '',
            sem_caucao:         document.getElementById('sem-caucao')?.checked         || false,
            sem_multa_infracao: document.getElementById('sem-multa-infracao')?.checked || false,
            sem_multa_rescisao: document.getElementById('sem-multa-rescisao')?.checked || false,
        };

        const url = _editingContratoId
            ? `${API_BASE}/api/contratoaluguel/${_editingContratoId}/`
            : `${API_BASE}/api/contratoaluguel/`;

        const res = await fetch(url, {
            method: _editingContratoId ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const savedContrato = await res.json();
            if (!_editingContratoId) salvarContratoLocal({ ...idsBackend, backendId: savedContrato.id });
            if (!silent) alert(_editingContratoId ? 'Contrato atualizado com sucesso!' : 'Contrato salvo com sucesso!');
            limparFormulario();
        } else {
            const erro = await res.json().catch(() => ({}));
            console.error('Erro ao salvar contrato no backend:', erro);
            if (!silent) alert('Erro ao salvar no servidor: ' + JSON.stringify(erro));
        }
    } catch (err) {
        console.error('Erro ao salvar contrato:', err);
        alert('Não foi possível salvar o contrato. Veja o console para detalhes.');
    }
}

window.salvarContratoNoSistema = salvarContratoNoSistema;

function carregarContratoAluguelParaEdicao() {
    const raw = sessionStorage.getItem('contratoEdicao');
    if (!raw) return;

    let dados;
    try {
        dados = JSON.parse(raw);
    } catch (e) {
        sessionStorage.removeItem('contratoEdicao');
        return;
    }

    if (dados.tipoContrato !== 'aluguel' || !dados.contrato?.id) return;

    const contrato = dados.contrato;
    _editingContratoId = contrato.id;
    _editingInquilinoId = contrato.inquilino;
    _editingImovelId = contrato.imovel;

    if (dados.inquilino) preencherInquilino(dados.inquilino);
    if (dados.imovel) preencherImovel(dados.imovel);
    [...INQ_FIELD_IDS, ...IMOVEL_FIELD_IDS].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.removeAttribute('readonly');
        el.removeAttribute('disabled');
        el.classList.remove('prefilled');
    });

    const valores = {
        'prazo': contrato.prazo_meses,
        'valor-aluguel': contrato.valor_aluguel,
        'dia-vencimento': contrato.dia_vencimento,
        'valor-caucao': contrato.valor_caucao,
        'multa-infracao': contrato.multa_infracao,
        'multa-rescisao': contrato.multa_rescisao,
        'assinatura-cidade': contrato.cidade_assinatura,
        'assinatura-estado': contrato.estado_assinatura,
        'data-inicio': contrato.data_inicio,
        'data-assinatura': contrato.data_assinatura,
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (!el || valor === null || valor === undefined) return;
        el.value = valor;
        el.dispatchEvent(new Event('input'));
        el.dispatchEvent(new Event('change'));
    });

    [
        ['sem-caucao', 'sem_caucao'],
        ['sem-multa-infracao', 'sem_multa_infracao'],
        ['sem-multa-rescisao', 'sem_multa_rescisao'],
    ].forEach(([id, campo]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = Boolean(contrato[campo]);
        el.dispatchEvent(new Event('change'));
    });

    sincronizarTodosPreview();
}
