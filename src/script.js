const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1500;
canvas.height = 900;

// global variables 
const cellSize = 100; // kich thuoc o la 100px
const cellGap = 3; // khoang cach giua cac o la 3 px
const gameGrid = []; // giu thong tin ve tung o rieng le

const defenders = []; // tao mang trong nhunng nguoi bao ve
const enemies = []; // tao mang chua ke thu
const enemyPosition  = []; // tao mang chua  vi tri hang ke thu 
// let defendersCost = 100; // diem ban dau ch hau ve
let numberOfResources = 400; // bien chu cai cung cap cho nguoi choi vi du 300 tai nguyen khi bat dau
let enemiesInterval = 800; // thoi gian goi ke thu
let frame = 0;

let gameOver = false;

const projectiles = []; // dan ban 
let score = 0; // diem 
const winninngScore = 100;
let choosenDefender = 1; // chon defender 

const amounts = [20,30,40,50];// mang diem mat troi
const resources = []; // mang chua mat troi

const floatingMessage = [];


// tao mang chua loai ke thu 
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = '../img/runman2_4116_98_139 nguoc.png';
enemyTypes.push(enemy1);

// ke thu 2
const enemy2 = new Image();
enemy2.src = '../img/runman2_4116_98_139 nguoc.png';
enemyTypes.push(enemy2);
 
// nguoi bao ve 1
const defender1 = new Image();
defender1.src = '../img/spritesheet_nguoiban_128_128_72.png';


const card1 = {
    x : 10,
    y : 10,
    width : 70,
    height : 85
}

const card2 = {
    x : 10 + cellSize,
    y : 10,
    width : 70,
    height : 85
}

// mouse
const mouse = {
    x : undefined,
    y : undefined,
    width : 0.1,
    height : 0.1,
    clicked : false
};
canvas.addEventListener('mousedown',function() {
    mouse.clicked = true;
});

canvas.addEventListener('mouseup',function() {
    mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect(); // trich xuat vi tri canvas

canvas.addEventListener('mousemove',function(e){
    mouse.x = e.x  - canvasPosition.left; // lay vi tri chuot
    mouse.y = e.y - canvasPosition.top;

});
canvas.addEventListener('mouseleave', function(){
    mouse.y = undefined;
    mouse.x = undefined;
})

// game board
// tao doi tuong thanh dieu khien , chieu cao bang voi kich thuoc o
const controlsBar = {
     
    width : canvas.width,
    height : cellSize,
}


class Cell {
    constructor (x,y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }

    draw(){
        // ctx.strokeStyle = 'black';
        // ctx.strokeRect(this.x,this.y,this.width,this.height);
        if( mouse.x && mouse.y && collision(this,mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x,this.y,this.width,this.height);
        }
    }
}
function creatGrid() {
    for(let y = 0; y < canvas.height; y += cellSize ) {
        for(let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x,y));
        }
    }
}

function handleGameGrid() {
    for(let i = 0; i < gameGrid.length; i ++) {
        gameGrid[i].draw();
    }
}

// duong dan ban 

class Projectile {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.power = 20;
        this.speed = 4;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(this.x + 20,this.y + 20,this.width,0,Math.PI*2);
        ctx.fill();
    }
}


// dieu khien dan

function handleProjectiles() {
    for(let i = 0; i < projectiles.length; i ++) {
        projectiles[i].update();
        projectiles[i].draw();

        // kiem tra va cham  giua dan 
        for(let j = 0; j < enemies.length; j ++) {
            if(enemies[j] && projectiles[i]&&collision(projectiles[i],enemies[j])) {
                enemies[j].health -= projectiles[i].power;  // ke thu tru hp
                projectiles.splice(i,1); // loai bo dan khi ban thanh cong
                i--;
            }
        }


        // kiem tra 
        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i,1);
            i--;
        }
        // console.log('projectiles '+projectiles.length );
    }
}

//  nguoi bao ve
class Defender {
    constructor (x,y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap*2;
        this.height = cellSize - cellGap*2;
        this.shooting = false; // kiem tra phat hien ke thu
        this.shootNow = false;
        this.health = 100; // suc khoe bao ve
        this.projectiles = []; // thong tin ve duong dan hau ve dang ban
        this.timer = 0;  // bo dem thoi gian khi hau ve phat hien ke thu
        
        // image
     
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.minFrame = 0;
        this.maxFrame = 24;
        this.choosenDefender = choosenDefender;

    }

