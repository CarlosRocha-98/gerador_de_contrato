// ── Gestão de Clientes (localStorage + API) ───────────────────────────────────
const CLIENTES_KEY = 'clientes';

function normalizarCPF(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function cpfTemTamanhoValido(valor) {
    // CPF-VALIDACAO: ponto central usado pelo formulário de aluguel.
    return window.CPF ? CPF.valido(valor) : normalizarCPF(valor).length === 11;
}

async function lerErroResposta(res, contexto) {
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        const erro = await res.json().catch(() => ({}));
        if (erro.detail && erro.error) return `${erro.detail}\n${erro.error}`;
        return erro.detail || erro.error || JSON.stringify(erro);
    }

    const texto = await res.text();
    if (/^\s*<!doctype html/i.test(texto) || /^\s*<html/i.test(texto)) {
        console.error(`${contexto}: backend retornou HTML`, texto);
        return `Erro interno no servidor ao ${contexto.toLowerCase()}. Verifique os logs do backend/Render e se as migrations foram aplicadas.`;
    }

    return texto || `Erro ${res.status} ao ${contexto.toLowerCase()}.`;
}

function montarPayloadCliente(dados) {
    return {
        nome: dados.nome,
        cpf: window.CPF ? CPF.formatar(dados.cpf) : normalizarCPF(dados.cpf),
        nacionalidade: dados.nacionalidade,
        profissao: dados.profissao,
        estado_civil: dados.estado_civil || dados.estadoCivil || '',
        telefone: TelefoneBR.formatar(dados.telefone),
        email: dados.email,
        rua: dados.endereco || dados.rua,
        numero: dados.numero,
        bairro: dados.bairro,
        cep: dados.cep,
        cidade: dados.cidade,
        estado: dados.estado,
    };
}

function carregarClientes() {
    return JSON.parse(localStorage.getItem(CLIENTES_KEY) || '[]')
        .map(cliente => ({
            ...cliente,
            cpf: CPF.formatar(cliente.cpf),
            telefone: TelefoneBR.formatar(cliente.telefone),
        }));
}

function salvarClientes(lista) {
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(lista));
}

function clienteSimilarExiste(lista, novo) {
    const nome = (novo?.nome || '').trim().toLowerCase();
    const cpf  = normalizarCPF(novo?.cpf);

    return lista.filter(c =>
        (nome && (c.nome || '').toLowerCase() === nome) ||
        (cpf && normalizarCPF(c.cpf) === cpf)
    );
}

function clienteJaExiste(lista, novo) {
    if (!novo) return false;

    const nome = (novo.nome || '').trim().toLowerCase();
    const cpf  = normalizarCPF(novo.cpf);

    return lista.some(c =>
        (nome && (c.nome || '').toLowerCase() === nome) ||
        (cpf && normalizarCPF(c.cpf) === cpf)
    );
}

