let player = { health: 100, light: 10, stunned: false };
let cpu = { health: 100, light: 10, stunned: false };
let gameLocked = false;
let cpuChosenMove = null;

// Define moves (with animations)
const moves = [
    { name: "Power Strike", cost: 6, minRoll: 1, maxRoll: 6, damage: 20, type: "attack", animation: "power-strike-animation.gif" },
    { name: "Quick Slash", cost: 3, minRoll: 4, maxRoll: 10, damage: 10, type: "attack", animation: "quick-slash-animation.gif" },
    { name: "Defensive Stance", cost: 4, minRoll: 3, maxRoll: 8, damage: 0, type: "passive", animation: "defensive-stance-animation.gif" },
    { name: "Heal", cost: 8, minRoll: 1, maxRoll: 3, damage: -20, type: "healing", animation: "heal-animation.gif" },
    { name: "Stun", cost: 12, minRoll: 3, maxRoll: 6, damage: 50, type: "stun", animation: "stun-animation.gif" }
];

const playerMovesContainer = document.getElementById("player-moves");
const cpuMoveContainer = document.getElementById("cpu-move");
const logContainer = document.getElementById("log");

function generateMoveButtons() {
    if (gameLocked) return;

    playerMovesContainer.innerHTML = "";
    moves.forEach((move, index) => {
        const btn = document.createElement("button");
        btn.innerHTML = `${move.name} (Cost: ${move.cost})<br>Roll: ${move.minRoll}-${move.maxRoll}<br>Damage: ${move.damage}`;
        btn.onclick = () => playTurn(index);
        playerMovesContainer.appendChild(btn);
    });
}

function cpuChooseMove() {
    if (gameLocked || cpu.stunned) return;

    const availableMoves = moves.filter(move => cpu.light >= move.cost);

    if (availableMoves.length === 0) {
        cpu.light += 6;
        cpuChooseMove();
        return;
    }

    cpuChosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    cpuMoveContainer.innerHTML = `CPU chose: ${cpuChosenMove.name}<br>Cost: ${cpuChosenMove.cost}<br>Roll: ${cpuChosenMove.minRoll}-${cpuChosenMove.maxRoll}<br>Damage: ${cpuChosenMove.damage}`;
}

function playTurn(playerMoveIndex) {
    if (gameLocked || player.stunned) return;

    const playerMove = moves[playerMoveIndex];

    if (player.light < playerMove.cost) {
        log("Not enough Light!");
        return;
    }

    player.light -= playerMove.cost;

    let playerRoll, cpuRoll;
    do {
        playerRoll = roll(playerMove.minRoll, playerMove.maxRoll);
        cpuRoll = roll(cpuChosenMove.minRoll, cpuChosenMove.maxRoll);
    } while (playerRoll === cpuRoll); // Reroll on tie

    log(`Player used ${playerMove.name} and rolled ${playerRoll}`);
    log(`CPU used ${cpuChosenMove.name} and rolled ${cpuRoll}`);

    setBattleAnimation(playerMove.animation);

    if (playerRoll > cpuRoll) {
        handleMoveEffect(playerMove, player, cpu);
    } else {
        handleMoveEffect(cpuChosenMove, cpu, player);
    }

    player.light += 3;
    cpu.light += 3;

    updateUI();
    checkGameOver();
    cpuChooseMove();
}

// 💡 FIXED: Skip Turn Feature
function skipTurn() {
    if (gameLocked || player.stunned) return;

    log("Player skipped their turn and regenerated 6 Light!");
    player.light += 6;

    // CPU attacks as if it won the roll
    log(`CPU attacks with ${cpuChosenMove.name}!`);
    handleMoveEffect(cpuChosenMove, cpu, player);

    updateUI();
    checkGameOver();
    cpuChooseMove();
}

function handleMoveEffect(move, user, target) {
    if (move.type === "passive") {
        log(`${user === player ? "Player" : "CPU"} successfully dodged!`);
    } else if (move.type === "healing") {
        user.health = Math.min(100, user.health + 20);
        log(`${user === player ? "Player" : "CPU"} healed 20 HP!`);
    } else if (move.type === "stun") {
        target.stunned = true;
        log(`${target === player ? "Player" : "CPU"} is stunned and will skip their next turn!`);
    } else {
        target.health -= move.damage;
        log(`${user === player ? "Player" : "CPU"} wins and deals ${move.damage} damage!`);
    }
}

function setBattleAnimation(animationFile) {
    const animationImage = document.getElementById("battle-animation");
    animationImage.src = `animations/${animationFile}`;
    animationImage.style.display = 'block';
}

function roll(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateUI() {
    document.getElementById("player-health").textContent = player.health;
    document.getElementById("cpu-health").textContent = cpu.health;
    document.getElementById("player-light").textContent = player.light;
    document.getElementById("cpu-light").textContent = cpu.light;
}

function checkGameOver() {
    if (player.health <= 0) {
        gameLocked = true;
        alert("CPU Wins! Game Over!");
        showResetOption();
    } else if (cpu.health <= 0) {
        gameLocked = true;
        alert("Player Wins! Game Over!");
        showResetOption();
    }
}

function showResetOption() {
    const resetButton = document.createElement("button");
    resetButton.textContent = "Restart Game";
    resetButton.onclick = resetGame;
    logContainer.appendChild(resetButton);
}

function resetGame() {
    player.health = 100;
    cpu.health = 100;
    player.light = 10;
    cpu.light = 10;
    player.stunned = false;
    cpu.stunned = false;
    logContainer.innerHTML = "";
    updateUI();
    generateMoveButtons();
    cpuChooseMove();
    gameLocked = false;
}

function log(message) {
    const entry = document.createElement("p");
    entry.textContent = message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Start the game
document.addEventListener("DOMContentLoaded", () => {
    const playerName = localStorage.getItem("playerName") || "Player";
    document.getElementById("player-title").textContent = playerName;
});

updateUI();
generateMoveButtons();
cpuChooseMove();
