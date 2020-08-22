"use strict";
const serverUtil = require("./server-util");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port);
app.use(express.static('public'));
console.log("Server is listening at port 3000");

const socket = require('socket.io');

const io = socket(server);

const MAX_ROUNDS = 5;
const MAX_CARDS_FOR_HAND = 3;
const MAX_CARDS_FOR_ROUND = 15;


io.sockets.on('connection', newConnection);




function getPlayerCardType(playerStr) {
    if (playerStr === "player1") {
        return "red";
    } else if (playerStr === "player2") {
        return "green";
    } else {
        return "blue";
    }
}

function getEmptyPlayer(lobbyCode, playerName, playerId, isHost) {
    while (true) {
        let playerIndex = serverUtil.getRandomIntInclusive(1, 3);
        let playerStr = "player" + playerIndex;
        if (game_lobbies["customLobbies"][lobbyCode]["players"][playerStr] === null) {
            let playerCardType = getPlayerCardType(playerStr);
            game_lobbies["customLobbies"][lobbyCode]["players"][playerStr] = {
                "playerName": playerName,
                "playerId": playerId,
                "playerCardType": playerCardType,
                "isHost": isHost,
                "lobbyCode": lobbyCode,
                "cardsPlayed": [false, false, false, false, false],
                "handsWon": 0,
                "roundsWon": 0,
                "isNotInGame": true
            };
            return {
                "playerGameId": playerStr,
                "playerCardType": playerCardType
            };
        }
    }
}

function isThisLobbyFull(lobbyCode) {
    for (let player in game_lobbies["customLobbies"][lobbyCode]["players"]) {
        if (game_lobbies["customLobbies"][lobbyCode]["players"][player] === null) {
            return false;
        }
    }
    return true;
}

function isThisLobbyEmtpy(lobbyCode) {
    for (let player in game_lobbies["customLobbies"][lobbyCode]["players"]) {
        if (game_lobbies["customLobbies"][lobbyCode]["players"][player] !== null) {
            return false;
        }
    }
    return true;
}

function joinOnGoingGame(lobbyCode, playerName, connection) {
    console.log("Joining on going game!!!!!!!!!!!!!");
    for (let player in game_lobbies["customLobbies"][lobbyCode]["players"]) {
        if (!game_lobbies["customLobbies"][lobbyCode]["players"][player]["isNotInGame"]) {
            let playerData = {
                "playerName": playerName,
                "playerId": connection.id,
                "playerCardType": game_lobbies["customLobbies"][lobbyCode]["players"][player]["playerCardType"],
                "isHost": false,
                "lobbyCode": lobbyCode,
                "cardsPlayed": game_lobbies["customLobbies"][lobbyCode]["players"][player]["cardsPlayed"],
                "handsWon": game_lobbies["customLobbies"][lobbyCode]["players"][player]["handsWon"],
                "roundsWon": game_lobbies["customLobbies"][lobbyCode]["players"][player]["roundsWon"],
                "isNotInGame": true
            };

            game_lobbies["customLobbies"][lobbyCode]["players"][player] = playerData;
            connection.join(lobbyCode);
            connections_data[connection.id] = {
                "playerId": player,
                "playerName": playerName,
                "playerCardType": playerData["playerCardType"],
                "isHost": false,
                "lobbyCode": lobbyCode
            };
            console.log(playerData);
            connection.emit("joiningOnGoingGameMsg", {
                "myPlayerId": player,
                "myPlayerName": playerName,
                "players": game_lobbies["customLobbies"][lobbyCode]["players"],
                "cardsPlayedInThisHand": game_lobbies["customLobbies"][lobbyCode]["cardsPlayedInThisHand"],
                "roundNumber": (MAX_ROUNDS - game_lobbies["customLobbies"][lobbyCode]["roundsRemaining"]) + 1
            });
            io.sockets.to(lobbyCode).emit("joinedOnGoingGameMsg", {
                "playerId": player,
                "playerData": playerData,
                "cardsPlayedInThisHand": game_lobbies["customLobbies"][lobbyCode]["cardsPlayedInThisHand"]
            });
            connection.emit("getMessages", game_lobbies["customLobbies"][lobbyCode]["messages"]);
            break;
        }
    }
}

