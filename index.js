
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienWorth = 100;
let alienHealth = 1;
let alienDiffer = 1.15;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 0.75;

let bulletArray = [];
let bulletVelocityY = -7.5;
let bulletDamage = 1;

let gameScore = 0;
let gameWave = 1;
let gameOver = false;

let starArray = [];

let alienHitSound = new Audio("./sounds/alienHit.wav");
let gameOverSound = new Audio("./sounds/gameOver.wav");


window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    shipImg = new Image();
    shipImg.src = "./img/ship.png";

    createAliens();
    createStars();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);

}

function update() {
    requestAnimationFrame(update);
    context.fillStyle = "white";

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, boardWidth, boardHeight);

    for (let i = 0; i < starArray.length; i++) {
        star = starArray[i];
        context.fillRect(star.x, star.y, star.width, star.height);
    }

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if(alien.alive) {
            alien.x += alienVelocityX;

            if(alien.x + alien.width >= boardWidth || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for(let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);
        
            if (alien.y >= ship.y) {
                gameOverSound.play();
                context.fillStyle = "red";
                context.font = "50px courier";
                context.fillText("GAME OVER", boardWidth / 4.5, boardHeight / 3);
                gameOver = true;
            }
        }
    }
    
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && checkCollision(bullet, alien)) {
                alienHitSound.play();
                bullet.used = true;
                alien.health -= bulletDamage;
                if(alien.health <= 0){
                    alien.alive = false;
                    alienCount -= 1;
                    gameScore += alien.worth;
                }
            }
            
        }
    }
    
    if (bulletArray.length > 0) {
        for (let i = 0; i < bulletArray.length; i++) {
            if (bulletArray[i].used || bulletArray[i].y > boardHeight){
                bulletArray.splice(i, 1);
            }
        }
    }

    if (alienCount == 0) {
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // cap is 8 aliens
        alienRows = Math.min(alienRows + 1, rows - 4);
        gameScore += 100;
        gameWave += 1;
        alienDiffer += 0.035;
        if (alienVeloxityX < 0){
            alienVelocityX -= 0.125;
        }else{
            alienVelocityX += 0.125;
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + gameScore, 5, 20);
    context.fillText("Wave: " + gameWave, boardWidth - 80, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "KeyA" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } 
    else if (e.code == "KeyD" && ship.x + shipVelocityX + ship.width <= boardWidth ) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for(let c = 0; c < alienColumns; c++) {
        for(let r = 0; r < alienRows; r++) {
            let alienImg = new Image();
            alienImg.src = "./img/alien.png";
            let alienWorth = 100;
            let alienHealth = 1;
            if (gameWave >= 2 && getRandomInt(0, 100) * alienDiffer >= 80){
                alienImg.src = "./img/alien-cyan.png";
                alienWorth = 250;
                alienHealth = 2;
            }else if (gameWave >= 4 && getRandomInt(0, 100) * (alienDiffer / 1.2) >= 80){
                alienImg.src = "./img/alien-yellow.png";
                alienWorth = 300;
                alienHealth = 3;
            }else if (gameWave >= 5 && getRandomInt(0, 100) * (alienDiffer / 1.25) >= 90){
                alienImg.src = "./img/alien-magenta.png";
                alienWorth = 500;
                alienHealth = 5;
            }

            let alien = {
                img : alienImg,
                x : alienX + c * alienWidth,
                y : alienY + r * alienHeight,
                width : alienWidth,
                height : alienHeight,
                worth : alienWorth,
                health : alienHealth,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e){
    if (gameOver) {
        return;
    }

    if (e.code == "Space"){
        let bullet = {
            x : ship.x + ship.width * 15 / 32,
            y : ship.y,
            width : tileSize / 8,
            height : tileSize / 2,
            velocityY : bulletVelocityY,
            used : false,
            damage : bulletDamage
        }
        bulletArray.push(bullet);
    }
}

function checkCollision(bullet, alien) {
    return alien.x < bullet.x + bullet.width && 
    alien.x + alien.width > bullet.x && 
    alien.y < bullet.y + bullet.height && 
    alien.y + alien.height > bullet.y;
}

function createStars() {
    for (let i = 0; i < 150; i++) {
        let star = {
            x : getRandomInt(0, boardWidth),
            y : getRandomInt(0, boardHeight),
            width : 0.7,
            height : 0.7
        }
        starArray.push(star);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
