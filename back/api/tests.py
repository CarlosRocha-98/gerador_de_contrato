from django.contrib.auth.models import User
from django.test import TestCase

from .cpf import cpf_valido, formatar_cpf
from .serializers import ClienteSerializer


class CPFTestCase(TestCase):
    def test_valida_digitos_verificadores(self):
        self.assertTrue(cpf_valido('529.982.247-25'))
        self.assertTrue(cpf_valido('16899535009'))
        self.assertFalse(cpf_valido('529.982.247-24'))
        self.assertFalse(cpf_valido('111.111.111-11'))
        self.assertFalse(cpf_valido('123'))

    def test_formata_no_padrao_nacional(self):
        self.assertEqual(formatar_cpf('52998224725'), '529.982.247-25')

    def test_serializer_recusa_cpf_invalido_e_formata_valido(self):
        usuario = User.objects.create_user(username='teste', password='senha123')
        serializer = ClienteSerializer(data={'nome': 'Cliente', 'cpf': '52998224725'})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        cliente = serializer.save(usuario=usuario)
        self.assertEqual(cliente.cpf, '529.982.247-25')

        invalido = ClienteSerializer(data={'nome': 'Outro', 'cpf': '52998224724'})
        self.assertFalse(invalido.is_valid())
        self.assertIn('cpf', invalido.errors)
