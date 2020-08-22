let SOCKET;
let PLAYER_ID = "";
let OPPONENT_PLAYER_1_ID = "";
let OPPONENT_PLAYER_2_ID = "";
let PLAYER_NAME = "";
let PLAYER_CARD_TYPE = "";
let PLAYER_IS_HOST = false;
let PLAYERS = {
    "player1": null,
    "player2": null,
    "player3": null
};

let CARD_COLORS = {
    "red": "#E70C0C",
    "green": "#2EDF06",
    "blue": "#074ADA"
};
let MSG_TIMER = 0;
let MSG_DELAY = 1;
let MSG_TO_VALUE = 0;
let MSG_FROM_VALUE = 0;
let MSG_ANIMATE = false;
let GAME_IS_RUNNING = false;
const MAX_ROUNDS = 5;
const MAX_HANDS = 5;
let ROUNDS_PASSED = 1;

let IS_ONLINE_LOBBY = false;
let startingOnlineGame = false;
const GAME_STARTING_TEXT = "Game Starting......";
const START_ONLINE_GAME_IN_TIME = 6; //in seconds; 
let startOnlineGameTimer = 0;

function getPlayerCardType(playerStr) {
    if (playerStr === "player1") {
        return "red";
    } else if (playerStr === "player2") {
        return "green";
    } else {
        return "blue";
    }
}

function getPlayerId(cardColor) {
    if (cardColor === "red") {
        return "player1";
    } else if (cardColor === "green") {
        return "player2";
    } else {
        return "player3";
    }
}

function getEmptyPlayer(playerName, playerId) {
    while (true) {
        let playerIndex = floor(random(1, 4));
        let playerStr = "player" + playerIndex;
        if (PLAYERS[playerStr] === null) {
            PLAYERS[playerStr] = {
                "playerName": playerName,
                "playerId": playerId,
                "playerCardType": getPlayerCardType(playerStr)
            }
            document.getElementById(playerStr).innerHTML = playerName;
            return;
        }
    }
}

