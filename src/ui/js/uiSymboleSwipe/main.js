function symbole (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Selector = SCOPE.option.selector;
	var Data = SCOPE.option.data;

	var resultEndFlag = function () {

		return ((document.body.clientWidth/2) - (Data.map[Data.idx]*document.body.clientWidth/100))/$(Selector.gradientSymbole).width() *100 + '%';
	}

	$(Selector.gradientSymbole).on('dragstart drag dragend', function (event) {

		var t = $(this);

		if ($(Selector.parent).find(':animated').length) {

			return;
		}

		if(event.type == "dragstart") {

			Data.start = Math.floor(event.pageX);
		}

		if(event.type == "drag") {

			event.preventDefault();

			Data.move = (Math.floor(event.pageX) - Data.start) / document.body.clientWidth * 100;

			Data.range = Data.move - Data.rangePrev;

			t.css({ 'left': '+=' + Data.range + '%' });

			// 움직이는 만큰 margin 을 계산한 후 심볼의 너비의 대한 % 를 구한다
			SCOPE.symboleCoreBar( '+=' + (Data.range*document.body.clientWidth/100)*-1 / $(Selector.gradientSymbole).width() * 100 + '%' );

			if(Data.range < 0){

				Data.touchDir = 'prev';
			}

			if(Data.range > 0){

				Data.touchDir = 'next';
			}

			Data.rangePrev = Data.move;
			Data.prev = Data.move;

			SCOPE.moveMented();
			SCOPE.createEndFlag();
		}

		if(event.type == "dragend" ) {

			Data.rangePrev = 0;

			SCOPE.moveEnded();
			SCOPE.symboleCoreBar( resultEndFlag );
		}
	});


	$(Selector.symboleDirBtn).on('click', function (event) {

		event.preventDefault();

		var t = $(this);

		Data.idx = t.data('idx');

		SCOPE.moveEnded();
		SCOPE.moveMented(1);

		SCOPE.symboleCoreBar( resultEndFlag );
	});

	var rtime = 0;
	var rw = document.body.clientWidth;
	$(window).resize(function () {

		if (rw != document.body.clientWidth) {

			clearTimeout(rtime);

			rtime = setTimeout(function () {

				SCOPE.createEndFlag();
				SCOPE.moveMented(2);
				SCOPE.symboleCoreBar( resultEndFlag );

			}, 100);

			rw = document.body.clientWidth;
		}
	});

	SCOPE.createScreenFlag();
	SCOPE.symboleCoreBar();

	return 1;
}

symbole.prototype.symboleCoreBar = function (arg) {

	var Selector = this.option.selector;

	//core 그라데이션 셋
	$(Selector.symboleCoreBar)
		.css({ 

			'width': document.body.clientWidth,
			'margin-left': arg
		});

	return 1;
}

symbole.prototype.createScreenFlag = function () {

	var Selector = this.option.selector;
	var Data = this.option.data;

	var pointWidth = document.body.clientWidth/Data.screenLen;

	for (var i=0; i<Data.screenLen; i++) {

		Data.map[i] = Math.floor((pointWidth * i + pointWidth/2) / document.body.clientWidth * 100);
	}

	Data.middleLen = Math.ceil( ( Data.screenLen - 1 ) / 2 );
	Data.idx = Data.middleLen;

	return 1;
}

symbole.prototype.createEndFlag = function () {

	var Selector = this.option.selector;
	var Data = this.option.data;

	Data.currPosition = Math.floor( parseInt($(Selector.gradientSymbole).css('left')) / document.body.clientWidth * 100 );

	if (Data.touchDir == 'prev') {

		if (Data.map[Data.idx] - Data.map[Data.middleLen]/7 > Data.currPosition) {

			Data.idx--;
		}

		if (Data.idx < 0) {

			Data.idx = 0;
		}
	}

	if (Data.touchDir == 'next') {

		if (Data.map[Data.idx] + Data.map[Data.middleLen]/7 < Data.currPosition) {

			Data.idx++;
		}

		if (Data.idx > Data.screenLen-1) {

			Data.idx = Data.screenLen-1;
		}
	}

	return 1;
};

symbole.prototype.moveMented = function (arg) {

	var Selector = this.option.selector;
	var Data = this.option.data;

	var groupWidth = $(sceneGroup).width();

	var leftPos = 0;

	if (Data.idx == 0) {

		leftPos = groupWidth;
	}

	if (Data.idx == 1) {

		leftPos = 0;
	}

	if (Data.idx == 2) {

		leftPos = groupWidth*-1;
	}

	if (arg == 1) {

		$(sceneGroup)
			.css( 'transition', 'none')
				.stop(1, 0).animate({

						'left': leftPos
					}, 1000, 'easeInOutCubic');
	}

	if (arg == 2) {

		$(sceneGroup)
			.css({
				'transition': 'none',
				'left': leftPos
			}, 1000, 'easeInOutCubic');
	}

	if (arg == undefined) {

		$(sceneGroup)
			.css({ 

				'transition': 'left 1000ms ease-out',
				'left': leftPos
			});
	}

	return 1;
};

symbole.prototype.moveEnded = function () {

	var Selector = this.option.selector;
	var Data = this.option.data;

	$(Selector.gradientSymbole).stop(1, 0).animate({ 'left': Data.map[Data.idx] + '%' }, 300, 'easeOutCubic');

	return 1;
}


window.Symbole = new symbole ({
	selector: {
		parent: "#symbole",
		gradientSymbole: "#symbole .symbole_core",
		sceneGroup: "#sceneGroup",
		symboleDirBtn: '#symbole [data-idx]',
		symboleCoreBar: '#symbole .symbole_core .core_bar'

	},
	data: {
		screenLen: 3,
		map: []
	}

});