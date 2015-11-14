import json

def to_json(card):
    obj = { k : card.__dict__[k].name for k in ['number', 'color', 'shading', 'shape']}
    return json.dumps(obj)
