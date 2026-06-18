from django.contrib import admin
from .models import Cliente, Imovel, ContratoAluguel, ContratoServico, PerfilUsuario


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cpf', 'telefone', 'usuario', 'criado_em']
    list_filter = ['estado', 'criado_em']
    search_fields = ['nome', 'cpf', 'telefone', 'usuario__username', 'usuario__email']
    readonly_fields = ['usuario', 'criado_em']
    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'nacionalidade', 'profissao', 'estado_civil')
        }),
        ('Documentos', {
            'fields': ('cpf',)
        }),
        ('Contato', {
            'fields': ('telefone',)
        }),
        ('Endereço', {
            'fields': ('rua', 'numero', 'bairro', 'cep', 'cidade', 'estado')
        }),
        ('Sistema', {
            'fields': ('usuario', 'criado_em')
        }),
    )


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cpf', 'email', 'telefone', 'usuario', 'criado_em']
    list_filter = ['usuario', 'estado', 'criado_em']
    search_fields = ['nome', 'cpf', 'email', 'telefone']
    readonly_fields = ['criado_em']
    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'nacionalidade', 'profissao', 'estado_civil')
        }),
        ('Documentos', {
            'fields': ('cpf',)
        }),
        ('Contato', {
            'fields': ('email', 'telefone')
        }),
        ('Endereço', {
            'fields': ('rua', 'numero', 'bairro', 'cep', 'cidade', 'estado')
        }),
        ('Sistema', {
            'fields': ('usuario', 'criado_em')
        }),
    )


@admin.register(Imovel)
class ImovelAdmin(admin.ModelAdmin):
    list_display = ['endereco', 'numero', 'bairro', 'cidade', 'estado', 'tipo', 'usuario', 'criado_em']
    list_filter = ['tipo', 'usuario', 'criado_em']
    search_fields = ['endereco', 'bairro', 'cidade', 'estado']
    readonly_fields = ['criado_em']
    fieldsets = (
        ('Localização', {
            'fields': ('endereco', 'numero', 'bairro', 'cidade', 'estado')
        }),
        ('Detalhes', {
            'fields': ('tipo', 'caracteristicas')
        }),
        ('Sistema', {
            'fields': ('usuario', 'criado_em')
        }),
    )


@admin.register(ContratoAluguel)
class ContratoAluguelAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'inquilino', 'imovel', 'valor_aluguel', 'prazo_meses', 'data_inicio', 'criado_em']
    list_filter = ['usuario', 'data_inicio', 'criado_em']
    search_fields = ['usuario__username', 'inquilino__nome', 'imovel__endereco']
    readonly_fields = ['criado_em']
    fieldsets = (
        ('Partes', {
            'fields': ('inquilino', 'imovel'),
            'description': 'Você é automaticamente o proprietário'
        }),
        ('Condições', {
            'fields': ('prazo_meses', 'data_inicio', 'valor_aluguel', 'dia_vencimento')
        }),
        ('Caução', {
            'fields': ('valor_caucao', 'sem_caucao')
        }),
        ('Multas', {
            'fields': ('multa_infracao', 'sem_multa_infracao', 'multa_rescisao', 'sem_multa_rescisao')
        }),
        ('Assinatura', {
            'fields': ('cidade_assinatura', 'estado_assinatura', 'data_assinatura')
        }),
        ('Sistema', {
            'fields': ('usuario', 'criado_em')
        }),
    )

@admin.register(ContratoServico)
class ContratoServicoAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'contratante', 'tipo_servico', 'valor_mensal', 'data_inicio', 'criado_em']
    list_filter = ['usuario', 'tipo_servico', 'data_inicio', 'criado_em']
    search_fields = ['usuario__username', 'contratante__nome', 'tipo_servico', 'especificacao_servico']
    readonly_fields = ['criado_em']
    fieldsets = (
        ('Partes', {
            'fields': ('contratante',),
            'description': 'Você é automaticamente o prestador/contratado'
        }),
        ('Serviço', {
            'fields': ('tipo_servico', 'especificacao_servico', 'atividades_contratadas', 'motivo_contratacao')
        }),
        ('Prazo', {
            'fields': ('data_inicio', 'data_termino', 'prazo_meses')
        }),
        ('Valor', {
            'fields': ('valor_mensal', 'forma_pagamento', 'dia_vencimento')
        }),
        ('Local de Execução', {
            'fields': ('local_execucao', 'executa_nas_dependencias')
        }),
        ('Segurança e Saúde', {
            'fields': ('disposicoes_seguranca', 'responsabilidade_subsidiaria')
        }),
        ('Multas', {
            'fields': ('multa_atraso', 'multa_rescisao')
        }),
        ('Sistema', {
            'fields': ('usuario', 'criado_em')
        }),
    )

