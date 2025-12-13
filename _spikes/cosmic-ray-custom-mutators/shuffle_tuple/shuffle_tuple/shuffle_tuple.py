from cosmic_ray.operators.operator import Operator
from parso.python.tree import ReturnStmt, YieldExpr
from parso import parse
import random

class ShuffleTuple(Operator):
    
    def mutation_positions(self, node):
        if isinstance(node, (ReturnStmt, YieldExpr)) and len(node.children) >= 2:
            return_value = node.children[1]
            if return_value.type == "atom" and len(return_value.children) == 3:
                left_operator = return_value.children[0]
                tuple_values = return_value.children[1]
                right_operator = return_value.children[2]
                if (
                    left_operator.type== "operator" and left_operator.value == "(" 
                    and tuple_values.type == "testlist_comp" and len(tuple_values.children) >= 2 
                    and right_operator.type == "operator" and right_operator.value == ")"
                ):
                    yield (tuple_values.start_pos, tuple_values.end_pos)

    def mutate(self, node, index):
        tuple_values = node.children[1].children[1].children
        tuple_numbers = node.children[1].children[1].children[::2]
        random.shuffle(tuple_numbers)
        for i in range(len(tuple_numbers)):
            tuple_values[2*i] = tuple_numbers[i]
        return node
    
    def examples(self):
        return [(parse('return (1, 2, 3)').children[0], parse('return (3, 2, 1)').children[0])]