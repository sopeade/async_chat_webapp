import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, send


app = Flask(__name__)
app.config["SECRET_KEY"] = 'mysecret'
socketio = SocketIO(app)


# @socketio.on('message')
# def handleMessage(msg):
#     print('Message: ' + msg)
#     send(msg, broadcast=True)
#
#
# if __name__ == '__main__':
#     socketio.run(app)

@app.route("/")
def index():
    return render_template("index.html")