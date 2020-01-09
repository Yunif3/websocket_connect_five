from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from .models import *

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'game_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data_json = json.loads(text_data)
        pos = data_json['position']
        player = data_json['player']
        pk = data_json['pk']

        game = Game.objects.get(pk=pk)
        game.current_player = (player + 1) % game.player_count
        game.save()


        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_play',
                'game_id' : pk,
                'position' : pos,
                'player' : player,
                'player_count' : game.player_count
            }
        )

    def game_play(self, event):
        pos = event['position']
        player = event['player']
        player_count = event['player_count']

        self.send(text_data=json.dumps({
            'position' : pos,
            'player' : player,
            'player_count' : player_count
        }))

class WaitConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'wait_%s' % self.room_name

        wait = Wait.objects.get(name=self.room_name)
        wait.player_count += 1
        wait.save()

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        self.accept()

    def disconnect(self, close_code):
        wait = Wait.objects.get(name=self.room_name)
        wait.player_count -= 1
        wait.save()

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data_json = json.loads(text_data)
        player_count = data_json['player_count']

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'waiting',
                'player_count' : player_count
            }
        )

    def waiting(self, event):
        player_count = event['player_count']

        self.send(text_data=json.dumps({
            'player_count' : player_count
        }))