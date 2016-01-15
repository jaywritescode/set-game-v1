import os

import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool

import webservices


class SetApp:
    def __init__(self):
        self.solitaire_service = webservices.SolitaireWebService()
        self.multiplayer_service = webservices.MultiplayerWebService()
        self.game = None

    @cherrypy.expose
    def index(self):
        return open('index.html')

if __name__ == '__main__':
    base_conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
            'tools.sessions.on': True,
            'tools.trailing_slash.on': False
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
    cherrypy.tree.mount(webservices.SolitaireWebService(), '/solitaire', {
        '/' : {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        },
        '/game': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        }
    })
    cherrypy.tree.mount(webservices.MultiplayerWebService(), '/multiplayer', {
        '/' : {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        },
        '/go': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')]
        }
    })
    cherrypy.quickstart(SetApp(), '/', base_conf)

    cherrypy.engine.start()
    cherrypy.engine.block()
