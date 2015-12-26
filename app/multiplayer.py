import random

from app.setutils import *

class MultiplayerSet:
    set_factory = SetFactory()

    def __init__(self, initial_cards=12):
        self.initial_cards = initial_cards
        self.cards = set()
        self.players = set()
        self.deck = all_cards()
        random.shuffle(self.deck)

    def start(self):
        self.cards = set(self.deck[:self.initial_cards])
        self.deck = self.deck[self.initial_cards:]

        while True:
            if len(find_all_sets(self.cards)): break
            for _ in range(3):
                self.cards.add(self.deck.pop())

    def add_player(self):
        new_player = PlayerFactory.make_player(self)
        self.players.add(new_player)
        return new_player

    def receive_selection(self, selection, player):
        # TODO: make thread-safe
        Response = Enum('response', ('OK', 'NOT_A_SET', 'INVALID'))

        invalids = [card for card in selection if card not in self.cards]
        if any(invalids):
            return Response['INVALID']
        elif is_set(selection):
            player.found.add(self.set_factory.make_set_from_cards(selection))
            self.cards = {card for card in self.cards if card not in selection}

            while len(self.cards) < self.initial_cards and len(self.deck):
                self.cards.add(self.deck.pop())

            while len(find_all_sets(self.cards)) == 0:
                if len(self.deck) >= 3:
                    for _ in range(3):
                        self.cards.add(self.deck.pop())
                else:
                    # TODO: figure out an exception to raise here
                    raise Exception

            return Response['OK']
        else:
            return Response['NOT_A_SET']


class PlayerFactory:

    next_id = 0

    class Player:
        def __init__(self, game, id):
            self.game = game
            self.id = id
            self.found = set()

    @staticmethod
    def make_player(game):
        # TODO: make thread-safe
        PlayerFactory.next_id += 1
        return PlayerFactory.Player(game, PlayerFactory.next_id)
