import uvicorn
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import user
from routers import auth
from routers import vehicles

app = FastAPI()

# Definiamo gli URL del server FE
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Aggiungiamo la protezione contro il CORS (https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    # Permette l'utilizzo di JWT Token (https://www.jwt.io/introduction#when-to-use-json-web-tokens)
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(vehicles.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
