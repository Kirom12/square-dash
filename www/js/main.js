/**
 * Main javascript file
 */

//Global variables
var gameInfo = {
	div : 'game',
	width : 1200,
	height : 640,
	initWidth : 3000,
	initHeight : 3000,
	scale : 0.5
}

var game = new Phaser.Game(gameInfo.initWidth, gameInfo.initHeight, Phaser.AUTO, gameInfo.div, {
	preload: preload,
	create: create,
	update: update,
	render: render
});

var map, layer, player;

var jumpTimer = 0;

//Game functions

/**
 * Preload function
 */
function preload() {
	game.load.tilemap('map', 'assets/json/map.json', null, Phaser.Tilemap.TILED_JSON);
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
		main : map.createLayer('main'),
		main_collision : map.createLayer('collision-main')
	}

	layers.main.scale.set(gameInfo.scale);
	layers.main_collision.scale.set(gameInfo.scale);
	layers.main.resizeWorld();

	layers.main_collision.alpha = 0.5;
	layers.main_collision.resizeWorld();
	
	map.setCollisionBetween(1, 20, true, layers.main_collision);
	//map.setCollisionByExclusion([]);


	game.scale.setGameSize(gameInfo.width, gameInfo.height);


	//Player
	player = game.add.sprite(64, 64, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);

	player.scale.set(gameInfo.scale);

    player.body.collideWorldBounds = true;
	player.body.bounce.y = 0;
    player.body.maxVelocity = 1000;

    game.camera.follow(player);

	cursors = this.input.keyboard.createCursorKeys();
	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

/**
 * Update function
 */
function update() {

	game.physics.arcade.collide(player, layers.main_collision);

	player.body.velocity.x = 0;

	if (cursors.left.isDown) {
		console.log("left");
		player.body.velocity.x = -250;
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 250;
	}

	if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
		player.body.velocity.y = -600;
		jumpTimer = game.time.now + 750;
	}
}

/**
 * Render function
 */
function render() {

}

//Personnal functions
