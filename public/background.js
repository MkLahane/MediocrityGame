// class Background {
//     constructor() {
//         this.centerX = width * 0.7;
//         this.centerY = height * 0.55;
//         this.centerCardW = width * 0.15;
//         this.centerCardH = height * 0.4;
//         this.cardPositions = [
//             {
//                 x: this.centerX,
//                 y: this.centerY,
//                 w: this.centerCardW,
//                 h: this.centerCardH
//             }
//         ];
//     }
//     show() {
//         // for (let cardPos of this.cardPositions) {
//         //     noFill(0);
//         //     stroke(255, 255, 255);
//         //     rectMode(CENTER);
//         //     rect(cardPos.x, cardPos.y, cardPos.w, cardPos.h, 20);
//         // }

//     }
// }
let background_startedHovering = false;
let background_stoppedHovering = false;
let background_currentlyHovering = false;
let background_initialStates = {
    "opacity": {
        "game-background-red-card-number": 0.0,
        "game-background-green-card-number": 0.0,
        "game-background-blue-card-number": 0.0,
        "game-background-green-card-status": 0.0,
        "game-background-blue-card-status": 0.0,
        "game-background-red-card-status": 0.0
    },
    "color": {
        "game-background-green-card-number": "#2EDF06",
        "game-background-blue-card-number": "#074ADA",
        "game-background-red-card-number": "#E70C0C"
    },
    "background": {
        "game-background-green-card": "#0D0C0C",
        "game-background-blue-card": "#0D0C0C",
        "game-background-red-card": "#0D0C0C"
    },
    "zIndex": {
        "game-background-green-card": 0,
        "game-background-red-card": 0,
        "game-background-blue-card": 0
    },
    "innerHTML": {
        "game-background-green-card-number": 5,
        "game-background-blue-card-number": 3,
        "game-background-red-card-number": 4
    }
};
let background_animationData = [
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-red-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-green-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-blue-card-number",
        "duration": 0.3
    },
    {
        "value": "particles",
        "type": "blue",
        "to": 100
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-blue-card-status",
        "duration": 0.2
    },
    {
        "from": "#074ADA",
        "to": "white",
        "value": "color",
        "of": "game-background-blue-card-number"
    },
    {
        "from": "#0D0C0C",
        "to": "#074ADA",
        "value": "background",
        "of": "game-background-blue-card"
    },
    {
        "value": "zindex",
        "to": 1,
        "of": "game-background-blue-card"
    },
    {
        "value": "pause",
        "duration": 1.0
    },
    {
        "value": "particles",
        "type": "blue",
        "to": 30
    },
    {
        "value": "zindex",
        "to": 0,
        "of": "game-background-blue-card"
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-blue-card-status",
        "duration": 0.2
    },
    {
        "from": "#074ADA",
        "to": "#0D0C0C",
        "value": "background",
        "of": "game-background-blue-card"
    },
    {
        "from": "white",
        "to": "#074ADA",
        "value": "color",
        "of": "game-background-blue-card-number"
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-blue-card-number",
        "duration": 0.3
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-green-card-number",
        "duration": 0.3
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-red-card-number",
        "duration": 0.3
    },
    {
        "value": "pause",
        "duration": 0.3
    },
    {
        "value": "innerHTML",
        "to": "4",
        "of": "game-background-red-card-number"
    },
    {
        "value": "innerHTML",
        "to": "4",
        "of": "game-background-green-card-number"
    },
    {
        "value": "innerHTML",
        "to": "4",
        "of": "game-background-blue-card-number"
    },
    {
        "value": "pause",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-red-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-green-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-blue-card-number",
        "duration": 0.3
    },
    {
        "to": 100,
        "value": "particles",
        "type": "green"
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-green-card-status",
        "duration": 0.2
    },
    {
        "from": "#2EDF06",
        "to": "white",
        "value": "color",
        "of": "game-background-green-card-number"
    },
    {
        "from": "#0D0C0C",
        "to": "#2EDF06",
        "value": "background",
        "of": "game-background-green-card"
    },
    {
        "value": "pause",
        "duration": 1.0
    },
    {
        "to": 30,
        "value": "particles",
        "type": "green"
    },
    {
        "value": "zindex",
        "to": 0,
        "of": "game-background-green-card"
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-green-card-status",
        "duration": 0.2
    },
    {
        "from": "#074ADA",
        "to": "#0D0C0C",
        "value": "background",
        "of": "game-background-green-card"
    },
    {
        "from": "white",
        "to": "#2EDF06",
        "value": "color",
        "of": "game-background-green-card-number"
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-blue-card-number",
        "duration": 0.3
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-green-card-number",
        "duration": 0.3
    },
    {
        "from": 1.0,
        "to": 0.0,
        "value": "opacity",
        "of": "game-background-red-card-number",
        "duration": 0.3
    },
    {
        "value": "pause",
        "duration": 0.3
    },
    {
        "value": "innerHTML",
        "to": "2",
        "of": "game-background-red-card-number"
    },
    {
        "value": "innerHTML",
        "to": "1",
        "of": "game-background-green-card-number"
    },
    {
        "value": "innerHTML",
        "to": "2",
        "of": "game-background-blue-card-number"
    },
    {
        "value": "pause",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-red-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-green-card-number",
        "duration": 0.3
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-blue-card-number",
        "duration": 0.3
    },
    {
        "to": 100,
        "value": "particles",
        "type": "red"
    },
    {
        "from": 0.0,
        "to": 1.0,
        "value": "opacity",
        "of": "game-background-red-card-status",
        "duration": 0.2
    },
    {
        "from": "#E70C0C",
        "to": "white",
        "value": "color",
        "of": "game-background-red-card-number"
    },
    {
        "from": "#0D0C0C",
        "to": "#E70C0C",
        "value": "background",
        "of": "game-background-red-card"
    },
    {
        "value": "zindex",
        "to": 1,
        "of": "game-background-red-card"
    }
];
function backgroundSetup() {
    //make backgroundParticles 
    let types = ["red", "green", "blue"]; //for particles 
    for (let i = 0; i < 500; i++) {
        background_particles.push(new Particle(random(width), random(height), types[floor(random(0, types.length))]));
    }
    document.getElementById("game-background").onmouseover = function () {
        if (CURRENT_MAIN_MENU_STATE !== 'customlobby' && CURRENT_MAIN_MENU_STATE !== "game" &&
            CURRENT_MAIN_MENU_STATE !== 'onlinelobby') {
            background_startedHovering = true;
            background_stoppedHovering = false;
            background_currentlyHovering = true;
        } else {
            background_startedHovering = false;
            background_stoppedHovering = true;
            background_currentlyHovering = false;
        }

    }
    document.getElementById("game-background").onmouseout = function () {
        background_startedHovering = false;
        background_stoppedHovering = true;
        background_currentlyHovering = false;
        for (let value in background_initialStates) {
            for (let element in background_initialStates[value]) {
                // if (value == "opacity") {
                //     document.getElementById(element).style["opacity"] = background_initialStates[value][element];
                // } else if (value == "background") {
                //     document.getElementById(element).style.background = background_initialStates[value][element];
                // } else if (value == "color") {
                //     document.getElementById(element).style.color = background_initialStates[value][element];
                // }
                if (value !== "innerHTML") {
                    document.getElementById(element).style[value] = background_initialStates[value][element];
                } else {
                    document.getElementById(element).innerHTML = background_initialStates[value][element];
                }
            }
        }
        for (let particle of background_particles) {
            particle.opacity = 30;
        }
    }

}


