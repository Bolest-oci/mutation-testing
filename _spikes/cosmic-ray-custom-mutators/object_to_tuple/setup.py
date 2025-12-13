from setuptools import setup, find_packages

setup(
    name="object_to_tuple",
    version="0.1.0",
    packages=find_packages(),
    entry_points={
        "cosmic_ray.operator_providers": [
            "object_to_tuple = object_to_tuple.provider:Provider"
        ]
    },
)