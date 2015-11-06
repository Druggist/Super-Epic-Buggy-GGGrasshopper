var scene, camera, renderer, keyboard, clock;
var cube, player;
var collidableMeshList = [];

var DEBUG = true;
var MOVE_SPEED = 10;
var JUMP_SPEED = 2;
var JUMP_HEIGHT = 10;
var LVL_LENGHT = 30;
var MAX_VELOCITY = 30;
var VERTICES = 8;
var LOW_VERTICES = 2;

init();
animate();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomGreenColor(){
    return Math.floor(Math.random()*10);
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
    var min_height =-1;
    var positionX = 0;
    var positionY = 0;
    var green_color = [0x7B7922, 0xCECC15, 0xCDD704, 0xA2BC13, 0x859C27, 0x668014, 0xBEE554, 0xCDAD00, 0x8B7500, 0xAEBB51];
    cube = [];
    
    for (var i = 0; i < blocks; i++) {
        var geometry = new THREE.CubeGeometry( block_width, block_height, block_depth, LOW_VERTICES, LOW_VERTICES, LOW_VERTICES );
        var material = new THREE.MeshLambertMaterial( { color: green_color[getRandomGreenColor()],  } );
        cube[i] = new THREE.Mesh( geometry, material );
        cube[i].position.x= positionX;
        cube[i].position.y= positionY;
        scene.add( cube[i] );
        collidableMeshList.push(cube[i]);
        
        positionY += getRandomInt(min_distanceY, max_distanceY);
        positionX += getRandomInt(min_distanceX, getRandomInt(min_distanceX, max_distanceX));
        if (positionY<min_height) positionY=min_height;

        if (positionY>max_height) positionY=max_height;
		}

    cube[0].scale.x = 5;
    cube[0].position.x += -4;
    cube[blocks-1].material.color = cube[0].material.color;
    cube[blocks-1].scale.x = 8;
    cube[blocks-1].position.x += 7;    
    return 0;
}

function init() {
	// CLOCK
	clock = new THREE.Clock();
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	camera = new THREE.PerspectiveCamera( 95, window.innerWidth / window.innerHeight, 1, 10000 );
	//camera.position.y = -800;
	//camera.position.z = 500;
	camera.position.z = 4;
	camera.position.y = 7;
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

    
	// PLAYER
	geometry = new THREE.CubeGeometry( 1, 1, 1, VERTICES, VERTICES, VERTICES );
	material = new THREE.MeshPhongMaterial( { color: 0x8AB800 } );

	player = new THREE.Mesh( geometry, material );
	player.offset = 1;
	player.position.y = player.offset;
	player.isJumping = false;
	player.onGround = true;
	player.velocityX = 0;
	player.velocityY = 0;
	scene.add( player );
	collidableMeshList.push(player);

	// GENERATE LEVEL
	generate(LVL_LENGHT);

	// RENDERER
	if ( Detector.webgl ){
		renderer = new THREE.WebGLRenderer( {antialias:true,alpha:true} );
    }
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 0);


	document.body.appendChild( renderer.domElement );
}

function animate() {

	requestAnimationFrame( animate );
	delta = clock.getDelta();
	camera.position.x += 0.01;
	if(keyboard.pressed("A")) {
		if(Math.abs(player.velocityX) < MAX_VELOCITY) player.velocityX -= MOVE_SPEED * delta;
		if(Math.abs(player.velocityX) > MAX_VELOCITY) player.velocityX = -MAX_VELOCITY;
	} else if (keyboard.pressed("D")) {
		player.velocityX += MOVE_SPEED * delta;
		if(Math.abs(player.velocityX) > MAX_VELOCITY) player.velocityX = MAX_VELOCITY;
	} else {
		if(player.velocityX != 0){
			if(player.velocityX>0){
				player.velocityX -= (player.velocityX<MOVE_SPEED)?player.velocityX:MOVE_SPEED * delta;
			} else {
				player.velocityX += (Math.abs(player.velocityX)<MOVE_SPEED)?-player.velocityX:MOVE_SPEED * delta;
			}
		}
	}
	if (keyboard.pressed("w") && player.onGround == true) {
		player.isJumping = false;
		console.log("jump");
	}

	if(DEBUG == true) {
		if(keyboard.pressed("I")) player.position.y += 1;
		if(keyboard.pressed("J")) player.position.x -= 1;
		if(keyboard.pressed("L")) player.position.x += 1;
		if(keyboard.pressed("K")) player.position.y -= 1;
	}

	camera.position.x = player.position.x;
	update(delta);

	renderer.autoClear = false;
renderer.clear();
	renderer.render( scene, camera );
}

function getCollision(collisionObject){
var originPoint = collisionObject.position.clone();

	for (var vertexIndex = 0; vertexIndex < collisionObject.geometry.vertices.length; vertexIndex++)
	{
		var localVertex = collisionObject.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4( collisionObject.matrix );
		var directionVector = globalVertex.sub( collisionObject.position );

		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( collidableMeshList, true );
	}

	return [collisionResults, directionVector.length()];
}

function update(delta){
	col = getCollision(player);
	colliders = col[0];
	l = col[1];
	if(false)//colliders.length > 0
	for (var i = colliders.length - 1; i >= 0; i--) {
		if(colliders[i].distance < l && colliders[i].faceIndex == 5 && player.velocityX > 0){
			player.velocityX = 0;
		}
		if(colliders[i].distance < l && colliders[i].faceIndex == 1 && player.velocityX < 0){
			player.velocityX = 0;
		}

	}

	if(player.position.y <= player.offset){ //colliders[i].distance < l && [17, 293].indexOf(colliders[i].faceIndex)

		if(player.onGround){
			player.velocityY = -JUMP_HEIGHT;
			player.onGround = false;
		} else {
			player.velocityY = 0;
			player.onGround	= true;
		}
	}
	if (!player.onGround){
		player.velocityY += JUMP_SPEED;
	}
	player.position.x += player.velocityX * delta;
	player.position.y -= player.velocityY * delta;

	if(player.position.y < -100){
		player.velocityY = 0;
		player.velocityX = 0;
		player.positionX = 0;
		player.position.y = player.offset;
	}
}