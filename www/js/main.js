/**
 * Main javascript file
 */

//Global variables
const gameData = {
	div : 'game',
	width : 1200,
	height : 640,
	initWidth : 1200,
	initHeight : 640,
	scale : 1
}

const playerData = {
	speed : 300,
	startX : 20,
	startY : gameData.height/2,
	preStartTime : 60,
	respawnTime : 60,
	scale : 0.5
}

const debug = {
	godMode : false,
	keyMode : true
}

var game = new Phaser.Game(gameData.initWidth, gameData.initHeight, Phaser.AUTO, gameData.div, {
	preload: preload,
	create: create,
	update: update,
	render: render
});


var map, layers, player, particle, titleBg, playButton, timer, text;
var buttons = {};
var currentColor = 0;
var tick = {
	currentGame : 0
}
var gameState = 0;

var jump = {
	speed : 400,
	holdSpeed : 250,
	heightDuration : 10,
	timer : 0,
	cooldown : 0,
	holdTimer : 0,
	current : false //@TODO : change name
}

var timerData = {
	update : 100,
	sec : 0,
	centSec : 0,
	style : { font: "30px Arial", fill: "white", align: "center" },
	text : null
}

var particles = {};

//Game functions

/**
 * Preload function
 */
function preload() {
	game.load.tilemap('map', 'assets/json/map-full-16.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/img/tileset-16.png');
	game.load.image('tileset-trap-new', 'assets/img/tileset-trap-new-16.png');
	game.load.image('player', 'assets/img/player.png');
	game.load.image('particle', 'assets/img/particles.png');
	game.load.image('particle-white', 'assets/img/particle-white.png');

	//Title screen
	game.load.image('title-screen', 'assets/img/titlescreen.png');	
	game.load.image('play-button', 'assets/img/bouton.png');
}

/**
 * Create function
 */
function create() {
	//Start arcade physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

	createButton();
}

function createButton() {
	titleBg = game.add.sprite(0,0,'title-screen');
	playButton = game.add.button(game.world.centerX,400,'play-button', function() {
		createGame();
		gameState = 1;
		titleBg.kill();
		playButton.kill();
	}, this, 2, 1, 0);
	playButton.anchor.set(0.5);
	playButton.inputEnable = true;
}

