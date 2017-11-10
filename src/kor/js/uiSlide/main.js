
function _slide(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Slide = SCOPE.option;

	var GET_DOC = document;
	var GET_TARGET_POSITION = GET_DOC.getElementsByTagName('script')[0];
	var MAKE_ELEMENT = GET_DOC.createElement("link");

	MAKE_ELEMENT.id = 'uiSlideStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = Slide.data.request.css;

	GET_TARGET_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_TARGET_POSITION);

	SCOPE.setRender([ SCOPE.setDefault, SCOPE.onEvent ]);

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

_slide.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;

	Data.items = $(Event.node.item);
	Data.itemslen = Data.items.length;
	
	Data.index = 0;

	Data.items.removeAttr('style');
	$(Event.node.hold).removeAttr('style');
	$(Event.node.animate).removeAttr('style');

	$(Event.node.hold).css({
		'width': ClientWidth(),
		'margin-left': function() {

			var w = ClientWidth();
			var cw = $(Event.node.content).outerWidth();

			var result = w - cw;

			if(w != cw) {
				return result/2*-1;
			}
			else{
				return 0;
			}
			
		}()
	});

	$(Event.node.animate).css({
		'width': function() {
			
			var result = 0;

			for(var i=0; i<Data.itemslen; i++){
				result += Data.items.eq(i).outerWidth(true);

			}

			return result;
		}()
	});

	for(var itemNumber=0; itemNumber<Data.itemslen; itemNumber++){

		Data.items.eq(itemNumber).css({
			'opacity': itemNumber ? .7 : 1,
			'width': $(Event.node.animate).width()/Data.itemslen
		});
	}

	// 각 슬라이드 이동할 거리 구함
	Data.offset = function() {
		var result = [];

		for(var i=0; i<Data.itemslen; i++) {
			result[i] = i != 0 ? result[i-1] + Data.items.eq(i).outerWidth(true) : 0;
		}

		return result;
	}();

	return 1;
};

_slide.prototype.onRequest = function(args, callback) {

	var SCOPE = this;
	var Request = args || SCOPE.option.data.request;

	return $.getJSON(Request.json, function(res) {
		return callback.call(SCOPE,res);

	});
};

