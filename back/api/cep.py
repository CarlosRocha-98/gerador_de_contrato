import re

from django.core.exceptions import ValidationError


def somente_digitos_cep(valor):
    return re.sub(r'\D', '', str(valor or ''))


def cep_valido(valor):
    if not str(valor or '').strip():
        return True
    cep = somente_digitos_cep(valor)
    return len(cep) == 8 and cep != cep[0] * 8


def formatar_cep(valor):
    cep = somente_digitos_cep(valor)
    if len(cep) == 8:
        return f'{cep[:5]}-{cep[5:]}'
    return str(valor or '').strip()


def validar_cep(valor):
    if not cep_valido(valor):
        raise ValidationError('CEP inválido. Use o formato 00000-000.')
