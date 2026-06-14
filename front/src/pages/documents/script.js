const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

const documentsList = document.getElementById('documentsList');
const statusMessage = document.getElementById('statusMessage');

let clientesMap = {};
let imoveisMap = {};
let todosContratos = [];

function getToken() {
    return localStorage.getItem('access_token') || localStorage.getItem('access');
}

function formatarData(data) {

    if (!data) return 'Data não informada';

    const partes = String(data).split('-');

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const date = new Date(data);

    if (Number.isNaN(date.getTime())) {
        return 'Data não informada';
    }

    return date.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return 'R$ 0,00';
    }

    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function mostrarStatus(mensagem, tipo = '') {

    statusMessage.textContent = mensagem;
    statusMessage.className = `status-message ${tipo}`;
    statusMessage.style.display = mensagem ? 'block' : 'none';
}

async function buscarJson(url, token) {

    const res = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    if (!res.ok) {
        throw new Error(`Erro ${res.status} ao buscar ${url}`);
    }

    return res.json();
}

async function carregarClientesEImoveis(token) {

    const [clientesResult, imoveisResult] = await Promise.allSettled([
        buscarJson(`${API_BASE}/api/clientes/`, token),
        buscarJson(`${API_BASE}/api/imoveis/`, token)
    ]);

    clientesMap = {};
    imoveisMap = {};

    if (clientesResult.status === 'fulfilled') {

        clientesResult.value.forEach(cliente => {
            clientesMap[cliente.id] = cliente;
        });
    }

    if (imoveisResult.status === 'fulfilled') {

        imoveisResult.value.forEach(imovel => {
            imoveisMap[imovel.id] = imovel;
        });
    }
}

function obterClientePorId(id) {

    if (!id) return null;

    return clientesMap[id] || null;
}

function obterImovelPorId(id) {

    if (!id) return null;

    return imoveisMap[id] || null;
}

function limparNomeArquivo(texto) {

    return String(texto || 'Contrato')
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_');
}

function obterNomeContrato(contrato) {

    if (contrato.tipoContrato === 'aluguel') {

        const inquilino = obterClientePorId(contrato.inquilino);

        const nomeCliente =
            inquilino?.nome ||
            `Cliente_${contrato.inquilino || contrato.id}`;

        return `Contrato_Locacao_${limparNomeArquivo(nomeCliente)}.pdf`;
    }

    const prestador = obterClientePorId(contrato.prestador);

    const nomePrestador =
        prestador?.nome ||
        `Cliente_${contrato.prestador || contrato.id}`;

    return `Contrato_Servico_${limparNomeArquivo(nomePrestador)}.pdf`;
}

function obterInfoContrato(contrato) {

    if (contrato.tipoContrato === 'aluguel') {

        const inquilino = obterClientePorId(contrato.inquilino);
        const imovel = obterImovelPorId(contrato.imovel);

        const enderecoImovel = imovel
            ? `${imovel.endereco || ''}${imovel.numero ? ', ' + imovel.numero : ''}${imovel.bairro ? ' - ' + imovel.bairro : ''}${imovel.cidade ? ' - ' + imovel.cidade : ''}`
            : 'Imóvel não informado';

        return {
            subtitulo1: `Inquilino: ${inquilino?.nome || 'Inquilino não informado'}`,
            subtitulo2: `Imóvel: ${enderecoImovel}`,
            subtitulo3: `Valor: ${formatarMoeda(contrato.valor_aluguel)}`,
            data: formatarData(
                contrato.criado_em ||
                contrato.data_assinatura ||
                contrato.data_inicio
            )
        };
    }

    const prestador = obterClientePorId(contrato.prestador);

    return {
        subtitulo1: `Prestador: ${prestador?.nome || 'Prestador não informado'}`,
        subtitulo2: `Serviço: ${contrato.tipo_servico || contrato.especificacao_servico || 'Serviço não informado'}`,
        subtitulo3: `Valor: ${formatarMoeda(contrato.valor_mensal || contrato.valor_total)}`,
        data: formatarData(
            contrato.criado_em ||
            contrato.data_assinatura ||
            contrato.data_inicio
        )
    };
}

function montarContratoCompleto(contrato) {

    const inquilino = obterClientePorId(contrato.inquilino);
    const imovel = obterImovelPorId(contrato.imovel);
    const prestador = obterClientePorId(contrato.prestador);

    return {
        contrato,
        tipoContrato: contrato.tipoContrato,
        nomeArquivo: obterNomeContrato(contrato),

        inquilino,
        imovel,
        prestador
    };
}

