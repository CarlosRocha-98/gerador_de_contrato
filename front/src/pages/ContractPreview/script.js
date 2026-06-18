const contractContent = document.getElementById('contractContent');
const btnPrint = document.getElementById('btnPrint');

const API_BASE = window.API_HOST || 'https://gerador-de-contrato-6uck.onrender.com';

async function buscarPerfilLocador() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('access');

    try {
        if (!token) {
            return JSON.parse(localStorage.getItem('localProfile') || 'null') || {};
        }

        const res = await fetch(`${API_BASE}/api/perfil/`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!res.ok) throw new Error('Erro ao buscar perfil do usuário');

        return await res.json();
    } catch (error) {
        console.warn('Não foi possível buscar perfil:', error);
        return JSON.parse(localStorage.getItem('localProfile') || 'null') || {};
    }
}

function formatarData(data) {
    if (!data) return '______________';

    const partes = String(data).split('-');

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const date = new Date(data);

    if (Number.isNaN(date.getTime())) return data;

    return date.toLocaleDateString('pt-BR');
}

function formatarDataExtenso(data) {
    if (!data) return '______________';

    const partes = String(data).split('-');

    if (partes.length !== 3) return formatarData(data);

    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const ano = partes[0];
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    return `${dia} de ${meses[mes - 1]} de ${ano}`;
}

function texto(valor, fallback = '______________') {
    if (valor === null || valor === undefined || valor === '') {
        return fallback;
    }

    return valor;
}

function campo(valor, fallback = '______________') {
    return `<span class="contract-field">${texto(valor, fallback)}</span>`;
}

function valorOuIsento(valor, semCampo = false) {
    if (semCampo) return 'isento';

    if (valor === null || valor === undefined || valor === '') {
        return '______________';
    }

    return valor;
}

function montarEnderecoPessoa(pessoa) {
    if (!pessoa) return '______________';

    return `${campo(pessoa.rua || pessoa.endereco)}, nº ${campo(pessoa.numero)}, bairro ${campo(pessoa.bairro)}, ${campo(pessoa.cidade)}/${campo(pessoa.estado)}, CEP: ${campo(pessoa.cep)}`;
}

function montarEnderecoImovel(imovel) {
    if (!imovel) return '______________';

    return `${campo(imovel.endereco)}, nº ${campo(imovel.numero)}, ${campo(imovel.bairro)}, ${campo(imovel.cidade)}/${campo(imovel.estado)}`;
}

