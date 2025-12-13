from cosmic_ray.operators.operator import Operator
from parso.python.tree import ReturnStmt, YieldExpr
from parso import parse

class ObjectToTuple(Operator):
    
    def mutation_positions(self, node):
        if isinstance(node, (ReturnStmt, YieldExpr)) and len(node.children) >= 2:
            return_value = node.children[1]
            if return_value.type == "atom_expr" and len(return_value.children) == 2:
                name = return_value.children[0]
                trailer = return_value.children[1]
                if name.type== "name" and name.value == "object" and trailer.type == "trailer":
                    left_operator = trailer.children[0]
                    right_operator = trailer.children[1]
                    if (
                        left_operator.type == "operator" and left_operator.value == "(" 
                        and right_operator.type == "operator" and right_operator.value == ")"
                        ):
                        yield (return_value.start_pos, return_value.end_pos)

    def mutate(self, node, index):
        node = parse("    return tuple()")
        return node
    
    def examples(self):
        return [(parse('return object()').children[0], parse('return ()').children[0])]