function joinCustomLobby(data, connection) {
    console.log("Joining!!!!!!!!!!!!!!!!");

    let joiningCode = data.joiningCode;
    if (!game_lobbies["customLobbies"][joiningCode]) {
        connection.emit("errorMsg", "This lobby does not exist!");
        return;
        //connection.disconnect();
    } else {
        if (game_lobbies["customLobbies"][joiningCode]["gameIsRunning"]) {
            if (game_lobbies["customLobbies"][joiningCode]["playersInGame"] < 3) {
                joinOnGoingGame(joiningCode, data.playerName, connection);
                game_lobbies["customLobbies"][joiningCode]["playersInGame"]++;
            } else {
                connection.emit("errorMsg", "This lobby is full!");
                return;
            }
        } else {
            if (isThisLobbyFull(joiningCode)) {
                connection.emit("errorMsg", "This lobby is full!");
                return;
            }
            connection.join(joiningCode);
            // if (game_lobbies["customLobbies"][joiningCode]["gameIsRunning"]) {
            //     playerSetupData["gameIsRunning"] = true;
            // }
            let playerGameData = getEmptyPlayer(joiningCode, data.playerName, connection.id, false);
            let playerSetupData = {
                "lobbyCode": joiningCode,
                "playerName": data.playerName,
                "playerId": playerGameData["playerGameId"],
                "playerCardType": playerGameData["playerCardType"],
                "isHost": false
            }
            connection.emit("playerSetupMsg", playerSetupData);
            connections_data[connection.id] = {
                "playerId": playerGameData["playerGameId"],
                "playerName": data.playerName,
                "playerCardType": playerGameData["playerCardType"],
                "isHost": false,
                "lobbyCode": joiningCode
            };

            connection.emit("getMessages", game_lobbies["customLobbies"][joiningCode]["messages"]);
            io.sockets.to(joiningCode).emit("newPlayerJoinedMsg", game_lobbies["customLobbies"][joiningCode]);
            io.sockets.to(data.lobbyCode).emit("errorMsg", data.playerName + " joined the lobby");
        }
    }
}

function createLobby(lobbyCode, isOnline) {
    game_lobbies["customLobbies"][lobbyCode] = {
        "players": {},
        "roundsRemaining": MAX_ROUNDS,
        "cardsRemainingForThisHand": MAX_CARDS_FOR_HAND,
        "cardsRemainingForThisRound": 15,
        "cardsPlayedInThisHand": {},
        "gameIsRunning": false,
        "playersInGame": 0,
        "isOnlineLobby": isOnline,
        "messages": []
    };

}

function makeLobby(lobbyData, connection, isOnlineLobby) { //for custom lobby 
    let lobbyCode = serverUtil.getLobbyCode(game_lobbies["customLobbies"]);
    createLobby(lobbyCode, isOnlineLobby);
    game_lobbies["customLobbies"][lobbyCode]["players"] = {
        "player1": null,
        "player2": null,
        "player3": null
    };
    connection.join(lobbyCode);
    let playerGameData = getEmptyPlayer(lobbyCode, lobbyData.playerName, connection.id, true);
    connection.emit("playerSetupMsg", {
        "lobbyCode": lobbyCode,
        "playerName": lobbyData.playerName,
        "playerId": playerGameData["playerGameId"],
        "playerCardType": playerGameData["playerCardType"],
        "isHost": true
    });
    connections_data[connection.id] = {
        "playerId": playerGameData["playerGameId"],
        "playerName": lobbyData.playerName,
        "playerCardType": playerGameData["playerCardType"],
        "isHost": true,
        "lobbyCode": lobbyCode
    };
    connection.emit("getMessages", game_lobbies["customLobbies"][lobbyCode]["messages"]);
}


