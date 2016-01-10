from app.setutils import Card

def json_to_cards(blob):
    return [Card(*[getattr(Card, key)(obj[key])
                   for key in ['number', 'color', 'shading', 'shape']]) for obj in blob]
