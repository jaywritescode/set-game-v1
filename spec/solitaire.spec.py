from app.solitaire import *
import unittest


class SolitaireSetTest(unittest.TestCase):
    def test_start(self):
        _solitaire = SolitaireSet()
        _solitaire.start()

        self.assertEqual(_solitaire.num_cards, len(_solitaire.cards))
        self.assertEqual(_solitaire.num_sets, len(_solitaire.sets))

    def test_receive_selection(self):
        _solitaire = SolitaireSet()
        _solitaire.cards = [
            Card(Number['three'], Color['blue'], Shading['empty'], Shape['oval']),
            Card(Number['three'], Color['green'], Shading['empty'], Shape['diamond']),
            Card(Number['three'], Color['blue'], Shading['solid'], Shape['oval']),
            Card(Number['two'], Color['green'], Shading['solid'], Shape['oval']),
            Card(Number['two'], Color['green'], Shading['striped'], Shape['oval']),
            Card(Number['one'], Color['red'], Shading['empty'], Shape['oval']),
            Card(Number['one'], Color['blue'], Shading['solid'], Shape['diamond']),
            Card(Number['three'], Color['red'], Shading['empty'], Shape['diamond']),
            Card(Number['one'], Color['red'], Shading['solid'], Shape['oval']),
            Card(Number['three'], Color['green'], Shading['striped'], Shape['diamond']),
            Card(Number['two'], Color['blue'], Shading['solid'], Shape['squiggle']),
            Card(Number['one'], Color['blue'], Shading['solid'], Shape['squiggle'])
        ]

        valid_set = [_solitaire.cards[5], _solitaire.cards[9], _solitaire.cards[10]]

        # fails if not all of the cards are in the game
        with self.assertRaises(ValueError):
            _solitaire.receive_selection([
                Card(Number['three'], Color['blue'], Shading['empty'], Shape['oval']),
                Card(Number['three'], Color['green'], Shading['empty'], Shape['diamond']),
                Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle'])
            ])

        self.assertEquals('NOT_A_SET', _solitaire.receive_selection([_solitaire.cards[0], _solitaire.cards[1], _solitaire.cards[2]]).name)
        self.assertEquals('OK', _solitaire.receive_selection(valid_set).name)

        _solitaire.found.add( _solitaire.set_factory.make_set_from_cards(valid_set))
        self.assertEquals('ALREADY_FOUND', _solitaire.receive_selection(valid_set).name)
