import http.server
import json
import os
import subprocess
import wave
import io
import time
from datetime import datetime

# Configurações via variáveis de ambiente
PIPER_BIN = os.environ.get('PIPER_BIN', './piper/piper')
PIPER_MODELS_DIR = os.environ.get('PIPER_MODELS_DIR', './piper/models')
PIPER_PORT = int(os.environ.get('PIPER_PORT', '5500'))

LANG_MODEL_MAP = {
    'pt_BR': 'pt_BR-faber-medium.onnx',
    'pt-BR': 'pt_BR-faber-medium.onnx',
    'pt':    'pt_BR-faber-medium.onnx',
    'en':    'en_US-lessac-medium.onnx',
    'en-US': 'en_US-lessac-medium.onnx',
    'en_US': 'en_US-lessac-medium.onnx',
    'es':    'es_ES-sharvard-medium.onnx',
}
FALLBACK_MODEL = 'pt_BR-faber-medium.onnx'

MODEL_SAMPLE_RATES = {}

def load_sample_rates():
    if not os.path.exists(PIPER_MODELS_DIR):
        print(f"[ERROR] Models directory not found: {PIPER_MODELS_DIR}")
        return

    for file in os.listdir(PIPER_MODELS_DIR):
        if file.endswith('.onnx.json'):
            model_name = file.replace('.json', '')
            try:
                with open(os.path.join(PIPER_MODELS_DIR, file), 'r') as f:
                    data = json.load(f)
                    sample_rate = data.get('audio', {}).get('sample_rate', 22050)
                    MODEL_SAMPLE_RATES[model_name] = sample_rate
            except Exception as e:
                print(f"[ERROR] Failed to read {file}: {e}")

load_sample_rates()

class PiperHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        if self.path == '/health':
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "ok", "engine": "piper"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        if self.path == '/tts':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                text = data.get('text', '')
                lang = data.get('lang', 'pt_BR')
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                return

            if not text:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'text' field"}).encode())
                return

            start_time = time.time()
            model_file = LANG_MODEL_MAP.get(lang, FALLBACK_MODEL)
            model_path = os.path.join(PIPER_MODELS_DIR, model_file)

            if not os.path.exists(model_path):
                model_file = FALLBACK_MODEL
                model_path = os.path.join(PIPER_MODELS_DIR, model_file)

            try:
                cmd = [PIPER_BIN, '--model', model_path, '--output_raw']
                
                # Parâmetros opcionais de voz
                length_scale = data.get('length_scale')
                if length_scale is not None:
                    cmd.extend(['--length_scale', str(length_scale)])
                
                noise_scale = data.get('noise_scale')
                if noise_scale is not None:
                    cmd.extend(['--noise_scale', str(noise_scale)])

                result = subprocess.run(
                    cmd,
                    input=text.encode('utf-8'),
                    capture_output=True,
                    timeout=15
                )

                if result.returncode != 0:
                    raise Exception(result.stderr.decode())

                pcm_data = result.stdout
                sample_rate = MODEL_SAMPLE_RATES.get(model_file, 22050)

                # Converter PCM para WAV
                wav_io = io.BytesIO()
                with wave.open(wav_io, 'wb') as wav_file:
                    wav_file.setnchannels(1)  # Mono
                    wav_file.setsampwidth(2)  # 16-bit
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes(pcm_data)

                duration = time.time() - start_time
                print(f"[TTS] texto=\"{text[:50]}{'...' if len(text) > 50 else ''}\" lang={lang} scales=({length_scale}, {noise_scale}) modelo={model_file} tempo={duration:.2f}s")

                self._set_headers(200, 'audio/wav')
                self.wfile.write(wav_io.getvalue())

            except Exception as e:
                print(f"[ERROR] TTS Failed: {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self._set_headers(404)

if __name__ == '__main__':
    server_address = ('', PIPER_PORT)
    httpd = http.server.HTTPServer(server_address, PiperHandler)
    print(f"Piper TTS Server running on port {PIPER_PORT}...")
    httpd.serve_forever()
