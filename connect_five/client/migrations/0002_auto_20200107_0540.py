# Generated by Django 3.0.2 on 2020-01-07 05:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='player_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]