function createGame() {

	//Set game gravity
	game.physics.arcade.gravity.y = 200; //@TODO : check gravity system...
	game.stage.backgroundColor = '#000000';

	map = game.add.tilemap('map');

	map.addTilesetImage('tileset');
	map.addTilesetImage('tileset-trap-new');
	
	layers = {
		base : {
			main : map.createLayer('main'),
			plateform_red : map.createLayer('plateform-red'),
			plateform_green : map.createLayer('plateform-green'),
			plateform_blue : map.createLayer('plateform-blue')
		},
		collision : {
			main : map.createLayer('collision-main'),
			die : map.createLayer('collision-die'),
			collision_red : map.createLayer('collision-red'),
			collision_green : map.createLayer('collision-green'),
			collision_blue : map.createLayer('collision-blue')
		}
	}

	//@TODO : check https://phaser.io/examples/v2/tilemaps/resize-map (refactor?)
	//Set scale on base layers
	for (let i in layers.base) {
		layers.base[i].setScale(gameData.scale);
		layers.base[i].resizeWorld();
	}

	//Set scale on collision layers
	for (let i in layers.collision) {
		map.setCollisionBetween(1, 200, true, layers.collision[i]);
		layers.collision[i].setScale(gameData.scale);
		layers.collision[i].alpha = 0;
		layers.collision[i].resizeWorld();
	}

	//Set game size
	//game.scale.setGameSize(gameData.width, gameData.height);

	//Player
	player = game.add.sprite(playerData.startX, playerData.startY, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.scale.set(playerData.scale);
	player.anchor.setTo(0.5);

    player.body.collideWorldBounds = true;
	player.body.bounce.y = 0;
    player.body.maxVelocity = 1000;
    player.body.gravity.y = 2000;

    game.camera.follow(player);

	cursors = game.input.keyboard.createCursorKeys();

	buttons = {
		jump : game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		red : game.input.keyboard.addKey(Phaser.Keyboard.A),
		green : game.input.keyboard.addKey(Phaser.Keyboard.Z),
		blue : game.input.keyboard.addKey(Phaser.Keyboard.E)
	}

	// PARTICLES
	//Tuto particle : https://www.programmingmind.com/phaser/stop-particles-from-sliding-in-phaser
	particles.die = game.add.emitter(player.x, player.y, 6);
	particles.die.makeParticles('particle-white');
	particles.die.width = 40;
	particles.die.minParticleScale = 1;
	particles.die.minParticleScale = 1.5;

	particles.jump = game.add.emitter(player.x, player.y, 3);
	particles.jump.makeParticles('particle-white');
	particles.jump.forEach(function(particle) {  particle.tint = 000015; });
	particles.jump.width = 32;

	//TIMER
	timer = game.time.create(false);
	text = game.add.text(gameData.width-100, 10, timerData.sec + " . " + timerData.centSec , timerData.style);
	text.fixedToCamera = true;

	timer.loop(timerData.update, function() {
		timerData.centSec += 10;
		if (timerData.centSec >= 100) {
			timerData.sec++;
			timerData.centSec = 0;
		}
		text.setText(timerData.sec + " . " + timerData.centSec);
	}, this);

	timer.start();
}

/**
 * Update function
 */
function update() {

	switch(gameState) {
		case 0:
			break;
		case 1:
			play();
			break;
		default:
	}

	
}

function play() {

	//Debug mode
	if (debug.keyMode) {
		player.body.velocity.x = 0;
	} else {
		if (tick.currentGame > playerData.preStartTime) {
			player.body.velocity.x = playerData.speed;
		}
	}

	//Hide plateform
	layers.base.plateform_red.alpha = 0.2;
	layers.base.plateform_green.alpha = 0.2;
	layers.base.plateform_blue.alpha = 0.2;

	//Collisions
	game.physics.arcade.collide(player, layers.collision.main);
	game.physics.arcade.collide(player, layers.collision.die, playerHit);

	//@TODO: refactor this switch
	switch (currentColor) {
		case 0 :
			game.physics.arcade.collide(player, layers.collision.collision_red);
			layers.base.plateform_red.alpha = 1;
			break;
		case 1 :
			game.physics.arcade.collide(player, layers.collision.collision_green);
			layers.base.plateform_green.alpha = 1;
			break;
		case 2 :
			game.physics.arcade.collide(player, layers.collision.collision_blue);
			layers.base.plateform_blue.alpha = 1;
			break;
		default:
	}

	if (debug.keyMode) {
		if (cursors.left.isDown) {
			player.body.velocity.x = -playerData.speed;
		} else if (cursors.right.isDown) {
			player.body.velocity.x = playerData.speed;
		}	
	}

	if (player.body.onFloor()) {
		//Rotation
		player.angle = 0;

		if (!jump.current) {
			jump.current = true;

			particles.jump.x = player.x;
			particles.jump.y = player.y+player.height/2;
			particles.jump.start(true, 200, null, 3);
		}
	} else {
		player.angle += 10;
	}



	//If player is on flood and press a key
	if (buttons.jump.isDown && player.body.onFloor() && game.time.now > jump.timer) {
		jump.holdTimer = 1;
		jump.current = false;

		player.body.velocity.y = -jump.speed;
		//player.body.gravity.y = 2000;
		jump.timer = game.time.now + jump.cooldown;
	} else if (buttons.jump.isDown && jump.holdTimer != 0) { //In jump and key still press
		if (jump.holdTimer > jump.heightDuration) {
			jump.holdTimer = 0;
		} else {
			jump.holdTimer++;
			player.body.velocity.y = -jump.speed;
			//player.body.gravity.y = 2000;
		}
	} else {
		jump.holdTimer = 0;
	}


	//Switch color
	if (buttons.red.isDown) {
		currentColor = 0;
	} else if (buttons.green.isDown) {
		currentColor = 1;
	} else if (buttons.blue.isDown) {
		currentColor = 2;
	}

	//Update ticks
	tick.currentGame++;
}


/**
 * Render function
 */
function render() {
	//game.debug.cameraInfo(game.camera, 32, 32);
}

function buttonClick() {
	console.log("click");
}

//Collision functions
function playerHit(player, world) {
	if (debug.godMode) return;

	particles.die.x = player.x;
	particles.die.y = player.y+player.height/2;
	particles.die.start(true, 200, null, 6);

	player.kill();

	//Shake camera
	game.camera.shake(0.005, 500);

	jump.current = false;

	game.time.events.add(Phaser.Timer.SECOND * (playerData.respawnTime/60)/2, function() {
		//Replace the camera at the begining
		game.camera.x = 0;
		game.camera.y = 0;

		//Small time and reset player
		game.time.events.add(Phaser.Timer.SECOND * (playerData.respawnTime/60)/2, function() {
			tick.currentGame = 0;
			player.reset(playerData.startX, playerData.startY);

			//Reset timer
			timerData.sec = 0;
			timerData.centSec = 0;
		}, this);
	}, this);
}


/** 
 * EXEMPLE
 */

// Layer resize http://www.html5gamedevs.com/topic/8897-scaling-down-a-tilemap-layer
// var layer = level.createLayer(layerData.name,layerData.width * levelData.tilewidth * 2,layerData.height * levelData.tileheight * 2,group);
// layer.visible = layerData.visible;
// layer.alpha = layerData.opacity;
// layer.position.set(layerData.x, layerData.y);
// layer.scale.set(0.5, 0.5);
// layer.resizeWorld();