// option.data 의 request 수정 후 재호출해서 새로운 목록을 가져올 수 있다
_slide.prototype.setRender = function(callback){

	var SCOPE = this;
	var Slide = SCOPE.option;

	var RegEx = function(key) {
		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	return SCOPE.onRequest(0, function(res) {

		var Element = Slide.element,
			result = Slide.body,
			customer = {
				list: { get: '', set: '' }
			},
			storage = {
				control: Element.control,
				paging: Element.paging(res.count)

			};

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

		storage.list = customer.list.set;

		for(var El in storage) {
			result = result.replace(RegEx(El.toUpperCase()), storage[El]);
		}

		$(Slide.target).html(result);

		$DOCUMENT.ready(function() {

			for(var callNumber in callback) {
				callback[callNumber].call(SCOPE);
			}

		});
	}); 
};

_slide.prototype.onEvent = function(args) {

	var Event = args || this.option.event;
	var Data = this.option.data;
	var Func = this.option.func;

	Func.indexing = function(getValue) {

		switch(getValue) {
			case 'prev' :
				if(Data.index > 0) {
					Data.index--;
				}
				else{
					Data.index = Data.items.length-1;
				}

				break;

			case 'next' :
				if(Data.index < Data.items.length-1) {
					Data.index++;
				}
				else{
					Data.index = 0;
				}

				break;

		}

		return Data.index;
	}

	Func.movement = function(getValue) {

		if(getValue.useShield) {
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}
		}

		if(getValue.order) {
			Data.index = Func.indexing(getValue.order);
		}

		$(Event.node.animate).stop(1, 1).animate({
			'left': Data.offset[Data.index]*-1

		}, 600, 'easeOutCubic');

		Data.items.stop(1, 0).animate({
			'opacity': 0.15

		}, 600, 'easeOutCubic')
		.eq(Data.index).stop(1, 0).animate({
			'opacity': 1

		}, 600, 'easeOutCubic');

		$(Event.node.paging).removeClass('ov').eq(Data.index).addClass('ov');

		return 1;
	}

	$DOCUMENT.on(Event.def, Event.node.control, function(event) {
		event.preventDefault();

		var getValue = $(this).data('control');

		return Func.movement({ 
			order: getValue, 
			useShield: 0
		});

	});

	Data.swipe = {
		prev: 0, 
		next: 0

	};

	Data.touchDir = '';
	Data.mouseDown = false;

    $DOCUMENT.on(
    	Event.touch, Event.node.item, function(event) {
			if($(Event.node.animate).is(':animated')) {
				return 0;

			}

    		if(!Data.mouseDown && ( event.type == "touchstart" || event.type == "mousedown" )) {

    			Data.mouseDown = true;
    			Data.start = Math.floor(event.pageX);
				Data.half = Data.items.eq(Data.index).outerWidth(true)/2;

    		}

    		if(Data.mouseDown && ( event.type == "touchmove" || event.type == "mousemove" )) {
    			event.preventDefault();

    			Data.move = Math.floor(event.pageX) - Data.start;

		    	Data.range = Data.move - Data.prev;

				$(Event.node.animate).css({
					'left': '+='+ function(){

						var result = Data.range;

						if(Data.range < 0){
							Data.swipe.next = 0;
							Data.swipe.prev += result;

			    			if(Data.half < Data.swipe.prev*-1) {
								Data.touchDir = 'next';
			    			}
						}

						if(Data.range > 0){
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

    		if(Data.mouseDown && ( event.type == "touchend" || event.type == "mouseup" || event.type == "mouseleave" )) {

    			Data.mouseDown = false;

    			Data.prev = 0;

				Data.swipe = {
					prev: 0, 
					next: 0

				};

				Func.movement({ 
					order: Data.touchDir, 
					useShield: 0
				});

				Data.touchDir = '';

    		}

    	}
    );

	return 1;
};

_slide.prototype.stop = function() {

	var SCOPE = this;

	var Data = SCOPE.option.data;

	clearInterval(Data.interval);
};

_slide.prototype.play = function() {

	var SCOPE = this;

	var Func = SCOPE.option.func;
	var Data = SCOPE.option.data;

	clearInterval(Data.interval);

	Data.interval = setInterval(function() {

		return Func.movement({ order: 'next', useShield: 0 });

	}, 3000);
};

window.Slide = new _slide({
	type: 'linear',
	target: '#uiSlide',
	body: '\n'+
		'\n<div class="uiSlide-holdGroup">'+
			'{{CONTROL}}'+
			'\n<div class="uiSlide-background">'+
				'\n<div class="uiSlide-animateGroup">{{LIST}}</div>'+
			'\n</div>'+
		'\n</div>'+
		'\n{{PAGING}}',
	element: {
		control: '\n'+
			'\n<div class="uiSlide-control">'+
				'\n<button data-control="stop" type="button" onclick="return Slide.stop();" class="button stop"><span class="skip">슬라이드 멈춤</span></button>'+
				'\n<button data-control="play" type="button" onclick="return Slide.play();" class="button play"><span class="skip">슬라이드 시작</span></button>'+
				'\n<button data-control="prev" type="button" class="button prev"><span class="skip">이전 슬라이드</span></button>'+
				'\n<button data-control="next" type="button" class="button next"><span class="skip">다음 슬라이드</span></button>'+
			'\n</div>',
		list: '\n'+
			'\n<div data-number="{{NUMBER}}" class="uiSlide-item">'+
				'\n<div class="thumbnail" style="background-image:url({{THUMBNAIL}})">'+
					'\n<div class="title">{{TITLE}}</div>'+
				'\n</div>'+
			'\n</div>',
		paging: function(get) {

			var node = '\n'+
				'<div class="uiSlide-pagingGroup">';

			for(var i=0; i<get; i++) {
				node += '<button'+( i ? '' : ' class="ov"' )+' type="button" data-index='+i+'>'+(i+1)+'</button>';
			}

			node += '</div>';

			var Event = Slide.option.event;
			var Data = Slide.option.data;
			var Func = Slide.option.func;

			$DOCUMENT.on(
				Event.paging, Event.node.paging, function(e) {
					e.preventDefault();

					var t = $(this);

					Data.index = t.data('index');

					$(Event.node.paging).removeClass('ov').eq(Data.index).addClass('ov');

					Func.movement({ order: 0, useShield: 0 });

				}
			);

			return node;
		}
	},
	data: {
		request: {
			json: '/kor/js/uiSlide/xhr/list.json',
			css: '/kor/js/uiSlide/css/style.css',
		},
		allCount: 0,
		index: 0

	},
	event: {
		def: 'click.def',
		paging: 'click.paging',
		touch: 'touchstart.touch touchmove.touch touchend.touch mousedown.touch mousemove.touch mouseup.touch mouseleave.touch',
		node: {
			content: '#uiSlide',
			hold: '.uiSlide-holdGroup',
			animate: '.uiSlide-animateGroup',
			item: '.uiSlide-item',
			control: '.uiSlide-control button',
			paging: '.uiSlide-pagingGroup button'

		}
	},
	func : {}

});

