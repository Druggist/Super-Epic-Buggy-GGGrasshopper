var scene, camera, renderer, keyboard, clock;
var cubes, player, death_plane;

// Setup PhysiJS
Physijs.scripts.worker = 'static/js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var DEBUG = false;
var MOVE_SPEED = 10;
var MIN_JUMP_HEIGHT = 5;
var MAX_JUMP_HEIGHT = 10;
var JUMP_RATE = 5;
var BOUNCE_HEIGHT = 2;
var LVL_LENGTH = 50;
var MAX_VELOCITY = 30;
var MIN_HEIGHT = -1;
var PLAYER_OFFSET = 3;
var GRAVITY = 10;
var FOV = 95;
var VICTORY = false;
var PAUSE = false;

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
	var max_distanceX = 6;
	var min_distanceX = 20;
	var max_height =5;
	var min_height = MIN_HEIGHT;
	var positionX = 15;
	var positionY = 0;
	var green_color = [0x7B7922, 0xCECC15, 0xCDD704, 0xA2BC13, 0x859C27, 0x668014, 0xBEE554, 0xCDAD00, 0x8B7500, 0xAEBB51];
	cubes = [];

	for (var i = 0; i < blocks; i++) {
			var width =  getRandomInt(block_min_width, block_max_width);
		cubes[i] = new Physijs.BoxMesh(
			new THREE.BoxGeometry(width, block_height, block_depth ),
			new THREE.MeshLambertMaterial( { color: green_color[getRandomGreenColor()],  } ),
			0
		);
		cubes[i].position.x= positionX;
		cubes[i].position.y= positionY;
		if (i == 0) {
			cubes[i].scale.x = 20.0/width;
			cubes[i].position.x -= 9;
		}
		if (i == blocks - 1) {
			cubes[i].material.color = cubes[0].material.color;
			cubes[i].scale.x = 20.0/width;
			cubes[i].position.x += 9;

		}
		scene.add( cubes[i] );

		positionY += getRandomInt(min_distanceY, max_distanceY);
        min_distanceX = getRandomInt(width, max_distanceX);
		positionX += min_distanceX;
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
	//renderer.setClearColor( 0xffffff, 0);


	document.body.appendChild( renderer.domElement );
	// STATS
	if(DEBUG){
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
	}
	// SCENE
	scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3( 0, -GRAVITY, 0 ));
	scene.addEventListener(
		'update',
		function() {
			player.setAngularVelocity(new THREE.Vector3(0,0,0));
			if(!PAUSE)
				scene.simulate( undefined, 1 );
			if(DEBUG) physics_stats.update();
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
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial( { color: 0x8AB800 } )
	);
	player.addEventListener( 'collision', function(collidingObject) {
			if(collidingObject == cubes[LVL_LENGTH-1]){
				$(".victory").removeClass("hidden");
				VICTORY = true;
				PAUSE = true;
			}
			play(sounds.collision);
			force = BOUNCE_HEIGHT;
            if(player.isJumping){
            	play(sounds.jump);
                force += player.jumpForce;
                player.jumpForce = MIN_JUMP_HEIGHT;
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
	if (!keyboard.pressed("w") && !keyboard.pressed("up") && !keyboard.pressed("space")) {
        if(player.jumpForce != MIN_JUMP_HEIGHT) player.isJumping = true;
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
    }else {
        if(player.jumpForce < MAX_JUMP_HEIGHT){
            player.jumpForce += JUMP_RATE * delta;
        }
        
        player.isJumping = false;
        if(v.x>0){
                player.applyCentralImpulse(new THREE.Vector3(-MOVE_SPEED * delta,0,0));
            } else {
                player.applyCentralImpulse(new THREE.Vector3(MOVE_SPEED * delta,0,0))
            }
    }
	camera.position.x = player.position.x;

	renderer.autoClear = false;
	renderer.clear();
	renderer.render( scene, camera );
	if(DEBUG) render_stats.update();
}

function reset(FullReset) {
	if(FullReset){
		for(var i=0; i<LVL_LENGTH;i++)	scene.remove(cubes[i]);
		cubes = null;
		generate(LVL_LENGTH);
	}
	player.setLinearVelocity(new THREE.Vector3(0,0,0));
	player.position.set(0,PLAYER_OFFSET,0);
	player.__dirtyPosition = true;
	player.rotation.set(0,0,0);
	player.__dirtyRotation = true;
	$(".defeat").addClass("hidden");
	$(".victory").addClass("hidden");
	VICTORY = false;
}


