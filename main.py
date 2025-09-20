from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import os
try:
    from fastapi.templating import Jinja2Templates
except ImportError:
    from starlette.templating import Jinja2Templates

# Constants
PORT = 8000
HOST = "127.0.0.1"
RELOAD = True

# Initialize FastAPI app
app = FastAPI(
    title="Tongue-Controlled Fighting Game",
    description="Real-time tongue and head pose detection for fighting game control",
    version="1.0.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """
    Serve the main game page with tongue detection
    """
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "message": "Tongue Fighting Game API is running"}

@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    """
    print(f"\n🎮 Tongue-Controlled Fighting Game Server Starting...")
    print(f"🌐 Server: http://{HOST}:{PORT}")
    print(f"👅 Ready for tongue detection!")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    """
    print("\n👋 Shutting down Tongue Fighting Game server...")

if __name__ == "__main__":
    try:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=PORT,
            reload=RELOAD
        )
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        print("🔧 Server failed to start. Please check the error message above.")
        raise