var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {preload: preload, create: create});

// variable timer, sec, style et text
var timer;
var sec = 0;
var centiemeSec = 0;
var style = { font: "30px Arial", fill: "white", align: "center" };
var text;

function preload() {

	

}

function create() {

	// on créer le timer
	timer = game.time.create(false);

	//on affiche le timer
	text = game.add.text(game.world.centerX, 30, sec + " . " + centiemeSec , style);
	
	// on crée la boucle du timer, toute les 100 ms
	timer.loop(100, updateSec, this);

	// on start le timer
	timer.start();

}


function updateSec() {

	// les 100 ms, on ajoute 10
	centiemeSec += 10;

	// si ms  est supp a 100 on update les secs et on remet ms à 0
	if (centiemeSec >= 100)
	{
		sec++;
		centiemeSec = 0;
	}

	// on update le texte
	text.setText(sec + " . " + centiemeSec);
}