async function carregarContratos() {

    const token = getToken();

    if (!token) {

        mostrarStatus(
            'Você precisa estar logado para visualizar seus contratos.',
            'error'
        );

        return;
    }

    mostrarStatus('Carregando contratos...');

    try {

        await carregarClientesEImoveis(token);

        const [aluguelResult, servicoResult] = await Promise.allSettled([
            buscarJson(`${API_BASE}/api/contratoaluguel/`, token),
            buscarJson(`${API_BASE}/api/contratoservico/`, token)
        ]);

        let contratos = [];

        if (aluguelResult.status === 'fulfilled') {

            contratos = contratos.concat(
                aluguelResult.value.map(contrato => ({
                    ...contrato,
                    tipoContrato: 'aluguel'
                }))
            );
        }

        if (servicoResult.status === 'fulfilled') {

            contratos = contratos.concat(
                servicoResult.value.map(contrato => ({
                    ...contrato,
                    tipoContrato: 'servico'
                }))
            );
        }

        contratos.sort((a, b) => {

            const dataA = new Date(
                a.criado_em ||
                a.data_assinatura ||
                a.data_inicio ||
                0
            );

            const dataB = new Date(
                b.criado_em ||
                b.data_assinatura ||
                b.data_inicio ||
                0
            );

            return dataB - dataA;
        });

        todosContratos = contratos;

        renderizarContratos(todosContratos);

    } catch (error) {

        console.error(error);

        mostrarStatus(
            'Erro ao carregar contratos. Verifique se o backend está rodando.',
            'error'
        );
    }
}

function renderizarContratos(contratos) {

    documentsList.innerHTML = '';

    if (!contratos.length) {

        mostrarStatus(
            'Nenhum contrato encontrado.',
            'empty'
        );

        return;
    }

    mostrarStatus('');

    contratos.forEach(contrato => {

        const info = obterInfoContrato(contrato);
        const nomeArquivo = obterNomeContrato(contrato);

        const item = document.createElement('div');

        item.className = 'document-item';

        item.innerHTML = `
            <div class="doc-info">

                <span class="doc-icon">📄</span>

                <div>
                    <strong>${nomeArquivo}</strong>

                    <p>${info.subtitulo1}</p>
                    <p>${info.subtitulo2}</p>
                    <p>${info.subtitulo3}</p>
                    <p>Gerado em: ${info.data}</p>
                </div>
            </div>

            <div class="doc-actions">

                <button
                    class="btn-download"
                    title="Visualizar e salvar em PDF"
                >
                    📥
                </button>

                <button
                    class="btn-delete"
                    title="Excluir contrato"
                >
                    🗑️
                </button>

            </div>
        `;

        item
            .querySelector('.btn-download')
            .addEventListener('click', () => {
                abrirPreviewContrato(contrato);
            });

        item
            .querySelector('.btn-delete')
            .addEventListener('click', () => {
                excluirContrato(contrato);
            });

        documentsList.appendChild(item);
    });
}

function abrirPreviewContrato(contrato) {

    const dadosCompletos = montarContratoCompleto(contrato);

    sessionStorage.setItem(
        'contratoPreview',
        JSON.stringify(dadosCompletos)
    );

    window.location.href = '../ContractPreview/index.html';
}

async function excluirContrato(contrato) {

    const token = getToken();

    if (!token) {
        alert('Você precisa estar logado.');
        return;
    }

    if (!confirm('Deseja realmente excluir este contrato?')) {
        return;
    }

    const url =
        contrato.tipoContrato === 'aluguel'
            ? `${API_BASE}/api/contratoaluguel/${contrato.id}/`
            : `${API_BASE}/api/contratoservico/${contrato.id}/`;

    try {

        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!res.ok && res.status !== 204) {

            alert('Não foi possível excluir o contrato.');

            console.error(await res.text());

            return;
        }

        await carregarContratos();

    } catch (error) {

        console.error(error);

        alert('Erro ao excluir contrato.');
    }
}

const campoBusca = document.getElementById('searchContracts');

campoBusca?.addEventListener('input', (e) => {

    const termo = e.target.value
        .toLowerCase()
        .trim();

    if (!termo) {
        renderizarContratos(todosContratos);
        return;
    }

    const filtrados = todosContratos.filter(contrato => {

        const textoContrato =
            JSON.stringify(contrato).toLowerCase();

        return textoContrato.includes(termo);
    });

    renderizarContratos(filtrados);
});

document.addEventListener('DOMContentLoaded', carregarContratos);