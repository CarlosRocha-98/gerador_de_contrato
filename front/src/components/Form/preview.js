const fieldMap = {
    'prop-nome': 'pv-prop-nome',
    'prop-nacionalidade': 'pv-prop-nacionalidade',
    'prop-profissao': 'pv-prop-profissao',
    'prop-estado-civil': 'pv-prop-estado-civil',
    'prop-cpf': 'pv-prop-cpf',
    'prop-endereco': 'pv-prop-endereco',
    'prop-numero': 'pv-prop-numero',
    'prop-bairro': 'pv-prop-bairro',
    'prop-cep': 'pv-prop-cep',
    'prop-cidade': 'pv-prop-cidade',
    'inq-nome': 'pv-inq-nome',
    'inq-nacionalidade': 'pv-inq-nacionalidade',
    'inq-profissao': 'pv-inq-profissao',
    'inq-estado-civil': 'pv-inq-estado-civil',
    'inq-cpf': 'pv-inq-cpf',
    'inq-endereco': 'pv-inq-endereco',
    'inq-numero': 'pv-inq-numero',
    'inq-bairro': 'pv-inq-bairro',
    'inq-cep': 'pv-inq-cep',
    'inq-cidade': 'pv-inq-cidade',
    'imovel-endereco': 'pv-imovel-endereco',
    'imovel-numero': 'pv-imovel-numero',
    'imovel-bairro': 'pv-imovel-bairro',
    'imovel-cidade-uf': 'pv-imovel-cidade-uf',
    'imovel-caracteristicas': 'pv-imovel-caracteristicas',
    'prazo': 'pv-prazo',
    'valor-aluguel': 'pv-valor-aluguel',
    'dia-vencimento': 'pv-dia-vencimento',
    'valor-caucao': 'pv-valor-caucao',
    'multa-infracao': 'pv-multa-infracao',
    'multa-rescisao': 'pv-multa-rescisao',
    'assinatura-cidade': 'pv-assinatura-cidade',
    'assinatura-estado': 'pv-assinatura-estado',
};

function updatePreview(inputId) {
    const input = document.getElementById(inputId);
    const previewEl = document.getElementById(fieldMap[inputId]);

    if (!input || !previewEl) return;

    previewEl.textContent = (input.value || '').trim() || '______________';
}

function sincronizarTodosPreview() {
    Object.keys(fieldMap).forEach(updatePreview);
}

function atualizarPreviewData(inputId) {
    const pvMap = {
        'data-inicio': 'pv-data-inicio',
        'data-assinatura': 'pv-data-assinatura'
    };

    const el = document.getElementById(inputId);
    const pv = document.getElementById(pvMap[inputId]);

    if (!el || !pv) return;

    if (!el.value) {
        pv.textContent = '______________';
        return;
    }

    const [y, m, d] = el.value.split('-');
    pv.textContent = `${d}/${m}/${y}`;
}