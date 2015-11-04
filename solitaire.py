from setutils import *
from collections import defaultdict

class SolitaireSet:
    set_factory = SetFactory()

    def __init__(self, num_cards=12, num_sets=6):
        self.num_cards = num_cards
        self.num_sets = num_sets
        self.cards = set()
        self.sets = set()

    def start(self):
        while len(self.cards) < self.num_cards:
            self.cards.add(Card.random())

        self.sets = find_all_sets(self.cards)

        if len(self.sets) == self.num_sets:
            return

        cards_to_sets_map = defaultdict(set)
        for _set in self.sets:
            for _card in _set.cards:
                cards_to_sets_map[_card].add(_set)

        cards_not_in_sets = list(self.cards - cards_to_sets_map.keys())

        cards_to_complete_sets = defaultdict(set)
        for pair in itertools.combinations(list(self.cards), 2):
            if all(card in cards_to_sets_map for card in pair):
                continue
            completion_card = complete_set(pair)
            potential_set = self.set_factory.make_set_from_cards(list(pair) + [completion_card])
            cards_to_complete_sets[completion_card].add(potential_set)

        if len(self.sets) > self.num_sets:
            pass
        else:
            sets_needed = self.num_sets - len(self.sets)

            potential_replacements = [card for card in cards_to_complete_sets
                                      if len(cards_to_complete_sets[card]) == sets_needed]
            if not len(potential_replacements):
                raise Exception
            replacement_card = random.choice(potential_replacements)

            for _set in cards_to_complete_sets[replacement_card]:
                for _card in _set.cards:
                    if _card in cards_not_in_sets:
                        cards_not_in_sets.remove(_card)
            card_to_remove = random.choice(cards_not_in_sets)

            self.cards.remove(card_to_remove)
            self.cards.add(replacement_card)
            self.sets |= cards_to_complete_sets[replacement_card]


if __name__ == '__main__':
    SolitaireSet().start()
