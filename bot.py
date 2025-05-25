import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)

# Настройка логгирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
GAME_URL = 'https://your-vercel-app.vercel.app'  # Замените на ваш URL игры

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
    
    if query.data == 'play_solo':
        await query.edit_message_text(
            text="Starting solo game...",
            reply_markup=None
        )
        await context.bot.send_game(
            chat_id=query.message.chat_id,
            game_short_name="hacker_run_solo"
        )
    elif query.data == 'play_pvp':
        await query.edit_message_text(
            text="Starting PvP game...",
            reply_markup=None
        )
        await context.bot.send_game(
            chat_id=query.message.chat_id,
            game_short_name="hacker_run_pvp"
        )
    elif query.data == 'leaderboard':
        await show_leaderboard(query)
    elif query.data == 'shop':
        await show_shop(query)

async def show_leaderboard(query):
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

async def show_shop(query):
    keyboard = [
        [InlineKeyboardButton("💎 Turbo Boost (10 coins)", callback_data='buy_turbo')],
        [InlineKeyboardButton("🛡 Shield (15 coins)", callback_data='buy_shield')],
        [InlineKeyboardButton("🎨 Skin Pack (30 coins)", callback_data='buy_skin')],
        [InlineKeyboardButton("Back", callback_data='back')]
    ]
    
    await query.edit_message_text(
        text="🛒 Hacker Shop\n\n"
             "Buy power-ups and skins for your hacker!",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def game_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
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

async def set_game_score(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Обработка результатов игры
    score = context.args[0] if context.args else 0
    user = update.effective_user
    
    logger.info(f"User {user.id} scored {score} points")
    await update.message.reply_text(
        f"🏅 Your score: {score}\n"
        f"Your position in leaderboard: #{Phaser.Math.RND.integerInRange(1, 100)}"
    )

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