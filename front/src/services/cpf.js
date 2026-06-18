(function () {
    // CPF-VALIDACAO: mantenha false para testar com qualquer número.
    // Troque para true para reativar a regra oficial no frontend.
    const VALIDACAO_CPF_ATIVA = false;

    function digitos(valor) {
        return String(valor || '').replace(/\D/g, '').slice(0, 11);
    }

    function formatar(valor) {
        const cpf = digitos(valor);
        return cpf
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }

    function validoOficial(valor) {
        const cpf = digitos(valor);
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        for (let tamanho = 9; tamanho <= 10; tamanho++) {
            let soma = 0;
            for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
            let verificador = (soma * 10) % 11;
            if (verificador === 10) verificador = 0;
            if (verificador !== Number(cpf[tamanho])) return false;
        }
        return true;
    }

    function valido(valor) {
        const cpf = digitos(valor);
        // CPF-VALIDACAO: bypass temporário; ainda exige que algum número seja informado.
        return VALIDACAO_CPF_ATIVA ? validoOficial(cpf) : cpf.length > 0;
    }

    function prepararCampo(input) {
        if (!input || input.dataset.cpfPreparado) return;
        input.dataset.cpfPreparado = 'true';
        input.inputMode = 'numeric';
        input.maxLength = 14;
        input.value = formatar(input.value);
        input.addEventListener('input', () => { input.value = formatar(input.value); });
        input.addEventListener('blur', () => {
            // CPF-VALIDACAO: mensagem nativa de CPF inválido exibida ao sair do campo.
            input.setCustomValidity(!input.value || valido(input.value) ? '' : 'CPF inválido. Verifique os dígitos informados.');
        });
    }

    function prepararPagina() {
        document.querySelectorAll('input[id*="cpf" i], input[name*="cpf" i]').forEach(prepararCampo);
    }

    window.CPF = { digitos, formatar, valido, validoOficial, prepararCampo, prepararPagina };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepararPagina);
    else prepararPagina();
})();
