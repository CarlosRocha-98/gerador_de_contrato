from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from unittest.mock import patch

from .cpf import cpf_valido, cpf_valido_oficial, formatar_cpf
from .serializers import ClienteSerializer
from .models import ContratoAluguel
from .telefone import formatar_telefone, telefone_valido
from .cep import cep_valido, formatar_cep


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


class TelefoneTestCase(TestCase):
    def test_aceita_celular_e_fixo_brasileiros(self):
        self.assertTrue(telefone_valido('(11) 99999-1234'))
        self.assertTrue(telefone_valido('(21) 2345-6789'))
        self.assertTrue(telefone_valido(''))

    def test_recusa_ddd_e_formatos_invalidos(self):
        self.assertFalse(telefone_valido('(10) 99999-1234'))
        self.assertFalse(telefone_valido('(11) 89999-1234'))
        self.assertFalse(telefone_valido('(21) 1345-6789'))
        self.assertFalse(telefone_valido('119999123'))

    def test_formata_celular_e_fixo(self):
        self.assertEqual(formatar_telefone('11999991234'), '(11) 99999-1234')
        self.assertEqual(formatar_telefone('2123456789'), '(21) 2345-6789')


class EstadoCivilTestCase(TestCase):
    def test_serializer_aceita_opcoes_padronizadas(self):
        for estado_civil in ('Solteiro(a)', 'Casado(a)', 'União Estável', 'Divorciado(a)', 'Viúvo(a)'):
            serializer = ClienteSerializer(data={
                'nome': 'Cliente', 'cpf': '123', 'estado_civil': estado_civil,
            })
            self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_recusa_opcao_fora_da_lista(self):
        serializer = ClienteSerializer(data={
            'nome': 'Cliente', 'cpf': '123', 'estado_civil': 'Outro',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('estado_civil', serializer.errors)


class CEPTestCase(TestCase):
    def test_valida_e_formata_cep_brasileiro(self):
        self.assertTrue(cep_valido('01001-000'))
        self.assertTrue(cep_valido('01001000'))
        self.assertEqual(formatar_cep('01001000'), '01001-000')

    def test_recusa_cep_com_formato_invalido(self):
        self.assertFalse(cep_valido('123'))
        self.assertFalse(cep_valido('00000-000'))

    def test_serializer_formata_cep(self):
        serializer = ClienteSerializer(data={
            'nome': 'Cliente', 'cpf': '123', 'cep': '01001000',
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['cep'], '01001-000')


class DiaVencimentoAluguelTestCase(TestCase):
    def test_aceita_dias_de_1_a_28(self):
        campo = ContratoAluguel._meta.get_field('dia_vencimento')
        campo.run_validators(1)
        campo.run_validators(28)

    def test_recusa_dias_fora_do_intervalo(self):
        campo = ContratoAluguel._meta.get_field('dia_vencimento')
        with self.assertRaises(ValidationError):
            campo.run_validators(0)
        with self.assertRaises(ValidationError):
            campo.run_validators(29)
