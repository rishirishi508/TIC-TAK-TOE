const statusDisplay = document.querySelector('.game--status');
const modeSelect = document.querySelector('.game--mode');
const modeDisplay = document.querySelector('.game--mode-display');

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "single"; 

const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

modeSelect.addEventListener('change', (event) => {
    gameMode = event.target.value;
    modeDisplay.innerHTML = `Mode: ${gameMode === "single" ? "Single Player" : "Two Players"}`;
    handleRestartGame(); 
});

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    handlePlayerChange();
    if (gameMode === "single" && currentPlayer === "O" && gameActive) {
        setTimeout(computerMove, 500); 
    }
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive || (gameMode === "single" && currentPlayer === "O")) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function computerMove() {
    const bestMove = minimax(gameState, "O").index;
    const cell = document.querySelector(`.cell[data-cell-index="${bestMove}"]`);
    handleCellPlayed(cell, bestMove);
    handleResultValidation();
}

function minimax(newGameState, player) {
    const availableSpots = newGameState
        .map((val, index) => val === "" ? index : null)
        .filter(val => val !== null);

    if (checkWin(newGameState, "X")) return { score: -10 };
    if (checkWin(newGameState, "O")) return { score: 10 };
    if (availableSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newGameState[availableSpots[i]] = player;

        if (player === "O") {
            const result = minimax(newGameState, "X");
            move.score = result.score;
        } else {
            const result = minimax(newGameState, "O");
            move.score = result.score;
        }

        newGameState[availableSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    return winningConditions.some(condition => 
        condition.every(index => board[index] === player)
    );
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);
