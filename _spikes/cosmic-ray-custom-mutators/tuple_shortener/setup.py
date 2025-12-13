from setuptools import setup, find_packages

setup(
    name="tuple_shortener",
    version="0.1.0",
    packages=find_packages(),
    entry_points={
        "cosmic_ray.operator_providers": [
            "tuple_shortener = tuple_shortener.provider:Provider"
        ]
    },
)