function exitLobby(data, connection) {
    //console.log(data);
    if (data === null || data === undefined || game_lobbies["customLobbies"][data.lobbyCode] === undefined) {
        return;
    }
    io.sockets.to(data.lobbyCode).emit("errorMsg", data.playerName + " left the lobby");
    connection.emit("errorMsg", data.playerName + " left lobby");
    if (game_lobbies["customLobbies"][data.lobbyCode]["gameIsRunning"]) {
        game_lobbies["customLobbies"][data.lobbyCode]["playersInGame"]--;
        if (game_lobbies["customLobbies"][data.lobbyCode]["playersInGame"] === 0) {
            for (let player in game_lobbies["customLobbies"][data.lobbyCode]["players"]) {
                game_lobbies["customLobbies"][data.lobbyCode]["players"][player] = null;
            }
            game_lobbies["customLobbies"][data.lobbyCode]["gameIsRunning"] = false;
            console.log(":::::::::DELETE LOBBY:::::::::::::");
            delete game_lobbies["customLobbies"][data.lobbyCode];
            return;
        } else {
            console.log("GAME IS RUNNING SO I WILL NOT CLEAR THE DATA!!!!!");
            console.log(game_lobbies["customLobbies"][data.lobbyCode]["players"]);
            game_lobbies["customLobbies"][data.lobbyCode]["players"][data.playerId]["isNotInGame"] = false;
            // console.log(game_lobbies["customLobbies"][data.lobbyCode]["inGameData"]);
            console.log("Player that left:");
            // console.log(game_lobbies["customLobbies"][data.lobbyCode]["players"][data.playerId]);
            console.log(game_lobbies["customLobbies"]);
            console.log("Players in game:" + game_lobbies["customLobbies"][data.lobbyCode]["playersInGame"]);
        }
    } else {
        game_lobbies["customLobbies"][data.lobbyCode]["players"][data.playerId] = null;
    }
    delete connections_data[connection.id];
    connection.leave(data.lobbyCode);
    if (getPlayersInLobbyCount(data.lobbyCode) <= 0) {
        console.log(":::::::::DELETE LOBBY:::::::::::::");
        delete game_lobbies["customLobbies"][data.lobbyCode];
    } else {
        if (data.isHost) {
            console.log("host left the game!!!");
            //host left: 
            //console.log(game_lobbies["customLobbies"][data.lobbyCode]["players"]);
            if (getPlayersInLobbyCount(data.lobbyCode) > 0) { //if lobby not empty 
                let newHostPlayerId = "";
                for (let player in game_lobbies["customLobbies"][data.lobbyCode]["players"]) {
                    if (game_lobbies["customLobbies"][data.lobbyCode]["players"][player] !== null) {
                        newHostPlayerId = player;
                        game_lobbies["customLobbies"][data.lobbyCode]["players"][player].isHost = true;
                        break;
                    }
                }
                io.sockets.to(data.lobbyCode).emit("playerExitedLobbyMsg", {
                    "playerExitedId": data.playerId,
                    "newHostPlayerId": newHostPlayerId
                });

            }
        }
        else {
            io.sockets.to(data.lobbyCode).emit("playerExitedLobbyMsg", {
                "playerExitedId": data.playerId,
                "newHostPlayerId": null
            });
        }
    }
}

/// Red < Green < Blue 
function checkWinner(redCard, greenCard, blueCard) {
    if (greenCard["cardNumber"] === blueCard["cardNumber"] && blueCard["cardNumber"] === redCard["cardNumber"]) { //if all are equal 
        return greenCard["moveBy"];
    } else {
        if (blueCard["cardNumber"] === greenCard["cardNumber"]) {
            if (redCard["cardNumber"] < blueCard["cardNumber"]) {
                return greenCard["moveBy"];
            } else {
                return blueCard["moveBy"];
            }
        } else if (blueCard["cardNumber"] === redCard["cardNumber"]) {
            if (greenCard["cardNumber"] < blueCard["cardNumber"]) {
                return redCard["moveBy"];
            } else {
                return blueCard["moveBy"];
            }
        } else if (greenCard["cardNumber"] === redCard["cardNumber"]) {
            if (blueCard["cardNumber"] < greenCard["cardNumber"]) {
                return redCard["moveBy"];
            } else {
                return greenCard["moveBy"];
            }
        } else {
            if ((redCard["cardNumber"] > blueCard["cardNumber"] && //red Winner possiblity 
                redCard["cardNumber"] < greenCard["cardNumber"]) ||
                (redCard["cardNumber"] < blueCard["cardNumber"] &&
                    redCard["cardNumber"] > greenCard["cardNumber"])) {
                return redCard["moveBy"];
            } else if ((blueCard["cardNumber"] > redCard["cardNumber"] && //blue winner possiblity 
                blueCard["cardNumber"] < greenCard["cardNumber"]) ||
                (blueCard["cardNumber"] < redCard["cardNumber"] &&
                    blueCard["cardNumber"] > greenCard["cardNumber"])) {
                return blueCard["moveBy"];
            } else if ((greenCard["cardNumber"] > redCard["cardNumber"] && //green  winner possiblity 
                greenCard["cardNumber"] < blueCard["cardNumber"]) ||
                (greenCard["cardNumber"] < redCard["cardNumber"] &&
                    greenCard["cardNumber"] > blueCard["cardNumber"])) {
                return greenCard["moveBy"];
            }
        }
    }
}

