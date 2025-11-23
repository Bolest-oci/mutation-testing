#https://cosmic-ray.readthedocs.io/en/latest/how-tos/operators.html



# this would be placed in folder "example"
# example/string_replacer.py
# it also uses example/provider.py


from cosmic_ray.operators.operator import Operator
import parso
# this should be there always

# class of our operator, it is subclass of class Operator
class StringReplacer(Operator):
    """ there should be description of what this mutator operator does, like this ope replaces strings."""

# this  function only finds what to mutate, it does no mutations
    def mutation_positions(self, node):
# this uses that parso library to find place where string is in code, 
# TODO I think it could be more complex, like only string that is in for loop and so on, but for now this is enough
        if isinstance(node, parso.python.tree.String):
# TODO, I believe there are better ways to test this than isinstance
            yield (node.start_pos, node.end_pos)


# this function actually mutates what we already found using the other function
    def mutate(self, node, index):
        """Modify the numeric value on `node`."""
# this is documentation desription of mutation
        assert isinstance(node, parso.python.tree.String)
# this assert does not need to be there, but it should be, 
# and I think it is because python is dynamically typed language
        # val = eval(node.value) + 1 
# TODO better ways to do this, and better things than to use than eval (like eval can be unsafe)
        x = str(node.value) # convert for safety
        val = x.capitalize()
        return parso.python.tree.Number('' + str(val), node.start_pos)
