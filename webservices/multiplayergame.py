import cherrypy
from haikunator import haikunate

from app.multiplayer import MultiplayerSet


class MultiplayerWebService:
    exposed = True

    def __init__(self):
        self.games = dict()

    @cherrypy.tools.json_out()
    def GET(self):
        return {name: len(game.players) for name, game in self.games.items()}

    @cherrypy.tools.json_out()
    def PUT(self):
        for _ in range(5):
            self.create()

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def create(self):
        name = haikunate()
        self.games[name] = MultiplayerSet()
        return {'name': name}
