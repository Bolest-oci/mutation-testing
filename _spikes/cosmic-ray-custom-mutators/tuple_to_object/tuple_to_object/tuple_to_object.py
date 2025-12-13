from cosmic_ray.operators.operator import Operator
from parso.python.tree import ReturnStmt, YieldExpr, Name, PythonBaseNode
from parso import parse

class TupleToObject(Operator):
    
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
                    yield (return_value.start_pos, return_value.end_pos)

    def mutate(self, node, index):
        node = parse("    return object()")
        return node
    
    def examples(self):
        return [(parse('return (1, 2, 3)').children[0], parse('return object()').children[0])]