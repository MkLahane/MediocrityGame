function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getLobbyCode(lobbies) {
    console.log(lobbies);
    while (true) {
        let str = "";
        for (let i = 0; i < 5; i++) {
            let numberCode = getRandomIntInclusive(48, 57);
            let letterCode = getRandomIntInclusive(65, 90);
            let ch = String.fromCharCode(numberCode);
            if (Math.random() < 0.5) {
                ch = String.fromCharCode(letterCode);
            }
            str += ch;
        }
        if (!lobbies[str]) {
            return str;
        }
    }
}

exports.getLobbyCode = getLobbyCode;
exports.getRandomIntInclusive = getRandomIntInclusive;