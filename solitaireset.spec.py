from solitaire import *
from setutils import *
import unittest


class SolitaireSetTest(unittest.TestCase):
    def test__init__(self):
        solitaire = SolitaireSet(num_cards=12, num_sets=6)

        self.assertEqual(solitaire.num_cards, len(solitaire.cards))
        self.assertEqual(solitaire.num_sets, len(solitaire.sets))
