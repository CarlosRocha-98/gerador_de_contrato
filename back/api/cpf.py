import re

from django.core.exceptions import ValidationError

# CPF-VALIDACAO: mantenha False durante os testes com qualquer número.
# Troque para True para reativar a regra oficial dos dígitos verificadores.
VALIDACAO_CPF_ATIVA = False


def somente_digitos_cpf(valor):
    return re.sub(r'\D', '', str(valor or ''))


def cpf_valido_oficial(valor):
    cpf = somente_digitos_cpf(valor)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    for tamanho in (9, 10):
        soma = sum(int(cpf[indice]) * (tamanho + 1 - indice) for indice in range(tamanho))
        digito = (soma * 10) % 11
        if digito == 10:
            digito = 0
        if digito != int(cpf[tamanho]):
            return False
    return True


def cpf_valido(valor):
    cpf = somente_digitos_cpf(valor)
    # CPF-VALIDACAO: esta chave desativa temporariamente a conferência oficial.
    if not VALIDACAO_CPF_ATIVA:
        return bool(cpf)
    return cpf_valido_oficial(cpf)


def formatar_cpf(valor):
    cpf = somente_digitos_cpf(valor)
    if len(cpf) != 11:
        return str(valor or '').strip()
    return f'{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}'


def validar_cpf(valor):
    # CPF-VALIDACAO: validador usado pelos models e serializers do backend.
    if not cpf_valido(valor):
        raise ValidationError('CPF inválido. Verifique os dígitos informados.')
