from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import malware, url

app = FastAPI(title="MALPHIS AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "https://malphis-ygt2.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(malware.router, prefix="/api/malware", tags=["Malware Detection"])
app.include_router(url.router, prefix="/api/url", tags=["URL Detection"])


@app.get("/")
def root():
    return {"message": "MALPHIS AI API is running"}