function makeConnection(connectingData) {
    SOCKET = io();
    if (connectingData.lobby === "onlinelobby") {
        IS_ONLINE_LOBBY = true;
    }
    SOCKET.emit("connected", connectingData);
    SOCKET.on("playerSetupMsg", data => {
        PLAYER_NAME = data.playerName;
        PLAYER_ID = data.playerId;
        PLAYER_CARD_TYPE = data.playerCardType;
        PLAYER_IS_HOST = data.isHost;
        PLAYERS[PLAYER_ID] = data;
        if (PLAYER_ID === "player1") {
            OPPONENT_PLAYER_1_ID = "player2";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player2") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player3") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player2";
        }

        document.getElementById("lobbyCode").innerHTML = data.lobbyCode;
        let playerDisplayName = PLAYER_NAME;
        if (PLAYER_IS_HOST) {
            playerDisplayName += "     (Host)"
        }
        document.getElementById(PLAYER_ID).textContent = playerDisplayName;
        document.getElementById(OPPONENT_PLAYER_1_ID).textContent = "";
        document.getElementById(OPPONENT_PLAYER_2_ID).textContent = "";
        makeButtonTransition(connectingData.lobby);

        if (connectingData.isJoining) {
            document.getElementById("startCustomGameButton").style.opacity = 0.2;
            document.getElementById("startCustomGameButton").disabled = true;
        }
    });
    SOCKET.on("newPlayerJoinedMsg", data => {
        PLAYERS = data.players;
        for (let player in data.players) {
            if (player.playerId === PLAYER_ID || PLAYERS[player] === null) {
                continue;
            }
            let playerDisplayName = PLAYERS[player].playerName;
            if (PLAYERS[player].isHost) {
                playerDisplayName += "     (Host)";
            }
            document.getElementById(player).innerHTML = playerDisplayName;
        }
        if (IS_ONLINE_LOBBY) {
            if (getPlayersInLobbyCount() === 3) {
                // SOCKET.emit("launchGameMsg", { lobbyCode: PLAYERS["player1"].lobbyCode });
                startOnlineGame();
                //SOCKET.emit("launchGameMsg", { lobbyCode: PLAYERS["player1"].lobbyCode });
            }
        }
    });
    SOCKET.on("joiningOnGoingGameMsg", data => {
        PLAYER_ID = data["myPlayerId"];
        PLAYER_NAME = data["myPlayerName"];
        PLAYERS = data["players"];
        PLAYER_IS_HOST = PLAYERS[PLAYER_ID]["isHost"];
        if (PLAYER_ID === "player1") {
            OPPONENT_PLAYER_1_ID = "player2";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player2") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player3") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player2";
        }
        document.getElementById(OPPONENT_PLAYER_1_ID).textContent = (PLAYERS[OPPONENT_PLAYER_1_ID]["isHost"]) ?
            PLAYERS[OPPONENT_PLAYER_1_ID]["playerName"] + "     (Host)" : PLAYERS[OPPONENT_PLAYER_1_ID]["playerName"];
        document.getElementById(OPPONENT_PLAYER_2_ID).textContent = (PLAYERS[OPPONENT_PLAYER_2_ID]["isHost"]) ?
            PLAYERS[OPPONENT_PLAYER_2_ID]["playerName"] + "     (Host)" : PLAYERS[OPPONENT_PLAYER_2_ID]["playerName"];

        PLAYERS[OPPONENT_PLAYER_2_ID]["playerName"];

        document.getElementById(PLAYER_ID).textContent = PLAYERS[PLAYER_ID]["playerName"];
        PLAYER_CARD_TYPE = getPlayerCardType(PLAYER_ID);
        document.getElementById("current-player-hands-won").textContent = "Hands Won: " + PLAYERS[PLAYER_ID]["handsWon"];
        document.getElementById("current-player-rounds-won").textContent = "Rounds Won: " + PLAYERS[PLAYER_ID]["roundsWon"];
        document.getElementById("current-number-rounds").textContent = "Round " + data["roundNumber"] + "   of 5";
        if (document.getElementById("current-number-rounds").classList.contains("shrinkRoundClass")) {
            document.getElementById("current-number-rounds").classList.remove("shrinkRoundClass");
        }
        document.getElementById("current-number-rounds").classList.add("growRoundClass");
        makeButtonTransition("game");
        for (let player in PLAYERS) {
            let cardsPlayed = PLAYERS[player]["cardsPlayed"];
            for (let i = 0; i < 5; i++) {
                if (cardsPlayed[i]) {
                    let elementId = "";
                    if (player === PLAYER_ID) {
                        elementId = "current-player-card-" + (i + 1);
                    } else if (player === OPPONENT_PLAYER_1_ID) {
                        elementId = "opponent-player-1-card-" + (i + 1);
                    } else {
                        elementId = "opponent-player-2-card-" + (i + 1);
                    }
                    let rotation = getCardRotation(i + 1);
                    let cardColor = CARD_COLORS[PLAYERS["playerCardType"]];
                    resetTheSelectedCard(elementId, cardColor, rotation);
                }
            }
        }
        let cardsPlayedInThisHand = data["cardsPlayedInThisHand"];
        for (let cardColor in cardsPlayedInThisHand) {
            let cardData = cardsPlayedInThisHand[cardColor];
            if (cardData["moveBy"] === PLAYER_ID) {
                selectThisCardForCurrentPlayer(document.getElementById("current-player-card-" + cardData["cardNumber"]));
            } else {
                makeOpponentMove({
                    "cardNumber": cardData["cardNumber"],
                    "playerId": cardData["moveBy"]
                });
            }
        }


    });
    SOCKET.on("joinedOnGoingGameMsg", newPlayer => {
        let newPlayerData = newPlayer["playerData"];
        if (newPlayer["playerId"] !== PLAYER_ID) {
            PLAYERS[newPlayer["playerId"]] = newPlayerData;
            if (newPlayer["playerId"] === OPPONENT_PLAYER_1_ID) {
                if (document.getElementById("opponent-player-1").classList.contains("fadeOut")) {
                    document.getElementById("opponent-player-1").classList.remove("fadeOut");
                }
                document.getElementById("opponent-player-1").classList.add("fadeIn");
            } else {
                if (document.getElementById("opponent-player-2").classList.contains("fadeOut")) {
                    document.getElementById("opponent-player-2").classList.remove("fadeOut");
                }
                document.getElementById("opponent-player-2").classList.add("fadeIn");
            }
            document.getElementById(newPlayer["playerId"]).textContent = newPlayerData["playerName"];

        }
    });
    SOCKET.on("playerExitedLobbyMsg", data => {
        // if (GAME_IS_RUNNING && IS_ONLINE_LOBBY) {
        //     removeConnection();
        //     makeButtonTransition("mainmenu");
        // }

        resetOnlineGame();

        document.getElementById(data.playerExitedId).textContent = "";
        if (data["newHostPlayerId"] !== null) {
            document.getElementById(data.newHostPlayerId).innerHTML = PLAYERS[data.newHostPlayerId].playerName + "     (Host)";
            if (data["newHostPlayerId"] === PLAYER_ID) {
                PLAYER_IS_HOST = true;
            }
        }

        if (GAME_IS_RUNNING) {
            if (OPPONENT_PLAYER_1_ID === data.playerExitedId) {
                if (document.getElementById("opponent-player-1").classList.contains("fadeIn")) {
                    document.getElementById("opponent-player-1").classList.remove("fadeIn");
                }
                document.getElementById("opponent-player-1").classList.add("fadeOut");
                //resetCards("opponent-player-1-cards");
            } else {
                if (document.getElementById("opponent-player-2").classList.contains("fadeIn")) {
                    document.getElementById("opponent-player-2").classList.remove("fadeIn");
                }
                document.getElementById("opponent-player-2").classList.add("fadeOut");
                //resetCards("opponent-player-1-cards");
            }

        } else {
            PLAYERS[data.playerExitedId] = null;
        }

    });
    SOCKET.on("launchGameMsg", data => {
        makeButtonTransition("game");
    });
    SOCKET.on("errorMsg", data => {
        document.getElementById("server-msg").innerHTML = data;
        if (GAME_IS_RUNNING) {
            document.getElementById("server-msg").classList.remove("normal-msg");
            document.getElementById("server-msg").classList.add("ingame-msg");
        } else {
            if (!document.getElementById("server-msg").classList.contains("normal-msg")) {
                document.getElementById("server-msg").classList.add("normal-msg");
            }
        }
        popUpMessage();
    });
    SOCKET.on("movePlayedMsg", moveData => {

        makeOpponentMove(moveData);
    });
    SOCKET.on("handWinnerMsg", handWinnerData => {
        let winnerId = handWinnerData["winnerId"];
        changeWinText("hands", winnerId, handWinnerData["winnerData"]["handsWon"]);
        game.currentHandWinner = winnerId;
        document.getElementById("backButton").style.pointerEvents = "none";
        disablePlaying();
        //reveal opponent numbers and highlight cards  
        highlightPlayedCards(winnerId);
        setTimeout(function () {
            brightenTheCardsAgain();
            for (let player in game.currentRoundCards) {
                let currentRoundCard = game.currentRoundCards[player];
                let cardColor = CARD_COLORS[getPlayerCardType(player)];
                let rotation = currentRoundCard["rotation"];
                let elementId = currentRoundCard["element_id"];
                resetTheSelectedCard(elementId, cardColor, rotation);
            }
            enablePlaying();
            document.getElementById("backButton").style.pointerEvents = "auto";
        }, 3000);

    });
    SOCKET.on("roundWinnerMsg", roundWinnerData => {
        document.getElementById("backButton").style.pointerEvents = "none";
        disablePlaying();
        let numberOfRoundsText = document.getElementById("current-number-rounds");
        numberOfRoundsText.style.animationName = "shrinkRound";
        numberOfRoundsText.style.animationDuration = "2s";
        numberOfRoundsText.style.animationFillMode = "forwards";
        ROUNDS_PASSED++;
        let winnerId = roundWinnerData["gameWinnerId"] === null ? roundWinnerData["winnerId"] : roundWinnerData["gameWinnerId"];
        changeWinText("rounds", winnerId, roundWinnerData["roundsWon"]);
        if (!roundWinnerData["gameOver"]) {
            document.getElementById("round-complete").style.animationName = "roundCompleteAppear";
            document.getElementById("round-complete").style.background = CARD_COLORS[getPlayerCardType(winnerId)];
            document.getElementById("round-complete").style.animationDuration = "4s";
            document.getElementById("round-complete").style.animationFillMode = "forwards";
        } else {
            document.getElementById("round-complete").style.background = CARD_COLORS[getPlayerCardType(winnerId)];
            document.getElementById("round-complete").style.opacity = 0.5;
        }

        setTimeout(() => {
            changeWinText("hands", winnerId, 0);
            bringTheCardsBack();
            if (!roundWinnerData["gameOver"]) {

                enablePlaying();
                document.getElementById("round-complete").style.animation = "";
                numberOfRoundsText.textContent = "Round " + ROUNDS_PASSED + " of 5";
                numberOfRoundsText.style.animationName = "growRound";
                numberOfRoundsText.style.animationDuration = "2s";
                numberOfRoundsText.style.animationFillMode = "forwards";
            } else {

                if (PLAYER_IS_HOST || IS_ONLINE_LOBBY) {
                    document.getElementById("playAgain").style.opacity = 1.0;
                    document.getElementById("playAgain").style.pointerEvents = "auto";
                    if (IS_ONLINE_LOBBY) {
                        GAME_IS_RUNNING = false;
                        SOCKET.disconnect();
                    }
                }
            }
            document.getElementById("backButton").style.pointerEvents = "auto";
        }, 6000);
    });
    SOCKET.on("playersComebackToLobbyMsg", newGameData => {
        let restartedData = newGameData["restartedData"];
        let newPlayersData = newGameData["newPlayersData"];
        if (restartedData["prevHostId"] === PLAYER_ID) {
            PLAYER_ID = restartedData["newHostId"];
        }
        else if (restartedData["prevOpp1Id"] === PLAYER_ID) {
            PLAYER_ID = restartedData["newOpp1Id"];
        } else {
            PLAYER_ID = restartedData["newOpp2Id"];
        }

        //reset players data 
        PLAYERS = newPlayersData;
        PLAYER_NAME = PLAYERS[PLAYER_ID]["playerName"];
        PLAYER_CARD_TYPE = PLAYERS[PLAYER_ID]["playerCardType"];
        if (PLAYER_ID === "player1") {
            OPPONENT_PLAYER_1_ID = "player2";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player2") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player3";
        } else if (PLAYER_ID === "player3") {
            OPPONENT_PLAYER_1_ID = "player1";
            OPPONENT_PLAYER_2_ID = "player2";
        }
        document.getElementById(PLAYER_ID).textContent = (PLAYER_IS_HOST) ? PLAYER_NAME + "     (Host)" : PLAYER_NAME;
        document.getElementById(OPPONENT_PLAYER_1_ID).textContent = PLAYERS[OPPONENT_PLAYER_1_ID]["playerName"];
        document.getElementById(OPPONENT_PLAYER_2_ID).textContent = PLAYERS[OPPONENT_PLAYER_2_ID]["playerName"];

        document.getElementById("game-background").classList.remove("fadeOut");
        document.getElementById("game-background").classList.add("fadeIn");
        GAME_IS_RUNNING = false;
        changeWinText("all");
        bringTheCardsBack();
        makeButtonTransition("customlobby");
        enablePlaying();
    });

    SOCKET.on("getMessages", messages => {
        for (let message of messages) {
            drawMessage(message["senderId"], message["senderName"], message["msg"]);
        }
    });
    SOCKET.on("sendSentMessage", message => {
        if (message["senderId"] !== PLAYER_ID) {
            drawMessage(message["senderId"], message["senderName"], message["msg"]);
        }
    });
}

