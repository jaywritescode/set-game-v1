import json
import cherrypy

from app.solitaire import SolitaireSet
from app.setutils import CardSerializer


class SolitaireWebService:
    exposed = True

    def __init__(self, num_cards=12, num_sets=6):
        self.num_cards = num_cards
        self.num_sets = num_sets

    @cherrypy.tools.json_out()
    def GET(self, reset=False):
        game = cherrypy.session.get('game')
        if reset or not game:
            game = cherrypy.session['game'] = SolitaireSet(self.num_cards, self.num_sets)
            game.start()

        for a_set in game.sets:
            cherrypy.log(str(a_set))

        return {
            'cards': [card.to_hash() for card in game.cards]
        }

    @cherrypy.tools.json_out()
    def PUT(self, cards):
        game = cherrypy.session.get('game')

        jsoncards = json.loads(cards)
        result = game.receive_selection([CardSerializer.from_dict(card) for card in jsoncards])
        response = {'result': result.name}
        if result.name == 'OK' and game.solved():
            response.update({'solved': True})
        return response

    @cherrypy.tools.json_out()
    def DELETE(self):
        cherrypy.session.get('game').clear()
