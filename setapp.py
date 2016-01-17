import os
from datetime import datetime
import json

import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)


import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from ws4py.websocket import WebSocket
from ws4py.messaging import TextMessage

import webservices


class SetApp:
    def __init__(self):
        self.solitaire_service = webservices.SolitaireWebService()
        self.multiplayer_service = webservices.MultiplayerWebService()
        self.game = None

    @cherrypy.expose
    def index(self):
        return open('index.html')


class SetAppWebSocketHandler(WebSocket):
    def received_message(self, m):
        cherrypy.log('Received message: %s' % m)
        p = {
            'date': datetime.now().strftime("%c"),
            'msg': str(m.data.upper())
        }
        self.send(TextMessage(json.dumps(p)))

    def closed(self, code, reason="A client left the room without a proper explanation."):
        cherrypy.log('Closed')


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
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
            'tools.websocket.on': True,
            'tools.websocket.handler_cls': SetAppWebSocketHandler
        },
        '/go': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
            'tools.websocket.on': False,
        },
        '/status': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
            'tools.websocket.on': False
        },
        '/ws': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.websocket.on': True,
            'tools.websocket.handler_cls': SetAppWebSocketHandler
        }
    })
    cherrypy.quickstart(SetApp(), '/', base_conf)

    cherrypy.engine.start()
    cherrypy.engine.block()