    draw() {

        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Arial'; // hien thi font 20 px
        // ctx.fillText(Math.floor( this.health),this.x + 15,this.y + 30);
        
        //
        if(this.choosenDefender === 1){
            ctx.drawImage(
                defender1,
                this.frameX*this.spriteWidth,
                0,
                this.spriteWidth,
                this.spriteHeight,
                this.x,
                this.y,
                this.width,
                this.height
    
            ) 
        } else if(this.choosenDefender === 2) {
            ctx.drawImage(
                defender1,
                this.frameX*this.spriteWidth,
                0,
                this.spriteWidth,
                this.spriteHeight,
                this.x,
                this.y,
                this.width,
                this.height
    
            ) 
        }
        
        
    }

    update() {

        if(frame % 5 === 0) {
            if(this.frameX < this.maxFrame) 
                this.frameX++;
            else
                this.frameX = this.minFrame;
            
            if(this.frameX === 10) this.shootNow = true;
        }

        if(this.shooting) {
            this.minFrame = 3;
            this.maxFrame = 12
        }
        else {
            this.minFrame = 13;
            this.maxFrame = 24;
        }
        
        // khi phat hien ra ke thu
        if(this.shooting && this.shootNow) {
            // this.timer ++;
            // if(this.timer % 100 === 0) {
                projectiles.push(new Projectile(this.x + 50,this.y + 20));
                this.shootNow = false;
            // }
        // } else {
            // this.timer = 0;
        }
    }
}

canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if(gridPositionY < cellSize) 
        return;

    // kiem tra xem vi tri nay co nguoi ve hay chua
    // for(let i = 0; i < defenders.length; i ++) {
    //     if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) 
    //         return;
    // }

    let defendersCost = 100;// diem chi phi ban dau ch hau ve
    if(numberOfResources >= defendersCost) {
        if(!gameOver){
        defenders.push(new Defender(gridPositionX,gridPositionY)); // mang defenders them vao doi tuong defender
        numberOfResources -= defendersCost; // tru tien phi 
        }
    } else {
        floatingMessage.push(new FloatingMessage('need money',mouse.x,mouse.y,20,'blue'));
    }

});

// tao chuc nang hau ve 
function handleDefenders() {
    
    
    for(let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        // kiem tra hang doc cua hau ve
        if(enemyPosition.indexOf(defenders[i].y) !==  -1) {
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }

        // kiem tra va cham
        for(let  j = 0; j < enemies.length; j ++) {
            if( defenders[i]&& collision(defenders[i],enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 5;
            }
            if( defenders[i]&& defenders[i].health <= 0) {
                defenders.splice(i,1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }


}
// chon nguoi bao ve
let card1stroke = 'black';
let card2stroke = 'black';
function chooseDefender() {
    

    if(collision(mouse,card1) && mouse.clicked) {
        choosenDefender = 1;
    } else if(collision(mouse,card2)&&mouse.clicked){
        choosenDefender = 2;
    }

    if(choosenDefender == 1) {
        card1stroke = 'gold';
        card2stroke = 'black';
    }
    else if(choosenDefender == 2) {
        card1stroke = 'black';
        card2stroke = 'gold';
    }

    //
    // ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    //
    ctx.fillRect(
        card1.x,
        card1.y,
        card1.width,
        card1.height
    );
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x,card1.y,card1.width,card1.height);
    ctx.drawImage(
        defender1,
        0,
        0,
        128,
        128,
        10,
        15,
        128/2,
        128/2
        );
////////////////////////

    ctx.fillRect(
        card2.x,
        card2.y,
        card2.width,
        card2.height
    );
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x,card2.y,card2.width,card2.height);
    ctx.drawImage(
        defender1,
        0,
        0,
        128,
        128,
        10 + cellSize,
        15,
        128/2,
        128/2
        );
        // fillStyle = 'gold';
        // ctx.fillStyle = 'rgba(0,0,0,1)';
}


// tao ke thu
class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width; // chieu dai ban dau
        this.y = verticalPosition; // vi tri hang xuat hien
        this.width = cellSize - cellGap*2;
        this.height = cellSize - cellGap*2;
        this.speed =  Math.random()*0.2 + 0.5; 
        this.movement = this.speed;
        this.health = 100; // suc khoe ke thu
        this.maxHealth = this.health;

        // them hinh nhan vat
        this.enemyTypes = enemyTypes[0];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 42;
        this.spriteWidth = 98;
        this.spriteHeight = 139;

    }

    update() {
        this.x -= this.movement;
        if(frame % 2 ===0) {
            if(this.frameX < this.maxFrame) 
                this.frameX++;
            else 
                this.frameX = this.minFrame;
        }
        

    }

    draw() {
        // ctx.fillStyle = 'red';
        // // ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = 'gold';
        // ctx.font = '30px Arial'; // hien thi font 20 px
        // ctx.fillText(Math.floor( this.health),this.x + 15,this.y + 30);

        // ctx.rotate( 2* Math.PI );
        

        ctx.drawImage(
            this.enemyTypes,
            this.frameX*this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        )
        // ctx.rotate(  Math.PI /30);

    }
}

