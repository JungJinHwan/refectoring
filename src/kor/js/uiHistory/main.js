
function _slide(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Slide = SCOPE.option;

	var doc = document;
	var getEl = doc.getElementsByTagName('script')[0];
	var mkEl = doc.createElement("link");

	mkEl.id = 'uiHistoryStyle';
	mkEl.rel = 'stylesheet';
	mkEl.href = Slide.data.request.css;

	getEl.parentNode.insertBefore(mkEl, getEl);

	SCOPE.onRequest(0, function(res) {

		var Data = res,
			Element = Slide.element,
			year = Element.paging,
			item = Element.list,
			description = Element.description,
			result = Slide.body,
			customer = { 
				year: '',
				item: '',
				description: ''
			};

		for(var yearNumber in Data.year) {

			var mkList = Data.list[Data.year[yearNumber]];

			customer.year += year.replace(/\[%YEAR%\]/g, Data.year[yearNumber]);

			for(var listNumber in mkList) {

				var mkDescription = mkList[listNumber];

				customer.description = description(function() {
					// 지우고싶은 부분 살짝쿵 입력해 주세요...
					var rmString = ['effect'];

					var keys = Object.keys(mkList[listNumber]);

					for(var strNumber in rmString) {
						for(var keyNumber in keys) {
							if(rmString[strNumber] != keys[keyNumber]) {
								continue;
							}
							else{
								return 1;
							}

						}
					}

				}());

				for(var listKey in mkDescription) {
					customer.description = customer.description
						.replace('[%'+listKey.toUpperCase()+'%]', mkDescription[listKey]);
				}

				customer.item += item
					.replace('[%YEAR%]', Data.year[yearNumber])
						.replace('[%ITEM%]', customer.description);

			};

		}

		Element.paging = customer.year;
		Element.list = customer.item;

		for(var resultKey in Element) {
			result = result.replace('[%'+resultKey.toUpperCase()+'%]', Element[resultKey]);

		}

		$(Slide.target).html(result);

		SCOPE.setDefault();
		SCOPE.onEvent();

	}); 

	var rw, rh, rtime;

	$WINDOW.resize(function() {
		var t = $(this);

		if(rw != t.width() || rh != t.height()) {
			clearTimeout(rtime);
			rtime = setTimeout(function() {
				SCOPE.setDefault();

			}, 100);

			rw = rw || t.width(), rh = rh || t.height();
		}

	});

	return 0;
}

_slide.prototype.setDefault = function() {

	var Slide = this.option;
	var Event = this.option.event;
	var Data = this.option.data;

	Data.items = $(Event.node.item);
	Data.shift = $(Event.node.shift);
	Data.page = $(Event.node.page);

	Data.transform = $WINDOW.width() <= 1000;

	Data.year = { start: 1945, end: 1945 };

	Data.index = 0;
	Data.count = 0;

	Data.half = $(Event.node.item).outerWidth(true)/2;

	Data.page.css({
		'left': 0,
		'width': function() {
			var result = 0;

			for (var i=0; i<Data.shift.length; i++) {
				result += Data.shift.eq(i).width();

			}

			return result;
		}()

	});

	$(Event.node.hold).css({
		'width': $WINDOW.width(), 
		'margin-left': ($(Event.node.content).width()-$WINDOW.width())/2

	});

	$(Event.node.animate).css({
		'left': 0,
		'margin-left': Data.half*-1

	});

	Data.items.css({
		'opacity': Data.transform  ? 0.15 : 1

	}).eq(Data.index).css({ 'opacity': 1 });

	Data.shift.removeClass('ov').eq(Data.count).addClass('ov');

	// 각 슬라이드 이동할 거리 구함
	Data.offset = function() {
		var result = [];

		for(var i=0; i<Data.items.length; i++) {
			result[i] = i != 0 ? result[i-1] + Data.items.eq(i).outerWidth(true) : 0;
		}

		return result;
	}();

	return 0;
};

_slide.prototype.onRequest = function(args, callback) {
	
	var Request = args || this.option.data.request;

	return $.getJSON(Request.json, function(res) {
		return callback(res);

	});

};

