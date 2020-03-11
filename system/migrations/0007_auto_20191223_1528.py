# Generated by Django 2.2.8 on 2019-12-23 06:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0006_auto_20191217_1654'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='budcode',
            options={'managed': True, 'verbose_name': '予算科目コード', 'verbose_name_plural': 'コード：予算科目コード'},
        ),
        migrations.AlterModelOptions(
            name='depcode',
            options={'managed': True, 'verbose_name': '部署コード', 'verbose_name_plural': 'コード：部署コード'},
        ),
        migrations.AlterModelOptions(
            name='order',
            options={'managed': True, 'verbose_name': '発注', 'verbose_name_plural': '発注データ'},
        ),
        migrations.AlterModelOptions(
            name='procode',
            options={'managed': True, 'verbose_name': 'プロジェクトコード', 'verbose_name_plural': 'コード：プロジェクトコード'},
        ),
        migrations.RemoveField(
            model_name='user',
            name='kanji',
        ),
        migrations.AlterField(
            model_name='user',
            name='syozoku',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='system.syozoku'),
        ),
    ]
