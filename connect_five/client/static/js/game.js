const BOARD_SIZE = 10;
let w, h;
let current_player;
let board = [];
let winner = null;

function setup() {
    createCanvas(400, 400);
    w = width / (BOARD_SIZE - 1);
    h = height / (BOARD_SIZE - 1);
    current_player = 0; 

    for (let i = 0; i < BOARD_SIZE; ++i) {
        let row = new Array(BOARD_SIZE);
        row.fill(null, 0, BOARD_SIZE);
        board.push(row);
    }
}

function draw() {
    for (let i = 0; i < BOARD_SIZE; ++ i) {
        line(w * i, 0, w * i, height);
        line(0, h * i, width, h * i);
    }
}

// returns [Row, Col]
function nearest_grid(x, y) {
    x = (x % w) < w/2 ? x - (x % w) : x - (x % w) + w;
    y = (y % h) < h/2 ? y - (y % h) : y - (y % h) + h;
    return [round(y / h), round(x / w)];
}

function is_inboard(val) {
    return 0 <= val && val < BOARD_SIZE;
}
function check_line(row, col, r_dir, c_dir) {
    if (r_dir === 0) {
        if (!is_inboard(col + 5 * c_dir)) { return false;}
        for (let i = 0; i < 5; ++i) {
            if (board[row][col] != board[row][col + i * c_dir]) {
                return false;
            }
        }
        if (is_inboard(col + 6 * c_dir) && board[row][col] === board[row][col + 6 * c_dir]) {
            return false;
        }
    }
    else if (c_dir === 0) {
        if (!is_inboard(row + 5 * r_dir)) { return false;}
        for (let i = 0; i < 5; ++i) {
            if (board[row][col] != board[row + i * r_dir][col]) {
                return false;
            }
        }
        if (is_inboard(row + 6 * r_dir) && board[row][col] === board[row + 6 * r_dir][col]) {
            return false;
        }
    }
    else {
        if (!is_inboard(row + 5 * r_dir) && !is_inboard(col + 5 * c_dir)) { return false;}
        for (let i = 0; i < 5; ++i) {
            if (board[row][col] != board[row + i * r_dir][col + i * c_dir]) {
                return false;
            }
        }
        if (is_inboard(row + 6 * r_dir) && is_inboard(col + 6 * c_dir) && board[row][col] === board[row + 6 * r_dir][col + 6 * c_dir]) {
            return false;
        }
    }
    return true;
}

function check_winner(row, col) {
    // non-diagonals
    if (check_line(row, col, 0, 1) || check_line(row, col, 0, -1) || check_line(row, col, 1, 0) || check_line(row, col, -1, 0)) { return true;}
    else if (check_line(row, col, 1, 1) || check_line(row, col, 1, -1) || check_line(row, col, -1, -1) || check_line(row, col, -1, 1)) { return true;}
    return false;
}

function place_stone(row, col, player) {
    if (board[row][col] == null) {
        let x = col * w;
        let y = row * h;
        if (player === 0) {
            fill(255);
        }
        else if (player === 1) {
            fill(0);
        }
        board[row][col] = player;
        ellipse(x, y, w/2);
    }
}

function mousePressed() {
    if (winner != null) { return false;}
    else if (current_player != player) { return false;}
    if (0 < mouseX && mouseX < width + w && 0 < mouseY && mouseY < height + h) {
        let pos = nearest_grid(mouseX, mouseY);
        place_stone(pos[0], pos[1], current_player);

        // sending position to the server
        ws.send(JSON.stringify({
            'pk' : pk,
            'position' : pos,
            'player' : current_player,
        }));
        
    }
    return false;
}

ws.onmessage = function(e) {
    let data = JSON.parse(e.data);
    let pos = data['position'];
    let player = data['player'];
    player_count = data['player_count'];
    place_stone(pos[0], pos[1], player);

    if (check_winner(pos[0], pos[1])) { 
        winner = current_player;
        noLoop();
        document.getElementById('result').innerHTML = "player " + current_player + " won!";
    }
    else {
        current_player = (player + 1) % player_count;
    }
    document.getElementById('display_player_count').innerHTML = "Number of Players " + player_count;
}

ws.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
}
