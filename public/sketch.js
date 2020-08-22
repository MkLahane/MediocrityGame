let game = null;
let gameBackground;
let buttonLogic;
let replyText;
let messages;
function setup() {
    buttonLogic = new ButtonLogic();
    let c = createCanvas(innerWidth, innerHeight);
    c.style("z-index: 200")
    backgroundSetup();
    //for messaging 
    messages = document.querySelector('.messages');
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    replyText = document.querySelector('#reply-text');
    replyText.oninput = function () {

    };
}

function draw() {
    background(200, 200, 200, 100);
    backgroundTransition();
    listenForMsgs();
    if (game != null) {
        game.run();
    }
    if (frameCount % 60 == 0) {
        if (startingOnlineGame) {
            startOnlineGameTimer++;
            document.getElementById("game-starting-text").textContent = GAME_STARTING_TEXT.substring(0, GAME_STARTING_TEXT.length - startOnlineGameTimer);
            if (startOnlineGameTimer >= START_ONLINE_GAME_IN_TIME) {
                startOnlineGameTimer = START_ONLINE_GAME_IN_TIME;
                launchOnlineGame();
            }
        }
    }
}


function getColorFromType(type) {
    if (type === "red") {
        return "#E70C0C";
    } else if (type === "green") {
        return "#2EDF06";
    } else if (type === "blue") {
        return "#074ADA";
    }
}

function launchOnlineGame() {
    console.log("Launching online game!!!!!");
    resetOnlineGame();
    if (PLAYER_IS_HOST) {
        SOCKET.emit("launchGameMsg", { lobbyCode: PLAYERS["player1"].lobbyCode });
    }
}

function launchGame() {
    document.getElementById("round-complete").style.opacity = 0.0;
    document.getElementById("round-complete").style.animation = "";
    document.getElementById("game-background").classList.add("fadeOut");
    document.getElementById("game-background").style.zIndex = 0;
    document.getElementById("current-player-name").innerHTML = PLAYER_NAME;
    document.getElementById("opponent-player-1-name").textContent = PLAYERS[OPPONENT_PLAYER_1_ID].playerName;
    document.getElementById("opponent-player-2-name").textContent = PLAYERS[OPPONENT_PLAYER_2_ID].playerName;

    if (document.getElementById("current-player-cards").classList.contains("fadeOut")) {
        document.getElementById("current-player-cards").classList.remove("fadeOut");
        document.getElementById("current-player-cards").classList.add("fadeIn");
    }
    if (document.getElementById("opponent-player-1").classList.contains("fadeOut")) {
        document.getElementById("opponent-player-1").classList.remove("fadeOut");
        document.getElementById("opponent-player-1").classList.add("fadeIn");
    }
    if (document.getElementById("opponent-player-2").classList.contains("fadeOut")) {
        document.getElementById("opponent-player-2").classList.remove("fadeOut");
        document.getElementById("opponent-player-2").classList.add("fadeIn");
    }
    changeWinText("all");
    bringTheCardsBack();
    let currentPlayerColor = getColorFromType(PLAYERS[PLAYER_ID].playerCardType);
    let opponentPlayer1Color = getColorFromType(PLAYERS[OPPONENT_PLAYER_1_ID].playerCardType);
    let opponentPlayer2Color = getColorFromType(PLAYERS[OPPONENT_PLAYER_2_ID].playerCardType);
    document.getElementById("game-elements").style.setProperty("--current-player-card-color",
        getColorFromType(PLAYERS[PLAYER_ID].playerCardType));
    document.getElementById("game-elements").style.setProperty("--opponent-player-1-card-color",
        getColorFromType(PLAYERS[OPPONENT_PLAYER_1_ID].playerCardType));
    document.getElementById("game-elements").style.setProperty("--opponent-player-2-card-color",
        getColorFromType(PLAYERS[OPPONENT_PLAYER_2_ID].playerCardType));


    game = new Game();
    GAME_IS_RUNNING = true;


}


function restartGame() {
    console.log("Restart Game!!!!!!!!!!!!!!");
    document.getElementById("playAgain").style.opacity = 0.0;
    document.getElementById("playAgain").style.pointerEvents = "none";
    if (IS_ONLINE_LOBBY) {
        document.getElementById("game-background").classList.remove("fadeOut");
        document.getElementById("game-background").classList.add("fadeIn");
        // GAME_IS_RUNNING = false;
        PLAYER_ID = "";
        PLAYERS = {};
        buttonTransition("onlineGameButton");
    } else {
        SOCKET.emit("hostRestartedGameMsg", {
            "lobbyCode": PLAYERS[PLAYER_ID].lobbyCode,
            "playerId": PLAYER_ID,
            "opp1Id": OPPONENT_PLAYER_1_ID,
            "opp2Id": OPPONENT_PLAYER_2_ID,
            "playerName": PLAYER_NAME,
            "isHost": PLAYER_IS_HOST
        });
    }

}

function startOnlineGame() {
    startingOnlineGame = true;
    startOnlineGameTimer = 0;
    document.getElementById("game-starting-text").textContent = GAME_STARTING_TEXT;
}

function resetOnlineGame() {
    startingOnlineGame = false;
    startOnlineGameTimer = 0;
    document.getElementById("game-starting-text").textContent = "";
}

function keyPressed() {
    if (key === 'Enter') {
        if (replyText.value !== '') {
            drawMessage(PLAYER_ID, document.getElementById("playerNameInput").value, replyText.value);
            sendMessageToServer(PLAYER_ID, document.getElementById("playerNameInput").value, replyText.value);
        }
        replyText.value = '';
    }
}

function drawMessage(senderId, senderName, msg) {
    let message = document.createElement('div');
    message.className = "message";
    message.innerHTML = `<div class="message">
                <p class="sender-name">${senderName}:</p>
                <p class="msg">${msg}</p>
            </div>`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;

}

function sendMessageToServer(senderId, senderName, msg) {
    SOCKET.emit("sendMessage", {
        "senderId": senderId,
        "senderName": senderName,
        "msg": msg,
        "lobbyCode": PLAYERS[PLAYER_ID].lobbyCode
    });
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}