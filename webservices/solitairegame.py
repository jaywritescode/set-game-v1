import json

import cherrypy
from app.solitaire import SolitaireSet
import setapp


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
        result = self.solitaire.receive_selection(setapp.SetApp.json_to_cards(jsoncards))
        response = {'result': result.name}
        if result.name == 'OK' and self.solitaire.solved():
            response.update({'solved': True})
        return response

    @cherrypy.tools.json_out()
    def DELETE(self):
        self.solitaire.found.clear()


class SolitaireApp(setapp.SetApp):
    homepage = 'solitaire.html'
    game = SolitaireWebService()
