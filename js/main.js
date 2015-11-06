var scene, camera, renderer, keyboard, clock;
var cube, player, death_plane;

// Setup PhysiJS
Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

var DEBUG = true;
var MOVE_SPEED = 10;
var JUMP_HEIGHT = 10;
var BOUNCE_HEIGHT = 3;
var LVL_LENGHT = 30;
var MAX_VELOCITY = 30;
var MIN_HEIGHT = -1;
var PLAYER_OFFSET = 1;
var GRAVITY = 5;

// LOADER
loader = new THREE.TextureLoader();

var bg = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 0),
  new THREE.MeshBasicMaterial({map: loader.load('images/bg.jpg')})
);

// The bg plane shouldn't care about the z-buffer
bg.material.depthTest = false;
bg.material.depthWrite = false;

var bgScene = new THREE.Scene();
var bgCam = new THREE.Camera();
bgScene.add(bgCam);
bgScene.add(bg);


window.onload = init();

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generate(blocks) {
		var block_height = 1;
		var block_width = 2;
		var block_depth = 3;
		var max_distanceY = 2;
		var min_distanceY = -2;
		var max_distanceX = 4;
		var min_distanceX = 2;
		var max_height =5;
		var min_height = MIN_HEIGHT;
		var positionX = 0;
		var positionY = 0;

		cube = [];

		for (var i = 0; i < blocks; i++) {
			cube[i] = new Physijs.BoxMesh(
				new THREE.BoxGeometry( block_width, block_height, block_depth ),
				new THREE.MeshBasicMaterial( { color: 0xB88A00,  } ),
				0
			);
			cube[i].position.x= positionX;
			cube[i].position.y= positionY;
			scene.add( cube[i] );

			positionY += getRandomInt(min_distanceY, max_distanceY);
			positionX += getRandomInt(min_distanceX, getRandomInt(min_distanceX, max_distanceX));
			if (positionY<min_height) {
					positionY=min_height;
			};
					if (positionY>max_height) {
					positionY=max_height;
			};
		};

		cube[0].material.color.setHex( 0xff0000 );
		cube[blocks-1].material.color.setHex( 0x00ff03 );


return 0;
}

function init() {
	// CLOCK
	clock = new THREE.Clock();
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.setClearColor( 0xffffff, 0);


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
			scene.simulate( undefined, 1 );
			physics_stats.update();
		}
	);
	// CAMERA
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 7 ,4 );
	camera.rotation.x = -0.5;
	// KEYBOARD
	keyboard = new THREEx.KeyboardState();

	//END setup
	// DEATH PLANE TODO
	// death_plane = new Physijs.PlaneMesh()
	// PLAYER
	player = new Physijs.BoxMesh(
		new THREE.BoxGeometry( 1, 1, 1 ),
		new THREE.MeshBasicMaterial( { color: 0x8AB800 } )
	);
	player.addEventListener( 'collision', function() {
			force = BOUNCE_HEIGHT;
			if (this.isJumping) {
				force += JUMP_HEIGHT;
			}
			this.applyCentralImpulse(new THREE.Vector3(0,force,0));
			this.setAngularVelocity(new THREE.Vector3( 0, 0, 0 ))
			this.isJumping = false;
			console.log(force);
	});
	player.position.y = PLAYER_OFFSET;
	player.isJumping = false;
	player.onGround = true;
	scene.add( player );

	// GENERATE LEVEL
	generate(LVL_LENGHT);
	requestAnimationFrame( render );
	scene.simulate();
}

function render() {

	requestAnimationFrame( render );
	if (player.position.y < -1) {
		console.log("dead");
		player.position.y = PLAYER_OFFSET;
		player.position.x = 0;
		player.__dirtyPosition = true;
	}

	delta = clock.getDelta();
	//camera.position.x += 0.01;
	v = player.getLinearVelocity();
	if(keyboard.pressed("A")) {
		v.x -= MOVE_SPEED * delta;
		if(Math.abs(v.x) > MAX_VELOCITY) v.x = -MAX_VELOCITY;
	} else if (keyboard.pressed("D")) {
		v.x += MOVE_SPEED * delta;
		if(Math.abs(v.x) > MAX_VELOCITY) v.x = MAX_VELOCITY;
	} else {
		if(v.x>0){
				v.x -= (v.x<MOVE_SPEED)?v.x:MOVE_SPEED * delta;
			} else {
				v.x += (Math.abs(v.x)<MOVE_SPEED)?-v.x:MOVE_SPEED * delta;
			}
	}
	if (keyboard.pressed("w")) {
		player.isJumping = true;
		console.log("jump");
	}
	player.setLinearVelocity(v);
	camera.position.x = player.position.x;

	renderer.autoClear = false;
	renderer.clear();
	renderer.render(bgScene, bgCam);

	renderer.render( scene, camera );
	render_stats.update();
}