function contratoAluguelHTML(dados) {
    const contrato = dados.contrato || {};
    const proprietario = dados.proprietario || {};
    const inquilino = dados.inquilino || {};
    const imovel = dados.imovel || {};

    return `
        <h1>CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL</h1>

        <h2>IDENTIFICAÇÃO DAS PARTES CONTRATANTES</h2>

        <p class="contract-line">
            <strong>LOCADOR:</strong>
            ${campo(proprietario.nome || proprietario.username)},
            ${campo(proprietario.nacionalidade)},
            ${campo(proprietario.profissao)},
            ${campo(proprietario.estado_civil)},
            C.P.F. nº ${campo(proprietario.cpf)},
            residente na ${montarEnderecoPessoa(proprietario)}.
        </p>

        <p class="contract-line">
            <strong>LOCATÁRIO:</strong>
            ${campo(inquilino.nome)},
            ${campo(inquilino.nacionalidade)},
            ${campo(inquilino.profissao)},
            ${campo(inquilino.estado_civil)},
            C.P.F. nº ${campo(inquilino.cpf)},
            residente na ${montarEnderecoPessoa(inquilino)}.
        </p>

        <p>
            As partes acima nomeadas acordam o presente
            <strong>Contrato de Locação Residencial</strong>, de acordo com as cláusulas a seguir:
        </p>

        <h2>Cláusula 1ª – DO OBJETO DO CONTRATO</h2>

        <p class="contract-line">
            O OBJETO deste contrato é o imóvel de propriedade do LOCADOR,
            situado na ${montarEnderecoImovel(imovel)}, com as características a seguir:
        </p>

        <p>${texto(imovel.caracteristicas)}</p>

        <p>Imóvel isento de encargos ou quaisquer pendências financeiras.</p>

        <p>
            Parágrafo único. O atual documento é complementado pelo laudo de vistoria
            que descreve meticulosamente o imóvel e sua condição de preservação,
            no instante de entrega ao LOCATÁRIO.
        </p>

        <h2>Cláusula 2ª – DO PRAZO DE LOCAÇÃO</h2>

        <p class="contract-line">
            A duração da locação deste imóvel é de ${campo(contrato.prazo_meses)}
            meses, iniciando-se em ${campo(formatarData(contrato.data_inicio))}.
        </p>

        <h2>Cláusula 3ª – DA FINALIDADE DO IMÓVEL</h2>

        <p>
            O objetivo desta LOCAÇÃO é estritamente para a utilização do imóvel para
            fins de moradia, sendo vedado ao LOCATÁRIO sublocá-lo ou utilizá-lo de
            maneira diferente do estabelecido, a menos que haja consentimento explícito
            do LOCADOR.
        </p>

        <h2>Cláusula 4ª – SOBRE O VALOR DO ALUGUEL, DESPESAS E IMPOSTOS</h2>

        <p>
            O LOCATÁRIO se compromete a pagar o aluguel mensal no valor de
            R$ ${texto(contrato.valor_aluguel)}, que deverá ser realizado até o dia
            ${texto(contrato.dia_vencimento)} de cada mês subsequente ao vencido.
        </p>

        <p>
            § 1º. Este pagamento será efetuado em dinheiro (espécie), diretamente ao
            LOCADOR ou a terceiros que tenham a devida autorização deste.
        </p>

        <p>
            § 2º. O valor do aluguel poderá ser reajustado anualmente, com base nos
            índices previstos e acumulados no período anual do IGP-M.
        </p>

        <p>
            § 3º. O LOCATÁRIO, não realizando o pagamento do aluguel até a data
            estipulada, fica obrigado a pagar uma multa de 10% (dez por cento)
            sobre o valor do aluguel acordado neste contrato, além de juros de
            1% ao mês.
        </p>

        <h2>Cláusula 5ª – DA CAUÇÃO</h2>

        <p>
            O LOCATÁRIO entrega ao LOCADOR, a título de caução, o valor de R$
            ${valorOuIsento(contrato.valor_caucao, contrato.sem_caucao)}, que será
            devolvido ao final do contrato, caso não haja débitos pendentes.
        </p>

        <h2>Cláusula 6ª – DAS INFRAÇÕES</h2>

        <p>
            Em caso de infração a qualquer cláusula deste contrato, a parte infratora
            pagará à outra uma multa no valor de R$
            ${valorOuIsento(contrato.multa_infracao, contrato.sem_multa_infracao)}.
        </p>

        <h2>Cláusula 7ª – DA RESCISÃO</h2>

        <p>
            Em caso de rescisão antecipada por qualquer das partes, deverá ser paga
            uma multa no valor de R$
            ${valorOuIsento(contrato.multa_rescisao, contrato.sem_multa_rescisao)},
            proporcional ao período restante do contrato.
        </p>

        <p class="local-data">
            ${texto(contrato.cidade_assinatura)}, ${texto(contrato.estado_assinatura)},
            ${formatarData(contrato.data_assinatura)}.
        </p>

        <div class="assinaturas">
            <div>
                <span></span>
                <p>LOCADOR</p>
            </div>

            <div>
                <span></span>
                <p>LOCATÁRIO</p>
            </div>
        </div>
    `;
}

