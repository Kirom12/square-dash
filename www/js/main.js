/**
 * Main javascript file
 */

//Global variables
const gameData = {
	div : 'game',
	width : 1200,
	height : 640,
	initWidth : 2400,
	initHeight : 1280,
	scale : 0.5
}

const playerData = {
	speed : 300,
	startX : 20,
	startY : gameData.height/2,
	preStartTime : 60,
	respawnTime : 60
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


var map, layers, player, particle;
var buttons = {};
var currentColor = 0;
var tick = {
	currentGame : 0
}

var jump = {
	speed : 400,
	holdSpeed : 250,
	heightDuration : 10,
	timer : 0,
	cooldown : 0,
	holdTimer : 0,
	particleEmit : false
}

//Game functions

/**
 * Preload function
 */
function preload() {
	game.load.tilemap('map', 'assets/json/map-full.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/img/tileset.png');
	game.load.image('tileset-trap-new', 'assets/img/tileset-trap-new.png');
	game.load.image('player', 'assets/img/player.png');
	game.load.image('particle', 'assets/img/particles.png');
	game.load.image('particle-white', 'assets/img/particle-white.png');
}

/**
 * Create function
 */
function create() {
	//Start arcade physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

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
	game.scale.setGameSize(gameData.width, gameData.height);

	//Player
	player = game.add.sprite(playerData.startX, playerData.startY, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.scale.set(gameData.scale);
	player.anchor.setTo(0.5);

    player.body.collideWorldBounds = true;
	player.body.bounce.y = 0;
    player.body.maxVelocity = 1000;
    player.body.gravity.y = 2000;

    game.camera.follow(player);

	cursors = this.input.keyboard.createCursorKeys();

	buttons = {
		jump : game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		red : game.input.keyboard.addKey(Phaser.Keyboard.A),
		green : game.input.keyboard.addKey(Phaser.Keyboard.Z),
		blue : game.input.keyboard.addKey(Phaser.Keyboard.E)
	}

	//Tuto particle : https://www.programmingmind.com/phaser/stop-particles-from-sliding-in-phaser
	particle = game.add.emitter(player.x, player.y, 6);
	particle.makeParticles('particle-white');

	//particle.forEach(function(particle) {  particle.tint = 0xff0000; });
	particle.x = player.x;
	particle.y = player.y;
	particle.width = 40;
	particle.minParticleScale = 1;
	particle.minParticleScale = 1.5;
}

/**
 * Update function
 */
function update() {

	//console.log(gameTick);

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

	if (player.body.onFloor() && !jump.particleEmit) {
		jump.particleEmit = true;
		
	}

	//If player is on flood and press a key
	if (buttons.jump.isDown && player.body.onFloor() && game.time.now > jump.timer) {
		jump.holdTimer = 1;
		jump.particleEmit = false;
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

//Collision functions
function playerHit(player, world) {
	if (debug.godMode) return;

	particle.x = player.x;
	particle.y = player.y+player.height/2;
	particle.start(true, 200, null, 6);

	player.kill();


	//Shake camera
	game.camera.shake(0.005, 500);

	jump.particleEmit = false;


	game.time.events.add(Phaser.Timer.SECOND * (playerData.respawnTime/60)/2, function() {
		//Replace the camera at the begining
		game.camera.x = 0;
		game.camera.y = 0;

		//Small time and reset player
		game.time.events.add(Phaser.Timer.SECOND * (playerData.respawnTime/60)/2, function() {
			tick.currentGame = 0;
			player.reset(playerData.startX, playerData.startY);
		}, this);
	}, this);


}


/** 
 * EXEMPLE
 */

// var layer = level.createLayer(layerData.name, layerData.width * levelData.tilewidth * 2,    layerData.height * levelData.tileheight * 2,    group);
// layer.visible = layerData.visible;
// layer.alpha = layerData.opacity;
// layer.position.set(layerData.x, layerData.y);
// layer.scale.set(0.5, 0.5);
// layer.resizeWorld(); 