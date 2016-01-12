import cherrypy
from haikunator import haikunate

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    exposed = True

    def __init__(self):
        self.games = dict()

    @cherrypy.tools.json_out()
    def GET(self):
        if not len(self.games):
            name = self.create_game()
        return {name: len(game.players) for name, game in self.games.items()}

    def create_game(self):
        name = haikunate()
        self.games[name] = MultiplayerSet()
        return name
