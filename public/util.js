function isLobbyFull() {
    for (let player in PLAYERS) {
        if (PLAYERS[player] === null) {
            return false;
        }
    }
    return true;
}

function getPlayersInLobbyCount(lobbyCode) {
    let count = 0;
    for (let player in PLAYERS) {
        if (PLAYERS[player] != null) {
            count++;
        }
    }
    return count;
}