import os
from time import localtime, strftime
from flask import Flask, render_template, request, session, \
    redirect, flash, url_for, send_from_directory, abort
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.utils import secure_filename

import json

STORAGE_FOLDER = r'C:\Users\lolab\Online Coursework\CS50_HarvardX\Project 2\lecture1_javascript\Testwork\storage'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}


app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("MY_CHAT_APP_KEY")
app.config["STORAGE_FOLDER"] = STORAGE_FOLDER
app.config["ALLOWED_EXTENSIONS"] = ALLOWED_EXTENSIONS
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


socketio = SocketIO(app)

# global variables used
usersregistered = {}
channels = []
storedmessages = dict()
selected_channel = []
# current_room = "Music"


def allowed_files(filename):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1]
    if ext.lower() in app.config["ALLOWED_EXTENSIONS"]:
        return True
    else:
        return False


@app.route("/upload_file", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        if request.files:
            sent_data = request.files['user_file']

            if sent_data.filename == "":
                flash("No file selected")
                return redirect(request.url)

            if not allowed_files(sent_data.filename):
                print("That file extension is not allowed")
                return redirect(request.url)
            else:
                filename = secure_filename(sent_data.filename)
                print("999999999999999")
                print(filename)

            sent_data.save(os.path.join(app.config["STORAGE_FOLDER"], filename))
            return redirect(url_for("sent_files", filename=filename))


@app.route('/download_file/<filename>')
def download_file(filename):

    try:
        return send_from_directory(app.config["STORAGE_FOLDER"],
                                   filename=filename, as_attachment=True)

    except FileNotFoundError:
        abort(404)


# Route1
@app.route("/", methods=["GET", "POST"])
def start():
    if not selected_channel:
        return render_template("signin.html")
    else:
        return render_template("index2.html", username=session['username'], channels=channels)


# Route2
@app.route("/register", methods=["GET", "POST"])
def register():
    return render_template("register.html")


# Route3
@app.route("/register1", methods=["GET", "POST"])
def register1():
    username = request.form.get("username")
    password = request.form.get("password")
    session['username'] = username
    if username == '' or password == '':
        return render_template("error.html", message="A username/password has not been entered. Please try again or ")
    if username in usersregistered:
        return render_template("error1.html", message="That username already exists. Please try again or ")

    usersregistered.update({session['username']: password})
    return render_template("login.html", message="Congratulations! The user " + session['username'] +
                                                 " has now been registered. Please log in.")


# Route4
@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")


# Route5
@app.route("/index", methods=["GET", "POST"])
def index():
    username = request.form.get("username")
    password = request.form.get("password")

    session['username'] = username

    if username in usersregistered and password == usersregistered[username]:
        return render_template("/index2.html", username=session['username'], channels=channels)
    else:
        return render_template("error2.html", message="The username and/or password is incorrect. Please try again or ")


# Route6
@app.route("/logout", methods=["GET"])
def logout():
    # usersregistered.remove(session['username'])
    return redirect("/")


# Route7
@app.route("/channels", methods=["GET", "POST"])
def channel():
    # filename = "a_pic.jpg"
    if request.method == "POST":
        newChannel = request.form.get("usr-channel")
        # session["channel"] = newChannel

        if not channels and not newChannel:
            flash("A Channel has not been created yet. Please create a channel")
        elif channels and not newChannel:
            flash("A channel has to have a name. To create a new channel, Please enter a name")
        elif newChannel in channels:
            flash("That channel already exists")
        else:
            channels.append(newChannel)
            session["channel"] = channels
        return render_template("/index2.html", channels=channels)
    else:
        return render_template("/index2.html", channels=session["channel"])


@app.route("/sent_files/<filename>", methods=["GET"])
def sent_files(filename):
    socketio.emit("sent_file", {"filename": filename}, broadcast=True)
    return render_template("/index2.html", channels=session["channel"], filename=filename)


# Route8
@socketio.on("text message")
def mydata(data):
    username = data["username"]
    usermessage = data["usermessage"]
    room = data["room"]
    session["room"] = room
    print(room)
    timestamp = strftime('%Y-%m-%d %I:%M%p', localtime())
    try:
        storedmessages[room].extend([username, usermessage, timestamp])
    except KeyError:
        storedmessages[room] = list()
        storedmessages[room].extend([username, usermessage, timestamp])

    if len(storedmessages[room]) > 300:
        del storedmessages[room][0:3]

    emit("sent message", {"usermessage": usermessage, "username": username, "timestamp": timestamp}, room=room)


# Route9
@socketio.on("just joined")
def join(data):
    username = data["username"]
    room = data["room"]
    current_room = room
    join_room(room)
    try:
        storedmessages[room]

    except KeyError:
        storedmessages[room] = list()
    json_messages = json.dumps(storedmessages[room])


    emit("user joined", {"details": username + ' has joined the ' + room + ' channel.',
                         "storedjsonmessage": json_messages, "username": username, "room": room}, room=room)


# Route10
@socketio.on("leave")
def leave(data):
    username = data["username"]
    room = data["room"]
    leave_room(room)
    emit("user left", {"details": username + ' has left the ' + room + ' channel.'}, room=room)
