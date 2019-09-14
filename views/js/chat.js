var socket = io();
// var room =
$('#message-form').submit(function() {
    let mess = $('#message').val();
    //alert($("#messages").scrollTop() + " px");
    socket.emit('send-mess', mess)
    $('#message').val('');
    // let x = $("messages").scrollTop();
    // console.log(x);
    return false;
});
socket.on('send-mess-client', async(messager) => {
    // $(".chat-history").animate({ scrollTop: $('#messages')[0].scrollHeight }, 1000);
    $("#messages").append(function() {
        return '<li style="list-style-type: none; width: 500px;">' +
            '<div id="nametime">' +
            '<span id="span1" style ="color: red;">' + messager.name + '</span>' +
            '<span id="span2">' + messager.date + '</span>' +
            '</div>' +
            '<div id="contain" dir="auto">' + messager.mess + '</div>' +
            '</li>'
    });
    $("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight }, 0);
})

socket.on('message-join', (mess) => {
    $("#messages").append(function() {
        return '<li style="list-style-type: none; font-size: 18px; padding-bottom: 15px; " >' + mess + '</ li>'
    });

    $("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight }, 0);
})
socket.emit('join')
socket.on('user-active', (chatter) => {
    //$("#sidebar").val('')
    var data = "";
    for (i = 0; i < chatter.length; i++) {
        data += " " + chatter[i].username;
    };

    document.querySelector('#sidebar').innerHTML = data;
})
$(document).ready(function() {
    $(".chat__messages").scroll((event) => {
        //console.log('bbbbb')
        var body_place = $(".chat__messages").scrollTop();
        //console.log(body_place)
        if (body_place == 0) {
            socket.emit('load_more');
        }
    })
})