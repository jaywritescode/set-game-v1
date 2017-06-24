# -*- coding: utf-8 -*-
import os

import cherrypy
from ws4py.server.cherrypyserver import WebSocketTool

import webservices


class SetApp:
    @cherrypy.expose
    def index(self, **kwargs):
        return open('index.html')


if __name__ == '__main__':
    import logging
    import argparse
    from ws4py import configure_logger
    configure_logger(level=logging.DEBUG)

    parser = argparse.ArgumentParser()
    parser.add_argument('--env', help='set runtime environment')
    args = parser.parse_args()

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
    }
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': int(os.environ.get('PORT', 8080)),
        'environment': args.env or 'staging'
    })
    webservices.MultiplayerWebSocketPlugin(cherrypy.engine).subscribe()
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
        },
        '/go': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
        },
        '/status': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.response_headers.on': True,
            'tools.response_headers.headers': [('Content-Type', 'application/json')],
        },
        '/leave': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
        },
        '/destroy': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
        },
        '/ws': {
            'request.dispatch': cherrypy.dispatch.Dispatcher(),
            'tools.websocket.on': True,
            'tools.websocket.handler_cls': webservices.MultiplayerWebSocket
        },
    })
    cherrypy.quickstart(SetApp(), '/', base_conf)

    cherrypy.engine.start()
    cherrypy.engine.block()
