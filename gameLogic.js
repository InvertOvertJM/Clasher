let player = { health: 100, light: 10 }; // player's stats (health and light)
let cpu = { health: 100, light: 10 }; // cpu's stats (health and light)
let gameLocked = false; // prevents further actions once the game is over
let cpuChosenMove = null; // the move the cpu will choose

// define available moves (with animations for both player and cpu)
const moves = [
    { name: "Power Strike", cost: 5, minRoll: 3, maxRoll: 6, damage: 20, type: "attack", playerAnimation: "power-strike-animation.gif", cpuAnimation: "cpu-power-strike.gif" },
    { name: "Quick Slash", cost: 3, minRoll: 2, maxRoll: 8, damage: 10, type: "attack", playerAnimation: "quick-slash-animation.gif", cpuAnimation: "cpu-quick-slash-animation.gif" },
    { name: "Defensive Stance", cost: 4, minRoll: 3, maxRoll: 8, damage: 0, type: "passive", playerAnimation: "defensive-stance-animation.gif", cpuAnimation: "cpu-dodge-animation.gif" },
    { name: "Heal", cost: 8, minRoll: 4, maxRoll: 6, damage: -20, type: "healing", playerAnimation: "player-heal-animation.gif", cpuAnimation: "cpu-heal-animation.gif" },
    { name: "Blitz", cost: 15, minRoll: 1, maxRoll: 10, damage: 40, type: "attack", playerAnimation: "blitz.gif", cpuAnimation: "cpu-blitz.gif" },
    { name: "Perfect Dodge", cost: 10, minRoll: 7, maxRoll: 10, damage: 0, type: "passive", playerAnimation: "defensive-stance-animation.gif", cpuAnimation: "cpu-dodge-animation.gif" }
];

const playerMovesContainer = document.getElementById("player-moves"); // container to display the player's moves
const cpuMoveContainer = document.getElementById("cpu-move"); // container to display the cpu's move
const logContainer = document.getElementById("log"); // container to display the battle log

// generate buttons for the player's available moves
function generateMoveButtons() {
    if (gameLocked) return; // prevents further actions if the game is locked

    playerMovesContainer.innerHTML = ""; // clear any existing buttons
    moves.forEach((move, index) => {
        const btn = document.createElement("button");
        btn.innerHTML = `${move.name} (Cost: ${move.cost})<br>Roll: ${move.minRoll}-${move.maxRoll}<br>Damage: ${move.damage}`;
        btn.onclick = () => playTurn(index); // attach a click event to play the turn
        playerMovesContainer.appendChild(btn);
    });
}

// cpu chooses a move based on available light
function cpuChooseMove() {
    if (gameLocked) return; // prevents cpu move if the game is locked

    const availableMoves = moves.filter(move => cpu.light >= move.cost); // filter moves based on light cost

    if (availableMoves.length === 0) {
        cpu.light += 6; // if no moves available, regenerate light and try again
        cpuChooseMove();
        return;
    }

    //flash animation
    cpuMoveContainer.classList.add("flash");

    // 1 second duration
    setTimeout(() => {
        cpuMoveContainer.classList.remove("flash");
    }, 1000); // Removes the flash class after the animation is complete

    // randomly choose a move from the available options
    cpuChosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    cpuMoveContainer.innerHTML = `CPU chose: ${cpuChosenMove.name}<br>Cost: ${cpuChosenMove.cost}<br>Roll: ${cpuChosenMove.minRoll}-${cpuChosenMove.maxRoll}<br>Damage: ${cpuChosenMove.damage}`;
}

// main function to handle the player's turn
function playTurn(playerMoveIndex) {
    if (gameLocked) return; // prevents play if the game is locked

    const playerMove = moves[playerMoveIndex]; // get the player's selected move

    // check if the player has enough light for the chosen move
    if (player.light < playerMove.cost) {
        log("Not enough Light!"); // display an error if not enough light
        return;
    }

    player.light -= playerMove.cost; // deduct light for the move

    let playerRoll, cpuRoll;
    do {
        playerRoll = roll(playerMove.minRoll, playerMove.maxRoll); // roll the player's dice
        cpuRoll = roll(cpuChosenMove.minRoll, cpuChosenMove.maxRoll); // roll the cpu's dice
    } while (playerRoll === cpuRoll); // if rolls tie, reroll

    log(`Player used ${playerMove.name} and rolled ${playerRoll}`); // log player's action
    log(`CPU used ${cpuChosenMove.name} and rolled ${cpuRoll}`); // log cpu's action

    setBattleAnimation(playerMove.playerAnimation); // set the player's animation before resolving the outcome

    let playerWon = false;

    // compare rolls to determine who wins
    if (playerRoll > cpuRoll) {
        handleMoveEffect(playerMove, player, cpu); // player wins and deals damage
        playerWon = true; // set flag indicating the player won
    } else {
        handleMoveEffect(cpuChosenMove, cpu, player); // cpu wins and deals damage
    }

    // play the animation based on who won
    if (playerWon) {
        setBattleAnimation(playerMove.playerAnimation); // play player’s animation if they won
    } else {
        setBattleAnimation(cpuChosenMove.cpuAnimation); // play cpu’s animation if it won
    }

    // both player and cpu regenerate light
    player.light += 2; 
    cpu.light += 2;

    updateUI(); // update the ui to reflect health and light
    checkGameOver(); // check if the game is over
    cpuChooseMove(); // let the cpu choose its next move
}

