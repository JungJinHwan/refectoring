
function _uiSceneShift (args) {

	var SCOPE = this;

	SCOPE.option = args;

	var GET_DOC = document;
	var GET_TARGET_POSITION = GET_DOC.getElementsByTagName('script')[0];
	var MAKE_ELEMENT = GET_DOC.createElement("link");

	MAKE_ELEMENT.id = 'uiSceneShift';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = SCOPE.option.css;

	GET_TARGET_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_TARGET_POSITION);

	SCOPE.dataParser([ 'setDefault', 'setBind', 'setAppend', 'setCount', 'onPlayAuto' ]);

	var rw, rh, rtime;

	$WINDOW.resize(function() {
		var t = $(this);

		if(rw != t.width() || rh != t.height()) {
			clearTimeout(rtime);
			rtime = setTimeout(function() {
				// 데이터 파싱을 두번 할 필요 없잖아?
				SCOPE.option.status = { resize: true  };
				
				SCOPE.setDefault('resize', [ 'setBind', 'setAppend', 'setCount', 'onPlayAuto' ]);

				SCOPE.option.status.resize = false;

			}, 100);

			rw = rw || t.width(), rh = rh || t.height();
		}
	});

	return this;
}

_uiSceneShift.prototype.getRequester = function (args, callback) {

	return $.ajax({
		type: args.type,
		url: args.url,
		dataType: args.dataType,
		data: args.data,
		success: callback,
		error: function (res) {
			console.log('ERROR', res);
		}
	});
};

_uiSceneShift.prototype.dataParser = function (callback) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Request = SCOPE.option.request;

	SCOPE.getRequester(Request, function (res) {

		Data.responsed = res;

		if(callback) {
			for (var i=0; i<callback.length; i++) {
				SCOPE[callback[i]].call(SCOPE);

			}

			return 1;
		}
	});

	return this;
};

_uiSceneShift.prototype.setDefault = function (args, callback) {
	
	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Status = SCOPE.option.status;
	var Indicate = SCOPE.option.indicate;

	Data.index = 0, Data.oldIndex = 0, Data.count = 1;

	Status.mo = ClientWidth()<Data.mo;

	$(Indicate.parent+'-list').css({
		'width': function () {
			var offLeft = $(Indicate.parent+'-list').offset().left;
			var result = ClientWidth() - offLeft;

			return result;
		}()

	});

	if(callback) {
		for (var i=0; i<callback.length; i++) {
			SCOPE[callback[i]].call(SCOPE);

		}

		return 1;
	}

	return this;
}

_uiSceneShift.prototype.setBind = function (args) {
	
	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Indicate = SCOPE.option.indicate;

	// 구분!
	var str_category = '';
	for (var i=0; i<Data.category.length; i++) {
		str_category += '<button onclick="return SCENESHIFT.onChangeList('+Data.category[i].category+',[\'setAppend\', \'setCount\'])" type="button">'+Data.category[i].name+'<span class="icon"></span></button>';
	}

	document.querySelector(Indicate.parent+'-category').innerHTML = str_category;

	// 컨트롤!
	var str_control = '\n'+
		'\n<button onclick="return SCENESHIFT.onControl(this, \'prev\')" class="prev" type="button"><span class="skip">이전</span></button>'+
		'\n<span id="uiSceneShift-count"></span>'+
		'\n<button onclick="return SCENESHIFT.onControl(this, \'next\')" class="next" type="button"><span class="skip">다음</span></button>'+
		'\n<button onclick="return SCENESHIFT.onControl(this, \'stop\')" class="stop" type="button"><span class="skip">멈춤</span></button>'+
		'\n<button onclick="return SCENESHIFT.onControl(this, \'play\')" class="play" type="button"><span class="skip">시작</span></button>';

	document.querySelector(Indicate.parent+'-control').innerHTML = str_control;

	return this;
}

_uiSceneShift.prototype.setAppend = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Indicate = SCOPE.option.indicate;

	var list = Data.responsed[Data.index].list;

	$(Indicate.buttons)
		.removeClass("ov").eq(Data.index).addClass("ov");

	// 목록!
	var str_list = '<div class="list">';
	for (var i=0; i<list.length; i++) {

		str_list += '<div data-catrgory="'+list[i].category+'" class="item'+( i ? '' : ' ov' )+'">';
		str_list += '<a target="'+list[i].target+'" href="'+list[i].href+'">';
		str_list += '<span class="icon icon_'+list[i].category+'_'+list[i].index+'"></span>';
		str_list += '<strong class="title">'+list[i].title+'</strong>';
		str_list += '</a>';
		str_list += '</div>';
	}

	str_list += '</div>';

	document.querySelector(Indicate.parent+'-list').innerHTML = str_list;

	var items = $(Indicate.items);
	var itemsLen = items.length;

	var list = $(Indicate.parent+'-list');	

	if (list.hasClass('false')) {
		list.removeClass('false');

	}

	// 각 슬라이드 이동할 거리 구함
	Data.offset = function() {
		var result = [];

		for(var i=0; i<itemsLen; i++) {

			result[i] = i != 0 ? result[i-1] + items.eq(i).outerWidth() : 0;
		}

		return result;
	}();

	Data.clientBlock = $(Indicate.parent+'-list').outerWidth();

	Data.break = function() {
		 
		var result = false;

		for(var i=0; i<itemsLen; i++) {
			result = ( Math.floor(items.eq(i).position().left + items.eq(i).outerWidth(true)) ) > Data.clientBlock;

			if(result) {
				result = i;
				break;
			}

		}

		return result;

	}();

	if (!Data.break) { 
		list.addClass('false');
	}

	// console.log(Data.offset, Data.clientBlock, Data.break);

	SCOPE.onInBound();

	return this;
}

