import json
import logging
from flask import Flask, request
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Dispatcher, CommandHandler, CallbackQueryHandler, MessageHandler, filters

TOKEN = '8157079413:AAFEH7nL79NTFqJxvsTYK-Kym68HKNxmbDw'
bot = Bot(token=TOKEN)
app = Flask(__name__)
dp = Dispatcher(bot, None, workers=0)

LEADERBOARD_FILE = 'leaderboard.json'

def load_leaderboard():
    try:
        with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_leaderboard(data):
    with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def start(update: Update, context):
    update.message.reply_text(
        "Привет! Добро пожаловать в Hacker Run!\n"
        "Доступные команды:\n"
        "/play — начать игру\n"
        "/top — таблица лидеров\n"
        "/shop — магазин (скоро)"
    )

def play(update: Update, context):
    keyboard = [
        [InlineKeyboardButton("Играть в Hacker Run", callback_game="HackerRunGame")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text("Нажми кнопку, чтобы начать игру:", reply_markup=reply_markup)

def top(update: Update, context):
    leaderboard = load_leaderboard()
    if not leaderboard:
        update.message.reply_text("Таблица лидеров пока пуста.")
        return
    sorted_scores = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)[:10]
    text = "🏆 Топ игроков:\n"
    for i, (user, score) in enumerate(sorted_scores, 1):
        text += f"{i}. {user}: {score} очков\n"
    update.message.reply_text(text)

def shop(update: Update, context):
    update.message.reply_text("Магазин пока в разработке!")

def button_callback(update: Update, context):
    query = update.callback_query
    query.answer()
    # Telegram сам откроет игру при callback_game
    # Можно обработать другие callback-данные, если добавишь

@app.route('/webhook', methods=['POST'])
def webhook():
    update = Update.de_json(request.get_json(force=True), bot)
    dp.process_update(update)
    return 'OK'

@dp.message_handler(commands=['start'])
def cmd_start(update: Update, context):
    start(update, context)

@dp.message_handler(commands=['play'])
def cmd_play(update: Update, context):
    play(update, context)

@dp.message_handler(commands=['top'])
def cmd_top(update: Update, context):
    top(update, context)

@dp.message_handler(commands=['shop'])
def cmd_shop(update: Update, context):
    shop(update, context)

@dp.callback_query_handler()
def cb_handler(update: Update, context):
    button_callback(update, context)

# Эндпоинт для приема результатов из игры (POST JSON с user и score)
@app.route('/score', methods=['POST'])
def receive_score():
    data = request.json
    user = data.get('user')
    score = data.get('score')
    if not user or not isinstance(score, int):
        return {"status": "error", "message": "Invalid data"}, 400

    leaderboard = load_leaderboard()
    prev_score = leaderboard.get(user, 0)
    if score > prev_score:
        leaderboard[user] = score
        save_leaderboard(leaderboard)
        # Обновляем очки через Telegram Game API
        try:
            bot.set_game_score(user_id=int(user), score=score, force=True)
        except Exception as e:
            print(f"Ошибка set_game_score: {e}")
    return {"status": "ok"}

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app.run(host='0.0.0.0', port=8443)
