from django.db import models
from django.contrib.auth.models import User
from .cpf import formatar_cpf, validar_cpf


class PerfilUsuario(models.Model):
    """Perfil completo do usuário que fez o cadastro"""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    
    # Dados pessoais
    nome = models.CharField(max_length=255)
    nacionalidade = models.CharField(max_length=100, blank=True)
    profissao = models.CharField(max_length=100, blank=True)
    estado_civil = models.CharField(max_length=20, blank=True)
    
    # Documentos
    orgao_expedidor = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(
        max_length=14,
        # CPF-VALIDACAO: validação do CPF do perfil; chave em api/cpf.py.
        validators=[validar_cpf]
    )
    
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

    def save(self, *args, **kwargs):
        self.cpf = formatar_cpf(self.cpf)
        self.full_clean()
        return super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Perfil de Usuário'
        verbose_name_plural = 'Perfis de Usuários'


class Cliente(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clientes')
    nome = models.CharField(max_length=255)
    nacionalidade = models.CharField(max_length=100, blank=True)
    profissao = models.CharField(max_length=100, blank=True)
    estado_civil = models.CharField(max_length=20, blank=True)
    orgao_expedidor = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(
        max_length=14,
        # CPF-VALIDACAO: validação do CPF do cliente; chave em api/cpf.py.
        validators=[validar_cpf]
    )
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

    def save(self, *args, **kwargs):
        self.cpf = formatar_cpf(self.cpf)
        self.full_clean()
        return super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
    

class Imovel(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='imoveis')
    endereco = models.CharField(max_length=255)
    numero = models.CharField(max_length=10)
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)
    tipo = models.CharField(max_length=50)             # casa, apartamento, comercial
    caracteristicas = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.endereco}, {self.numero} - {self.cidade}/{self.estado}'
    
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
    # Prestador/contratado é sempre o usuário logado (via perfil)
    # Contratante é sempre outra pessoa (Cliente)
    contratante = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='contratos_como_contratante')
    
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
    def prestador(self):
        """Retorna o perfil do usuário como prestador/contratado."""
        return self.usuario.perfil

    def __str__(self):
        return f'Contrato Serviço {self.id} - {self.tipo_servico} (Você / {self.contratante})'

    class Meta:
        verbose_name = 'Contrato de Serviço'
        verbose_name_plural = 'Contratos de Serviços'
