import os

import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool

import webservices


class SetApp:
    @cherrypy.expose
    def index(self):
        return open('index.html')

    @cherrypy.expose
    def solitaire(self):
        self.game = webservices.SolitaireWebService()

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
    cherrypy.quickstart(SetApp(), '/', base_conf)
