"""
UyMap.uz Telegram Bot — MVP
Yangi e'lonlar haqida xabar beradi va qidirish imkonini beradi.

Ishga tushirish:
  export TELEGRAM_BOT_TOKEN="..."
  export API_BASE_URL="http://localhost:8000/api"
  python bot.py
"""

import os
import logging
from datetime import datetime, timezone

import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
API_URL = os.environ.get("API_BASE_URL", "http://localhost:8000/api")
subscribers = set()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    subscribers.add(user.id)
    await update.message.reply_text(
        f"Assalomu alaykum, {user.first_name}! 👋\n\n"
        "UyMap.uz Telegram botiga xush kelibsiz!\n\n"
        "Buyruqlar:\n"
        "/start — Botni ishga tushirish\n"
        "/latest — So'nggi e'lonlar\n"
        "/search [so'z] — E'lonlarni qidirish\n"
        "/subscribe — Yangi e'lonlardan xabardor bo'lish\n"
        "/help — Yordam"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Yordam bo'limi:\n\n"
        "/start — Botni ishga tushirish\n"
        "/latest — So'nggi 5 ta e'lon\n"
        "/search [tuman/narx] — Qidirish\n"
        "/subscribe — Yangi e'lon bildirishnomasi\n\n"
        "Masalan: /search Chilonzor"
    )


async def latest(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{API_URL}/properties", params={"limit": 5, "sort": "newest"})
            data = resp.json()
        items = data.get("items", [])
        if not items:
            await update.message.reply_text("Hozircha e'lonlar yo'q.")
            return
        lines = ["📋 So'nggi e'lonlar:\n"]
        for p in items:
            price = f"${float(p['price']):,.0f}" if p["currency"] == "USD" else f"{float(p['price']):,.0f} so'm"
            period = f"/{p['price_period']}" if p.get("price_period") else ""
            title = p["title"][:60]
            lines.append(f"🏠 {title}")
            lines.append(f"💰 {price}{period} | 📍 {p['district']}")
            lines.append(f"🔗 http://localhost:5173/?page=detail&id={p['id']}\n")
        await update.message.reply_text("\n".join(lines))
    except Exception as e:
        logger.error(f"Error fetching latest: {e}")
        await update.message.reply_text("Xatolik yuz berdi. Server bilan bog'lanib bo'lmadi.")


async def search(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = " ".join(context.args)
    if not query:
        await update.message.reply_text("Qidiruv so'zini kiriting. Masalan: /search Chilonzor 2 xonali")
        return
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{API_URL}/properties", params={"search": query, "limit": 5})
            data = resp.json()
        items = data.get("items", [])
        if not items:
            await update.message.reply_text(f"\"{query}\" bo'yicha e'lon topilmadi.")
            return
        lines = [f"🔍 \"{query}\" bo'yicha natijalar:\n"]
        for p in items:
            price = f"${float(p['price']):,.0f}" if p["currency"] == "USD" else f"{float(p['price']):,.0f} so'm"
            lines.append(f"🏠 {p['title'][:60]}")
            lines.append(f"💰 {price} | 📍 {p['district']}")
            lines.append(f"🔗 http://localhost:5173/?page=detail&id={p['id']}\n")
        await update.message.reply_text("\n".join(lines))
    except Exception as e:
        logger.error(f"Error searching: {e}")
        await update.message.reply_text("Xatolik yuz berdi.")


async def subscribe(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    subscribers.add(user_id)
    await update.message.reply_text(
        "✅ Yangi e'lonlar haqida xabardor qilish yoqildi!\n\n"
        "Yangi e'lon qo'shilganda sizga xabar keladi."
    )


async def post_new_listing(application: Application, property_data: dict) -> None:
    """Yangi e'lon qo'shilganda barcha obunachilarga xabar yuborish."""
    price = f"${float(property_data['price']):,.0f}" if property_data["currency"] == "USD" else f"{float(property_data['price']):,.0f} so'm"
    text = (
        "🆕 Yangi e'lon!\n\n"
        f"🏠 {property_data['title'][:80]}\n"
        f"💰 {price}\n"
        f"📍 {property_data['district']} tumani\n"
        f"🔗 http://localhost:5173/?page=detail&id={property_data['id']}"
    )
    for user_id in list(subscribers):
        try:
            await application.bot.send_message(chat_id=user_id, text=text)
        except Exception as e:
            logger.warning(f"Failed to send to {user_id}: {e}")
            subscribers.discard(user_id)


def main() -> None:
    if not TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN environment variable is not set!")
        return

    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("latest", latest))
    app.add_handler(CommandHandler("search", search))
    app.add_handler(CommandHandler("subscribe", subscribe))

    logger.info("Bot started!")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
