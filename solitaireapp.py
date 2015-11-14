import os
import cherrypy
import json

class SolitaireApp:
    @cherrypy.expose
    def index(self):
        return open('index.html')


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'public'
        }
    }
    webapp = SolitaireApp()
    cherrypy.quickstart(webapp, '/', conf)
