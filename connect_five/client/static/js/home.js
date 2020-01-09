document.getElementById('room_input').focus();
document.getElementById('room_input').onkeyup = function(e) {
    console.log(e.key);
    if (e.keyCode == 13) {
        document.getElementById('room_submit').click();
        console.log('enter is pressed');
    }
};

document.getElementById('room_submit').onclick = function(e) {
    let name = document.getElementById('room_input').value;
    window.location.pathname = '/wait/' + name + '/';
}