let currentAnimationIndex = 0;
let currentTime = 0;
let currentValue;
let currentFrom;
let currentTo;
let currentDuration;
let currentOf;
let background_particles = [];
function backgroundTransition() {
    //renderParticles 
    for (let particle of background_particles) {
        particle.show();
        particle.update();
    }
    if (background_startedHovering) {
        currentAnimationIndex = 0;
        currentTime = 0;
        currentValue = background_animationData[currentAnimationIndex].value;
        currentFrom = background_animationData[currentAnimationIndex].from;
        currentTo = background_animationData[currentAnimationIndex].to;
        currentDuration = background_animationData[currentAnimationIndex].duration;
        currentOf = background_animationData[currentAnimationIndex].of;
        background_startedHovering = false;
    }
    if (background_currentlyHovering) {
        animate(currentValue, currentFrom, currentTo, currentDuration, currentOf);
    }

}

function lerpOpacity(from, to, duration, ofId) {
    let newOpacity = map(currentTime, 0, duration, from, to);
    if (currentTime <= currentDuration) {
        document.getElementById(ofId);
        document.getElementById(ofId).style.opacity = newOpacity;
    } else {
        document.getElementById(ofId).style.opacity = to;
        goToNextAnimation();
    }
}

function goToNextAnimation() {
    if (currentAnimationIndex < background_animationData.length - 1) {
        currentAnimationIndex++;
        currentTime = 0;
        currentValue = background_animationData[currentAnimationIndex].value;
        currentFrom = background_animationData[currentAnimationIndex].from;
        currentTo = background_animationData[currentAnimationIndex].to;
        currentDuration = background_animationData[currentAnimationIndex].duration;
        currentOf = background_animationData[currentAnimationIndex].of;
    }
}

function pauseAnimation() {
    if (currentTime >= currentDuration) {
        goToNextAnimation();
    }
}

function animate(value, from, to, duration, ofId) {
    switch (value) {
        case "opacity": {
            lerpOpacity(from, to, duration, ofId);
            break;
        }
        case "background": {
            document.getElementById(ofId).style.background = to;
            goToNextAnimation();
            break;
        }
        case "color": {
            document.getElementById(ofId).style.color = to;
            goToNextAnimation();
            break;
        }
        case "pause": {
            pauseAnimation();
            break;
        }
        case "innerHTML": {
            document.getElementById(ofId).innerHTML = to;
            goToNextAnimation();
            break;
        }
        case "zindex": {
            document.getElementById(ofId).style.zIndex = to;
        }
        case "particles": {
            let type = background_animationData[currentAnimationIndex].type;
            for (let particle of background_particles) {
                if (particle.type == type) {
                    particle.opacity = background_animationData[currentAnimationIndex].to;
                }
            }
            goToNextAnimation();
            break;
        }
        default: {
            goToNextAnimation();
            break;
        }
    }
    currentTime += 1 / 60;
    //console.log(currentTime);
}


