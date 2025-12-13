from setuptools import setup, find_packages

setup(
    name="tuple_to_object",
    version="0.1.0",
    packages=find_packages(),
    entry_points={
        "cosmic_ray.operator_providers": [
            "tuple_to_object = tuple_to_object.provider:Provider"
        ]
    },
)