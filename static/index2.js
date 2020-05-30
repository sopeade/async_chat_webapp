document.addEventListener('DOMContentLoaded', () => {


// Connect to websocket
   var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

//Get channel from local storage and initialize value
   if(!localStorage.getItem("channel")){
   localStorage.setItem("channel", "Default")
   }
   let channel = localStorage.getItem("channel");



//Send messages--------------------------------------------
    socket.on('connect', () => {
//    Disable send button by default
    document.querySelector("#send").disabled = true;
    document.querySelector("#usertext").onkeyup = () => {
    if (document.querySelector("#usertext").value.length > 0)
        document.querySelector("#send").disabled = false;
    else
        document.querySelector("#send").disabled = true;
    }

        document.querySelector("#send").onclick = () => {


            document.querySelector("#send").disabled = true;
            let usertext = document.querySelector("#usertext").value
            socket.emit("text message", {"usermessage": usertext, "username": username, "room": channel});
            console.log(usertext)
            document.querySelector("#usertext").value = '';
        }
        return false

    })


//display received messages-----------------------------------
    socket.on("sent message", data => {
        const message_p = document.createElement("p");
        const username_p = document.createElement("p");
        const time_p = document.createElement("p")

        message_p.innerHTML = `${data.usermessage}`;
        username_p.innerHTML = `${data.username}`;
        time_p.innerHTML = `${data.timestamp}`;

        document.querySelector("#message-area").append(username_p);
        document.querySelector("#message-area").append(message_p);
        document.querySelector("#message-area").append(time_p);
    });


//on selecting a channel--------------------------------------------
    document.querySelectorAll(".user_channel").forEach(li => {
        li.onclick = () => {
            const newchannel = li.innerHTML;
//            document.querySelector("li").style.color = 'blue'
            if (newchannel === channel) {
                document.querySelector("#notification_section").innerHTML = `${username} is already in the ${channel} channel.`;
            }

            else {
                document.querySelector("#message-area").innerHTML = '';
//                document.querySelector("#notification_section").innerHTML = `${username} is now in the ${channel} channel.`;
                socket.emit("leave", {"username": username, "room": channel});
                socket.emit("just joined", {"username": username, "room": newchannel});
//                console.log(newchannel)
                channel = newchannel;
            }
            localStorage.setItem("channel", channel)
        }
    })


//display user joined message-------------------------
     socket.on("user joined", data => {
     document.querySelector("#notification_section").innerHTML = `${data.details}`;
     document.querySelector("#message-area").innerHTML = `${data.storedmessages}`

    })

     socket.on("user left", data => {
     document.querySelector("#notification_section").innerHTML = `${data.details}`;
    })



});
