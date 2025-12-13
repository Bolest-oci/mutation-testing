from .object_to_tuple import ObjectToTuple

class Provider:
    _operators = {"object-to-tuple": ObjectToTuple}

    def __iter__(self):
        return iter(Provider._operators)

    def __getitem__(self, name):
        return Provider._operators[name]