/**
 * Main javascript file
 */

//Global variables
var gameInfo = {
	div : 'game',
	width : 1200,
	height : 600
}

var game = new Phaser.Game(gameInfo.width, gameInfo.height, Phaser.AUTO, gameInfo.div, {
	preload: preload,
	create: create,
	update: update,
	render: render
});

var map, layer, player;

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

	game.stage.backgroundColor = '#000000';

	map = game.add.tilemap('map');

	map.addTilesetImage('tileset');
	map.addTilesetImage('tileset-trap-new');

	layer = map.createLayer('main');

	//Player
	player = game.add.sprite(64, 64, 'player');
	game.physics.enable(player, Phaser.Physics.ARCADE);

	cursors = this.input.keyboard.createCursorKeys();
}

/**
 * Update function
 */
function update() {

	player.body.velocity = 0;

	if (cursors.left.isDown) {
		console.log("left");
		player.body.velocity.x = -100;
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 100;
	}
}

/**
 * Render function
 */
function render() {

}

//Personnal functions
