import os
import logging
import random
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)
from telegram.constants import ParseMode

# Настройка логгирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
GAME_URL = 'https://mark3245.github.io/hacker-run/'

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [InlineKeyboardButton("🎮 Play Solo", callback_data='play_solo')],
        [InlineKeyboardButton("⚔ Play PvP", callback_data='play_pvp')],
        [InlineKeyboardButton("🏆 Leaderboard", callback_data='leaderboard')],
        [InlineKeyboardButton("🛒 Shop", callback_data='shop')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        '🚀 Welcome to Hacker Run!\n\n'
        'Swipe to avoid obstacles and collect bonuses.\n'
        'Compete with other players in PvP mode!',
        reply_markup=reply_markup
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    
    try:
        if query.data == 'play_solo':
            await query.edit_message_text(text="Starting solo game...", reply_markup=None)
            await context.bot.send_game(
                chat_id=query.message.chat_id,
                game_short_name="hacker_run_solo"
            )
        elif query.data == 'play_pvp':
            await query.edit_message_text(text="Starting PvP game...", reply_markup=None)
            await context.bot.send_game(
                chat_id=query.message.chat_id,
                game_short_name="hacker_run_pvp"
            )
        elif query.data == 'leaderboard':
            await show_leaderboard(query, context)
        elif query.data == 'shop':
            await show_shop(query, context)
        elif query.data == 'back':
            await start(query.message, context)
    except Exception as e:
        logger.error(f"Error in button handler: {e}")

async def show_leaderboard(query, context):
    leaderboard = [
        ("Player1", 5000),
        ("Player2", 4500),
        ("You", 3200),
        ("Player3", 3000),
        ("Player4", 2500)
    ]
    
    text = "🏆 Top Hackers 🏆\n\n"
    for i, (name, score) in enumerate(leaderboard, 1):
        text += f"{i}. {name}: {score}\n"
    
    await query.edit_message_text(
        text=text,
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("Back", callback_data='back')]
        ])
    )

async def show_shop(query, context):
    keyboard = [
        [InlineKeyboardButton("💎 Turbo Boost (10 coins)", callback_data='buy_turbo')],
        [InlineKeyboardButton("🛡 Shield (15 coins)", callback_data='buy_shield')],
        [InlineKeyboardButton("🎨 Skin Pack (30 coins)", callback_data='buy_skin')],
        [InlineKeyboardButton("Back", callback_data='back')]
    ]
    
    await query.edit_message_text(
        text="🛒 Hacker Shop\n\nBuy power-ups and skins for your hacker!",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def game_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        game = update.message.game
        url = f"{GAME_URL}?id={update.message.from_user.id}&mode={'pvp' if 'pvp' in game.short_name else 'solo'}"
        
        keyboard = [
            [InlineKeyboardButton("Play Now", url=url)],
            [InlineKeyboardButton("Share", switch_inline_query="Play Hacker Run!")]
        ]
        
        await update.message.reply_text(
            text=f"🕹 {game.description if game.description else 'Ready to hack?'}",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    except Exception as e:
        logger.error(f"Error in game handler: {e}")

async def set_game_score(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    try:
        score = int(context.args[0]) if context.args else 0
        await context.bot.set_game_score(
            user_id=update.effective_user.id,
            score=score,
            chat_id=update.effective_chat.id
        )
        await update.message.reply_text(
            f"🏅 Your score: {score}\n"
            f"Your position in leaderboard: #{random.randint(1, 100)}"
        )
    except (IndexError, ValueError):
        await update.message.reply_text("Usage: /score <points>")
    except Exception as e:
        logger.error(f"Error setting game score: {e}")
        await update.message.reply_text("Error updating score")

def main() -> None:
    application = Application.builder().token(TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("score", set_game_score))
    
    # Обработчики кнопок
    application.add_handler(CallbackQueryHandler(button_handler))
    
    # Игра
    application.add_handler(MessageHandler(filters.Game, game_handler))
    
    # Запуск бота
    application.run_polling()

if __name__ == '__main__':
    main()
