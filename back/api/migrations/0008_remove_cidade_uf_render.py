from django.db import migrations


def remover_cidade_uf(apps, schema_editor):
    tabela = 'api_imovel'
    coluna = 'cidade_uf'

    with schema_editor.connection.cursor() as cursor:
        colunas = schema_editor.connection.introspection.get_table_description(cursor, tabela)
        nomes_colunas = [col.name for col in colunas]

        if coluna in nomes_colunas:
            cursor.execute(f'ALTER TABLE {tabela} DROP COLUMN {coluna}')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_cliente_cpf_alter_imovel_cidade_and_more'),
    ]

    operations = [
        migrations.RunPython(remover_cidade_uf, migrations.RunPython.noop),
    ]