function resetTheSelectedCard(elementId, cardColor, rotation) {
    document.getElementById(elementId).classList.add("fadeOut");
    if (elementId.includes("opponent")) {
        document.getElementById(elementId + "-number").textContent = "-";
        document.getElementById(elementId).style.border = "";//4px dashed " + cardColor";
    } else {
        document.getElementById(elementId).style.border = "";//"6px dashed " + cardColor;
    }
    document.getElementById(elementId).style.transform = rotation + " scale(1.0)";
    document.getElementById(elementId).style.pointerEvents = "none";
    game.cardsUsedInThisHand[elementId] = true;
}

function resetSelectedCards() {
    resetSelectedCardsFor("current-player-cards");
    resetSelectedCardsFor("opponent-player-1-cards");
    resetSelectedCardsFor("opponent-player-2-cards");
}

function resetSelectedCardsFor(cardClass) {
    let cards = document.getElementsByClassName(cardClass);
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        if (game.cardsUsedInThisHand[card.id]) {
            let rotation = getCardRotation(i + 1);
            resetTheSelectedCard(card.id, "none", rotation);
        }
    }
}

function highlightPlayedCards(winnerId) {
    for (let player in game.currentRoundCards) {
        let currentRoundCard = game.currentRoundCards[player];
        document.getElementById(currentRoundCard["element_id"]).style.pointerEvents = "none";
        if (player !== PLAYER_ID) {
            document.getElementById(currentRoundCard["element_id"] + "-number").textContent = currentRoundCard["cardNumber"];
        }
        if (player === winnerId) {
            if (player !== PLAYER_ID) {
                document.getElementById(currentRoundCard["element_id"]).style.transform = "scale(1.5)";
            }
            document.getElementById(currentRoundCard["element_id"] + "-number").style.opacity = 1.0;
            document.getElementById(currentRoundCard["element_id"]).style.background = CARD_COLORS[getPlayerCardType(player)];
            document.getElementById(currentRoundCard["element_id"]).style.border = "6px dashed white";
        } else {
            document.getElementById(currentRoundCard["element_id"]).style.filter = "brightness(0.3)";
        }
    }
}

