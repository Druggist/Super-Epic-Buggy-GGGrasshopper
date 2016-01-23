var context = new AudioContext(); // Create and Initialize the Audio Context
var playSound = [];
var sounds = {
	bg : {
		id: 0,
		src: "static/audio/bg.ogg",
		volume: 1,
		loop: false
	},
	jump : {
		id: 1,
		src: "static/audio/jump.ogg",
		volume: 0.5,
		loop: false
	},	
	collision : {
		id: 2,
		src: "static/audio/collision.ogg",
		volume: 0.5,
		loop: false
	},
};

(function(){
	load(sounds.bg, function(){
		load(sounds.jump, function(){ 
			load(sounds.collision);
		});
	});
}());

function load(obj, callback){
	var getSound = new XMLHttpRequest(); // Load the Sound with XMLHttpRequest
	getSound.open("GET", obj.src, true); // Path to Audio File
	getSound.responseType = "arraybuffer"; // Read as Binary Data
	getSound.onload = function() {
		context.decodeAudioData(getSound.response, function(buffer){
			obj.buffer = buffer; // Decode the Audio Data and Store it in a Variable
			console.log(obj.buffer);
		});
	}
	getSound.send(); // Send the Request and Load the File
	if(callback) callback();
}

function play(obj){
	for(i=0;i<3;i++){
		playSound[i]= context.createBufferSource(); // Declare a New Sound
	}
	playSound[obj.id].buffer = obj.buffer; // Attatch our Audio Data as it's Buffer
	playSound[obj.id].loop = obj.loop; // Attatch our Audio Data as it's Buffer
	 obj.gainNode = context.createGain();

  // connect the source to the gain node
  playSound[obj.id].connect(obj.gainNode);

  // set the gain (volume)
  obj.gainNode.gain.value = obj.volume;

  // connect gain node to destination
  obj.gainNode.connect(context.destination);

	playSound[obj.id].start(0); // Play the Sound Immediately
}

function mute(obj){
	obj.gainNode.gain.value = 0;
}

function restoreVolume(obj){
	obj.gainNode.gain.value = obj.volume;
}