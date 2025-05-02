const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const caveman = new Image();
const pigeon = new Image();
const dragon = new Image();
const toiletGod = new Image();
const poop = new Image();
const bg1 = new Image();
const bg2 = new Image();
const bg3 = new Image();
const bg4 = new Image();
const bg5 = new Image();

caveman.src = "caveman.png";
pigeon.src = "pigeon.png";
dragon.src = "dragon.png";
toiletGod.src = "toilet_god.png";
poop.src = "poop.png";
bg1.src = "bg1.png";
bg2.src = "bg2.png";
bg3.src = "bg3.png";
bg4.src = "bg4.png";
bg5.src = "bg5.png";

let player = {
    x: 200,
    y: 520,
    width: 80,
    height: 120,
    speed: 6,
    velocityY: 0,
    gravity: 1,
    isJumping: false
};

let drops = [];
let pigeons = [];
let dropTimer = 0;
let score = 0;
let gameOver = false;
let currentBg = bg1;
let currentEnemy = pigeon;

const keys = {};
window.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (e.key === " " && !player.isJumping) {
        player.velocityY = -18;
        player.isJumping = true;
    }
});
window.addEventListener("keyup", e => keys[e.key] = false);

function generatePigeons(count) {
    pigeons = [];
    for (let i = 0; i < count; i++) {
        pigeons.push({
            x: Math.random() * canvas.width,
            baseY: 80 + Math.random() * 60,
            angle: Math.random() * Math.PI * 2,
            speed: 1 + Math.random() * 1.5
        });
    }
}

function updateAssets() {
    if (score >= 120) {
        currentBg = bg5;
        currentEnemy = toiletGod;
        dropImage = dragon;
    } else if (score >= 90) {
        currentBg = bg4;
        currentEnemy = dragon;
        dropImage = pigeon;
    } else if (score >= 60) {
        currentBg = bg3;
        currentEnemy = pigeon;
        dropImage = poop;
    } else if (score >= 30) {
        currentBg = bg2;
        currentEnemy = pigeon;
        dropImage = poop;
    } else {
        currentBg = bg1;
        currentEnemy = pigeon;
        dropImage = poop;
    }
}

function update() {
    if (gameOver) return;

    updateAssets();
    ctx.drawImage(currentBg, 0, 0, canvas.width, canvas.height);

    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;

    // Jump physics
    player.y += player.velocityY;
    player.velocityY += player.gravity;
    if (player.y >= 520) {
        player.y = 520;
        player.isJumping = false;
    }

    ctx.drawImage(caveman, player.x, player.y, player.width, player.height);

    // Animate pigeons
    pigeons.forEach(p => {
        p.x += p.speed;
        p.angle += 0.05;
        const wave = Math.sin(p.angle) * 10;
        const pigeonY = p.baseY + wave;

        if (p.x > canvas.width) {
            p.x = -80;
            p.baseY = 60 + Math.random() * 40;
            p.angle = Math.random() * Math.PI * 2;
        }

        ctx.drawImage(currentEnemy, p.x, pigeonY, 80, 60);
    });

    // Drop poop
    dropTimer++;
    let dropSpeed = 4 + Math.floor(score / 100);
    let dropFrequency = 30 - Math.min(Math.floor(score / 100), 20);

    if (dropTimer > dropFrequency) {
        const p = pigeons[Math.floor(Math.random() * pigeons.length)];
        const poopY = p.baseY + Math.sin(p.angle) * 10 + 50;
        drops.push({ x: p.x + 20, y: poopY });
        dropTimer = 0;
    }

    // Poop collision and movement
    for (let i = 0; i < drops.length; i++) {
        let d = drops[i];
        d.y += dropSpeed;
        ctx.drawImage(dropImage, d.x, d.y, 40, 40);

        if (
            d.x < player.x + player.width &&
            d.x + 30 > player.x &&
            d.y < player.y + player.height &&
            d.y + 30 > player.y
        ) {
            gameOver = true;
            setTimeout(() => {
                alert("💥 SPLAT! You got hit! Final Score: " + score);
                window.location.reload();
            }, 100);
        }

        if (d.y > canvas.height) {
            drops.splice(i, 1);
            score++;
            i--;
        }
    }

    ctx.fillStyle = "#fff";
    ctx.font = "20px Comic Sans MS";
    ctx.fillText("Score: " + score, 20, 30);

    requestAnimationFrame(update);
}

generatePigeons(5);
update();