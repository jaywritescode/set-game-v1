from solitaire import *
from setutils import *
import unittest


class SolitaireSetTest(unittest.TestCase):
    def test__init__(self):
        _solitaire = SolitaireSet(num_cards=12, num_sets=6)

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

        # fails if not all of the cards are in the game
        with self.assertRaises(ValueError):
            _solitaire.receive_selection([
                Card(Number['three'], Color['blue'], Shading['empty'], Shape['oval']),
                Card(Number['three'], Color['green'], Shading['empty'], Shape['diamond']),
                Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle'])
            ])

         # fails if we don't pass in exactly three cards
        with self.assertRaises(ValueError):
            _solitaire.receive_selection([_solitaire.cards[0], _solitaire.cards[1]])

        # fails if the cards aren't a valid set
        self.assertFalse(_solitaire.receive_selection([_solitaire.cards[0], _solitaire.cards[1], _solitaire.cards[2]]))

        # succeeds if the cards are a valid set
        self.assertTrue(_solitaire.receive_selection([_solitaire.cards[5], _solitaire.cards[9], _solitaire.cards[10]]))

        # fails if we already found this set
        with self.assertRaises(AlreadyFound):
            _solitaire.receive_selection([_solitaire.cards[5], _solitaire.cards[9], _solitaire.cards[10]])