function checkHandWinner(lobbyCode) {
    let cardsPlayedInThisHand = game_lobbies["customLobbies"][lobbyCode]["cardsPlayedInThisHand"];
    let greenCard = cardsPlayedInThisHand["green"];
    let blueCard = cardsPlayedInThisHand["blue"];
    let redCard = cardsPlayedInThisHand["red"];
    return checkWinner(redCard, greenCard, blueCard);
}

function checkRoundWinner(lobbyCode) {
    let players = game_lobbies["customLobbies"][lobbyCode]["players"];
    let greenCard = {
        "moveBy": "player2",
        "cardNumber": players["player2"]["handsWon"]
    };
    let blueCard = {
        "moveBy": "player3",
        "cardNumber": players["player3"]["handsWon"]
    };
    let redCard = {
        "moveBy": "player1",
        "cardNumber": players["player1"]["handsWon"]
    };
    return checkWinner(redCard, greenCard, blueCard);
}

function checkGameWinner(lobbyCode) {
    let players = game_lobbies["customLobbies"][lobbyCode]["players"];
    let greenCard = {
        "moveBy": "player2",
        "cardNumber": players["player2"]["roundsWon"]
    };
    let blueCard = {
        "moveBy": "player3",
        "cardNumber": players["player3"]["roundsWon"]
    };
    let redCard = {
        "moveBy": "player1",
        "cardNumber": players["player1"]["roundsWon"]
    };
    console.log("GAME WINNER!!");
    console.log(redCard);
    console.log(greenCard);
    console.log(blueCard);
    return checkWinner(redCard, greenCard, blueCard);
}

function getPlayersInLobbyCount(lobbyCode) {
    let count = 0;
    for (let player in game_lobbies["customLobbies"][lobbyCode]["players"]) {
        if (game_lobbies["customLobbies"][lobbyCode]["players"][player] &&
            game_lobbies["customLobbies"][lobbyCode]["players"][player] !== null) {
            count++;
        }
    }
    return count;
}

function joinOnlineLobby(playerData, connection) { //for online lobby 
    for (let lobbyCode in game_lobbies["customLobbies"]) {
        if (game_lobbies["customLobbies"][lobbyCode]["isOnlineLobby"] &&
            !game_lobbies["customLobbies"][lobbyCode]["gameIsRunning"]) {
            let playersInLobby = getPlayersInLobbyCount(lobbyCode);
            if (playersInLobby < 3) {
                let joiningData = {
                    "joiningCode": lobbyCode,
                    "playerName": playerData["playerName"]
                };
                joinCustomLobby(joiningData, connection);
                console.log("joined online lobby");
                return;
            }
        }
    }
    makeLobby(playerData, connection, true);
    console.log(game_lobbies);
}


let game_lobbies = {
    "customLobbies": {}
};
let connections_data = {};

