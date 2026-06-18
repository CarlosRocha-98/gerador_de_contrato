from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_alter_contratoaluguel_dia_vencimento'),
    ]

    operations = [
        migrations.AlterField(model_name='contratoaluguel', name='inquilino', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contratos_como_inquilino', to='api.cliente')),
        migrations.AlterField(model_name='contratoaluguel', name='imovel', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contratos', to='api.imovel')),
        migrations.AlterField(model_name='contratoaluguel', name='prazo_meses', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoaluguel', name='valor_aluguel', field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
        migrations.AlterField(model_name='contratoaluguel', name='dia_vencimento', field=models.PositiveIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(28)])),
        migrations.AlterField(model_name='contratoaluguel', name='cidade_assinatura', field=models.CharField(blank=True, default='', max_length=100)),
        migrations.AlterField(model_name='contratoaluguel', name='estado_assinatura', field=models.CharField(blank=True, default='', max_length=2)),
        migrations.AlterField(model_name='contratoaluguel', name='data_inicio', field=models.DateField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoaluguel', name='data_assinatura', field=models.DateField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoservico', name='contratante', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='contratos_como_contratante', to='api.cliente')),
        migrations.AlterField(model_name='contratoservico', name='tipo_servico', field=models.CharField(blank=True, default='', max_length=100)),
        migrations.AlterField(model_name='contratoservico', name='especificacao_servico', field=models.TextField(blank=True, default='')),
        migrations.AlterField(model_name='contratoservico', name='atividades_contratadas', field=models.TextField(blank=True, default='')),
        migrations.AlterField(model_name='contratoservico', name='motivo_contratacao', field=models.TextField(blank=True, default='')),
        migrations.AlterField(model_name='contratoservico', name='data_inicio', field=models.DateField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoservico', name='data_termino', field=models.DateField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoservico', name='prazo_meses', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoservico', name='valor_mensal', field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
        migrations.AlterField(model_name='contratoservico', name='forma_pagamento', field=models.CharField(blank=True, default='', max_length=100)),
        migrations.AlterField(model_name='contratoservico', name='dia_vencimento', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AlterField(model_name='contratoservico', name='local_execucao', field=models.CharField(blank=True, default='', max_length=255)),
        migrations.AlterField(model_name='contratoservico', name='disposicoes_seguranca', field=models.TextField(blank=True, default='')),
    ]
