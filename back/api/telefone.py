import re

from django.core.exceptions import ValidationError


DDDS_VALIDOS = {
    11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73,
    74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92,
    93, 94, 95, 96, 97, 98, 99,
}


def somente_digitos_telefone(valor):
    return re.sub(r'\D', '', str(valor or ''))


def telefone_valido(valor):
    telefone = somente_digitos_telefone(valor)
    if not telefone:
        return True
    if len(telefone) not in (10, 11) or int(telefone[:2]) not in DDDS_VALIDOS:
        return False
    numero = telefone[2:]
    if len(telefone) == 11:
        return numero.startswith('9')
    return numero[0] in '2345'


def formatar_telefone(valor):
    telefone = somente_digitos_telefone(valor)
    if len(telefone) == 11:
        return f'({telefone[:2]}) {telefone[2:7]}-{telefone[7:]}'
    if len(telefone) == 10:
        return f'({telefone[:2]}) {telefone[2:6]}-{telefone[6:]}'
    return str(valor or '').strip()


def validar_telefone(valor):
    if not telefone_valido(valor):
        raise ValidationError('Telefone inválido. Use celular (XX) XXXXX-XXXX ou fixo (XX) XXXX-XXXX.')
