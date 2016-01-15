import cherrypy
from haikunator import haikunate

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    exposed = True

    def __init__(self):
        self.games = dict()
        for _ in range(5):
            self.games[self.make_name()] = self.create_game()

    @cherrypy.tools.json_out()
    def GET(self):
        return {name: len(game.players) for name, game in self.games.items()}

    @cherrypy.tools.json_out()
    def PUT(self):
        pass

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def create(self):
        """
        Endpoint to create a new MultiplayerSet game.

        :return: the name of the newly created game, and this user's player
        """
        if cherrypy.session.get('game'):
            raise cherrypy.HTTPError(400, 'Already in a game')
        if cherrypy.session.get('player'):
            raise cherrypy.HTTPError(400, 'Already has a player')

        name = self.make_name()
        game = self.games[name] = cherrypy.session['game'] = self.create_game()
        cherrypy.session['player'] = game.add_player()
        return {
            'name': name,
            'player': cherrypy.session['player'].id
        }

    # todo: combine create and join into a single endpoint
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def join(self, name):
        """
        Endpoint to join an existing MultiplayerSet game.

        :return: the name of the game, and this user's player, or an error message
        """
        if name not in self.games:
            raise cherrypy.HTTPError(422, 'This game does not exist')
        game = self.games[name]

        my_game, my_player = [cherrypy.session.get(k) for k in ['game', 'player']]

        if my_game and my_game is not game:
            raise cherrypy.HTTPError(400, 'Already in a different game')
        if my_player:
            raise cherrypy.HTTPError(422, 'Already connected to this game')

        player = game.add_player()
        if player:
            cherrypy.session['game'] = game
            cherrypy.session['player'] = player
            return {
                'name': name,
                'player': player.id
            }
        else:
            return {
                'error': 'some error'
            }

    def create_game(self):
        """
        Creates a game.

        :return: the game's name and the newly created game
        """
        return MultiplayerSet()

    def make_name(self):
        while True:
            name = haikunate()
            if name not in self.games:
                return name
