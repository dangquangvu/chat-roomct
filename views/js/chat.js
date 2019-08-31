var socket = io();
// var room =
$('#message-form').submit(function() {
    let mess = $('#message').val();
    socket.emit('send-mess', mess)
    $('#message').val('')
    return false;
});
socket.on('send-mess-client', async(messager) => {
    $("#messages").append(function() {
        return '<li style="list-style-type: none;" >' + messager.name + ":" + messager.mess + '&nbsp' + '<span style="text-align: right;font-size:11px;color: #3a3838;font-variant: small-caps;">' + messager.date + '</span>' + '</ li>'
    });
})

socket.on('message-join', (mess) => {
    $("#messages").append(function() {
        return '<li style="list-style-type: none;" >' + mess + '</ li>'
    });
})

socket.emit('join')