function changeWinText(winType, winnerId, winCount) {
    if (winType === "rounds") {
        if (winnerId === PLAYER_ID) {
            document.getElementById("current-player-rounds-won").textContent = "Rounds Won: " + winCount;
        } else if (winnerId === OPPONENT_PLAYER_1_ID) {
            document.getElementById("opponent-player-1-rounds-won").textContent = "Rounds Won:" + winCount;
        } else {
            document.getElementById("opponent-player-2-rounds-won").textContent = "Rounds Won:" + winCount;
        }
    } else if (winType === "hands") {
        if (winnerId === PLAYER_ID) {
            document.getElementById("current-player-hands-won").textContent = "Hands Won: " + winCount;
        } else if (winnerId === OPPONENT_PLAYER_1_ID) {
            document.getElementById("opponent-player-1-hands-won").textContent = "Hands Won: " + winCount;
        } else {
            document.getElementById("opponent-player-2-hands-won").textContent = "Hands Won: " + winCount;
        }
    } else {
        //reset rounds 
        document.getElementById("current-player-rounds-won").textContent = "Rounds Won: 0";
        document.getElementById("opponent-player-1-rounds-won").textContent = "Rounds Won: 0";
        document.getElementById("opponent-player-2-rounds-won").textContent = "Rounds Won: 0";

        document.getElementById("current-player-hands-won").textContent = "Hands Won: 0";
        document.getElementById("opponent-player-1-hands-won").textContent = "Hands Won: 0";
        document.getElementById("opponent-player-2-hands-won").textContent = "Hands Won: 0";
    }
}

