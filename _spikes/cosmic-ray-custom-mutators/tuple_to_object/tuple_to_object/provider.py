from .tuple_to_object import TupleToObject

class Provider:
    _operators = {"tuple-to-object": TupleToObject}

    def __iter__(self):
        return iter(Provider._operators)

    def __getitem__(self, name):
        return Provider._operators[name]