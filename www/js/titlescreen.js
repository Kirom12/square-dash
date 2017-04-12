var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {preload: preload, create: create});

var play;

function preload() {

	//chargement du titleScreen
	game.load.image('titlescreen', 'img/titlescreen.png');

	//chargement du bouton jouer
	game.load.spritesheet('button', 'img/bouton.png', 193, 71);

}

function create() {

	// Dans fonction create : creation du bouton et fonction clic
	game.add.sprite(0,0,'titlescreen');
	play = game.add.button(game.world.centerX,400,'button', buttonClick, this, 2, 1, 0);
	play.anchor.set(0.5);
	play.inputEnable = true;

}

function buttonClick() {
	console.log("click");
}
