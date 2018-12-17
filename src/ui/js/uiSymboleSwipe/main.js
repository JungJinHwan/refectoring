function symbole (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Selector = SCOPE.option.selector;
	var Data = SCOPE.option.data;

	$(Selector.gradientSymbole).on('mouseenter mouseleave dragstart drag dragend', function (event) {

		var t = $(this);

		// if (event.type == 'mouseenter') {

		// 	t.addClass('in_active');
		// }

		// if (event.type == 'mouseleave') {

		// 	t.removeClass('in_active');
		// }

		if ($(Selector.parent).find(':animated').length) {

			return;
		}

		if(event.type == "dragstart") {

			Data.start = Math.floor(event.pageX);
		}

		if(event.type == "drag") {

			event.preventDefault();

			Data.move = (Math.floor(event.pageX) - Data.start) / $(Selector.parent).width() * 100;

			Data.range = Data.move - Data.prev;

			t.css({ 'left': '+=' + Data.range + '%' });

			if(Data.range < 0){

				Data.touchDir = 'prev';
			}

			if(Data.range > 0){

				Data.touchDir = 'next';
			}

			Data.prev = Data.move;

			SCOPE.createEndFlag();
		}

		if(event.type == "dragend" ) {

			Data.prev = 0;

			$(Selector.gradientSymbole).stop(0, 1).animate({ 'left': Data.map[Data.idx] + '%' }, 300, 'easeOutCubic');
		}
	});

	var rtime = 0;
	var rw = document.body.clientWidth;
	$(window).resize(function () {

		if (rw != document.body.clientWidth) {

			clearTimeout(rtime);

			rtime = setTimeout(function () {

				SCOPE.createEndFlag();

			}, 100);

			rw = document.body.clientWidth;
		}
	});

	SCOPE.createScreenFlag();

}

symbole.prototype.createScreenFlag = function () {

	var Selector = this.option.selector;
	var Data = this.option.data;

	var pointWidth = $(Selector.parent).width()/Data.screenLen;

	for (var i=0; i<Data.screenLen; i++) {

		Data.map[i] = Math.floor((pointWidth * i + pointWidth/2) / $(Selector.parent).width() * 100);
	}

	Data.middleLen = Math.ceil( ( Data.screenLen - 1 ) / 2 );
	Data.idx = Data.middleLen;
}

symbole.prototype.createEndFlag = function () {

	var Selector = this.option.selector;
	var Data = this.option.data;

	Data.currPosition = Math.floor( parseInt($(Selector.gradientSymbole).css('left')) / $(Selector.parent).width() * 100 );

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

window.Symbole = new symbole ({
	selector: {
		parent: "#symbole",
		gradientSymbole: "#symbole .symbole_core",
		parentContent: ".slide_parent_content",

	},
	data: {
		screenLen: 3,
		map: []
	}

});