_uiSceneShift.prototype.setCount = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Indicate = SCOPE.option.indicate;

	var list = Data.responsed[Data.index].list;

	$(Indicate.items).removeClass("ov").eq(Data.count-1).addClass("ov");

	var str_count = '<span class="chCount">' + ( args || Data.count ) + '</span> / ' + list.length;

	document.querySelector(Indicate.parent+'-count').innerHTML = str_count;

	return this;
};

_uiSceneShift.prototype.setMovement = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Status = SCOPE.option.status;
	var Indicate = SCOPE.option.indicate;

	var lastItems = $(Indicate.items).last();

	if (lastItems.is(':animated')) {
		return 'animated';
	}

	// count
	if (args === 'prev') {
		Data.count--;
	}

	if (args  === 'next') {
		Data.count++;
	}

	// append 
	if (Data.count-1 == Data.responsed[Data.index].list.length) {
		Data.index++;
		Data.count = 1;

		if (Data.index == Data.responsed.length) {
			Data.index = 0;
			Status.returnNext = true;
		}
	}
	if (Data.count == 0) {
		Data.index--;

		if (Data.index == -1) {
			
			Data.index = Data.responsed.length-1;
		}

		Data.count = Data.responsed[Data.index].list.length;
	}

	// 끝에서 되돌아올 때 스위치로 사용
	if (Data.oldIndex > Data.index) {
		Status.firstPrev = true;
	}
	else{
		Status.firstPrev = false;	
	}

	if (Data.oldIndex != Data.index) {
		SCOPE.setAppend();
	}

	var items = $(Indicate.items);
	var itemsLen = items.length;

	$(Indicate.parent+'-list .list').stop(1, 0).animate({
		'left': Data.offset[function() {

			var result = 0;

			// 끝에서 처음으로 돌아갈때
			if (Status.returnNext) {
				Status.returnNext = false;
				return 0;
			}

			// 상태가 작은 화면일 때
			if (Status.mo) {
				return Data.count-1;
			}

			if (Data.break) {

				if(Status.firstPrev) { 
					result = itemsLen - Data.break;
				}
				else {

					if(Data.count-1 > ( itemsLen - Data.break )) {
						result = itemsLen - Data.break;
					}
					else{
						result = Data.count-1 > 1 ? (Data.count-1)-1 : 0;
					}
				}
			}

			return result;
		}()]*-1

	}, Status.firstPrev ? 0 : 600, 'easeOutCubic');

	
	SCOPE.setCount();

	Data.oldIndex = Data.index;

	return this;
};

_uiSceneShift.prototype.onInBound = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Status = SCOPE.option.status;
	var Indicate = SCOPE.option.indicate;

	// oldIndex 와 index 가 다를때 append 가 실행되기 때문에 scene 진입시 서로 같은 값을 가지도록
	Data.oldIndex = Data.index;

	if (Status.resize) {
		return 'resize'+ $WINDOW.width();
	}

	var items = $(Indicate.items);
	var itemsLen = items.length;

	for (var i=0; i<itemsLen; i++) {

		items.eq(i).css({ 
			'opacity': '0',
			'margin-left': i ? '10px' : '0px'

		}).delay(( i ? 30*i : 150 )).animate({
			'opacity': '1',
			'margin-left': '0px'

		}, 400, 'easeInOutCubic');
	}

	return this;
};

_uiSceneShift.prototype.onChangeList = function (args, callback) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;
	var Indicate = SCOPE.option.indicate;

	Data.count = 1;

	// 타겟 카테고리 변경
	Data.index = args;

	clearInterval(Event.auto);

	$(Indicate.play).show(), $(Indicate.stop).hide();

	if(callback) {
		for (var i=0; i<callback.length; i++) {
			SCOPE[callback[i]].call(SCOPE);

		}

		return 1;
	}

	return this;
};

_uiSceneShift.prototype.onControl = function (t, args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;
	var Indicate = SCOPE.option.indicate;

	clearInterval(Event.auto);

	if (args != 'play') {
		$(Indicate.play).show(), $(Indicate.stop).hide();
	}

	if (args === 'play') {
		$(Indicate.play).hide(), $(Indicate.stop).show();
		SCOPE.onPlayAuto();
	}

	if (args === 'prev') {
		SCOPE.setMovement('prev');
	}

	if (args === 'next') {
		SCOPE.setMovement('next');
	}

	return this;
}

_uiSceneShift.prototype.onPlayAuto = function () {

	var SCOPE = this;
	var Event = SCOPE.option.event;

	clearInterval(Event.auto);

	Event.auto = setInterval(function(){
		SCOPE.setMovement('next');
	}, 3000);

	return this;	
};

window.SCENESHIFT = new _uiSceneShift({
	css: '/hanbat-iucf-2017/js/uiSceneShift/css/style.css',
	request:{
		type: 'GET',
		url: '/hanbat-iucf-2017/js/uiSceneShift/xhr/data.json',
		dataType: 'json',
		data: {}
	},
	indicate:{
		parent: '#uiSceneShift',
		buttons: '#uiSceneShift-category button',
		controls: '#uiSceneShift-control button',
		play: '#uiSceneShift-control .play',
		stop: '#uiSceneShift-control .stop',
		items: '#uiSceneShift-list .item'

	},
	data:{
		mo: 768,
		category: [
			{	
				category: 0,
				name: '교육지원',
			},
			{	
				category: 1,
				name: '기업지원',
			},
			{	
				category: 2,
				name: '지역사회혁신지원'
			}
		]
	},
	event:{},
	status: {}
});