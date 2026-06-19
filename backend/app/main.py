from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt

from app.core.config import settings
from app.routers import admin, agent_reviews, agents, auth, bookings, buildings, chat, favorites, inquiries, otp, price_alerts, price_history, properties, reviews, saved_searches, uploads, users
from app.routers import analytics as analytics_router
from app.routers import boost as boost_router
from app.routers import translations as translations_router
from app.routers import view_stats as view_stats_router
from app.routers import crm as crm_router
from app.routers import viewings as viewings_router
from app.routers import referrals as referrals_router
from app.routers import qr as qr_router
from app.routers import report as report_router
from app.routers import social_post as social_post_router
from app.services.price_scheduler import start_scheduler, stop_scheduler
from app.services.websocket_manager import connection_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

dev_cors_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted({str(origin) for origin in settings.BACKEND_CORS_ORIGINS} | dev_cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

media_root = Path(settings.MEDIA_ROOT)
media_root.mkdir(parents=True, exist_ok=True)
app.mount(settings.MEDIA_URL, StaticFiles(directory=media_root), name="media")

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")
app.include_router(inquiries.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(otp.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(buildings.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(price_alerts.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(saved_searches.router)
app.include_router(agent_reviews.router)
app.include_router(price_history.router)
app.include_router(admin.router, prefix="/api")
app.include_router(boost_router.router, prefix="/api")
app.include_router(analytics_router.router, prefix="/api")
app.include_router(view_stats_router.router, prefix="/api")
app.include_router(translations_router.router, prefix="/api")
app.include_router(crm_router.router, prefix="/api")
app.include_router(viewings_router.router, prefix="/api")
app.include_router(referrals_router.router, prefix="/api")
app.include_router(qr_router.router, prefix="/api")
app.include_router(report_router.router, prefix="/api")
app.include_router(social_post_router.router, prefix="/api")


@app.websocket("/api/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = Query(...)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_user_id = int(payload.get("sub"))
        if token_user_id != user_id:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return
    await connection_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id, websocket)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
