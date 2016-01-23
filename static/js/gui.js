$(".play").on("click", function(event) {
	event.preventDefault();
	$(".play").addClass("hidden");
	$(".pause").removeClass("hidden");
	$(".sound").removeClass("hidden");
	$("body").css("background-image", "url(static/img/bg.png)");
	play(sounds.bg);
	init();
});

$(".exit").on("click", function(event) {
	event.preventDefault();
	location.reload();
});

$(".resume").on("click", function(event) {
	event.preventDefault();
	PAUSE= !PAUSE;
	scene.simulate( undefined, 1 );
	$(".gui").toggleClass('container');
	$(".pause-menu").toggleClass('hidden');
});

$(".pause").on("click", function(event) {
	event.preventDefault();
	PAUSE= !PAUSE;
	scene.simulate( undefined, 1 );
	$(".gui").toggleClass('container');
	$(".pause-menu").toggleClass('hidden');

});

$(".sound").on("click", function(event) {
	event.preventDefault();
	if($(".sound").hasClass('on')){
		$(".sound").addClass('off');
		$(".sound").removeClass('on');
		$(".sound").html("<span>sound<br>off</span>");
		mute(sounds.bg);
		mute(sounds.jump);
		mute(sounds.collision);
	} else {
		$(".sound").addClass('on');
		$(".sound").removeClass('off');
		$(".sound").html("<span>sound<br>on</span>");
		restoreVolume(sounds.bg);
		restoreVolume(sounds.jump);
		restoreVolume(sounds.collision);
	}
});