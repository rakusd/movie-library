def ensure_string(value, default=''):
    return _ensure_type(value, default, str)

def ensure_int(value, default=0):
    return _ensure_type(value, default, int)

def _ensure_type(value, default, _type):
    return value if type(value) is _type else default