// function to handle player skipping their turn
function skipTurn() {
    if (gameLocked) return; // prevents skipping if the game is locked

    log("Player skipped their turn and regenerated 4 Light!"); // log skipping action
    player.light += 4; // regenerate more light when skipping turn

    // cpu attacks as if it won the roll
    log(`CPU attacks with ${cpuChosenMove.name}!`);
    handleMoveEffect(cpuChosenMove, cpu, player); // apply the cpu's attack
    setBattleAnimation(cpuChosenMove.cpuAnimation);

    updateUI(); // update the ui after the skip
    checkGameOver(); // check if the game is over
    cpuChooseMove(); // let the cpu choose its next move
}

// handle the effects of a move, applying damage or healing
function handleMoveEffect(move, user, target) {
    if (move.type === "passive") {
        log(`${user === player ? "Player" : "CPU"} successfully dodged!`); // if passive, log a dodge
    } else if (move.type === "healing") {
        user.health = Math.min(100, user.health + 20); // heal the user, not exceeding 100 health
        log(`${user === player ? "Player" : "CPU"} healed 20 HP!`);
    } else {
        target.health -= move.damage; // apply damage to the target
        log(`${user === player ? "Player" : "CPU"} wins and deals ${move.damage} damage!`); // log the attack
    }
}

// function to set and display the battle animation
function setBattleAnimation(animationFile) {
    const animationImage = document.getElementById("battle-animation"); // get the animation element
    animationImage.src = `animations/${animationFile}`; // set the source to the selected animation
    animationImage.style.display = 'block'; // make the animation visible
}

// function to simulate a dice roll within a given range
function roll(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min; // generate a random number within the range
}

// update the ui to display the current health and light of the player and cpu
function updateUI() {
    document.getElementById("player-health").textContent = player.health;
    document.getElementById("cpu-health").textContent = cpu.health;
    document.getElementById("player-light").textContent = player.light;
    document.getElementById("cpu-light").textContent = cpu.light;

    updateMusicBasedOnHealth(); // update the music based on health
}

//update music based on player's health
function updateMusicBasedOnHealth() {
    const musicElement = document.getElementById("game-music");

    if (player.health >= 80) {
        const track1 = document.getElementById("track-1");
        if (musicElement.src !== track1.src) { // only change if track is different
            musicElement.src = track1.src;
            musicElement.play(); // no reset
        }
    } else if (player.health >= 40) {
        const track2 = document.getElementById("track-2");
        if (musicElement.src !== track2.src) { 
            musicElement.src = track2.src;
            musicElement.play();
        }
    } else {
        const track3 = document.getElementById("track-3");
        if (musicElement.src !== track3.src) { 
            musicElement.src = track3.src;
            musicElement.play(); 
        }
    }

    musicElement.loop = true; //music looping
}
// check if either the player or the cpu has lost all health
function checkGameOver() {
    if (player.health <= 0) {
        gameLocked = true; // lock the game
        alert("CPU Wins! Game Over!"); // alert the player they lost
        showResetOption(); // show the option to restart the game
    } else if (cpu.health <= 0) {
        gameLocked = true; // 
        alert("Player Wins! Game Over!"); //  won
        showResetOption(); 
    }
}

// function to display the reset button to restart the game
function showResetOption() {
    const resetButton = document.createElement("button");
    resetButton.textContent = "Restart Game";
    resetButton.onclick = resetGame; // restart the game when clicked
    logContainer.appendChild(resetButton); // add the reset button to the log container
}

// function to reset the game to its initial state
function resetGame() {
    player.health = 100;
    cpu.health = 100;
    player.light = 10;
    cpu.light = 10;
    logContainer.innerHTML = ""; // clear the battle log
    updateUI(); // reset the ui
    generateMoveButtons(); // regenerate move buttons
    cpuChooseMove(); // let the cpu choose a new move
    gameLocked = false; // unlock the game
}

// function to log messages in the battle log
function log(message) {
    const entry = document.createElement("p");
    entry.textContent = message;
    logContainer.appendChild(entry); // add the log entry to the container
    logContainer.scrollTop = logContainer.scrollHeight; // scroll the log down to the latest entry

}

// start the game
document.addEventListener("DOMContentLoaded", () => {
    const playerName = localStorage.getItem("playerName") || "Player"; // get the player’s name
    document.getElementById("player-title").textContent = playerName; // display the player’s name
});


// Initialize the game
generateMoveButtons();
cpuChooseMove(); // let the cpu choose its first move
