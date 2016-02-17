import cherrypy
from haikunator import haikunate
from collections import defaultdict
import json

from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from ws4py.server.cherrypyserver import WebSocketPlugin

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    def __init__(self):
        self.games = dict()

    @cherrypy.expose
    def ws(self, game=None):
        cherrypy.request.ws_handler.game = game
        cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def go(self, name=None):
        """
        Endpoint to create and/or join a MultiplayerSet game.

        :param name: the name of the game to join, or None to start a new game
        :return: the name of the game and this user's player id
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

        player = game.add_player()
        if player:
            cherrypy.session['player'] = player

            # inform the other players in this game that a new player was added
            all_games = cherrypy.engine.publish('get-clients').pop()
            for ws in all_games.get(name, list()):
                ws.send(json.dumps(dict(action='add-player', name=player.id)))

            return { 'name': name, 'player': player.id }
        else:
            return { 'error': 'some error' }

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def players(self, name):
        """
        Endpoint to get the players in a game.

        :param name: the name of the game
        :return: a JSON blob of dicts with keys 'name' and 'found'
        """
        try:
            game = self.games[name]
        except KeyError:
            raise cherrypy.HTTPError(422, 'This game does not exist.')
        return json.dumps(list(dict(name=player.id, found=player.found) for player in game.players))

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def status(self):
        return {name: len(game.players) for name, game in self.games.items()}

    def create_game(self):
        """
        Creates a game.

        :return: the newly created game
        """
        return MultiplayerSet()

    def make_name(self):
        while True:
            name = haikunate()
            if name not in self.games:
                return name


class MultiplayerWebSocket(WebSocket):
    def opened(self):
        cherrypy.engine.publish('add-client', self.game, self)

    def received_message(self, message):
        cherrypy.engine.publish('websocket-broadcast', message)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))


class MultiplayerWebSocketPlugin(WebSocketPlugin):
    def __init__(self, bus):
        WebSocketPlugin.__init__(self, bus)
        self.clients = defaultdict(set)

    def start(self):
        WebSocketPlugin.start(self)
        self.bus.subscribe('add-client', self.add_client)
        self.bus.subscribe('get-clients', self.get_clients)
        self.bus.subscribe('del-client', self.del_client)

    def stop(self):
        WebSocketPlugin.stop(self)
        self.bus.unsubscribe('add-client', self.add_client)
        self.bus.unsubscribe('get-clients', self.get_clients)
        self.bus.unsubscribe('del-client', self.del_client)

    def add_client(self, game, websocket):
        self.clients[game].add(websocket)
        print(self.clients)

    def get_clients(self):
        return self.clients

    def del_client(self, name):
        del self.clients[name]
