# https://cosmic-ray.readthedocs.io/en/latest/how-tos/operators.html


# this would be placed in folder "example"
# example//provider.py
# it is  used by
#example/string_replacer.py

# example/provider.py

from .string_replacer import StringReplacer
# import our custom operator class from its file


class Provider:
    _operators = {'number-replacer': StringReplacer}

# I think this line and later should be same for every file like this
# TODO make it one line function
    def __iter__(self):
        return iter(Provider._operators)

    def __getitem__(self, name):
        return Provider._operators[name]
