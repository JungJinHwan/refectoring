'use strict';

function _taste(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Taste = SCOPE.option;

	var GET_DOC = document;
	var GET_TARGET_POSITION = GET_DOC.getElementsByTagName('script')[0];

	for(var cssNumber in Taste.data.request.css) {

		var MAKE_ELEMENT = GET_DOC.createElement("link");

		MAKE_ELEMENT.id = 'uiTasteStyle'+cssNumber;
		MAKE_ELEMENT.rel = 'stylesheet';
		MAKE_ELEMENT.href = Taste.data.request.css[cssNumber];

		GET_TARGET_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_TARGET_POSITION);

	}

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

_taste.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;

	Data.obj = $(Event.node.obj);
	Data.items = $(Event.node.item);
	Data.itemslen = Data.items.length;
	Data.checker = $(Event.node.checker);

	Data.index = 0,
	Data.name = { season: '', trget: '', lsr: '' }

	var headerHeight = $("#top_layout").outerHeight();
	var itemsHeight = $(Event.node.content).outerHeight();

	Data.items.removeAttr('style').css({
		'width': ClientWidth(),
		'height': itemsHeight+headerHeight,
		'margin-top': headerHeight*-1,
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

	// 각 슬라이드 이동할 거리 구하기
	Data.offset = function() {
		var result = [];

		for(var i=0; i<Data.itemslen; i++) {
			result[i] = i != 0 ? result[i-1] + Data.items.eq(i).outerWidth(true) : 0;
		}

		return result;
	}();

	// 슬라이드 위치 반영
	for(var i=0; i<Data.itemslen; i++) {

		Data.items.eq(i).css({ 
			'position': 'absolute',
			'top': '0',
			'left': i ? Data.offset[1] : 0
		});

	}

	return 1;
};

_taste.prototype.onRequest = function(args, data ,type, callback) {

	var SCOPE = this;

	return $.get(args, data, function(res) {
		return callback.call(SCOPE, res);
		// 필요한 경우 콜백 함수를 배열로 받아와서 반복문을 사용해 복수의 프로그램을 실행 할 수 있다

	}, type);

};

// option.data 의 request 수정 후 재호출해서 새로운 목록을 가져올 수 있다
_taste.prototype.setRender = function(callback) {

	var SCOPE = this;
	var Taste = SCOPE.option;
	var Data = SCOPE.option.data;
	var Request = SCOPE.option.data.request;

	var RegEx = function(key) {
		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	SCOPE.onRequest(Request.json, null, 'json', function(res) {

		var Element = Taste.element,
			result = Taste.body,
			customer = {
				list: { get: '', set: '' }
			},
			storage = {};


		for(var count=0; count<res.count; count++ ) {

			customer.list.get = Element.list(res.data[count]);

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

		$(Taste.parent).html(result);

		// 내부 요소 로드 완료 지점
		if(callback){
			// 내부 요소 로드 완료 지점
			for(var callNumber in callback) {
				callback[callNumber].call(SCOPE);
			}
		}
	}); 

	return 1;
};

_taste.prototype.xhrListConection = function(callback) {

	var SCOPE = this;
	var Taste = SCOPE.option;
	var Data = SCOPE.option.data;
	var Request = SCOPE.option.data.request;

	SCOPE.onRequest(Request.url, Data.name ,'html', function(res) {

		var blankCheck = 0;

		for(var nameNumber in Data.name) {
			if(Data.name[nameNumber] === ''){
				blankCheck++;
			}
		}

		if(blankCheck === 3) {
			alert('반드시 한개 이상 선택되어야 결과를 가져올 수 있습니다');

			return SCOPE.replay();
		}

		var parseHtml = res+
			'\n<div class="uiTaste-return center">'+
			'\n\t<button class="btn btn-ani" type="button" onclick="return Taste.replay();">다시하기 <span class="bicon arr"></span></button>'+
			'\n</div>';

		$(Taste.parent).html(parseHtml).css({ 'height': 'auto', 'text-align': 'left' });

		Data.exit = 1;

		/* dist */
		if(callback){
			// 내부 요소 로드 완료 지점
			for(var callNumber in callback) {
				callback[callNumber].call(SCOPE);
			}
		}
	});

};

_taste.prototype.onEvent = function(args) {

	var SCOPE = this;
	var Event = SCOPE.option.event;
	var Data = SCOPE.option.data;
	var Request = SCOPE.option.data.request;

	var namekeys = [];

	for( var nameKey in Data.name ) {
		namekeys.push(nameKey);
	}

	$DOCUMENT.off('checker').on(
		Event.checker, Event.node.checker, function( event ) {
			event.preventDefault();

			var t = $(this);
			var index = Data.checker.index(t);

			if(t.hasClass('ov')) {
				t.removeClass('ov');

				Data.name[namekeys[Data.index]] = '';

			}
			else{

				Data.name[namekeys[Data.index]] = t.data('name');

				Data.checker.removeClass('ov').eq(index).addClass('ov');

			}

		});

	$DOCUMENT.off('def').on(
		Event.def, Event.node.control, function( event ) {
			event.preventDefault();

			var t = $(this);

			Data.index = t.data('step');

			if(Data.index < Data.items.length) {
				Data.items.eq(Data.index).show().animate({ 'left': 0 }, 700, 'easeOutExpo');
			}
			else{

				if(!Data.exit) {
					SCOPE.xhrListConection();

				}

			}
		});

	return 1;
};

_taste.prototype.replay = function() {

	var SCOPE = this;
	var Taste = SCOPE.option;
	var Data = SCOPE.option.data;

	Data.exit = 0;

	$(Taste.parent).removeAttr('style');
	
	return SCOPE.setRender([ SCOPE.setDefault ]);
};

window.Taste = new _taste({
	type: 'linear',
	parent: '#uiTaste',
	body: '{{LIST}}',

	element: {
		list: function(get) {

			var result = '\n'+
				'\n<div class="uiTaste-group" id="uiTasteStep'+get.step+'">'+
				'\n\t<div class="inner">'+
				'\n\t\t<div class="uiTaste-step"><span class="skip">강릉관광 맞춤형 여행코스 STEP.'+get.step+'</span></div>'+
				'\n\t\t<div class="uiTaste-title"><span class="skip">강릉으로 떠나는 시기는 언제 인가요?</span></div>'+
				'\n\t\t<ul class="uiTaste-checker">';

			for(var tagsNumber in get.tags) {
				result += '\n'+
					'\n\t\t\t<li>'+
					'\n\t\t\t\t<button type="button" class="tags-'+get.step+'-'+tagsNumber+'" data-name="'+get.tags[tagsNumber].code+'">'+
					'\n\t\t\t\t\t<span class="over-view clip"></span>'+
					'\n\t\t\t\t\t<span class="over-view mask"></span>'+
					'\n\t\t\t\t\t\t<span class="en">'+get.tags[tagsNumber].en+'</span>'+
					'\n\t\t\t\t\t\t<span class="kr">'+get.tags[tagsNumber].kr+'</span>'+
					'\n\t\t\t\t</button>'+
					'\n\t\t\t</li>';
			}

			result += '\n'+
				'\n\t\t</ul>';

			return result+function(){

					var result = '\n'+
						'\n\t\t<div class="uiTaste-control">'+
						'\n\t\t\t<button data-step="'+Number( get.step )+'" type="button"'+( 
							get.step != '03' ? 
								' class="next"><span class="skip">다음으로</span>' :
								' class="result"><span class="skip">취향저격 여행지 보기</span>' 
							)+'</button>'+
						'\n\t\t</div>';

					return result;
				}()+
				'\n\t</div>'+
				'\n</div>';
			}
		},

	data: {
		request: {
			css: [
				'/gn/js/uiTaste/css/style.css',
				'http://gntour.v3.acego.net/css/prog/lod/style.css'
			],
			json: '/gn/js/uiTaste/xhr/list.json',
			url: '/gn/js/uiTaste/xhr/list.html'
		},
		index: 0,
		name: { season: '', trget: '', lsr: '' }
	},
	event: {
		def: 'click.def',
		checker: 'click.checker',
		replay: 'click.replay',
		node: {
			obj: '#uiTaste',
			item: '.uiTaste-group',
			content: '#txt',
			control: '.uiTaste-control button',
			checker: '.uiTaste-checker button',
			replay: '.uiTaste-return button'
		}
	}
});

