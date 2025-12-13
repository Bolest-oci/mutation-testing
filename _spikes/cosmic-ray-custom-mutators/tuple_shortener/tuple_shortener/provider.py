from .tuple_shortener import ShortenTuple

class Provider:
    _operators = {"shorten-tuple": ShortenTuple}

    def __iter__(self):
        return iter(Provider._operators)

    def __getitem__(self, name):
        return Provider._operators[name]
