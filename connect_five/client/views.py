from django.shortcuts import render
from .models import *

# Create your views here.
def home(request):
    return render(request, 'home.html')

def join(request, room_name):
    game = Game.objects.get_or_create(name=room_name)[0]
    game.player_count += 1
    game.save()
    return render(request, 'game.html', {'name' : room_name, 'player' : game.player_count - 1, 'total' : game.player_count, 'id' : game.pk})

def waiting(request, room_name):
    wait = Wait.objects.get_or_create(name=room_name)[0]
    return render(request, 'waiting.html', {'name': room_name, 'count' : wait.player_count})