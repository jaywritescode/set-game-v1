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

        :return: the name of the newly created game
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
