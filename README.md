# set-game
That Set game that's a thing.

So far I've only written the solitaire version of the game. In the process of figuring out how to deploy it to Heroku.

My Set game is served by CherryPy and compiled for Python 3, so to run it locally:

~~~sh
pip install -r requirements.txt
python3 solitaireapp.py
~~~

...and then point your web browser to `http://localhost:8080/index`.

The plan is to have a solitaire game that's maybe a desktop app or maybe a web app, and a multiplayer game that's probably a web app. We'll see.
