def to_hash(card):
    return {k: card.__dict__[k].name for k in ['number', 'color', 'shading', 'shape']}
