const startButton = document.getElementById("start-game");
const playerNameInput = document.getElementById("player-name");

playerNameInput.oninput = () => {
    startButton.disabled = !playerNameInput.value.trim();
};

startButton.onclick = () => {
    const playerName = playerNameInput.value.trim();
    localStorage.setItem("playerName", playerName);
    window.location.href = "game.html";
};