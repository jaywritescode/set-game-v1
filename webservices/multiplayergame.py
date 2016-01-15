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
            game = self.games[name] = cherrypy.session['game'] = self.create_game()

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
