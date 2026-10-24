import argparse
import functools
import http.server
from pathlib import Path

parser = argparse.ArgumentParser(description='Preview the PuneFinds static frontend locally.')
parser.add_argument('--port', type=int, default=8765)
arguments = parser.parse_args()
root = Path(__file__).resolve().parent
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
server = http.server.ThreadingHTTPServer(('127.0.0.1', arguments.port), handler)
print(f'PuneFinds frontend: http://127.0.0.1:{arguments.port}', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
