import cherrypy
from haikunator import haikunate
import json

from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage, PongControlMessage
from ws4py.manager import WebSocketManager
from ws4py.exc import ProtocolException

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    exposed = True

    def __init__(self):
        self.ws_manager = None
        self.games = dict()

        cherrypy.engine.subscribe('player-add', self.on_player_add)
        cherrypy.engine.subscribe('submit-set', self.on_submit_set)

    @cherrypy.expose
    def ws(self):
        """
        Endpoint called when a websocket is opened.

        It adds the current websocket to the websocket manager.

        :return: None
        """
        if not self.ws_manager:
            self.ws_manager = WebSocketManager()
            self.ws_manager.start()
        self.ws_manager.add(cherrypy.request.ws_handler)

    def on_player_add(self, game):
        """
        Called when a player is added to a game.

        If we have at least two players, then start the game.

        Always broadcast the fact that we added a player to the game.

        :param game: the name of the game to start
        :return: None
        """
        if game is None or game not in self.games:
            # TODO: invalid error for websockets
            raise cherrypy.HTTPError(422, 'Need to join a game.')

        the_game = self.games[game]
        if not the_game.started and len(the_game.players) > 1:
            the_game.start()
        self.broadcast(the_game)

    def on_submit_set(self, game, player, cards):
        """
        Called when a player submits a Set.

        :param game: the name of the game
        :param player: the id of the player
        :param cards: the cards submitted
        :return: None
        """
        print(game, player, cards)

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

    def broadcast(self, game):
        """
        Publishes the game across the existing websockets.

        :param game: a Set game
        :return: None
        """
        cherrypy.engine.publish('websocket-broadcast', TextMessage(self.serialize(game)))
        cherrypy.engine.publish('websocket-broadcast', TextMessage('another message'))

    def serialize(self, game):
        """
        Serializes the game state.

        :param game: a Set game
        :return: a dict with "players" and optional "cards" keys. players maps
        to a dict of player id's mapped to the number of sets that player has
        found so far. cards is currently unimplemented.
        """
        if not game:
            return None
        cards = [card.to_hash() for card in game.cards]
        players = {player.id: player.found for player in game.players}
        return json.dumps(dict(players=players, cards=cards), ensure_ascii=False).encode('utf-8')

    def make_name(self):
        while True:
            name = haikunate()
            if name not in self.games:
                return name


class MultiplayerWebSocket(WebSocket):
    def received_message(self, message):
        cherrypy.log('received %s' % message)
        self.send(message.data, message.is_binary)

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.log('Closed. code %s. reason: %s' % (code, reason))
