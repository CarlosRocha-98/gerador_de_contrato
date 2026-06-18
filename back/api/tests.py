from django.contrib.auth.models import User
from django.test import TestCase
from unittest.mock import patch

from .cpf import cpf_valido, cpf_valido_oficial, formatar_cpf
from .serializers import ClienteSerializer


class CPFTestCase(TestCase):
    def test_valida_digitos_verificadores(self):
        # CPF-VALIDACAO: testa a regra oficial mesmo com a chave temporária desligada.
        self.assertTrue(cpf_valido_oficial('529.982.247-25'))
        self.assertTrue(cpf_valido_oficial('16899535009'))
        self.assertFalse(cpf_valido_oficial('529.982.247-24'))
        self.assertFalse(cpf_valido_oficial('111.111.111-11'))
        self.assertFalse(cpf_valido_oficial('123'))

    def test_chave_temporaria_aceita_qualquer_numero(self):
        # CPF-VALIDACAO: remover este teste quando a validação oficial for reativada.
        self.assertTrue(cpf_valido('123'))

    def test_formata_no_padrao_nacional(self):
        self.assertEqual(formatar_cpf('52998224725'), '529.982.247-25')

    def test_serializer_recusa_cpf_invalido_e_formata_valido(self):
        usuario = User.objects.create_user(username='teste', password='senha123')
        serializer = ClienteSerializer(data={'nome': 'Cliente', 'cpf': '52998224725'})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        cliente = serializer.save(usuario=usuario)
        self.assertEqual(cliente.cpf, '529.982.247-25')

        # CPF-VALIDACAO: força a chave oficial apenas neste teste de rejeição.
        with patch('api.cpf.VALIDACAO_CPF_ATIVA', True):
            invalido = ClienteSerializer(data={'nome': 'Outro', 'cpf': '52998224724'})
            self.assertFalse(invalido.is_valid())
            self.assertIn('cpf', invalido.errors)
