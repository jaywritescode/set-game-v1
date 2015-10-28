from setutils import *
from functools import reduce

class SolitaireSet:
    def __init__(self, cards=12, sets=6):
        self.num_cards = cards
        self.num_sets = sets
        self.set_factory = SetFactory()
        self.table = None

