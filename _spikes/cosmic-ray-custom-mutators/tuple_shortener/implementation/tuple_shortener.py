from cosmic_ray.operators.operator import Operator
import parso

class ShortenTuple(Operator):
    
    def mutation_positions(self, node):
        if isinstance(node, (parso.python.tree.ReturnStmt, parso.python.tree.YieldExpr)) and len(node.children) >= 2:
            children1 = node.children[1]
            if f"{children1.type}" == "atom":
                children2_0 = children1.children[0]
                children2_1 = children1.children[1]
                if f"{children2_0.type}"=="operator" and f"{children2_0.value}" == "(" and f"{children2_1.type}" == "testlist_comp" and len(children2_1.children) >= 3:
                    yield (children2_1.start_pos, children2_1.end_pos)

    def mutate(self, node, index):
        children = node.children[1].children[1]
        length = len(children.children)
        del children.children[length-1]
        del children.children[length-2]      
        return node
    

    def examples(self):
        before = parso.parse('return (1, 2, 3)').children[0]
        after = parso.parse('return (1, 2)').children[0]
        return [(before, after)]
