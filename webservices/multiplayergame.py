import cherrypy
from haikunator import haikunate
import json

from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage
from ws4py.manager import WebSocketManager
from ws4py.exc import ProtocolException

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    def __init__(self):
        self.games = dict()

    @cherrypy.expose
    def ws(self):
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
            cherrypy.engine.publish('websocket-broadcast', json.dumps(dict(action="add-player", name=player.id)))
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
    def received_message(self, message):
        cherrypy.engine.publish('websocket-broadcast', message)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.engine.publish('websocket-broadcast', TextMessage(reason))
