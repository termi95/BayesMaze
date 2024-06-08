from flask import Flask, render_template
from services.service import get_game_data

app = Flask(__name__)

@app.route("/")
def maine_page():
    return render_template("index.html")

@app.route("/game")
def get_game():
    return get_game_data()

if __name__ == "__main__":
    app.run(debug=True)