from django.db import migrations


def remover_rg_cliente_legado(apps, schema_editor):
    tabela = 'api_cliente'
    coluna = 'rg'

    with schema_editor.connection.cursor() as cursor:
        colunas = schema_editor.connection.introspection.get_table_description(cursor, tabela)
        nomes_colunas = [col.name for col in colunas]

        if coluna not in nomes_colunas:
            return

        tabela_quoted = schema_editor.quote_name(tabela)
        coluna_quoted = schema_editor.quote_name(coluna)
        cursor.execute(f'ALTER TABLE {tabela_quoted} DROP COLUMN {coluna_quoted}')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_rename_contratoservico_prestador_to_contratante'),
    ]

    operations = [
        migrations.RunPython(remover_rg_cliente_legado, migrations.RunPython.noop),
    ]
