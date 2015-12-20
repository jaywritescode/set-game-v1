from setutils import *
from enum import Enum
from collections import defaultdict


class SolitaireSet:
    set_factory = SetFactory()

    def __init__(self, num_cards=12, num_sets=6):
        self.num_cards = num_cards
        self.num_sets = num_sets
        self.cards = set()
        self.sets = set()
        self.found = set()

        SolitaireSet._start(self)

    def _start(self):
        while True:
            self.cards = SolitaireSet._random_cards(self.num_cards)
            self.sets = find_all_sets(self.cards)

            if len(self.sets) == self.num_sets:
                return

            # map each card on the table to the sets that card appears in
            cards_in_sets = defaultdict(set)
            for _set in self.sets:
                for _card in _set.cards:
                    cards_in_sets[_card].add(_set)

            cards_not_in_sets = list(self.cards - cards_in_sets.keys())

            # these are cards that, if added to the table, would complete one or more sets
            cards_to_complete_sets = defaultdict(set)
            for pair in itertools.combinations(list(self.cards), 2):
                if all(card in cards_in_sets for card in pair):
                    continue
                completion_card = complete_set(pair)
                potential_set = self.set_factory.make_set_from_cards(list(pair) + [completion_card])
                cards_to_complete_sets[completion_card].add(potential_set)

            # if we have k too many sets...
            if len(self.sets) > self.num_sets:
                extra_sets = len(self.sets) - self.num_sets

                # remove a card that appears in k sets
                potential_removals = [card for card in cards_in_sets if len(cards_in_sets[card]) == extra_sets]
                if not len(potential_removals):
                    # start over if no card appears in k sets -- this feels simpler
                    # than dealing with the changes in *cards_to_complete_sets* and
                    # and *cards_in_sets* when you swap cards
                    continue
                card_to_remove = random.choice(potential_removals)

                # find a different card that doesn't add any new sets to the table
                while True:
                    replacement_card = Card.random()
                    if replacement_card not in cards_in_sets and replacement_card not in cards_to_complete_sets:
                        break

                self.cards.remove(card_to_remove)
                self.cards.add(replacement_card)
                self.sets -= cards_in_sets[card_to_remove]
            # otherwise, we have j too many sets
            else:
                sets_needed = self.num_sets - len(self.sets)

                # remove a card that appears in j sets
                potential_replacements = [card for card in cards_to_complete_sets
                                          if len(cards_to_complete_sets[card]) == sets_needed]
                if not len(potential_replacements):
                    # start over if no card appears in j sets -- this feels simpler
                    # than dealing with the changes in *cards_to_complete_sets* and
                    # and *cards_in_sets* when you swap cards
                    continue
                replacement_card = random.choice(potential_replacements)

                # make sure we don't remove one of the cards that makes a
                # set with *replacement_card*
                for _set in cards_to_complete_sets[replacement_card]:
                    for _card in _set.cards:
                        if _card in cards_not_in_sets:
                            cards_not_in_sets.remove(_card)
                if not len(cards_not_in_sets):
                    continue
                card_to_remove = random.choice(cards_not_in_sets)

                self.cards.remove(card_to_remove)
                self.cards.add(replacement_card)
                self.sets |= cards_to_complete_sets[replacement_card]

            return

    def receive_selection(self, selection):
        """
        Given a selection of cards, determines if those cards are a valid Set in
        the context of the game.

        :param selection: a collection of Cards
        :return: 'NOT_A_SET' if *selection* is not a Set, 'ALREADY_FOUND' if we already found this Set, otherwise 'OK'
        :throws: ValueError if we include a Card that's not in the game
        """
        invalids = [card for card in selection if card not in self.cards]
        if any(invalids):
            raise ValueError("Invalid card%s: %s" %
                                 ('' if len(invalids) == 1 else 's', ', '.join(str(card) for card in invalids)))

        Response = Enum('response', ('OK', 'NOT_A_SET', 'ALREADY_FOUND'))
        if is_set(selection):
            the_set = self.set_factory.make_set_from_cards(selection)
            if the_set in self.found:
                return Response['ALREADY_FOUND']
            else:
                self.found.add(the_set)
                return Response['OK']
        else:
            return Response['NOT_A_SET']

    def solved(self):
        """
        Determines if we've found all Sets.

        :return: True iff we've found all Sets
        """
        return len(self.found) == self.num_sets


    @staticmethod
    def _random_cards(count):
        """
        Generates a set of *count* different cards chosen at random.
        :param count: the number of cards to return
        :return: the set of cards
        """
        cards = set()
        while len(cards) < count:
            cards.add(Card.random())
        return cards


if __name__ == '__main__':
    solitaire = SolitaireSet()
    for the_set in solitaire.sets:
        print(str(the_set))
