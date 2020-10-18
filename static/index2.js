document.addEventListener('DOMContentLoaded', () => {


// Connect to websocket
   var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

//Get channel from local storage or initialize value
   if(!localStorage.getItem("channel")){
   localStorage.setItem("channel", "")
   }
   var channel = localStorage.getItem("channel");


    var x=document.querySelectorAll(".user_channel");
    xlength=document.querySelectorAll(".user_channel").length;

    for (var a=0; a<xlength; a++){
       if(x[a].innerHTML === channel){
       x[a].style.backgroundColor = "#a6acaf";
       }
    }

        console.log(2)

   document.querySelector("#form-upload").onclick = function() {

        console.log(3)
    }
   document.querySelector("#selected_file").onsubmit = function() {

        console.log(4)
    };

    document.querySelector("#selected_file").onsubmit = function() {

        console.log(4)
    };

     console.log(5)
//on selecting a channel--------------------------------------------
    document.querySelectorAll(".user_channel").forEach(li => {
        li.onclick = () => {
            const newchannel = li.innerHTML;
            if (newchannel === channel) {
                document.querySelector("#notification_section").innerHTML = `${username} is already in the ${channel} channel.`;
            }

            else {
                for(var i=0; i < xlength; i++){
                x[i].style.backgroundColor = "";
                }
                li.style.backgroundColor = "#a6acaf";
                document.querySelector("#message-area").innerHTML = ''

                socket.emit("leave", {"username": username, "room": channel});
                socket.emit("just joined", {"username": username, "room": newchannel});



                channel = newchannel;
                document.querySelector("#usertext").focus()
            }
            localStorage.setItem("channel", channel)
        }
    })



//display a channels previous messages to a user-------------------------
     socket.on("user joined", data => {
         document.querySelector("#notification_section").innerHTML = `${data.details}`;
         const jsonmsg = JSON.parse(`${data.storedjsonmessage}`)
         const jsonmsglength = jsonmsg.length;

         if(username ===`${data.username}`){
             for(var i = 0; i< jsonmsglength; i++){
             const storedmsg_p = document.createElement("p");
             storedmsg_p.setAttribute("class","returned_data")
             storedmsg_p.innerHTML = jsonmsg[i]
             document.querySelector("#message-area").append(storedmsg_p);
             }
         }
    })


    socket.on("sent_file", data => {

        var x = "<a href=\"{{url_for(\'download_file\', filename=\'"
        var y = `${data.filename}`
        var z = "\')}}\"><i class=\"material-icons\" style=\"font-size:36px\">attachment</i></a>"
        var entire_url_var = x + y + z
        console.log(entire_url_var)
        document.querySelector("#url_string").innerHTML = entire_url_var
        }
    )


    socket.on("user left", data => {
        document.querySelector("#notification_section").innerHTML = `${data.details}`;
    })




//Send messages to users in a channel--------------------------------------------
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
            console.log(channel)

            document.querySelector("#usertext").value = '';
            document.querySelector("#usertext").focus()

        }
        return false
    })


//display a channels stored messages-----------------------------------
    socket.on("sent message", data => {
        const message_p = document.createElement("p");
        const username_p = document.createElement("p");
        const time_p = document.createElement("p")

        time_p.setAttribute("class", "actual_time")
        username_p.setAttribute("class", "actual_username")
        message_p.setAttribute("class", "actual_message")

        message_p.innerHTML = `${data.usermessage}`;
        username_p.innerHTML = `${data.username}`;
        time_p.innerHTML = `${data.timestamp}`;

        document.querySelector("#message-area").append(username_p);
        document.querySelector("#message-area").append(message_p);
        document.querySelector("#message-area").append(time_p);

    });
});
