import cherrypy
from haikunator import haikunate
from collections import defaultdict
import json

from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from ws4py.server.cherrypyserver import WebSocketPlugin

from app.multiplayer import MultiplayerSet
from app.setutils import CardSerializer, SetValidation


class MultiplayerWebService:
    def __init__(self):
        self.games = dict()

    ###########################################################################
    # HTTP endpoints
    ###########################################################################
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def go(self, name=None):
        """
        Endpoint to create and/or join a MultiplayerSet game.

        Assign this user/session to a specific game.

        :param name: the name of the game to join, or None to start a new game
        :return: a dict with property `game` mapping to the name of the game
        """
        if cherrypy.session.get('game'):
            # todo: move this user from the old game to the new game
            raise cherrypy.HTTPError(422, 'Already in a game.')

        if name:
            try:
                game = self.games[name]
            except KeyError:
                raise cherrypy.HTTPError(422, 'This game does not exist.')
        else:
            name = self.make_name()
            game = self.games[name] = self.create_game()

        cherrypy.session['game'] = game

        return {'game': name}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def status(self):
        """
        Endpoint to get the games currently under management by the app.

        :return: a dict of game names mapped to player count in each game
        """
        return {name: len(game.players) for name, game in self.games.items()}

    def create_game(self):
        """
        Creates a game.

        :return: the newly created game
        """
        return MultiplayerSet()

    def make_name(self):
        """
        Makes a Heroku-style name.

        :return: a Heroku-style haiku name
        """
        while True:
            name = haikunate()
            if name not in self.games:
                return name

    ###########################################################################
    # Websocket methods
    ###########################################################################
    @cherrypy.expose
    def ws(self, game=None):
        # these properties are now available on the MultiplayerWebSocket instance
        cherrypy.request.ws_handler.game_name = game
        cherrypy.request.ws_handler.game = self.games[game]
        cherrypy.request.ws_handler.player = None
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))


class MultiplayerWebSocket(WebSocket):
    def opened(self):
        cherrypy.engine.publish('add-client', self.game_name, self)

    def received_message(self, message):
        message = json.loads(str(message))
        req = message['request']

        response = {'action': req}
        if req == 'add-player':
            player = self.game.add_player()
            if player:
                self.player = player
                response.update({
                    'my_player_id': player.id,
                    'players': {p.id: len(p.found) for p in self.game.players.values()} if player else {}
                })

            if not self.game.started and len(self.game.players) > 1:
                self.game.start()
                response.update({
                    'cards': [card.to_hash() for card in self.game.cards]
                })
        elif req == 'verify-set':
            cards = [CardSerializer.from_dict(card_json_obj) for card_json_obj in message['cards']]
            result = self.game.receive_selection(cards, self.player)

            response.update({
                'valid': result.valid == SetValidation['OK'],
                'player': self.player.id,
                'found': len(self.player.found)
            })
            if result.valid == SetValidation['OK']:
                response.update({
                    'cards_to_remove': [CardSerializer.to_dict(card) for card in result.old_cards],
                    'cards_to_add': [CardSerializer.to_dict(card) for card in result.new_cards]
                })
        elif req == 'change-name':
            new_name = message['new_name']
            if new_name not in self.game.players:
                old_name = self.player.id
                del self.game.players[old_name]

                self.player.id = new_name
                self.game.players[new_name] = self.player
                response.update({
                    'old_name': old_name,
                    'new_name': new_name
                })

        for ws in self.websockets():
            ws.send(json.dumps(response))

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))

    def websockets(self):
        """
        Gets all of the websockets attached to the same game as this socket.

        :return: a list of WebSockets
        """
        return cherrypy.engine.publish('get-client').pop().get(self.game_name, list())


class MultiplayerWebSocketPlugin(WebSocketPlugin):
    def __init__(self, bus):
        WebSocketPlugin.__init__(self, bus)
        self.clients = defaultdict(set)

    def start(self):
        WebSocketPlugin.start(self)
        self.bus.subscribe('add-client', self.add_client)
        self.bus.subscribe('get-client', self.get_client)
        self.bus.subscribe('del-client', self.del_client)

    def stop(self):
        WebSocketPlugin.stop(self)
        self.bus.unsubscribe('add-client', self.add_client)
        self.bus.unsubscribe('get-client', self.get_client)
        self.bus.unsubscribe('del-client', self.del_client)

    def add_client(self, game, websocket):
        self.clients[game].add(websocket)

    def get_client(self):
        return self.clients

    def del_client(self, name):
        del self.clients[name]
