import requests
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Lista de IPs permitidos no ZeroTier
ALLOWED_IPS = [
    "10.147.17.5",
    "10.147.17.167",
    "10.147.17.221",
    "10.147.17.81",
    "10.147.17.1",
    "10.147.17.216",
    "172.18.0.1",   # Default Docker bridge network
    "127.0.0.1",    # Localhost inside the container
    "10.147.17.101",
    "192.168.65.1",
]

# Lista de URLs permitidas (CORS)
ALLOWED_ORIGINS = [
    "http://10.147.17.5",
    "http://10.147.17.167",
    "http://10.147.17.221",
    "http://10.147.17.81",
    "http://10.147.17.1",
    "http://10.147.17.216",
    "http://172.18.0.1",
    "http://127.0.0.1",
    "http://10.147.17.101",
    "http://192.168.65.1",
]

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Permitir apenas origens autorizadas
    allow_credentials=True,
    allow_methods=["*"],           # Permitir todos os métodos HTTP
    allow_headers=["*"],           # Permitir todos os cabeçalhos
)

@app.middleware("http")
async def check_ip(request: Request, call_next):
    client_ip = request.client.host
    print(f"Incoming request from IP: {client_ip}")  # Debugging

    if client_ip not in ALLOWED_IPS:
        print(f"Blocked request from IP: {client_ip}")  # Debugging
        raise HTTPException(status_code=403, detail="Access forbidden: IP not allowed.")
    
    return await call_next(request)


# Middleware para verificar os IPs permitidos
@app.middleware("http")
async def check_ip(request: Request, call_next):
    client_ip = request.client.host
    # Verificar se o IP do cliente está na lista de IPs permitidos
    if client_ip not in ALLOWED_IPS:
        raise HTTPException(status_code=403, detail="Access forbidden: IP not allowed.")
    return await call_next(request)

@app.get("/")
def home():
    return {"message": "Chat Bot API is running"}

@app.get('/ask')
def ask(prompt: str):
    """
    Endpoint para enviar o prompt ao modelo via API da Ollama e retornar a resposta simplificada.
    """
    try:
        # Fazer a requisição para a API da Ollama
        res = requests.post(
            'http://ollama:11434/api/generate',  # URL da API Ollama no Docker
            json={
                "prompt": prompt,
                "stream": False,
                "model": "llama3.2"
            }
        )
        # Verificar se a resposta foi bem-sucedida
        res.raise_for_status()

        # Processar a resposta para simplificar
        res_json = res.json()
        chatbot_response = res_json.get("response", "Sorry, I couldn't generate a response.")
        return {"response": chatbot_response}
    except requests.exceptions.RequestException as e:
        # Capturar erros relacionados à comunicação com Ollama
        print("Error communicating with Ollama:", e)
        return {"error": "Could not connect to Ollama."}, 500
