from setuptools import setup, find_packages

setup(
    name='set-game',
    version='1.1.0',
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),
    url='https://github.com/jaywritescode/set-game',
    license='MIT',
    author='jay harris',
    author_email='jaywritescode@users.noreply.github.com',
    description='The Set game that\'s a thing.',
    install_requires=['CherryPy', 'haikunator', 'ws4py']
)
