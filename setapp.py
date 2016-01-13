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

    @cherrypy.expose
    def multiplayer(self):
        # TODO: we can only use one of the web services at a time, fix that
        self.game = webservices.MultiplayerWebService()

if __name__ == '__main__':
    base_conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
            'tools.sessions.on': True,
            'tools.trailing_slash.on': False
        },
        '/game/create': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
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
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': int(os.environ.get('PORT', 8080)),
    })
    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()
    cherrypy.quickstart(SetApp(), '/', base_conf)
