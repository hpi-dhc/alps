# Generated by Django 2.2.5 on 2019-09-30 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0015_process_info'),
    ]

    operations = [
        migrations.AlterField(
            model_name='signal',
            name='first_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='signal',
            name='last_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
