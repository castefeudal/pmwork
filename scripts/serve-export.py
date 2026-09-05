import http.server
import os
class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if os.getenv('PMWORK_BASE_PATH') == 'github' and path.startswith('/pmwork/'):
            path = path[len('/pmwork'):]
        return super().translate_path(path)
    def log_message(self, *args):
        pass
os.chdir('out')
http.server.ThreadingHTTPServer(('127.0.0.1',3000),Handler).serve_forever()
