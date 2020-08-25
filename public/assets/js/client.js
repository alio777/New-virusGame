const socket = io();

const startPage = document.querySelector('#startPage');
const playerNickname = document.querySelector('#playerNickname-form');
const beforegame = document.querySelector('#waitForConnect');
const playingField = document.querySelector('#playingField');
const gameBoard = document.querySelector('#gameBoard');
const virus = document.getElementById('virus');
const timer = document.querySelector('#countdown')

let nickname = null;
let playersLob = []
let playerScoreOne = {
    score: 0,
}
let playerScoreTwo = {
    score: 0,
}
let startTime;
let endTime;
let reactionTime;
let score = 1;


const gameOver = () => {
    gameBoard.classList.add('hide');
   
    if(playerScoreOne.score < playerScoreTwo.score) {
        playingField.innerHTML = `
            <div>
                <h2>Vinnaren är: </h2>
                <p>${playersLob[1]}</p>
                <p>${playersLob[0]} poäng: ${playerScoreOne.score}</p>
                <p>${playersLob[1]} poäng: ${playerScoreTwo.score}</p>
            </div>
        `
    }else if(playerScoreOne.score > playerScoreTwo.score){
        playingField.innerHTML = `
                <div>
                <h2>Vinnaren är: </h2>
                <p>${playersLob[0]}</p>
                <p>${playersLob[1]} poäng: ${playerScoreTwo.score}</p>
                <p>${playersLob[0]} poäng: ${playerScoreOne.score}</p>
            </div>
        `
    }else if(playerScoreOne.score == playerScoreTwo.score){
        playingField.innerHTML = `
            <div>
                <h2>Oavgjort mellan </h2>
                <p>${playersLob[0]} och ${playersLob[1]}</p>
            </div>
        `
    }
}

const gamePlate = () => {
    beforegame.classList.add('hide');
    playingField.classList.remove('hide');
    document.querySelector("#playerOneName").innerText = playersLob[0];
    document.querySelector("#playerTwoName").innerText = playersLob[1];

    startTime = Date.now();
    randomVirusPosition()
    virus.classList.remove('hide');}

const scoreBoard = (datainfo) => {
    
        if (datainfo.nickname === playersLob[0]) {
            playerScoreOne.score ++;
            const playerOneInfo = document.querySelector('#playerOneInfo');
            playerOneInfo.innerHTML = 
            `<div>
                <p>Poäng: ${datainfo.score}</p>
                <p>Reaktionstid: ${datainfo.reaction}</p>
            </div>`
        } else if (datainfo.nickname === playersLob[1]){
            playerScoreTwo.score ++;
            const playerTwoInfo = document.querySelector('#playerTwoInfo');
            playerTwoInfo.innerHTML = 
            `<div>
                <p>Poäng: ${datainfo.score}</p>
                <p>Reaktionstid: ${datainfo.reaction}</p>
            </div>
            `
        }
}
    
const randomVirusPosition = (target) => {
    virus.classList.add('hide')
    setTimeout(() => {
        virus.style.top = target.width + "px";
        virus.style.left = target.height + "px";
        virus.classList.remove('hide')
        startTime = Date.now();
    }, 1000)
}

/* Start new round */
const startRound = (clickVirusPosition) => {
    randomVirusPosition(clickVirusPosition);
}

virus.addEventListener('click', e => {
    if(e.target.tagName === 'IMG' ){
        endTime = Date.now()
        reactionTime = (endTime - startTime)/1000;
    }
    const data = {
        name: nickname,
        reaction: reactionTime,
        score: score++
    }
	socket.emit('player-click', data)
})

playerNickname.addEventListener('submit', e => {
	e.preventDefault();

    nickname = document.querySelector('#nickname').value;
    
	socket.emit('register-player', nickname, (status) => {
        if (status.joinGame) {
			startPage.classList.add('hide');
			beforegame.classList.remove('hide');

            playersLob = status.onlinePlayers;
		}
	});
});



// all the socket.on methods

socket.on('players-online', (players) => {
    playersLob = players;
    document.querySelector("#playerOneName").innerText = playersLob[0];
    document.querySelector("#playerTwoName").innerText = playersLob[1];
});
socket.on('new-round', (clickVirusPosition, datainfo) => {
    scoreBoard(datainfo)
    startRound(clickVirusPosition)
});
socket.on('game-over', (datainfo) => {
    scoreBoard(datainfo);
    gameOver(datainfo)
})
socket.on('create-game-page', gamePlate);

socket.on('reconnect', () => {
	if (nickname) {
		socket.emit('register-player', nickname, () => {
		});
	}
});
