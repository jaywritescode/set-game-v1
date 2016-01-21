import cherrypy
from haikunator import haikunate
import json

from ws4py.messaging import TextMessage
from ws4py.manager import WebSocketManager

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    exposed = True

    def __init__(self):
        self.ws_manager = None
        self.games = dict()
        for _ in range(5):
            self.games[self.make_name()] = self.create_game()

    @cherrypy.expose
    def ws(self):
        if not self.ws_manager:
            self.ws_manager = WebSocketManager()
            self.ws_manager.start()
        self.ws_manager.add(cherrypy.request.ws_handler)

    def GET(self):
        game = cherrypy.session.get('game')
        if game is None:
            raise cherrypy.HTTPError(422, 'Need to join a game.')
        cherrypy.engine.publish('websocket-broadcast', TextMessage(self.serialize_game()))

    @cherrypy.tools.json_out()
    def PUT(self):
        pass

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
            return {
                'name': name,
                'player': player.id
            }
        else:
            return {
                'error': 'some error'
            }

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

    def serialize_game(self):
        """
        Serializes the game state.

        :return: a dict with "players" and optional "cards" keys. players maps
        to a dict of player id's mapped to the number of sets that player has
        found so far. cards is currently unimplemented.
        """
        d = dict(players=self.get_players())
        if len(d['players']) > 1:
            d['cards'] = self.get_cards()
        return json.dumps(d, ensure_ascii=False).encode('utf8')

    def get_players(self):
        game = cherrypy.session.get('game')
        return {player.id: player.found for player in game.players} if game else None

    def get_cards(self):
        game = cherrypy.session.get('game')
        return [card.to_hash() for card in game.cards] if game else None

    def make_name(self):
        while True:
            name = haikunate()
            if name not in self.games:
                return name