function bringTheCardsBack() {
    resetCards("current-player-cards");
    resetCards("opponent-player-1-cards");
    resetCards("opponent-player-2-cards");
    if (game !== null) {
        game.cardsUsedInThisHand = {};
    }
}

function resetCards(className) {

    for (let card of document.getElementsByClassName(className)) {
        if (card.classList.contains("fadeOut")) {
            card.classList.remove("fadeOut");
        }
        card.classList.add("fadeIn");
        card.style.background = "#0D0C0C";
        card.style.zIndex = 1;
        card.style.opacity = 1;
        card.style.filter = "brightness(1.0)";
        card.style.pointerEvents = "auto";
        if (className.includes("opponent")) {
            document.getElementById(card.id + "-number").textContent = "-";
        }
    }
}

function brightenTheCards(cardsClass) {
    let cards = document.getElementsByClassName(cardsClass);
    for (let card of cards) {
        card.style.filter = "brightness(1.0)";
    }
}

function brightenTheCardsAgain() {
    brightenTheCards("current-player-cards");
    brightenTheCards("opponent-player-1-cards");
    brightenTheCards("opponent-player-2-cards");
}


function getCardToBeMovedId(whoPlayed, cardNumber) {
    if (OPPONENT_PLAYER_2_ID === whoPlayed) {
        return "opponent-player-2-card-" + cardNumber;
    } else if (OPPONENT_PLAYER_1_ID === whoPlayed) {
        return "opponent-player-1-card-" + cardNumber;
    } else {
        return null;
    }
}

