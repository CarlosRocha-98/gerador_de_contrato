const CLIENTES_KEY = 'clientes';

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

function clienteJaExiste(lista, novo) {
    return lista.some(c =>
        c.nome === novo.nome &&
        c.cpf === novo.cpf &&
        (c.rua || c.endereco || '') === (novo.rua || novo.endereco || '') &&
        c.numero === novo.numero &&
        c.cidade === novo.cidade &&
        c.estado === novo.estado
    );
}

document.getElementById('clientForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const getVal = id => (document.getElementById(id) && document.getElementById(id).value) ? document.getElementById(id).value.trim() : '';

    const nome = getVal('nome');
    const cpf  = getVal('cpf');
    if (!nome || !cpf) {
        alert('Nome e CPF são obrigatórios para cadastrar um cliente.');
        return;
    }
    // CPF-VALIDACAO: validação do CPF no cadastro direto de cliente.
    if (!CPF.valido(cpf)) {
        alert('CPF inválido. Verifique os dígitos informados.');
        return;
    }
    const telefone = getVal('telefone');
    if (!TelefoneBR.valido(telefone)) {
        alert('Telefone inválido. Use celular ou fixo com DDD.');
        return;
    }

    const formData = {
        nome,
        cpf: CPF.formatar(cpf),
        orgao_expedidor:getVal('orgao_expedidor'),
        nacionalidade:  getVal('nacionalidade'),
        profissao:      getVal('profissao'),
        estado_civil:   getVal('estado_civil'),
        telefone:       TelefoneBR.formatar(telefone),
        email:          getVal('email'),
        rua:            getVal('rua'),
        numero:         getVal('numero'),
        bairro:         getVal('bairro'),
        cep:            getVal('cep'),
        cidade:         getVal('cidade'),
        estado:         getVal('estado'),
        criado_em:      new Date().toISOString(),
    };

    console.log('[Clients] formData before save:', formData);

    const lista = carregarClientes();
    if (clienteJaExiste(lista, formData)) {
        alert(`Cliente "${formData.nome}" já está cadastrado com os mesmos dados.`);
        return;
    }

    lista.push({ id: Date.now(), ...formData });
    salvarClientes(lista);

    // If logged in, try to POST to backend
    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (jwt) {
        (async () => {
            try {
                const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';
                const payload = {
                    nome: formData.nome,
                    cpf: formData.cpf,
                    orgao_expedidor: formData.orgao_expedidor,
                    nacionalidade: formData.nacionalidade,
                    profissao: formData.profissao,
                    estado_civil: formData.estado_civil,
                    telefone: formData.telefone,
                    email: formData.email,
                    rua: formData.rua,
                    numero: formData.numero,
                    bairro: formData.bairro,
                    cep: formData.cep,
                    cidade: formData.cidade,
                    estado: formData.estado,
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
                    // update local list with backend id
                    const local = carregarClientes();
                    const idx = local.findIndex(c => c.id === lista[lista.length-1].id);
                    if (idx !== -1) { local[idx] = saved; salvarClientes(local); }
                }
            } catch (e) { console.warn('Erro ao enviar cliente para API:', e); }
        })();
    }

    alert(`Cliente ${formData.nome} cadastrado com sucesso!`);
    window.location.href = '../Home/index.html';
});
