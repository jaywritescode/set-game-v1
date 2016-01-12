import json
import cherrypy

from app.solitaire import SolitaireSet
from .mixins import *


class SolitaireWebService:
    exposed = True

    def __init__(self, num_cards=12, num_sets=6):
        self.session_reset(num_cards, num_sets)

    @cherrypy.tools.json_out()
    def GET(self, reset=False):
        game = cherrypy.session.get('game')
        if reset:
            self.session_reset(game.num_cards, game.num_sets)

        for a_set in game.sets:
            cherrypy.log(str(a_set))

        return {
            'cards': [card.to_hash() for card in game.cards]
        }

    @cherrypy.tools.json_out()
    def PUT(self, cards):
        game = cherrypy.session.get('game')

        jsoncards = json.loads(cards)
        result = game.receive_selection(json_to_cards(jsoncards))
        response = {'result': result.name}
        if result.name == 'OK' and game.solved():
            response.update({'solved': True})
        return response

    @cherrypy.tools.json_out()
    def DELETE(self):
        cherrypy.session.get('game').clear()

    def session_reset(self, num_cards, num_sets):
        cherrypy.session['game'] = SolitaireSet(num_cards, num_sets)
        cherrypy.session['game'].start()
