import unittest

from app.setutils import *


class SetUtilsTest(unittest.TestCase):
    ###########################################################################
    # Card test
    ###########################################################################
    def test_card_equals(self):
        """
        two cards are __eq__ iff they have the same number, color, shading and shape
        """
        attrs = [SetUtilsTest.random_attribute(enum_type) for enum_type in game_attrs]
        card = Card(*attrs)
        self.assertEqual(card, Card(*attrs))

        attrs[0] = Number(2) if attrs[0] != Number(2) else Number(1)
        self.assertNotEqual(card, Card(*attrs))

    def test_card_hashes(self):
        """
        two cards that are __eq__ should hash to the same bucket
        """
        attrs = [SetUtilsTest.random_attribute(enum_type) for enum_type in game_attrs]
        test_set = {Card(*attrs)}
        self.assertIn(Card(*attrs), test_set)

        attrs[1] = Color(2) if attrs[1] != Color(2) else Color(1)
        self.assertNotIn(Card(*attrs), test_set)

    ###########################################################################
    # Capital-S Set test
    ###########################################################################
    def test_set_equals(self):
        """
        two Sets are __eq__ iff they have the same cards
        """
        test_set = SetFactory.make_random_set()
        self.assertEqual(test_set, SetFactory.Set(test_set.cards))

        alternate_set = SetFactory.make_random_set()
        # small chance alternate set will be the same as test set
        self.assertNotEqual(test_set, alternate_set)

    def test_set_hashes(self):
        """
        two Sets that are __eq__ should hash to the same value
        """
        test_set = SetFactory.make_random_set()
        test_set_set = {test_set}
        self.assertIn(SetFactory.Set(test_set.cards), test_set_set)

    ###########################################################################
    # SetUtils test
    ###########################################################################
    def test_is_set(self):
        def random_iter_for_set(enum_type):
            if random.choice((True, False)):
                return SetFactory.make_same_iterable(enum_type)
            else:
                return SetFactory.make_diff_iterable(enum_type)

        def random_iter_for_not_set(enum_type):
            return SetFactory.make_pair_iterable(enum_type)

        def cards_for_set():
            cards_attributes = [random_iter_for_set(enum_type) for enum_type in [Number, Color, Shading, Shape]]
            return [Card(*(attr[i] for attr in cards_attributes)) for i in range(3)]

        def cards_for_not_set():
            funcs = []
            for i in range(4):
                funcs.append(random.choice((random_iter_for_set, random_iter_for_not_set)))
            while all((func == random_iter_for_set for func in funcs)):
                funcs = []
                for i in range(4):
                    funcs.append(random.choice((random_iter_for_set, random_iter_for_not_set)))
            cards_attributes = [funcs[i](enum_type) for i, enum_type in enumerate((Number, Color, Shading, Shape))]
            return [Card(*(attr[i] for attr in cards_attributes)) for i in range(3)]

        self.assertTrue(is_set(cards_for_set()))
        self.assertFalse(is_set(cards_for_not_set()))

    def test_complete_set(self):
        couple = (Card(Number(1), Color(1), Shading(2), Shape(1)),
                  Card(Number(2), Color(2), Shading(2), Shape(1)))
        expected = {
            'Number': Number(3),
            'Color': Color(3),
            'Shading': Shading(2),
            'Shape': Shape(1)
        }
        actual = complete_set(couple)
        self.assertEqual(expected['Number'], actual.number)
        self.assertEqual(expected['Color'], actual.color)
        self.assertEqual(expected['Shading'], actual.shading)
        self.assertEqual(expected['Shape'], actual.shape)
        
    def test_find_all_sets(self):
        table = [
            Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond']),
            Card(Number['two'], Color['blue'], Shading['solid'], Shape['diamond']),
            Card(Number['two'], Color['red'], Shading['solid'], Shape['diamond']),
            Card(Number['one'], Color['red'], Shading['striped'], Shape['squiggle']),
            Card(Number['three'], Color['red'], Shading['solid'], Shape['oval']),
            Card(Number['three'], Color['blue'], Shading['striped'], Shape['squiggle']),
            Card(Number['one'], Color['green'], Shading['solid'], Shape['diamond']),
            Card(Number['three'], Color['green'], Shading['striped'], Shape['squiggle']),
            Card(Number['two'], Color['green'], Shading['empty'], Shape['oval']),
            Card(Number['two'], Color['green'], Shading['striped'], Shape['diamond']),
            Card(Number['two'], Color['red'], Shading['empty'], Shape['diamond']),
            Card(Number['three'], Color['blue'], Shading['empty'], Shape['diamond'])
        ]
        expected = {
            SetFactory.make_set_from_cards({table[0], table[5], table[8]}),
            SetFactory.make_set_from_cards({table[0], table[9], table[11]}),
            SetFactory.make_set_from_cards({table[4], table[7], table[11]}),
            SetFactory.make_set_from_cards({table[6], table[7], table[8]}),
            SetFactory.make_set_from_cards({table[1], table[9], table[10]}),
            SetFactory.make_set_from_cards({table[3], table[4], table[10]})
        }
        self.assertSetEqual(expected, find_all_sets(table))

    def test_are_parallel(self):
        cards_parallel = (
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['striped'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['blue'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['blue'], Shading['solid'], Shape['diamond']),
                    Card(Number['three'], Color['blue'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['two'], Color['red'], Shading['solid'], Shape['oval']),
                    Card(Number['two'], Color['green'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['blue'], Shading['solid'], Shape['squiggle'])
                }))
        self.assertTrue(are_parallel(cards_parallel))

        cards_intersect = (
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['striped'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['red'], Shading['striped'], Shape['oval']),
                    Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle']),
                    Card(Number['two'], Color['red'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['empty'], Shape['squiggle']),
                }))
        self.assertFalse(are_parallel(cards_intersect))

    def test_are_intersecting(self):
        one_intersect = (
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['empty'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['empty'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle']),
                    Card(Number['two'], Color['green'], Shading['empty'], Shape['squiggle']),
                    Card(Number['three'], Color['green'], Shading['empty'], Shape['squiggle'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['green'], Shading['striped'], Shape['oval']),
                    Card(Number['one'], Color['green'], Shading['solid'], Shape['diamond']),
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle']),
                    Card(Number['two'], Color['blue'], Shading['solid'], Shape['diamond']),
                    Card(Number['three'], Color['red'], Shading['striped'], Shape['oval']),
                }))
        self.assertTrue(are_intersecting(one_intersect))

        no_intersect = (
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['striped'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['blue'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['blue'], Shading['solid'], Shape['diamond']),
                    Card(Number['three'], Color['blue'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['three'], Color['green'], Shading['empty'], Shape['oval']),
                    Card(Number['two'], Color['green'], Shading['empty'], Shape['diamond']),
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['two'], Color['red'], Shading['solid'], Shape['oval']),
                    Card(Number['two'], Color['green'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['blue'], Shading['solid'], Shape['squiggle'])
                }))
        self.assertFalse(are_intersecting(no_intersect))

        many_intersect = (
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['green'], Shading['striped'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['one'], Color['red'], Shading['solid'], Shape['diamond']),
                    Card(Number['two'], Color['red'], Shading['striped'], Shape['oval']),
                    Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle'])
                }),
            SetFactory.make_set_from_cards(
                {
                    Card(Number['three'], Color['red'], Shading['empty'], Shape['squiggle']),
                    Card(Number['two'], Color['red'], Shading['empty'], Shape['squiggle']),
                    Card(Number['one'], Color['red'], Shading['empty'], Shape['squiggle']),
                }))
        self.assertFalse(are_intersecting(many_intersect))

    ###########################################################################
    # SetFactory test
    ###########################################################################
    def test_make_set_from_cards(self):
        with self.assertRaises(ValueError):
            SetFactory.make_set_from_cards(
                {
                    Card(Number['three'], Color['green'], Shading['striped'], Shape['squiggle']),
                    Card(Number['one'], Color['green'], Shading['empty'], Shape['squiggle'])
                }
            )

        self.assertIsNone(
            SetFactory.make_set_from_cards(
                {
                    Card(Number['two'], Color['red'], Shading['empty'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['solid'], Shape['oval']),
                    Card(Number['three'], Color['red'], Shading['striped'], Shape['oval'])
                }
            )
        )

        self.assertIsNotNone(
            SetFactory.make_set_from_cards(
                {
                    Card(Number['two'], Color['green'], Shading['empty'], Shape['oval']),
                    Card(Number['one'], Color['blue'], Shading['solid'], Shape['oval']),
                    Card(Number['three'], Color['red'], Shading['striped'], Shape['oval'])
                }
            )
        )

    @staticmethod
    def random_attribute(enum_type):
        """
        Choose a random value from *enum_type*
        :param enum_type: the enum type
        :return: an enum of the given type
        """
        return random.choice(list(enum_type))


if __name__ == '__main__':
    unittest.main()
