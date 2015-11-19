import os
import cherrypy
import json

from solitaire import SolitaireSet
from setutils import Card, SetFactory


class SolitaireApp:
    @cherrypy.expose
    def index(self):
        return open('index.html')


class SolitaireWebService:
    exposed = True

    def __init__(self):
        self.solitaire = None

    @cherrypy.tools.json_out()
    def GET(self, reset=False, num_cards=12, num_sets=6):
        if not self.solitaire or reset:
            self.solitaire = SolitaireSet(num_cards=num_cards, num_sets=num_sets)
        return {
            'cards': [card.to_hash() for card in self.solitaire.cards]
        }

    @cherrypy.tools.json_out()
    def PUT(self, cards):
        response = self.solitaire.receive_selection([Card(**p) for p in json.loads(cards)])
        return {'result': response.name}


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd())
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
    webapp = SolitaireApp()
    webapp.game = SolitaireWebService()
    cherrypy.quickstart(webapp, '/', conf)
