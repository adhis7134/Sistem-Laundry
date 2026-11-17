import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("  🧺 LAUNDRY HUB - SISTEM INFORMASI LAYANAN LAUNDRY")
        print("  Universitas Bina Sarana Informatika")
        print("=" * 60)
        print(f"  Server berjalan di: {url}")
        print("  Tekan Ctrl+C di terminal ini untuk menghentikan server.")
        print("=" * 60)
        
        # Buka browser secara otomatis
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            sys.exit(0)

if __name__ == "__main__":
    run()
