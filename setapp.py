import json
import os
import random

from app.setutils import Card
from app.solitaire import SolitaireSet
from app.multiplayer import MultiplayerSet

import cherrypy


class SetApp:
    @cherrypy.expose
    def index(self):
        if not hasattr(self, 'homepage'):
            raise cherrypy.HTTPRedirect('/solitaire', 302)
        return open(self.homepage)


class SolitaireWebService:
    exposed = True

    def __init__(self):
        self.solitaire = None

    @cherrypy.tools.json_out()
    def GET(self, num_cards=12, num_sets=6, reset=False):
        if (not self.solitaire) or reset:
            self.solitaire = SolitaireSet(num_cards=num_cards, num_sets=num_sets)
            self.solitaire.start()

        for a_set in self.solitaire.sets:
            cherrypy.log(str(a_set))

        return {
            'cards': [card.to_hash() for card in self.solitaire.cards]
        }

    @cherrypy.tools.json_out()
    def PUT(self, cards):
        jsoncards = json.loads(cards)
        result = self.solitaire.receive_selection(json_to_cards(jsoncards))
        response = {'result': result.name}
        if result.name == 'OK' and self.solitaire.solved():
            response.update({'solved': True})
        return response

    @cherrypy.tools.json_out()
    def DELETE(self):
        self.solitaire.found.clear()


class MultiplayerWebService:
    exposed = True

    def __init__(self, initial_cards=12):
        self.game = MultiplayerSet(initial_cards)


class MultiplayerJoinWebService:
    exposed = True

    def __init__(self, game):
        self.game = game

    @cherrypy.tools.json_out()
    def POST(self):
        cherrypy.session['player'] = self.game.add_player()
        return {
            'player_id': cherrypy.session.get('player').id
        }


class SolitaireApp(SetApp):
    homepage = 'solitaire.html'
    game = SolitaireWebService()


class MultiplayerApp(SetApp):
    homepage = 'multiplayer.html'
    game = MultiplayerWebService()
    join = MultiplayerJoinWebService(game.game)


def json_to_cards(blob):
    return [Card(*[getattr(Card, key)(obj[key])
                   for key in ['number', 'color', 'shading', 'shape']]) for obj in blob]


if __name__ == '__main__':
    base_conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
            'tools.sessions.on': True,
            'tools.trailing_slash.on': False
        },
        '/game': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'public'
        },
        '/bower_components': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'bower_components'
        }
    }
    mp_conf = base_conf.copy()
    mp_conf.update({
        '/join': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        }
    })
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': int(os.environ.get('PORT', 8080)),
    })
    cherrypy.tree.mount(SolitaireApp(), '/solitaire', base_conf)
    cherrypy.tree.mount(MultiplayerApp(), '/multiplayer', mp_conf)
    cherrypy.quickstart(SetApp(), '/', base_conf)            # needs to be mounted last
    cherrypy.engine.start()
    cherrypy.engine.block()
