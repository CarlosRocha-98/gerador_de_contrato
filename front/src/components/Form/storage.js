// ── Gestão de Clientes (localStorage + API) ───────────────────────────────────
const CLIENTES_KEY = 'clientes';

function normalizarCPF(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function carregarClientes() {
    return JSON.parse(localStorage.getItem(CLIENTES_KEY) || '[]');
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

            const payload = {
                nome: dados.nome,
                cpf: normalizarCPF(dados.cpf),
                orgao_expedidor: dados.orgao_expedidor,
                nacionalidade: dados.nacionalidade,
                profissao: dados.profissao,
                estado_civil: dados.estado_civil || dados.estadoCivil || '',
                telefone: dados.telefone,
                email: dados.email,
                rua: dados.endereco || dados.rua,
                numero: dados.numero,
                bairro: dados.bairro,
                cep: dados.cep,
                cidade: dados.cidade,
                estado: dados.estado,
            };

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

            console.warn('Backend recusou cliente:', await res.text());
        } catch (err) {
            console.warn('Falha backend cliente:', err);
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

async function adicionarImovel(imovel) {
    const lista = carregarImoveis();
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');

    if (jwt) {
        try {
            const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

            const payload = {
                endereco: imovel.endereco,
                numero: imovel.numero,
                bairro: imovel.bairro,
                cidade: imovel.cidade,
                estado: imovel.estado,
                tipo: imovel.tipo || '',
                caracteristicas: imovel.caracteristicas || ''
            };

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
        } catch (err) {
            console.warn('Falha backend imóvel:', err);
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