async function adicionarCliente(dados) {
    const lista = carregarClientes();
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');

    if (jwt) {
        try {
            const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

            const payload = montarPayloadCliente(dados);

            const res = await fetch(`${API_BASE}/api/clientes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                const atualizada = lista.filter(c =>
                    String(c.id) !== String(dados.id) &&
                    (!dados.cpf || normalizarCPF(c.cpf) !== normalizarCPF(dados.cpf))
                );
                atualizada.push(saved);
                salvarClientes(atualizada);
                return saved;
            }

            const erro = await lerErroResposta(res, 'Salvar cliente');
            console.warn('Backend recusou cliente:', erro);
            return { erroBackend: erro || `Erro ${res.status} ao salvar cliente.` };
        } catch (err) {
            console.warn('Falha backend cliente:', err);
            return { erroBackend: err?.message || 'Falha ao conectar ao backend de clientes.' };
        }
    }

    if (!clienteJaExiste(lista, dados)) {
        lista.push({ id: Date.now(), ...dados });
        salvarClientes(lista);
    }

    return null;
}

async function sincronizarClientesDoBackend() {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt) return;

    try {
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

        const res = await fetch(`${API_BASE}/api/clientes/`, {
            headers: { 'Authorization': 'Bearer ' + jwt }
        });

        if (!res.ok) return;

        const lista = await res.json();
        const backendIds = new Set(lista.map(c => c.id));

        const locais = carregarClientes()
            .filter(c => !c.id || (!backendIds.has(c.id) && c.id > 1e9));

        salvarClientes([...lista, ...locais]);
    } catch (e) {}
}


// ── Gestão de Imóveis ────────────────────────────────────────────────────────
const IMOVEIS_KEY = 'imoveis';

function carregarImoveis() {
    return JSON.parse(localStorage.getItem(IMOVEIS_KEY) || '[]');
}

function montarPayloadImovel(imovel) {
    return {
        endereco: imovel.endereco,
        numero: imovel.numero,
        bairro: imovel.bairro,
        cidade: imovel.cidade,
        estado: imovel.estado,
        tipo: imovel.tipo || 'casa',
        caracteristicas: imovel.caracteristicas || ''
    };
}

async function adicionarImovel(imovel) {
    const lista = carregarImoveis();
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');

    if (jwt) {
        try {
            const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

            const payload = montarPayloadImovel(imovel);

            const res = await fetch(`${API_BASE}/api/imoveis/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                const atualizada = lista.filter(i =>
                    String(i.id) !== String(imovel.id) &&
                    !(i.endereco === imovel.endereco && i.numero === imovel.numero)
                );
                atualizada.push(saved);
                localStorage.setItem(IMOVEIS_KEY, JSON.stringify(atualizada));
                return saved;
            }
            const erro = await lerErroResposta(res, 'Salvar imóvel');
            console.warn('Backend recusou imóvel:', erro);
            return { erroBackend: erro || `Erro ${res.status} ao salvar imóvel.` };
        } catch (err) {
            console.warn('Falha backend imóvel:', err);
            return { erroBackend: err?.message || 'Falha ao conectar ao backend de imóveis.' };
        }
    }

    if (!lista.some(i => i.endereco === imovel.endereco && i.numero === imovel.numero)) {
        lista.push({ id: Date.now(), ...imovel });
        localStorage.setItem(IMOVEIS_KEY, JSON.stringify(lista));
    }

    return null;
}

async function sincronizarImoveisDoBackend() {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt) return;

    try {
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

        const res = await fetch(`${API_BASE}/api/imoveis/`, {
            headers: { 'Authorization': 'Bearer ' + jwt }
        });

        if (!res.ok) return;

        const lista = await res.json();
        const backendIds = new Set(lista.map(i => i.id));

        const locais = carregarImoveis()
            .filter(i => !i.id || (!backendIds.has(i.id) && i.id > 1e9));

        localStorage.setItem(IMOVEIS_KEY, JSON.stringify([...lista, ...locais]));
    } catch (e) {}
}

async function atualizarImovelBackend(id, imovel) {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt || !id) return { ok: false, erro: 'Imóvel sem ID no backend.' };

    try {
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
        const res = await fetch(`${API_BASE}/api/imoveis/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify(montarPayloadImovel(imovel))
        });

        if (!res.ok) return { ok: false, erro: await lerErroResposta(res, 'Atualizar imóvel') };

        const saved = await res.json();
        const lista = carregarImoveis().map(i => String(i.id) === String(id) ? saved : i);
        localStorage.setItem(IMOVEIS_KEY, JSON.stringify(lista));
        return { ok: true, data: saved };
    } catch (err) {
        return { ok: false, erro: err?.message || 'Falha ao atualizar imóvel.' };
    }
}

async function atualizarClienteBackend(id, dados) {
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!jwt || !id) return { ok: false, erro: 'Cliente sem ID no backend.' };

    try {
        const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
        const res = await fetch(`${API_BASE}/api/clientes/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify(montarPayloadCliente(dados))
        });

        if (!res.ok) return { ok: false, erro: await lerErroResposta(res, 'Atualizar cliente') };

        const saved = await res.json();
        salvarClientes(carregarClientes().map(c => String(c.id) === String(id) ? saved : c));
        return { ok: true, data: saved };
    } catch (err) {
        return { ok: false, erro: err?.message || 'Falha ao atualizar cliente.' };
    }
}