function newConnection(connection) {
    //console.log(connection.id);

    connection.on("connected", data => {
        if (data["lobby"] === "onlinelobby") {
            console.log("Connecting to Online Lobby!!!!!!!!");
            joinOnlineLobby(data, connection);
        } else {
            console.log("Connecting to Custom Lobby!!!!!!!!!!!");
            if (data.isJoining) {
                joinCustomLobby(data, connection);
            } else {
                makeLobby(data, connection, false);
            }
        }

        //console.log(game_lobbies);

    });
    connection.on("playerExitedLobbyMsg", data => {
        exitLobby(data, connection);
    })

    connection.on("disconnect", () => {
        exitLobby(connections_data[connection.id], connection);
        console.log("Disconnected");
    });
    connection.on("launchGameMsg", data => {
        game_lobbies["customLobbies"][data.lobbyCode]["gameIsRunning"] = true;
        game_lobbies["customLobbies"][data.lobbyCode]["playersInGame"] = 3;
        for (let player in game_lobbies["customLobbies"][data.lobbyCode]["players"]) {
            game_lobbies["customLobbies"][data.lobbyCode]["players"][player]["isNotInGame"] = true;
        }
        io.sockets.to(data.lobbyCode).emit("launchGameMsg", "Launch Game!");
    });
    connection.on("movePlayedMsg", moveData => {
        game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsPlayedInThisHand"][moveData["cardType"]] = {
            "moveBy": moveData["playerId"],
            "cardNumber": parseInt(moveData["cardNumber"]),
        };
        game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisHand"]--;
        game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisRound"]--;
        io.sockets.to(moveData["lobbyCode"]).emit("movePlayedMsg", moveData);
        if (game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisHand"] === 0) { //hand Win 
            let winnerOfThisHand = checkHandWinner(moveData["lobbyCode"]);

            //store the cards that have been used in this hand for every player 
            for (let cardColor in game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsPlayedInThisHand"]) {
                let whoPlayed = game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsPlayedInThisHand"][cardColor]["moveBy"];
                let moveCardNumber = game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsPlayedInThisHand"][cardColor]["cardNumber"];
                game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][whoPlayed]["cardsPlayed"][moveCardNumber - 1] = true;
            }

            game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisHand"] = MAX_CARDS_FOR_HAND;
            game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsPlayedInThisHand"] = {};
            game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][winnerOfThisHand]["handsWon"]++;

            io.sockets.to(moveData["lobbyCode"]).emit("handWinnerMsg", {
                "winnerId": winnerOfThisHand,
                "winnerData": game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][winnerOfThisHand]
            });
        }
        if (game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisRound"] === 0) { //round Win 
            game_lobbies["customLobbies"][moveData["lobbyCode"]]["roundsRemaining"]--;
            console.log("Round completed!!!!!!!!!!!!");
            console.log("Rounds Remaining for " + moveData["lobbyCode"] + ": " + game_lobbies["customLobbies"][moveData["lobbyCode"]]["roundsRemaining"])
            for (let player in game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"]) {
                game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][player]["cardsPlayed"] = [false,
                    false, false, false, false];
            }
            let roundWinnerId = checkRoundWinner(moveData["lobbyCode"]);
            game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][roundWinnerId]["roundsWon"]++;

            let roundWinnerData = {
                "winnerId": roundWinnerId,
                "roundsWon": game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][roundWinnerId]["roundsWon"],
                "gameOver": false,
                "gameWinnerId": null
            };
            if (game_lobbies["customLobbies"][moveData["lobbyCode"]]["roundsRemaining"] > 0) {
                for (let player in game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"]) {
                    game_lobbies["customLobbies"][moveData["lobbyCode"]]["players"][player]["handsWon"] = 0;
                }
                game_lobbies["customLobbies"][moveData["lobbyCode"]]["cardsRemainingForThisRound"] = MAX_CARDS_FOR_ROUND;
                io.sockets.to(moveData["lobbyCode"]).emit("roundWinnerMsg", roundWinnerData);
            } else {
                let gameWinnerId = checkGameWinner(moveData["lobbyCode"]);
                roundWinnerData["gameWinnerId"] = gameWinnerId;
                console.log(gameWinnerId + " won the game!!!");
                roundWinnerData["gameOver"] = true;
                io.sockets.to(moveData["lobbyCode"]).emit("roundWinnerMsg", roundWinnerData);
            }
        }
    });
    connection.on("hostRestartedGameMsg", restartedPlayerData => {
        let lobbyCode = restartedPlayerData["lobbyCode"];
        // let playerName = restartedPlayerData["playerName"];
        let restartedPlayerId = restartedPlayerData["playerId"];
        let prevOpp1Id = restartedPlayerData["opp1Id"];
        let prevOpp2Id = restartedPlayerData["opp2Id"];
        let prevHostData = game_lobbies["customLobbies"][lobbyCode]["players"][restartedPlayerId];
        let prevOpp1Data = game_lobbies["customLobbies"][lobbyCode]["players"][prevOpp1Id];
        let prevOpp2Data = game_lobbies["customLobbies"][lobbyCode]["players"][prevOpp2Id];
        // let playerCardType = getPlayerCardType(playerId);
        // let isHost = restartedPlayerData["isHost"];
        game_lobbies["customLobbies"][lobbyCode]["players"][restartedPlayerId]["handsWon"] = 0;
        game_lobbies["customLobbies"][lobbyCode]["players"][restartedPlayerId]["roundsWon"] = 0;

        game_lobbies["customLobbies"][lobbyCode]["roundsRemaining"] = MAX_ROUNDS;
        game_lobbies["customLobbies"][lobbyCode]["cardsRemainingForThisHand"] = MAX_CARDS_FOR_HAND;
        game_lobbies["customLobbies"][lobbyCode]["cardsRemainingForThisRound"] = MAX_CARDS_FOR_ROUND;
        game_lobbies["customLobbies"][lobbyCode]["cardsPlayedInThisHand"] = {};
        game_lobbies["customLobbies"][lobbyCode]["gameIsRunning"] = false;
        game_lobbies["customLobbies"][lobbyCode]["messages"] = [];
        for (let player in game_lobbies["customLobbies"][lobbyCode]["players"]) {
            game_lobbies["customLobbies"][lobbyCode]["players"][player]["handsWon"] = 0;
            game_lobbies["customLobbies"][lobbyCode]["players"][player]["roundsWon"] = 0;
            game_lobbies["customLobbies"][lobbyCode]["players"][player]["cardsPlayed"] = [false, false, false, false, false];
        }
        let newHostId = getRandomId();
        let newOpp1Id = "";
        let newOpp2Id = "";
        if (newHostId === "player1") {
            newOpp1Id = "player2";
            newOpp2Id = "player3";
        } else if (newHostId === "player2") {
            newOpp1Id = "player1";
            newOpp2Id = "player3";
        } else {
            newOpp1Id = "player1";
            newOpp2Id = "player2";
        }
        let restartedData = {
            "prevHostId": restartedPlayerId,
            "prevOpp1Id": prevOpp1Id,
            "prevOpp2Id": prevOpp2Id,
            "newHostId": newHostId,
            "newOpp1Id": newOpp1Id,
            "newOpp2Id": newOpp2Id
        };
        game_lobbies["customLobbies"][lobbyCode]["players"][newHostId] = prevHostData;
        game_lobbies["customLobbies"][lobbyCode]["players"][newOpp1Id] = prevOpp1Data;
        game_lobbies["customLobbies"][lobbyCode]["players"][newOpp2Id] = prevOpp2Data;
        // connection.emit("newHostIdMsg", restartedData)
        io.sockets.to(lobbyCode).emit("playersComebackToLobbyMsg", {
            "restartedData": restartedData,
            "newPlayersData": game_lobbies["customLobbies"][lobbyCode]["players"]
        });
    });
    connection.on("sendMessage", messageData => {
        let lobbyCode = messageData["lobbyCode"];
        game_lobbies["customLobbies"][lobbyCode]["messages"].push(messageData);
        io.sockets.to(lobbyCode).emit("sendSentMessage", messageData);
        console.log("got Message:");
        console.log(messageData);
    });


}


function getRandomId() {
    let rIndex = serverUtil.getRandomIntInclusive(0, 2);
    if (rIndex === 0) {
        return "player1";
    } else if (rIndex === 1) {
        return "player2";
    } else {
        return "player3";
    }
}

