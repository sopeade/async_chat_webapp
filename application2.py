import sys
from time import localtime, strftime
from flask import Flask, render_template, request, session, redirect, flash
from flask_socketio import SocketIO, emit, join_room, leave_room
import json


app = Flask(__name__)
app.config["SECRET_KEY"] = "Mysecret"
socketio = SocketIO(app)


usersregistered = {}
channels = []
storedmessages = dict()


@app.route("/", methods=["GET", "POST"])
def start():
    return render_template("signin.html")



@app.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


@app.route("/register1", methods=["GET", "POST"])
def register1():
    username = request.form.get("username")
    password = request.form.get("password")
    session['username'] = username
    if username == '':
        return render_template("error.html", message="A username has not been entered. Please try again or ")
    if username in usersregistered:
        return render_template("error1.html", message="That username already exists. Please try again or ")

    usersregistered.update({session['username']: password})
    return render_template("login.html", message="Congratulations! The user " + session['username'] +
                                                 " has now been registered. Please log in.")


@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")


@app.route("/index", methods=["GET", "POST"])
def index():
    username = request.form.get("username")
    password = request.form.get("password")

    session['username'] = username

    if username in usersregistered and password == usersregistered[username]:
        return render_template("/index2.html", username=session['username'], channels=channels)
    else:
        return render_template("error2.html", message="The username and/or password is incorrect. Please try again or ")


@app.route("/logout", methods=["GET"])
def logout():
    usersregistered.remove(session['username'])
    return redirect("/")


@app.route("/channels/", methods=["GET", "POST"])
def channel():
    newChannel = request.form.get("usr-channel")

    if not channels and not newChannel:
        flash("A Channel has not been created yet. Please create a channel")
    elif channels and not newChannel:
        flash("A channel has to have a name. To create a new channel, Please enter a name")
    elif newChannel in channels:
        flash("That channel already exists")
    else:
        channels.append(newChannel)
    return render_template("/index2.html", channels=channels)


@socketio.on("text message")
def mydata(data):
    username = data["username"]
    usermessage = data["usermessage"]
    room = data["room"]
    timestamp = strftime('%Y-%m-%d %I:%M%p', localtime())
    try:
        storedmessages[room].extend([username, usermessage, timestamp])
    except KeyError:
        storedmessages[room] = list()
        storedmessages[room].extend([username, usermessage, timestamp])
    print("storedmessages on sending a message///////////////////////////////////////////")
    print(storedmessages[room])

    # if len(storedmessages[room]) > 3:
    #     del storedmessages[room][0:2]

    emit("sent message", {"usermessage": usermessage, "username": username, "timestamp": timestamp}, room=room)


@socketio.on("just joined")
def join(data):
    username = data["username"]
    room = data["room"]
    join_room(room)
    try:
        storedmessages[room]
    except KeyError:
        storedmessages[room] = list()
    json_messages = json.dumps(storedmessages[room])
    print("stored_messages on selecting a channel*****************************************")

    print(storedmessages[room])
    print(json_messages)

    emit("user joined", {"details": username + ' has joined the ' + room + ' channel.',
                         "storedmessages": storedmessages[room], "storedjsonmessage": json_messages,
                         "room": room}, room=room)


@socketio.on("leave")
def join(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    emit("user left", {"details": username + ' has left the ' + room + ' channel.'}, room=room)