function contratoServicoHTML(dados) {
    const contrato = dados.contrato || {};
    const prestador = dados.proprietario || {};
    const contratante = dados.contratante || {};

    return `
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

        <h2>IDENTIFICAÇÃO DAS PARTES CONTRATANTES</h2>

        <p>
            <strong>CONTRATANTE:</strong>
            ${texto(contratante.nome)},
            ${texto(contratante.nacionalidade)},
            ${texto(contratante.profissao)},
            ${texto(contratante.estado_civil)},
            C.P.F. nº ${texto(contratante.cpf)},
            residente na ${montarEnderecoPessoa(contratante)}.
        </p>

        <p>
            <strong>PRESTADOR:</strong>
            ${texto(prestador.nome || prestador.username)},
            ${texto(prestador.nacionalidade)},
            ${texto(prestador.profissao)},
            ${texto(prestador.estado_civil)},
            C.P.F. nº ${texto(prestador.cpf)},
            residente na ${montarEnderecoPessoa(prestador)}.
        </p>

        <p>
            As partes acima identificadas celebram o presente
            <strong>Contrato de Prestação de Serviços</strong>, que se regerá pelas cláusulas seguintes:
        </p>

        <h2>Cláusula 1ª – DO OBJETO DO CONTRATO</h2>

        <p>
            O presente contrato tem por objeto a prestação de serviços de
            ${texto(contrato.tipo_servico)}, conforme especificado a seguir:
        </p>

        <p>${texto(contrato.especificacao_servico)}</p>

        <h2>Cláusula 2ª – DAS ATIVIDADES CONTRATADAS</h2>

        <p>As seguintes atividades deverão ser executadas pelo PRESTADOR:</p>

        <p>${texto(contrato.atividades_contratadas)}</p>

        <h2>Cláusula 3ª – DO MOTIVO DA CONTRATAÇÃO</h2>

        <p>${texto(contrato.motivo_contratacao)}</p>

        <h2>Cláusula 4ª – DO PRAZO</h2>

        <p>
            O presente contrato vigorará pelo prazo de ${texto(contrato.prazo_meses)}
            meses, com início em ${formatarDataExtenso(contrato.data_inicio)}
            e término em ${formatarDataExtenso(contrato.data_termino)}.
        </p>

        <h2>Cláusula 5ª – DO LOCAL DE EXECUÇÃO</h2>

        <p>${contrato.executa_nas_dependencias
            ? 'Os serviços serão executados no Endereço do Contratante.'
            : `Os serviços serão executados no seguinte local: ${texto(contrato.local_execucao)}.`}
        </p>

        <h2>Cláusula 6ª – DA REMUNERAÇÃO E FORMA DE PAGAMENTO</h2>

        <p>
            Pela prestação dos serviços, a CONTRATANTE pagará ao PRESTADOR o valor
            mensal de R$ ${texto(contrato.valor_mensal)}, de forma
            ${texto(contrato.forma_pagamento)}, com vencimento no dia
            ${texto(contrato.dia_vencimento)} de cada mês.
        </p>

        <p>
            § 1º. O não pagamento na data acordada sujeitará a CONTRATANTE ao
            pagamento de multa de R$ ${texto(contrato.multa_atraso)}, além de juros
            de 1% ao mês sobre o valor em atraso.
        </p>

        <h2>Cláusula 7ª – DAS DISPOSIÇÕES DE SEGURANÇA, HIGIENE E SALUBRIDADE</h2>

        <p>${texto(contrato.disposicoes_seguranca)}</p>

        <p>
            Parágrafo único. O PRESTADOR é o responsável pelo cumprimento das normas
            de segurança do trabalho aplicáveis à atividade prestada.
        </p>

        <h2>Cláusula 8ª – DA RESCISÃO</h2>

        <p>
            Em caso de rescisão antecipada por qualquer das partes, sem justa causa,
            deverá ser paga à outra parte uma multa no valor de
            R$ ${texto(contrato.multa_rescisao)}.
        </p>

        <h2>Cláusula 9ª – DA RESPONSABILIDADE SUBSIDIÁRIA</h2>

        <p>
            A CONTRATANTE responde subsidiariamente pelas obrigações trabalhistas e
            previdenciárias decorrentes da execução deste contrato, nos termos da
            legislação vigente.
        </p>

        <h2>Cláusula 10ª – DO FORO</h2>

        <p>
            As partes elegem o foro da comarca de ${texto(contrato.foro || contrato.local_execucao)}
            para dirimir quaisquer controvérsias oriundas do presente contrato.
        </p>

        <p class="local-data">
            ${texto(contrato.cidade_assinatura || 'São Paulo')},
            ${texto(contrato.estado_assinatura || 'SP')},
            ${formatarDataExtenso(contrato.data_assinatura || contrato.criado_em)}.
        </p>

        <div class="assinaturas">
            <div>
                <span></span>
                <p>CONTRATANTE</p>
            </div>

            <div>
                <span></span>
                <p>PRESTADOR</p>
            </div>
        </div>
    `;
}

function agruparInicioDasClausulas(forcarClausula5NaNovaPagina = false) {
    contractContent.querySelectorAll('h2').forEach(titulo => {
        if (!titulo.textContent.trim().toLowerCase().startsWith('cláusula')) return;
        const primeiroParagrafo = titulo.nextElementSibling;
        if (!primeiroParagrafo || primeiroParagrafo.tagName !== 'P') return;

        const grupo = document.createElement('section');
        grupo.className = 'clause-start';
        if (forcarClausula5NaNovaPagina && titulo.textContent.includes('Cláusula 5ª')) {
            grupo.classList.add('clause-page-break');
        }
        titulo.parentNode.insertBefore(grupo, titulo);
        grupo.append(titulo, primeiroParagrafo);
    });
}

async function carregarPreview() {
    const raw = sessionStorage.getItem('contratoPreview');

    if (!raw) {
        contractContent.innerHTML = `
            <h1>Contrato não encontrado</h1>
            <p>Volte para a página de contratos e selecione um documento novamente.</p>
        `;
        return;
    }

    const dados = JSON.parse(raw);

    dados.proprietario = await buscarPerfilLocador();

    document.title = dados.nomeArquivo || 'Contrato';

    if (dados.tipoContrato === 'aluguel') {
        contractContent.innerHTML = contratoAluguelHTML(dados);
        agruparInicioDasClausulas(true);
        return;
    }

    contractContent.innerHTML = contratoServicoHTML(dados);
    agruparInicioDasClausulas(false);
}

btnPrint.addEventListener('click', () => {
    window.print();
});

document.addEventListener('DOMContentLoaded', carregarPreview);