function moveCard(whoPlayed, cardNumber, moveDir, cardToBeMovedId, cardToBeMovedNumber) {
    let thisRect = document.getElementById(cardToBeMovedId).getBoundingClientRect();
    game.currentRoundCards[whoPlayed] = {
        "cardNumber": cardNumber,
        "element_id": cardToBeMovedId,
        "transform_x": "0px",
        "transform_y": "0px",
        "rotation": getCardRotation(cardToBeMovedNumber)
    };
    game.cardsUsedInThisHand[cardToBeMovedId] = true;
    if (moveDir == "left") {
        document.getElementById(cardToBeMovedId).style.transform = "rotate(0deg) translate(-20px, 20px)";
        document.getElementById(cardToBeMovedId).style.zIndex = 4;
        for (let i = 1; i <= 5; i++) {
            let cardId = "opponent-player-2-card-" + i;
            if (cardId !== cardToBeMovedId) {
                document.getElementById(cardId).style.filter = "brightness(0.3)";
            }
        }
        game.currentRoundCards[whoPlayed]["transform_x"] = "-20px";
        game.currentRoundCards[whoPlayed]["transform_y"] = "20px";
    } else {
        document.getElementById(cardToBeMovedId).style.transform = "rotate(0deg) translate(20px, 20px)";
        document.getElementById(cardToBeMovedId).style.zIndex = 4;
        for (let i = 1; i <= 5; i++) {
            let cardId = "opponent-player-1-card-" + i;
            if (cardId !== cardToBeMovedId) {
                document.getElementById(cardId).style.filter = "brightness(0.3)";
            }
        }
        game.currentRoundCards[whoPlayed]["transform_x"] = "20px";
        game.currentRoundCards[whoPlayed]["transform_y"] = "20px";
    }
}



function makeOpponentMove(moveData) {
    let cardNumber = moveData["cardNumber"];
    let whoPlayed = moveData["playerId"];

    let cardToBeMovedNumber = floor(random(1, 6));
    let cardToBeMovedId = getCardToBeMovedId(whoPlayed, cardToBeMovedNumber);
    while (true) {
        if (cardNotPlayed(cardToBeMovedId)) {
            break;
        } else {
            cardToBeMovedNumber = floor(random(1, 6));
            cardToBeMovedId = getCardToBeMovedId(whoPlayed, cardToBeMovedNumber);
        }
    }
    if (cardToBeMovedId === null) {
        return;
    }
    if (cardToBeMovedId.includes("opponent-player-2")) {
        moveCard(whoPlayed, cardNumber, "left", cardToBeMovedId, cardToBeMovedNumber);
    } else if (cardToBeMovedId.includes("opponent-player-1")) {
        moveCard(whoPlayed, cardNumber, "right", cardToBeMovedId, cardToBeMovedNumber);
    }

}




function popUpMessage() {
    MSG_TO_VALUE = 1.0;
    MSG_FROM_VALUE = 0.0;
    MSG_ANIMATE = true;
}

function listenForMsgs() {

    if (MSG_ANIMATE) {
        document.getElementById('server-msg').style.opacity = map(MSG_TIMER, 0, MSG_DELAY, MSG_FROM_VALUE, MSG_TO_VALUE);
        MSG_TIMER += 1 / 60;
    }
    if (MSG_TIMER >= MSG_DELAY) {
        if (MSG_TO_VALUE === 0.0) {
            MSG_ANIMATE = false;
            document.getElementById("server-msg").style.opacity = 0.0;
        } else {
            MSG_TO_VALUE = 0.0;
            MSG_FROM_VALUE = 1.0;
        }
        MSG_TIMER = 0.0;
    }
}

function removeConnection() {
    document.getElementById("player1").textContent = "";
    document.getElementById("player2").textContent = "";
    document.getElementById("player3").textContent = "";
    SOCKET.emit("playerExitedLobbyMsg", {
        "isHost": PLAYER_IS_HOST,
        "playerId": PLAYER_ID,
        "lobbyCode": PLAYERS[PLAYER_ID].lobbyCode,
        "playerName": PLAYER_NAME
    });
    PLAYER_IS_HOST = false;
    PLAYERS = {
        "player1": null,
        "player2": null,
        "player3": null
    };
    GAME_IS_RUNNING = false;
    IS_ONLINE_LOBBY = false;
    if (document.getElementById("game-background").classList.contains("fadeOut")) {
        document.getElementById("game-background").classList.remove("fadeOut");
    }
    document.getElementById("game-background").classList.add("fadeIn");
    document.getElementById("game-background").style.pointerEvents = "auto";
    SOCKET.disconnect();
}


