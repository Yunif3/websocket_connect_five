from django.db import models

# Create your models here.
class Game(models.Model):
    name = models.TextField(max_length=20)
    player_count = models.PositiveIntegerField(default=0)
    current_player = models.PositiveIntegerField(default=0)

class Wait(models.Model):
    name = models.TextField(max_length=20)
    player_count = models.PositiveIntegerField(default=0)