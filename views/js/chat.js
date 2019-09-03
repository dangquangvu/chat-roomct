var socket = io();
// var room =
$('#message-form').submit(function() {
    let mess = $('#message').val();
    socket.emit('send-mess', mess)
    $('#message').val('')
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
    $("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight }, 1000);
})

socket.on('message-join', (mess) => {
    $("#messages").append(function() {
        return '<li style="list-style-type: none; font-size: 18px; padding-bottom: 15px; " >' + mess + '</ li>'
    });
    $("#messages").animate({ scrollTop: $('#messages')[0].scrollHeight }, 1000);
})

socket.emit('join')