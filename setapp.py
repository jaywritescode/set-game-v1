import os

import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool

from app.setutils import Card
import webservices.solitairegame


class SetApp:
    homepage = ''

    @cherrypy.expose
    def index(self):
        try:
            return open(self.homepage)
        except FileNotFoundError:
            raise cherrypy.HTTPRedirect('/solitaire', 302)

    @staticmethod
    def json_to_cards(blob):
        return [Card(*[getattr(Card, key)(obj[key])
                       for key in ['number', 'color', 'shading', 'shape']]) for obj in blob]


if __name__ == '__main__':
    base_conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
            'tools.sessions.on': True,
            'tools.trailing_slash.on': False
        },
        '/game': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'public'
        },
        '/bower_components': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'bower_components'
        }
    }
    mp_conf = base_conf.copy()
    mp_conf.update({
        '/join': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        }
    })
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': int(os.environ.get('PORT', 8080)),
    })
    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()

    cherrypy.tree.mount(webservices.solitairegame.SolitaireApp(), '/solitaire', base_conf)
    cherrypy.tree.mount(MultiplayerApp(), '/multiplayer', mp_conf)
    cherrypy.quickstart(SetApp(), '/', base_conf)            # needs to be mounted last
    cherrypy.engine.start()
    cherrypy.engine.block()