// xu ly ke thu

function handleEnemies() {
    for(let i = 0; i < enemies.length; i ++) {
        enemies[i].update();
        enemies[i].draw();

        // game over 
        if(enemies[i].x < 0) {
            gameOver = true;
        }
        if(enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth/10;// diem /
            floatingMessage.push( new FloatingMessage('+'+gainedResources,enemies[i].x,enemies[i].y,30,'black'));
            floatingMessage.push( new FloatingMessage('+'+gainedResources,250,50,30,'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPosition.indexOf(enemies[i].y); // tim vi tri ke thu trong mang ke thu
            enemyPosition.splice(findThisIndex,1);
            enemies.splice(i,1);
            i--;
            
        }
    }
    if(frame % enemiesInterval === 0 && score < winninngScore) {
        let verticalPosition = Math.floor(Math.random() * 8 + 1)*cellSize + cellGap; // vi tri hang ke thu xuat hien
        enemies.push(new Enemy(verticalPosition));
        enemyPosition.push(verticalPosition);

        if(enemiesInterval > 100 ) enemiesInterval -= 50;
       

    }
}

// them mat troi 

class Resource {
    constructor () {
        this.x = Math.random()*(canvas.width - cellSize);
        this.y = Math.floor((Math.random()*5 +1))*cellSize + 25;
        this.width = cellSize*0.6;
        this.height = cellSize*0.6;
        this.amounts = amounts[Math.floor(Math.random()*amounts.length)]; 
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.arc(this.x ,this.y,30,0,Math.PI*2);
        ctx.fill();
        // ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(this.amounts,this.x -15,this.y + 15);
    }
}
// xu ly mat troi 

function handleResources() {
    if(frame % 500 === 0 && score < winninngScore) {
        resources.push(new Resource);
    }

    for(let i = 0; i < resources.length; i ++) {
        resources[i].draw();
        if(resources[i]&& mouse.x&&mouse.y&&collision(resources[i],mouse)){
            numberOfResources += resources[i].amounts;
            floatingMessage.push( new FloatingMessage('+'+resources[i].amounts,resources[i].x,resources[i].y,20,'black'));
            floatingMessage.push( new FloatingMessage('+'+resources[i].amounts,450,80,20,'gold'));

            resources.splice(i,1);
            i--;
        }
    }
}

// xu ly trang thai tro choi

function handleGameStatus() {
    // ctx.beginPath();
    // ctx.fillStyle = 'rgba(0,0,0,0)';
    fillStyle = 'gold';
    // fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText( 'Resources: ' + numberOfResources,250,40 );
    ctx.fillText( 'Score: ' + score,250 ,80 );
    if(gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '90px Arial';
        ctx.fillText('GAME OVER',300,380);
    }

    if(score > winninngScore && enemies.length === 0){
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('LEVEL COMPLETE',400,380);
        ctx.font = '30px Arial';
        ctx.fillText('you win with '+ score + ' points!',450,450);
        gameOver = true ;
    }
}

// tin nhan 
class FloatingMessage {
    constructor(value,x,y,size,color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1; // do trong suot cua ban ve
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if(this.opacity > 0.05) 
            this.opacity -= 0.05;
    };
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size +'px Arial';
        ctx.fillText(this.value,this.x,this.y);
        ctx.globalAlpha = 1;
    };
}
// dieu khien tin nhan
function handleFloatingMessage () {
    for(let i = 0; i < floatingMessage.length; i++) {
        floatingMessage[i].update();
        floatingMessage[i].draw();
        if(floatingMessage[i].lifeSpan >= 50) {
            floatingMessage.splice(i,1);
            i--;
        }
    }
};


creatGrid();
// function check lien tuc doi tuong 
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'blue';
        ctx.fillRect(0,0,controlsBar.width,controlsBar.height);
        handleGameGrid();
        
        handleDefenders();
        handleResources();
        handleProjectiles();
        handleEnemies();
        chooseDefender();
        handleFloatingMessage();
        handleGameStatus();
        
        frame++;
    
        if(!gameOver) requestAnimationFrame(animate);
    }
    animate();

    // kiem tra va tai su dung de tim ra va cham
    function collision (first,second) {
        if(!(
            first.x > second.x + second.width||
            first.x + first.width < second.x||
            first.y > second.y + second.height||
            first.y + first.height < second.y
        )
        ) {
            return true; 
        };
    };
// khi thay doi chuc nang con chuot thi con chuot khong duoc su dung dung ban chat 

window.addEventListener('resize',function() {
    canvasPosition = canvas.getBoundingClientRect();
})