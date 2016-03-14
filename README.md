# set-game
That Set game that's a thing.

My game lives on Heroku, at http://guarded-fortress-9683.herokuapp.com/ until I get around to fiddling with my DNS settings.

### i'm a d-i-y kind of guy

If you're the kind of person who enjoys downloading code, building apps and running them locally, might I recommend the following:
~~~sh
wget https://github.com/jharris119/set-game/archive/v1.1.tar.gz
~~~

Extract the directory, then I recommend setting up a virtual environment:
~~~sh
cd set-game-1.1
virtualenv venv
source venv/bin/activate
~~~

Install the Python dependencies, and the Javascript dependencies while you're at it:
~~~sh
pip install -r requirements.txt
npm install && bower install
~~~

Either get a futuristic browser or transpile the ES6 to ES5:
~~~sh
gulp babel
~~~

And run the app
~~~sh
python setapp.py
open http://localhost:8080
~~~
