import json
import logging
from flask import Flask, request
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Dispatcher, CommandHandler, CallbackQueryHandler
from telegram.constants import ParseMode

TOKEN = '8157079413:AAFEH7nL79NTFqJxvsTYK-Kym68HKNxmbDw'  # 🔒 Вставь сюда свой токен
GAME_SHORT_NAME = 'hacker_run'

app = Flask(__name__)
bot = Bot(token=TOKEN)

# Загрузка и сохранение лидерборда
LEADERBOARD_FILE = 'leaderboard.json'


def load_leaderboard():
    try:
        with open(LEADERBOARD_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def save_leaderboard(data):
    with open(LEADERBOARD_FILE, 'w') as f:
        json.dump(data, f)


# ==== Обработчики Telegram ====

def start(update: Update, _):
    keyboard = [[InlineKeyboardButton("▶ Играть", callback_game=GAME_SHORT_NAME)]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text("💻 Добро пожаловать в *Hacker Run*!\nУправляй хакером и обгони всех!", 
                              parse_mode=ParseMode.MARKDOWN, reply_markup=reply_markup)


def top(update: Update, _):
    leaderboard = load_leaderboard()
    sorted_scores = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)[:10]
    if not sorted_scores:
        update.message.reply_text("Пока что нет лидеров 😢")
        return

    text = "🏆 *Топ игроков:*\n\n"
    for i, (user_id, score) in enumerate(sorted_scores, 1):
        text += f"{i}. ID {user_id}: {score} очков\n"

    update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


def shop(update: Update, _):
    update.message.reply_text("🛍 Магазин скоро будет доступен!")


def play(update: Update, _):
    update.message.reply_game(game_short_name=GAME_SHORT_NAME)


def callback_query(update: Update, _):
    query = update.callback_query
    if query.game_short_name != GAME_SHORT_NAME:
        query.answer(text="Неверная игра.")
        return

    query.answer()
    query.message.reply_game(game_short_name=GAME_SHORT_NAME)


# ==== Flask route для получения очков ====

@app.route('/score', methods=['POST'])
def receive_score():
    data = request.get_json()
    user_id = data.get('user_id')
    score = data.get('score')

    if not user_id or not isinstance(score, int):
        return {'status': 'error', 'message': 'Неверные данные'}, 400

    leaderboard = load_leaderboard()
    prev_score = leaderboard.get(str(user_id), 0)

    if score > prev_score:
        leaderboard[str(user_id)] = score
        save_leaderboard(leaderboard)

        try:
            bot.set_game_score(user_id=int(user_id), score=score, force=True)
        except Exception as e:
            print(f'[!] Ошибка set_game_score: {e}')

    return {'status': 'ok'}


# ==== Telegram webhook ====

@app.route(f"/webhook", methods=["POST"])
def webhook():
    update = Update.de_json(request.get_json(force=True), bot)
    dispatcher.process_update(update)
    return "OK"


# ==== Запуск диспетчера ====

dispatcher = Dispatcher(bot=bot, update_queue=None, workers=0, use_context=True)
dispatcher.add_handler(CommandHandler('start', start))
dispatcher.add_handler(CommandHandler('top', top))
dispatcher.add_handler(CommandHandler('shop', shop))
dispatcher.add_handler(CommandHandler('play', play))
dispatcher.add_handler(CallbackQueryHandler(callback_query))


# ==== Запуск сервера ====

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(debug=True, port=5000)
