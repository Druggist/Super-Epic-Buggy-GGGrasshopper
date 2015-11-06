var scene, camera, renderer, keyboard, clock;
var cube, player, death_plane;

// Setup PhysiJS
Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var DEBUG = true;
var MOVE_SPEED = 10;
var JUMP_HEIGHT = 5;
var BOUNCE_HEIGHT = 3;
var LVL_LENGTH = 50;
var MAX_VELOCITY = 30;
var MIN_HEIGHT = -1;
var PLAYER_OFFSET = 1;
var GRAVITY = 10;
var FOV = 100;
var VICTORY = false;
var PAUSE = false;

window.onload = init();

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomGreenColor(){
	return Math.floor(Math.random()*10);
}

function generate(blocks) {
	var block_height = 1;
	var block_min_width = 1;
	var block_max_width = 3;
	var block_depth = 3;
	var max_distanceY = 2;
	var min_distanceY = -2;
	var max_distanceX = 8;
	var min_distanceX = 2;
	var max_height =5;
	var min_height = MIN_HEIGHT;
	var positionX = 4;
	var positionY = 0;
	var green_color = [0x7B7922, 0xCECC15, 0xCDD704, 0xA2BC13, 0x859C27, 0x668014, 0xBEE554, 0xCDAD00, 0x8B7500, 0xAEBB51];
	cube = [];

	for (var i = 0; i < blocks; i++) {
			var width =  getRandomInt(block_min_width, block_max_width);
		cube[i] = new Physijs.BoxMesh(
			new THREE.BoxGeometry(width, block_height, block_depth ),
			new THREE.MeshLambertMaterial( { color: green_color[getRandomGreenColor()],  } ),
			0
		);
		cube[i].position.x= positionX;
		cube[i].position.y= positionY;
		if (i == 0) {
			cube[i].scale.x = 20.0/width;
			cube[i].position.x -= 9;
		}
		if (i == blocks - 1) {
			cube[i].material.color = cube[0].material.color;
			cube[i].scale.x = 20.0/width;
			cube[i].position.x += 9;

		}
		scene.add( cube[i] );

		positionY += getRandomInt(min_distanceY, max_distanceY);
		positionX += getRandomInt(min_distanceX, getRandomInt(min_distanceX, max_distanceX));
		if (positionY<min_height) positionY=min_height;

		if (positionY>max_height) positionY=max_height;
		}

	return 0;
}

function init() {
	// CLOCK
	clock = new THREE.Clock();
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true, alpha:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xffffff, 0);


	document.body.appendChild( renderer.domElement );
	// STATS
	render_stats = new Stats();
		render_stats.domElement.style.position = 'absolute';
		render_stats.domElement.style.top = '1px';
		render_stats.domElement.style.zIndex = 100;
		document.body.appendChild( render_stats.domElement );
		physics_stats = new Stats();
		physics_stats.domElement.style.position = 'absolute';
		physics_stats.domElement.style.top = '50px';
		physics_stats.domElement.style.zIndex = 100;
		document.body.appendChild( physics_stats.domElement );

	// SCENE
	scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3( 0, -GRAVITY, 0 ));
	scene.addEventListener(
		'update',
		function() {
			player.setAngularVelocity(new THREE.Vector3(0,0,0));
			if(!PAUSE)
				scene.simulate( undefined, 1 );
			physics_stats.update();
		}
	);
	// CAMERA

	camera = new THREE.PerspectiveCamera( FOV, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 7 ,4 );
	camera.rotation.x = -0.5;
	// KEYBOARD
	keyboard = new THREEx.KeyboardState();
	//LIGHT
	var light = new THREE.AmbientLight( 0xf0f0f0 ); // soft white light
scene.add( light );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 1, 0 );
scene.add( directionalLight );
	//END setup
	// DEATH PLANE TODO
	// death_plane = new Physijs.PlaneMesh()
	// PLAYER
	player = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 1, 1, 1 ),
		new THREE.MeshPhongMaterial( { color: 0x8AB800 } )
	);
	player.addEventListener( 'collision', function(collidingObject) {
			if(collidingObject == cube[LVL_LENGTH-1]){
				$(".victory").removeClass("hidden");
				VICTORY = true;
				PAUSE = true;
			}
			
			force = BOUNCE_HEIGHT;
			if (this.isJumping) {
				force += JUMP_HEIGHT;
			}
			this.applyCentralImpulse(new THREE.Vector3(0,force,0));
			this.setAngularVelocity(new THREE.Vector3( 0, 0, 0 ))
			this.isJumping = false;
	});
	player.position.y = PLAYER_OFFSET;
	player.isJumping = false;
	player.onGround = true;
	scene.add( player );

	// GENERATE LEVEL
	generate(LVL_LENGTH);

	requestAnimationFrame( render );
	scene.simulate();
}

function render() {
	requestAnimationFrame( render );
	if (player.position.y < -2) {
		$(".defeat").removeClass("hidden");
		if(keyboard.pressed("r"))
		reset(false);
	}
	
	if(VICTORY && keyboard.pressed("r")){
		reset(true);
		PAUSE = false;
		scene.simulate( undefined, 1 );
	}

	delta = clock.getDelta();
	v = player.getLinearVelocity();
	if(keyboard.pressed("a") || keyboard.pressed("left")) {
		if(Math.abs(v.x) < MAX_VELOCITY) player.applyCentralImpulse(new THREE.Vector3(-MOVE_SPEED * delta,0,0));
	} else if (keyboard.pressed("d") || keyboard.pressed("right")) {
		if(Math.abs(v.x) < MAX_VELOCITY) player.applyCentralImpulse(new THREE.Vector3(MOVE_SPEED * delta,0,0));
	} else {
		if(v.x>0){
				player.applyCentralImpulse(new THREE.Vector3(-MOVE_SPEED * delta,0,0));
			} else {
				player.applyCentralImpulse(new THREE.Vector3(MOVE_SPEED * delta,0,0))
		}
	}
	if (keyboard.pressed("w") || keyboard.pressed("up") || keyboard.pressed("space")) {
		player.isJumping = true;
	}
	camera.position.x = player.position.x;

	renderer.autoClear = false;
	renderer.clear();
	renderer.render( scene, camera );
	render_stats.update();
}

function reset(FullReset) {
	if(FullReset){
		for(var i=0; i<LVL_LENGTH;i++)	scene.remove(cube[i]);
		cube = null;
		generate(LVL_LENGTH);
	}
	player.setLinearVelocity(new THREE.Vector3(0,0,0));
	player.position.y = PLAYER_OFFSET;
	player.position.x = 0;
	player.__dirtyPosition = true;
	$(".defeat").addClass("hidden");
	$(".victory").addClass("hidden");
	VICTORY = false;
}


