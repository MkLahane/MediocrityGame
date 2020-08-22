let CURRENT_BACK_BUTTON_DATA = {
    "appearElements": [],
    "disappearElements": []
};
BUTTON_TRANSITION_DATA = {
    "onlineGameButton": {
        "nextState": "onlinelobby",
        "prevState": "mainmenu",
        "disappearElements": ["onlineGameButton", "customGameButton"],
        "appearElements": ["onlineGameLobby", "backButton"]
    },
    "customGameButton": {
        "nextState": "customroom",
        "prevState": "mainmenu",
        "disappearElements": ["onlineGameButton", "customGameButton"],
        "appearElements": ["customGameRoom", "createCustomGameButton", "joinCustomGameButton", "backButton"]
    },
    "startOnlineGame": {
        "nextState": "game",
        "prevState": "mainmenu",
        "disappearElements": ["onlineGameLobby"]
    },
    "startCustomGameButton": {
        "nextState": "game",
        "prevstate": "customroom",
        "disappearElements": ["customGameLobby"]
    },
    "createCustomGameButton": {
        "nextState": "customlobby",
        "prevstate": "customroom",
        "disappearElements": ["createCustomGameButton", "joinCustomGameButton"],
        "appearElements": ["customGameLobby", "startCustomGameButton"]
    },
    "joinCustomGameButton": {
        "nextState": "joingameCode",
        "prevState": "customroom",
        "disappearElements": ["createCustomGameButton", "joinCustomGameButton"],
        "appearElements": ["joinGameCode", "joinGameCodeInput", "joinGameCodeSubmit"]
    },
    "joinGameCodeSubmit": {
        "nextState": "customlobby",
        "prevState": "joingameCode",
        "disappearElements": ["joinGameCode", "joinGameCodeInput", "joinGameCodeSubmit"],
        "appearElements": ["customGameLobby", "startCustomGameButton"]
    }
};

let STATE_TRANSITION_DATA = {
    "mainmenu": {
        "appearElements": ["mainGame", "onlineGameButton", "customGameButton", "playerNameInput"],
        "prevState": null
    },
    "customroom": {
        "appearElements": ["customGameRoom", "createCustomGameButton", "joinCustomGameButton", "backButton"],
        "prevState": "mainmenu"
    },
    "customlobby": {
        "appearElements": ["customGameLobby", "startCustomGameButton", "backButton"],
        "prevState": "customroom"
    },
    "onlinelobby": {
        "appearElements": ["onlineGameLobby", "backButton"],
        "prevState": "mainmenu"
    },
    "joingameCode": {
        "appearElements": ["joinGameCode", "joinGameCodeInput", "joinGameCodeSubmit", "backButton"],
        "prevState": "customroom"
    },
    "game": {
        "appearElements": ["game-elements", "backButton", "message-box"],
        "prevState": "mainmenu"
    }
};

let CURRENT_MAIN_MENU_STATE = "mainmenu";

class ButtonLogic {
    constructor() {
        this.gameButtons = [
            "onlineGameButton",
            "customGameButton",
            "createCustomGameButton",
            "joinCustomGameButton",
            "backButton",
            "joinGameCodeSubmit"
        ];
        document.getElementById("startCustomGameButton").disabled = true;
        document.getElementById("createCustomGameButton").disabled = true;
        document.getElementById("joinCustomGameButton").disabled = true;
        document.getElementById("backButton").disabled = true;
        document.getElementById("joinGameCodeInput").disabled = true;
        document.getElementById("joinGameCodeSubmit").disabled = true;
        document.getElementById("playerNameInput").oninput = function () {
            if (this.value != "") {
                this.value = (this.value.length > 15) ? this.value.substring(0, 15) : this.value;
                PLAYER_NAME = this.value;
            }
        }
        document.getElementById("joinGameCodeInput").oninput = function () {
            if (this.value != "") {
                this.value = (this.value.length > 5) ? this.value.substring(0, 5) : this.value;
                PLAYER_NAME = this.value;
            }
        }
        document.getElementById("startCustomGameButton").onclick = function () {
            if (PLAYER_IS_HOST) {
                if (getPlayersInLobbyCount() === 3) {
                    SOCKET.emit("launchGameMsg", { lobbyCode: PLAYERS["player1"].lobbyCode });
                }
                else {
                    document.getElementById('server-msg').innerHTML = 'Lobby is not full yet';
                    popUpMessage();
                }
            }
        }
        document.getElementById("playAgain").onclick = function () {
            restartGame();
        }
        this.checkEvents();
    }
    checkEvents() {

        for (let gameButtonId of this.gameButtons) {
            document.getElementById(gameButtonId).onclick = function (e) {
                buttonTransition(gameButtonId);
            }
        }

    }
}


function buttonTransition(whichButton) {
    if (whichButton == "backButton") {
        goBack();
    } else {
        let nextState = BUTTON_TRANSITION_DATA[whichButton]["nextState"];
        if (nextState === "onlinelobby") {
            makeConnection({
                "lobby": "onlinelobby",
                "playerName": document.getElementById("playerNameInput").value
            });
            return;
        } else if (nextState === "customlobby") {
            //if (CURRENT_MAIN_MENU_STATE === "customroom" || CURRENT_MAIN_MENU_STATE === "joingameCode") {
            let isJoining = (CURRENT_MAIN_MENU_STATE === "joingameCode") ? true : false;
            let joiningCode = document.getElementById("joinGameCodeInput").value;
            makeConnection({
                "lobby": "customlobby",
                "isJoining": isJoining,
                "joiningCode": joiningCode,
                "playerName": document.getElementById("playerNameInput").value,
                "lobbyCode": document.getElementById("joinGameCodeInput").value
            });
            return;
            //}
        }
        makeButtonTransition(nextState);
    }
}

