from .shuffle_tuple import ShuffleTuple

class Provider:
    _operators = {"shuffle-tuple": ShuffleTuple}

    def __iter__(self):
        return iter(Provider._operators)

    def __getitem__(self, name):
        return Provider._operators[name]