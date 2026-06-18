(function () {
    function digitos(valor) {
        return String(valor || '').replace(/\D/g, '').slice(0, 8);
    }

    function formatar(valor) {
        const cep = digitos(valor);
        return cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
    }

    function valido(valor) {
        const cep = digitos(valor);
        return !cep || (cep.length === 8 && !/^(\d)\1{7}$/.test(cep));
    }

    function idsEndereco(id) {
        const mapas = {
            'cep': ['rua', 'bairro', 'cidade', 'estado'],
            'field-cep': ['field-rua', 'field-bairro', 'field-cidade', 'field-estado'],
            'edit-cli-cep': ['edit-cli-rua', 'edit-cli-bairro', 'edit-cli-cidade', 'edit-cli-estado'],
            'imovel-cadastro-cep': ['endereco', 'bairro', 'cidade', 'estado'],
            'prop-cep': ['prop-endereco', 'prop-bairro', 'prop-cidade', 'prop-estado'],
            'inq-cep': ['inq-endereco', 'inq-bairro', 'inq-cidade', 'inq-estado'],
            'cont-cep': ['cont-endereco', 'cont-bairro', 'cont-cidade', 'cont-estado'],
            'prest-cep': ['prest-endereco', 'prest-bairro', 'prest-cidade', 'prest-estado'],
            'nc-cep': ['nc-rua', 'nc-bairro', 'nc-cidade', 'nc-estado'],
        };
        return mapas[id];
    }

    function preencher(id, dados) {
        const ids = idsEndereco(id);
        if (!ids) return;
        [dados.logradouro, dados.bairro, dados.localidade, dados.uf].forEach((valor, indice) => {
            const campo = document.getElementById(ids[indice]);
            if (!campo || !valor) return;
            campo.value = valor;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            campo.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    async function consultar(input) {
        const cep = digitos(input.value);
        if (cep.length !== 8 || !valido(cep)) return;
        input.dataset.cepConsultado = cep;
        input.setAttribute('aria-busy', 'true');
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!resposta.ok) throw new Error('Falha na consulta');
            const dados = await resposta.json();
            if (dados.erro) {
                input.setCustomValidity('CEP não encontrado.');
                input.reportValidity();
                return;
            }
            input.setCustomValidity('');
            preencher(input.id, dados);
        } catch (erro) {
            console.warn('Não foi possível consultar o CEP:', erro);
        } finally {
            input.removeAttribute('aria-busy');
        }
    }

    function prepararCampo(input) {
        if (!input || input.dataset.cepPreparado) return;
        input.dataset.cepPreparado = 'true';
        input.inputMode = 'numeric';
        input.maxLength = 9;
        input.value = formatar(input.value);
        input.addEventListener('input', () => {
            input.value = formatar(input.value);
            input.setCustomValidity('');
            if (digitos(input.value).length === 8 && input.dataset.cepConsultado !== digitos(input.value)) consultar(input);
        });
        input.addEventListener('blur', () => {
            input.setCustomValidity(valido(input.value) ? '' : 'CEP inválido. Use o formato 00000-000.');
            if (valido(input.value)) consultar(input);
        });
    }

    function prepararPagina() {
        document.querySelectorAll('input[id*="cep" i], input[name*="cep" i]').forEach(prepararCampo);
    }

    window.CEPBrasil = { digitos, formatar, valido, consultar, prepararCampo, prepararPagina };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepararPagina);
    else prepararPagina();
})();