function makeButtonTransition(nextState) {
    let elementsToAppear = STATE_TRANSITION_DATA[nextState]["appearElements"];
    let elementsToDisappear = STATE_TRANSITION_DATA[CURRENT_MAIN_MENU_STATE]["appearElements"];
    for (let elementToDisappear of elementsToDisappear) {
        if (document.getElementById(elementToDisappear).classList.contains('fadeIn')) {
            document.getElementById(elementToDisappear).classList.remove('fadeIn');
        }
        document.getElementById(elementToDisappear).classList.add('fadeOut');
        document.getElementById(elementToDisappear).disabled = true;
        document.getElementById(elementToDisappear).style.zIndex = "0";
    }
    if (nextState === "game") {
        launchGame();
        document.getElementById("message-box").style.pointerEvents = "auto";
    }
    if (nextState === "customlobby") {
        if (PLAYER_IS_HOST) {
            document.getElementById("startCustomGameButton").style.pointerEvents = "auto";
        } else {
            document.getElementById("startCustomGameButton").style.pointerEvents = "none";
        }
    }
    for (let elementToAppear of elementsToAppear) {
        if (document.getElementById(elementToAppear).classList.contains('fadeOut')) {
            document.getElementById(elementToAppear).classList.remove('fadeOut');
        }
        if (elementToAppear === "joinGameCodeInput") {
            document.getElementById(elementToAppear).value = '';
        }
        document.getElementById(elementToAppear).classList.add('fadeIn');
        document.getElementById(elementToAppear).disabled = false;
        document.getElementById(elementToAppear).style.zIndex = "1";
    }

    CURRENT_MAIN_MENU_STATE = nextState;
}


function goBack() {
    if (CURRENT_MAIN_MENU_STATE === "customlobby") {
        document.getElementById("player1").innerHTML = "";
        document.getElementById("player2").innerHTML = "";
        document.getElementById("player3").innerHTML = "";
    }
    let prevState = STATE_TRANSITION_DATA[CURRENT_MAIN_MENU_STATE]["prevState"];
    let elementsToAppear = STATE_TRANSITION_DATA[prevState]["appearElements"];
    let elementsToDisappear = STATE_TRANSITION_DATA[CURRENT_MAIN_MENU_STATE]["appearElements"];
    for (let elementToDisappear of elementsToDisappear) {
        if (document.getElementById(elementToDisappear).classList.contains('fadeIn')) {
            document.getElementById(elementToDisappear).classList.remove('fadeIn');
        }
        document.getElementById(elementToDisappear).classList.add('fadeOut');
        document.getElementById(elementToDisappear).disabled = true;
        document.getElementById(elementToDisappear).style.zIndex = "0";
    }
    for (let elementToAppear of elementsToAppear) {
        if (document.getElementById(elementToAppear).classList.contains('fadeOut')) {
            document.getElementById(elementToAppear).classList.remove('fadeOut');
        }
        document.getElementById(elementToAppear).classList.add('fadeIn');
        document.getElementById(elementToAppear).disabled = false;
        document.getElementById(elementToAppear).style.zIndex = "1";
    }
    if (CURRENT_MAIN_MENU_STATE === "customlobby" || CURRENT_MAIN_MENU_STATE === "onlinelobby" || CURRENT_MAIN_MENU_STATE === "game") {
        if (CURRENT_MAIN_MENU_STATE === "game") {
            if (document.getElementById("game-background").classList.contains("fadeOut")) {
                document.getElementById("game-background").classList.remove("fadeOut");
            }
            document.getElementById("game-background").classList.add("fadeIn");
            document.getElementById("game-background").style.pointerEvents = "auto";

            if (document.getElementById("current-player").classList.contains("fadeOut")) {
                document.getElementById("current-player").classList.remove("fadeOut");
            }
            if (document.getElementById("opponent-player-1").classList.contains("fadeOut")) {
                document.getElementById("opponent-player-1").classList.remove("fadeOut");
            }
            if (document.getElementById("opponent-player-2").classList.contains("fadeOut")) {
                document.getElementById("opponent-player-2").classList.remove("fadeOut");
            }
            for (let player in game.currentRoundCards) {
                let currentRoundCard = game.currentRoundCards[player];
                let cardColor = CARD_COLORS[getPlayerCardType(player)];
                document.getElementById(currentRoundCard["element_id"]).classList.add("fadeOut");
                if (player !== PLAYER_ID) {
                    document.getElementById(currentRoundCard["element_id"] + "-number").textContent = "-";
                    document.getElementById(currentRoundCard["element_id"]).style.border = "4px dashed " + cardColor;
                } else {
                    document.getElementById(currentRoundCard["element_id"]).style.border = "6px dashed " + cardColor;
                }
                let rotation = currentRoundCard["rotation"];
                document.getElementById(currentRoundCard["element_id"]).style.transform = rotation + " scale(1.0)";
            }
            document.getElementById("playAgain").style.opacity = 0.0;
            document.getElementById("playAgain").style.pointerEvents = "none";
            resetSelectedCards();
            bringTheCardsBack();
            document.getElementById("message-box").style.pointerEvents = "none";
            removeAllChildNodes(messages);
        }
        removeConnection();
    }

    CURRENT_MAIN_MENU_STATE = prevState;

}