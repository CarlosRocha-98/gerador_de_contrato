const IMOVEIS_KEY = 'imoveis';

function carregarImoveisLocal() {
    return JSON.parse(localStorage.getItem(IMOVEIS_KEY) || '[]');
}

function imovelJaExiste(lista, novo) {
    return lista.some(i =>
        i.endereco === novo.endereco &&
        i.numero === novo.numero &&
        i.bairro === novo.bairro &&
        i.cidadeUf === novo.cidadeUf
    );
}

document.getElementById('propertyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // helper: try multiple possible IDs and return the first found trimmed value
    function getValueByIds(...ids) {
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el && typeof el.value !== 'undefined') return String(el.value).trim();
        }
        return '';
    }

    const novoImovel = {
        endereco:        getValueByIds('address', 'endereco'),
        numero:          getValueByIds('number', 'numero'),
        bairro:          getValueByIds('neighborhood', 'bairro'),
        cidadeUf:        getValueByIds('city', 'cidade_uf'),
        tipo:            getValueByIds('tipo', 'tipo-imovel'),
        caracteristicas: getValueByIds('features', 'caracteristicas'),
    };

    const jwt = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (jwt) {
        const API_BASE = window.API_HOST || 'http://localhost:8000';
        const payload = {
            endereco:        novoImovel.endereco,
            numero:          novoImovel.numero,
            bairro:          novoImovel.bairro,
            cidade_uf:       novoImovel.cidadeUf,
            tipo:            novoImovel.tipo,
            caracteristicas: novoImovel.caracteristicas,
        };
        fetch(`${API_BASE}/api/imoveis/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t); });
            return res.json();
        })
        .then(saved => {
            const lista = carregarImoveisLocal();
            lista.push(saved);
            localStorage.setItem(IMOVEIS_KEY, JSON.stringify(lista));
            alert('Imóvel registrado com sucesso!');
            window.location.href = '../Home/index.html';
        })
        .catch(err => {
            console.error('Falha ao salvar imóvel no backend:', err);
            // fallback local
            const lista = carregarImoveisLocal();
            if (!imovelJaExiste(lista, novoImovel)) {
                lista.push({ id: Date.now(), ...novoImovel });
                localStorage.setItem(IMOVEIS_KEY, JSON.stringify(lista));
            }
            alert('Imóvel salvo localmente (erro no servidor: ' + err.message + ').');
            window.location.href = '../Home/index.html';
        });
        return; // aguarda o fetch acima
    }

    // Sem JWT → salva só local
    const lista = carregarImoveisLocal();
    if (!imovelJaExiste(lista, novoImovel)) {
        lista.push({ id: Date.now(), ...novoImovel });
        localStorage.setItem(IMOVEIS_KEY, JSON.stringify(lista));
    }
    alert('Imóvel registrado com sucesso!');
    window.location.href = '../Home/index.html';
});
