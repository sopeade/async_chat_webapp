document.addEventListener('DOMContentLoaded', () => {


// Connect to websocket
   var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

//Get channel from local storage or initialize value
   if(!localStorage.getItem("channel")){
   localStorage.setItem("channel", "Default")
   }
   var channel = localStorage.getItem("channel");



//Send messages--------------------------------------------
    socket.on('connect', () => {

//      Disable send button by default
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
            document.querySelector("#usertext").value = '';
            document.querySelector("#usertext").focus()
        }
        return false

    })


//display received messages-----------------------------------
    socket.on("sent message", data => {
        const message_p = document.createElement("p");
        const username_p = document.createElement("p");
        const time_p = document.createElement("p")

        time_p.setAttribute("class", "actual_time" )
        username_p.setAttribute("class", "actual_username" )
        message_p.setAttribute("class", "actual_message")

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
            if (newchannel === channel) {
                document.querySelector("#notification_section").innerHTML = `${username} is already in the ${channel} channel.`;
            }

            else {
                document.querySelector("#message-area").innerHTML = ''
                socket.emit("leave", {"username": username, "room": channel});
                socket.emit("just joined", {"username": username, "room": newchannel});

//                if(li.style.color != 'red'){
//                li.style.color = 'red'}
//                else {li.style.color = 'black'}
                channel = newchannel;
                document.querySelector("#usertext").focus()
            }
            localStorage.setItem("channel", channel)
        }
    })


//display user joined message-------------------------
     socket.on("user joined", data => {
     document.querySelector("#notification_section").innerHTML = `${data.details}`;
//     const channelmsgs = `${data.storedmessages}`
//     console.log(channelmsgs)

     const jsonmsg = JSON.parse(`${data.storedjsonmessage}`)
     console.log(jsonmsg)
     const jsonmsglength = jsonmsg.length;
     console.log(jsonmsglength)


     for(var i = 0; i< jsonmsglength; i++){
     const storedmsg_p = document.createElement("p");
     storedmsg_p.innerHTML = jsonmsg[i]
     document.querySelector("#message-area").append(storedmsg_p);
     }



//     document.querySelector("#message-area").innerHTML = `${data.storedmessages}`
//       document.querySelector("#message-area").innerHTML = jsonmessage


    })

     socket.on("user left", data => {
     document.querySelector("#notification_section").innerHTML = `${data.details}`;
    })

});
