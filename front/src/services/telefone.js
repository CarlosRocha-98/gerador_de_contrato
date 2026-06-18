(function () {
    const DDDS_VALIDOS = new Set([
        11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,
        41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,
        69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,
        96,97,98,99
    ]);

    function digitos(valor) {
        return String(valor || '').replace(/\D/g, '').slice(0, 11);
    }

    function formatar(valor) {
        const telefone = digitos(valor);
        if (telefone.length <= 2) return telefone ? `(${telefone}` : '';
        if (telefone.length <= 6) return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
        if (telefone.length <= 10) {
            return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
        }
        return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
    }

    function valido(valor) {
        const telefone = digitos(valor);
        if (!telefone) return true;
        if (![10, 11].includes(telefone.length) || !DDDS_VALIDOS.has(Number(telefone.slice(0, 2)))) return false;
        return telefone.length === 11 ? telefone[2] === '9' : '2345'.includes(telefone[2]);
    }

    function prepararCampo(input) {
        if (!input || input.dataset.telefonePreparado) return;
        input.dataset.telefonePreparado = 'true';
        input.inputMode = 'tel';
        input.maxLength = 15;
        input.value = formatar(input.value);
        input.addEventListener('input', () => {
            input.value = formatar(input.value);
            input.setCustomValidity('');
        });
        input.addEventListener('blur', () => {
            input.setCustomValidity(valido(input.value) ? '' : 'Telefone inválido. Use celular ou fixo com DDD.');
        });
    }

    function prepararPagina() {
        document.querySelectorAll('input[id*="telefone" i], input[name*="telefone" i]').forEach(prepararCampo);
    }

    window.TelefoneBR = { digitos, formatar, valido, prepararCampo, prepararPagina };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepararPagina);
    else prepararPagina();
})();
