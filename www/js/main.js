/**
 * Main javascript file
 */

//Global variables
const gameInfo = {
	div : 'game',
	width : 1200,
	height : 640,
	initWidth : 3000,
	initHeight : 3000,
	scale : 0.5
}

const playerInfo = {
	speed : 250,
	jumpSpeed : 500,
	startX : 10,
	startY : gameInfo.height/2
}

const debug = {
	godMode : false
}

var game = new Phaser.Game(gameInfo.initWidth, gameInfo.initHeight, Phaser.AUTO, gameInfo.div, {
	preload: preload,
	create: create,
	update: update,
	render: render
});


var map, layers, player;
var buttons = {};
var jumpTimer = 0;
var currentColor = 0;

//Game functions

/**
 * Preload function
 */
function preload() {
	game.load.tilemap('map', 'assets/json/map-full.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/img/tileset.png');
	game.load.image('tileset-trap-new', 'assets/img/tileset-trap-new.png');
	game.load.image('player', 'assets/img/player.png');
}

/**
 * Create function
 */
function create() {
	//Start arcade physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//Set game gravity
	game.physics.arcade.gravity.y = 1000;
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

	//Set scale on base layers
	for (let i in layers.base) {
		layers.base[i].setScale(gameInfo.scale);
		layers.base[i].resizeWorld();
	}

	//Set scale on collision layers
	for (let i in layers.collision) {
		map.setCollisionBetween(1, 200, true, layers.collision[i]);
		layers.collision[i].setScale(gameInfo.scale);
		layers.collision[i].alpha = 0;
		layers.collision[i].resizeWorld();
	}

	//Set game size
	game.scale.setGameSize(gameInfo.width, gameInfo.height);


	//Player
	player = game.add.sprite(playerInfo.startX, playerInfo.startY, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.scale.set(gameInfo.scale);

    player.body.collideWorldBounds = true;
	player.body.bounce.y = 0;
    player.body.maxVelocity = 1000;

    game.camera.follow(player);

	cursors = this.input.keyboard.createCursorKeys();

	buttons = {
		jump : game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		red : game.input.keyboard.addKey(Phaser.Keyboard.A),
		green : game.input.keyboard.addKey(Phaser.Keyboard.Z),
		blue : game.input.keyboard.addKey(Phaser.Keyboard.E)
	}
}

/**
 * Update function
 */
function update() {

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

	//Actions
	player.body.velocity.x = 0;

	if (cursors.left.isDown) {
		player.body.velocity.x = -playerInfo.speed;
	} else if (cursors.right.isDown) {
		player.body.velocity.x = playerInfo.speed;
	}

	if (buttons.jump.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
		player.body.velocity.y = -playerInfo.jumpSpeed;
		jumpTimer = game.time.now + 750;
	}

	//Switch color
	if (buttons.red.isDown) {
		currentColor = 0;
	} else if (buttons.green.isDown) {
		currentColor = 1;
	} else if (buttons.blue.isDown) {
		currentColor = 2;
	}
}


/**
 * Render function
 */
function render() {

}

//Collision functions
function playerHit(player, world) {
	if (debug.godMode) return;
	
	player.x = playerInfo.startX;
	player.y = playerInfo.startY;
}