function getCardRotation(cardNumber) {
    switch (cardNumber) {
        case 1: {
            return "rotate(-30deg)";
            break;
        }
        case 2: {
            return "rotate(-15deg)";
            break;
        }
        case 3: {
            return "rotate(0deg)";
            break;
        }
        case 4: {
            return "rotate(15deg)";
        }
        case 5: {
            return "rotate(30deg)";
        }
    }
}

function cardNotPlayed(cardId) {
    if (game.cardsUsedInThisHand[cardId] === undefined) {
        return true;
    }
    return false;
}

function enablePlaying() {

    game.canIPlay = true;
    let currentPlayerCards = document.getElementsByClassName("current-player-cards");
    for (let currentPlayerCard of currentPlayerCards) {
        if (cardNotPlayed(currentPlayerCard.id)) {
            currentPlayerCard.style.pointerEvents = "auto";
            if (currentPlayerCard.classList.contains("cantHover")) {
                currentPlayerCard.classList.remove("cantHover");
            }
            currentPlayerCard.classList.add("canHover");
            currentPlayerCard.disabled = false;
        }
    }
    game.currentRoundCards = {};
}

function disablePlaying() {
    game.canIPlay = false;
    let currentPlayerCards = document.getElementsByClassName("current-player-cards");
    for (let currentPlayerCard of currentPlayerCards) {
        currentPlayerCard.style.pointerEvents = "none";
        if (currentPlayerCard.classList.contains("canHover")) {
            currentPlayerCard.classList.remove("canHover");
        }
        currentPlayerCard.classList.add("cantHover");
        currentPlayerCard.disabled = true;
    }
}



class Game {
    constructor() {
        this.numRounds = 0;
        this.handsCount = 0;
        this.currentPlayerHandsWon = 0;
        this.currentPlayerRoundsWon = 0;
        this.playersData = PLAYERS;
        this.canIPlay = true;
        this.roundStarted = true;
        this.growRoundText = true;
        this.currentRoundCards = {};
        this.currentHandWinner = "";
        this.cardsUsedInThisHand = {};
    }
    run() {
        if (this.growRoundText && frameCount % (60 * 2) == 0) {
            let numberOfRoundsText = document.getElementById("current-number-rounds");
            numberOfRoundsText.style.animationName = "growRound";
            numberOfRoundsText.style.animationDuration = "2s";
            numberOfRoundsText.style.animationFillMode = "forwards";
        }
        if (this.canIPlay) {
            let currentPlayerCards = document.getElementsByClassName("current-player-cards");
            for (let i = 0; i < currentPlayerCards.length; i++) {
                let currentPlayerCard = currentPlayerCards[i];
                let clicked = false;
                currentPlayerCard.onclick = function () {
                    selectThisCardForCurrentPlayer(this, i + 1);
                    sendCurrentMove(i + 1);
                }

            }
        }
    }
}

function selectThisCardForCurrentPlayer(card, cardNumber) {
    game.currentRoundCards[PLAYER_ID] = {
        "cardNumber": cardNumber,
        "element_id": card.id,
        "transform_x": "0px",
        "transform_y": "100px",
        "rotation": getCardRotation(cardNumber)
    };
    game.cardsUsedInThisHand[card.id] = true;
    card.style.transform = "translate(0, -100px) rotate(0deg)";
    card.style.zIndex = 4;
    card.style.pointerEvents = "none";
    let otherCards = document.getElementsByClassName("current-player-cards");
    for (let i = 0; i < otherCards.length; i++) {
        if (otherCards[i].id !== card.id) {
            otherCards[i].style.filter = "brightness(0.3)";
        }
    }
}

function sendCurrentMove(cardNumber) {
    disablePlaying();
    SOCKET.emit("movePlayedMsg", {
        "cardNumber": cardNumber,
        "playerId": PLAYER_ID,
        "cardType": PLAYER_CARD_TYPE,
        "lobbyCode": PLAYERS[PLAYER_ID].lobbyCode
    });
}