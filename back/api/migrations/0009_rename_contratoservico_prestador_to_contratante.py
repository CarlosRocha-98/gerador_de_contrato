# Generated manually to correct service contract party roles.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_cidade_uf_render'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contratoservico',
            old_name='prestador',
            new_name='contratante',
        ),
        migrations.AlterField(
            model_name='contratoservico',
            name='contratante',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='contratos_como_contratante',
                to='api.cliente',
            ),
        ),
    ]