_slide.prototype.onEvent = function(args) {

	var Event = args || this.option.event;
	var Data = this.option.data;

	var indexing = function(getValue) {

		switch(getValue) {
			case 'prev' :
				if(Data.index > 0) {
					Data.index--;
				}

				break;

			case 'next' :
				if(Data.index < Data.items.length-1) {
					Data.index++;
				}

				break;

		}

		return Data.index;
	}

	var counting = getValue => {

		switch(getValue) {
			case 'prev' :
				Data.count--;

				break;

			case 'next' :
				Data.count++;

				break;

		}

		return Data.count;
	}

	var movement = getValue => {

		if(getValue.useShield) {
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}
		}

		if(getValue.order) {
			Data.index = indexing(getValue.order);
		}

		$(Event.node.animate).stop(1, 0).animate({
			'left': Data.offset[Data.index]*-1

		}, 600, 'easeOutCubic');

		if(Data.transform) {

			Data.items.stop(1, 0).animate({
				'opacity': 0.15

			}, 600, 'easeOutCubic')
			.eq(Data.index).stop(1, 0).animate({
				'opacity': 1

			}, 600, 'easeOutCubic');

		}

		Data.year.start = Data.items.eq(Data.index).data('year');

		if(!getValue.order || ( Data.year.end ? Data.year.end : Data.year.start ) != Data.year.start) {
			// 달라질때만 체크

			var count = ( getValue.order ? counting(getValue.order) : Data.count ) + 1;

			Data.shift.removeClass('ov');

			$(Event.node.shift+':lt('+count+')').addClass('ov');

			if(Data.transform) {
				Data.page.stop(1, 0).animate({
					'left': function() {
						var result = [];

						for(var i=0; i<Data.shift.length; i++) {
							result[i] = i != 0 ? result[i-1] + Data.shift.eq(i).outerWidth(true) : 0;
						}

						return result;

					}()[count-1]*-1

				}, 1000, 'easeOutExpo');

			}

		}

		Data.year.end = Data.year.start;

		return 0;
	}

	$DOCUMENT.on(Event.def, Event.node.direction, function(event) {
		event.preventDefault();

		var getValue = $(this).data('control');

		return movement({ 
			order: getValue, 
			useShield: 0
		});

	});

	$DOCUMENT.on(Event.def, Event.node.shift, function(event) {
		event.preventDefault();

		var t = $(this);

		Data.count = t.index();

		Data.index = $(Event.node.item+'[data-year="'+t.data('year')+'"]').first().index();

		return movement({
			order: 0, 
			useShield: 0

		});

	});


	/*제스쳐시작*/
    var dir = delta => {
        // 휠 방향 [ 1:위, -1:아래 ]
        return (delta < 0) ? delta = 1 : delta = -1;
    }


	Data.swipe = {
		prev: 0, 
		next: 0

	};

	Data.touchDir = '';

    // 장착 뜨든!
   //  $DOCUMENT.on(
   //  	Event.wheel, Event.node.animate, function(event) {
   //  		event.preventDefault();

	  //       var saveDir = null;

	  //       if(event.originalEvent.wheelDelta != undefined) {
	  //           saveDir = dir(event.originalEvent.wheelDelta*-1); // IE

	  //       }else{
	  //           saveDir = dir(event.originalEvent.detail); // FF,CROME,SFARI

	  //       }

			// movement({
			// 	order: saveDir > 0 ? 'prev' : 'next',
			// 	useShield: 1

			// });

   //  	}
   //  );

    $DOCUMENT.on(
    	Event.touch, Event.node.item, function(event) {
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}



    		if(event.type == "touchstart" ) {
    			Data.start = Math.floor(event.pageX);

    		}

    		if(event.type == "touchmove" ) {
    			event.preventDefault();

    			Data.move = Math.floor(event.pageX) - Data.start;

		    	Data.result = Data.move - Data.prev;

				$(Event.node.animate).css({
					'left': '+='+ function(){

						var result = Data.result;

						if(Data.result < 0){
							Data.swipe.next = 0;
							Data.swipe.prev += result;

			    			if(Data.half < Data.swipe.prev*-1) {
								Data.touchDir = 'next';
			    			}
						}

						if(Data.result > 0){
							Data.swipe.prev = 0;
							Data.swipe.next += result;

			    			if(Data.half < Data.swipe.next) {
								Data.touchDir = 'prev';

			    			}
						}

						return result;
					}()

				});

				Data.prev = Data.move;

    		}

    		if(event.type == "touchend" ) {

    			Data.prev = 0;

				Data.swipe = {
					prev: 0, 
					next: 0

				};

				movement({ 
					order: Data.touchDir, 
					useShield: 0
				});

				Data.touchDir = '';

    		}
    	}
    );

	return 0;
};

window.Slide = new _slide({
	target: '#uiHistory',
	body: '\n'+
		'\n<div class="uiHistory-holdGroup">'+
		'\n\t<div class="uiHistory-paging"><div class="inner">[%PAGING%]</div></div>'+
		'\n\t<div class="uiHistory-background">'+
		'\n\t\t[%CONTROL%]'+
		'\n\t\t<div class="uiHistory-animateGroup">[%LIST%]</div>'+
		'\n\t</div>'+
		'\n</div>',
	element: {
		control: '\n'+
			'<div class="uiHistory-control">'+
			'	<button class="prev" data-control="prev" type="button"><span class="skip">이전 슬라이드</span></button>'+
			'	<button class="next" data-control="next" type="button"><span class="skip">다음 슬라이드</span></button>'+
			'</div>',
		list: '\n\t\t<div data-year="[%YEAR%]" class="uiHistory-item">[%ITEM%]</div>',
		paging: '\n\t\t<button data-year="[%YEAR%]" type="button"><span class="year">[%YEAR%]</span><span class="circle"></span></button>',
		description: (args) => {
			return '\n'+
				'\n<div class="pt">'+
				'\n\t<div class="thumbnail"><div class="inner"><img src="[%THUMBNAIL%]" alt="[%ALTTEXT%]"></div></div>'+
				'\n\t<div class="title">'+
				'\n\t<div class="date">[%DATE%]</div>'+
				'\n\t<div class="subject">[%SUBJECT%]</div>'+
				'\n\t</div>'+
				'\n\t<div class="description">[%DESCRIPTION%]'+( args ? '\n\t<div class="effect">[%EFFECT%]</div>' : '' )+'</div>'+
				'\n</div>';
		}

	},
	data: {
		request: {
			json: '/kor/js/uiHistory/xhr/history.json',
			css: '/kor/js/uiHistory/css/style.css',
		},
		count: 1,
		index: 0,
		move: 0,
		prev: 0,

	},
	event: {
		def: 'click.slideClick',
		touch: 'touchstart.slideTouch touchmove.slideTouch touchend.slideTouch',
		//wheel: 'mousewheel.slideWheel DOMMouseScroll.slideWheel',
		node: {
			content: '#txt',
			hold: '.uiHistory-holdGroup',
			animate: '.uiHistory-animateGroup',
			direction: '.uiHistory-control button',
			item: '.uiHistory-item',
			shift: '.uiHistory-paging button',
			page: '.uiHistory-paging .inner',
			thumbnail: '.uiHistory-item .thumbnail'
		}
	}

});

