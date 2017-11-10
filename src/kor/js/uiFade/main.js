
function _fade(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Pin = SCOPE.option;

	var doc = document;
	var getEl = doc.getElementsByTagName('script')[0];
	var mkEl = doc.createElement("link");

	mkEl.id = 'uiFadeStyle';
	mkEl.rel = 'stylesheet';
	mkEl.href = Pin.data.request.css;

	getEl.parentNode.insertBefore(mkEl, getEl);

	SCOPE.setList([ SCOPE.setDefault, SCOPE.onEvent ]);

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

	return 1;
}

_fade.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;

	Data.items = $(Event.node.item);
	Data.itemslen = Data.items.length;
	
	Data.index = 0;

	Data.items.removeAttr('style');

	return 1;
};

_fade.prototype.onRequest = function(args, callback) {

	var SCOPE = this;
	var Request = args || SCOPE.option.data.request;

	return $.getJSON(Request.json, function(res) {
		return callback.call(SCOPE,res);

	});

};

// option.data 의 request 수정 후 재호출해서 새로운 목록을 가져올 수 있다
_fade.prototype.setList = function(callback){

	var SCOPE = this;
	var Pin = SCOPE.option;

	var RegEx = function(key) {
		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	return SCOPE.onRequest(0, function(res) {

		var Element = Pin.element,
			result = Pin.body,
			customer = {
				list: { get: '', set: '' }
			};

		Pin.data.allCount = res.count;

		for(var count=0; count<res.count; count++ ) {

			customer.list.get = Element.list;

			for(var keys in res.data[count]) {
				customer.list.get = customer.list.get.replace(
					RegEx(keys.toUpperCase()), 
					res.data[count][keys]
				);

			}

			customer.list.set += customer.list.get;

		}

		Element.list = customer.list.set;

		for(var El in Element) {
			result = result.replace(RegEx(El.toUpperCase()), Element[El]);
		}

		$(Pin.target).html(result);

		for(var callNumber in callback) {
			callback[callNumber].call(SCOPE);
		}

	}); 

};

_fade.prototype.onEvent = function(args) {

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

	var movement = function(getValue) {

		if(getValue.useShield) {
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}
		}

		if(getValue.order) {
			Data.index = indexing(getValue.order);
		}


		Data.items.stop(1, 0).fadeOut(600, 'easeOutCubic')
			.eq(Data.index).stop(1, 0).fadeIn(600, 'easeOutCubic');

		return 1;
	}

	$DOCUMENT.on(Event.def, Event.node.control, function(event) {
		event.preventDefault();

		var getValue = $(this).data('control');

		return movement({ 
			order: getValue, 
			useShield: 0
		});

	});

	Data.swipe = {
		prev: 0, 
		next: 0

	};

	Data.touchDir = '';

    $DOCUMENT.on(
    	Event.touch, Event.node.item, function(event) {
    		
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}

    		if(event.type == "touchstart" ) {
    			Data.start = Math.floor(event.pageX);

				Data.half = Data.items.eq(Data.index).outerWidth(true)/4;

    		}

    		if(event.type == "touchmove" ) {
    			event.preventDefault();

    			Data.move = Math.floor(event.pageX) - Data.start;

		    	Data.range = Data.move - Data.prev;

				if(Data.range < 0){
					Data.swipe.next = 0;
					Data.swipe.prev += Data.range;

	    			if(Data.half < Data.swipe.prev*-1) {
	    				// prev, next 둘의 위치를 교체하면 좌, 우 방향을 바꿀 수 있습니다.
						Data.touchDir = 'next';
	    			}
				}

				if(Data.range > 0){
					Data.swipe.prev = 0;
					Data.swipe.next += Data.range;

	    			if(Data.half < Data.swipe.next) {
	    				// prev, next 둘의 위치를 교체하면 좌, 우 방향을 바꿀 수 있습니다.
						Data.touchDir = 'prev';

	    			}
				}

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

	return 1;
};

window.Pin = new _fade({
	type: 'linear',
	target: '#uiFade',
	body: '\n'+
		'\n<div class="uiFade-holdGroup">'+
			'{{CONTROL}}'+
			'{{LIST}}'+
		'\n</div>',
	element: {
		control: '\n'+
			'\n<div class="uiFade-control">'+
				'\n<button data-control="stop" type="button" class="button stop"><span class="skip">슬라이드 멈춤</span></button>'+
				'\n<button data-control="play" type="button" class="button play"><span class="skip">슬라이드 시작</span></button>'+
				'\n<button data-control="prev" type="button" class="button prev"><span class="skip">이전 슬라이드</span></button>'+
				'\n<button data-control="next" type="button" class="button next"><span class="skip">다음 슬라이드</span></button>'+
			'\n</div>',
		list: '\n'+
			'\n<div data-number="{{NUMBER}}" class="uiFade-item">'+
				'\n<div class="thumbnail" style="background-image:url({{THUMBNAIL}})">'+
					'\n<div class="title">{{TITLE}}</div>'+
				'\n</div>'+
			'\n</div>'
	},
	data: {
		request: {
			json: '/kor/js/uiFade/xhr/list.json',
			css: '/kor/js/uiFade/css/style.css',
		},
		allCount: 0,
		index: 0

	},
	event: {
		def: 'click.pinClick',
		touch: 'touchstart.pinTouch touchmove.pinTouch touchend.pinTouch',
		node: {
			content: '#uiFade',
			hold: '.uiFade-holdGroup',
			animate: '.uiFade-animateGroup',
			item: '.uiFade-item',
			control: '.uiFade-control button'

		}
	}

});

