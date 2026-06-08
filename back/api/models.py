from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class PerfilUsuario(models.Model):
    """Perfil completo do usuário que fez o cadastro"""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Dados pessoais
    nome = models.CharField(max_length=255)
    nacionalidade = models.CharField(max_length=100, blank=True)
    profissao = models.CharField(max_length=100, blank=True)
    estado_civil = models.CharField(max_length=20, blank=True)
    
    # Documentos
    rg = models.CharField(max_length=20, blank=True)
    orgao_expedidor = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=20)
    
    # Contato
    telefone = models.CharField(max_length=20, blank=True)
    
    # Endereço
    rua = models.CharField(max_length=255, blank=True)
    numero = models.CharField(max_length=10, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    cep = models.CharField(max_length=10, blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=2, blank=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Perfil de {self.nome}'
    
    class Meta:
        verbose_name = 'Perfil de Usuário'
        verbose_name_plural = 'Perfis de Usuários'


class Cliente(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clientes')
    nome = models.CharField(max_length=255)
    nacionalidade = models.CharField(max_length=100, blank=True)
    profissao = models.CharField(max_length=100, blank=True)
    estado_civil = models.CharField(max_length=20, blank=True)
    rg = models.CharField(max_length=20, blank=True)
    orgao_expedidor = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=20)
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    rua = models.CharField(max_length=255, blank=True)
    numero = models.CharField(max_length=10, blank=True)
    bairro = models.CharField(max_length=100, blank=True)
    cep = models.CharField(max_length=10, blank=True)
    cidade = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=2, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
    

class Imovel(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='imoveis')
    endereco = models.CharField(max_length=255)
    numero = models.CharField(max_length=10)
    bairro = models.CharField(max_length=100)
    cidade_uf = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)             # casa, apartamento, comercial
    caracteristicas = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.endereco}, {self.numero} - {self.cidade_uf}'
    
    class Meta:
        verbose_name = 'Imóvel'
        verbose_name_plural = 'Imóveis'
    

class ContratoAluguel(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contratos')
    # Proprietário é sempre o usuário logado (via perfil)
    # Inquilino é sempre outra pessoa (Cliente)
    inquilino = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='contratos_como_inquilino')
    imovel = models.ForeignKey(Imovel, on_delete=models.PROTECT, related_name='contratos')
    prazo_meses = models.PositiveIntegerField()
    valor_aluguel = models.DecimalField(max_digits=10, decimal_places=2)
    dia_vencimento = models.PositiveIntegerField()
    valor_caucao = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    multa_infracao = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    multa_rescisao = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cidade_assinatura = models.CharField(max_length=100)
    estado_assinatura = models.CharField(max_length=2)
    data_inicio = models.DateField()
    data_assinatura = models.DateField()
    sem_caucao = models.BooleanField(default=False)
    sem_multa_infracao = models.BooleanField(default=False)
    sem_multa_rescisao = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    @property
    def proprietario(self):
        """Retorna o perfil do usuário como proprietário"""
        return self.usuario.perfil

    def __str__(self):
        return f'Contrato {self.id} - Você / {self.inquilino}'

    class Meta:
        verbose_name = 'Contrato de Aluguel'
        verbose_name_plural = 'Contratos de Aluguel'

class ContratoServico(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contratos_servico')
    # Contratante é sempre o usuário logado (via perfil)
    # Prestador é sempre outra pessoa (Cliente)
    prestador = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='contratos_como_prestador')
    
    tipo_servico = models.CharField(max_length=100)  # Ex: Limpeza, Segurança, Manutenção
    especificacao_servico = models.TextField()  # Descrição detalhada
    atividades_contratadas = models.TextField()  # Definição clara das atividades
    
    motivo_contratacao = models.TextField()  # Justificativa da necessidade
    
    data_inicio = models.DateField()
    data_termino = models.DateField()
    prazo_meses = models.PositiveIntegerField()
    
    valor_mensal = models.DecimalField(max_digits=10, decimal_places=2)
    forma_pagamento = models.CharField(max_length=100)  # Ex: Mensal, Quinzenal
    dia_vencimento = models.PositiveIntegerField()
    
    local_execucao = models.CharField(max_length=255)  # Dependências da contratante ou outro
    executa_nas_dependencias = models.BooleanField(default=True)
    
    disposicoes_seguranca = models.TextField()  # Condições de segurança, higiene e salubridade
    
    multa_atraso = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    multa_rescisao = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    responsabilidade_subsidiaria = models.BooleanField(default=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    @property
    def contratante(self):
        """Retorna o perfil do usuário como contratante"""
        return self.usuario.perfil

    def __str__(self):
        return f'Contrato Serviço {self.id} - {self.tipo_servico} (Você / {self.prestador})'

    class Meta:
        verbose_name = 'Contrato de Serviço'
        verbose_name_plural = 'Contratos de Serviços'