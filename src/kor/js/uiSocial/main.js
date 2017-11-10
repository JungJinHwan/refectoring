/*
	releaze 0.0.3

	# 개발노트

	- v 0.0.1 ( 2017-09-15 정진환 jung860420@gmail.com )
		# 프로토타입 완성 
		# 모던 브라우저 , IE 9 이상 호환

	- v 0.0.2 ( 2017-09-18 정진환 jung860420@gmail.com )
		# 좌표와 너비 높이로 정렬을 진행하면 순서대로 정렬하기 때문에 한쪽이 필요 이상으로 길어지게 되어 만들다 만듯 하다. 
		# 해결방법은 가로 한줄 정렬 했다면, 다음 가로 한줄이 위치할 좌표를 계산 후 검증단계를 거쳐야 할것이다. 
		# 다음 줄 카드들의 높이를 가져오고 계산된 좌표중 가장 작은 좌표에 높이가 가장 긴 카드를 붙인다. 
		# 그에 맞게 다음 좌표가 첫번째보다 크고 나머지보다 작을 때 두번째 긴 카드를 붙인다.
		#
		# 한 행에 4개의 카드가 있다고 가정하고 4 로 나누어 떨어진 값이 같을 때 항상 같은 열을 참조한다.
		# n % 4 일때 나머지가 0이면 첫번째 열을, 1은 두번째, 2는 세번째, 3은 네번째 열의 카드만 참조한다.
		# 테스트 결과 위와 같다면 한 행을 처리할 때 마다, 다음 카드들이 위치를 좌표를 다음과같이 기록한다. 
		#
		# [
		#	= 1열.position().top + 높이 outerHeight(true),
		#	= 2열.position().top + 높이 outerHeight(true),
		#	= 3열.position().top + 높이 outerHeight(true),
		#	= 4열.position().top + 높이 outerHeight(true)
		# ]
		#
		# ( * 가로 한 줄에 대한 카드의 갯수가 4개 이상이라면 4개 이상이 한 배열에 입력된다 )
		#
		# 마지막 행에서 카드가 너비한계선 만큼의 갯수를 채우지 못하면 이전 좌표를 가지고있는 min 과 max 가 정상적으로 일치 하지 않는다.
		# 한 행의 카드 갯수 지정은 5 의 배수가 이상적이다

	- v 0.0.3 ( 2017-09-18 정진환 jung860420@gmail.com )
		# 전체 높이 구하기
		# 복잡한 계산식을 이용 하기보다 css 를 사용해서 스크롤 영역을 생성한 후 scrollHeight 를 참조해온다 - 세상넘나심플
		# 최초 margin-top 을 Data.bounse 만큼 위로 당겨 올리기 때문에 결과에 scrollHeight + Data.bounse
		# 더보기 버튼 영역 확보 되어야 하므로 scrollHeight + Data.bounse + 더보기버튼.outerHeight(true)

	- v 0.0.4 ( 2017-10-16 정진환 jung860420@gmail.com )
		# 더보기 버튼 목록 더 가져오기 추가
		# 
		# 
		# 
		# 


*/

function _social(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Social = SCOPE.option;

	var doc = document;
	var getEl = doc.getElementsByTagName('script')[0];

	var mkEl = doc.createElement("link");

	mkEl.id = 'uiSocialStyle';
	mkEl.rel = 'stylesheet';
	mkEl.href = Social.data.request.css;

	getEl.parentNode.insertBefore(mkEl, getEl);

	var facebook = {
		type: 1,
		url: 'https://graph.facebook.com/greenjp/',
		fields: 'full_picture,created_time,message,link,from',
		access_token: '1280169205428851|Ho3riqmJOseOfqX5_8Sjoqu3iv8',
		limit: Social.data.limit
	};

	Social.data.fb = {};

	SCOPE.onRequest({
		url: facebook.url,
		fields: 'photos{images}',
		access_token: facebook.access_token

	},function(res) {
		Social.data.fb.profile = res.photos.data[0].images[1].source;

		SCOPE.onRender(facebook,[ SCOPE.setDefault, SCOPE.onEvent ]);

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

	return 1;
}

_social.prototype.setDefault = function() {

	var SCOPE = this;
	var Social = SCOPE.option;
	var Data = Social.data;
	var Event = Social.event;

	Data.items = $(Event.node.item);
	Data.itemslen = Data.items.length;

	var iWorld = $(Social.target).width(), iWidth = 0, iCount = 0;
	var cutCount = 0;

	$(Social.target).removeAttr('style');

	Data.sort = { before: [], after: [] };

    for(var i=0; i<Data.itemslen; i++) {

    	var curr = Data.beforeItem = Data.items.eq(i);
    	var prev = curr.prev();

	  	iWidth += curr.outerWidth(true);

		if(iWidth > iWorld) {
			iWidth = curr.outerWidth(true);
			cutCount = iCount;
			iCount = 0;

		}

		// 다음의 큰것(before), 이전의 작은것(after) 판단
    	if(i%cutCount === 0) {
    		var setLength = i+cutCount;

    		for(var k=i; k<setLength; k++) {

    			if(k === Data.itemslen){
    				break;

    			}

    			Data.sort.before[k-i] = Data.items.eq(k).outerHeight(true);
    			Data.sort.after[k-i] = Data.items.eq(k-cutCount).outerHeight(true) + 
    									Data.items.eq(k-cutCount).position().top;
    		}

    		Data.row = i;

    	}

    	if(cutCount){
     		// 이것은 다음 줄의 가장 길이가 긴 것의 위치가 된다.
     		var min = Math.min.apply(null, Data.sort.before);
     		var max = Math.max.apply(null, Data.sort.after);

    		Data.sort.beforeIndex = Data.sort.before.indexOf(min);
    		Data.sort.afterIndex = Data.sort.after.indexOf(max);

    		Data.sort.before[Data.sort.beforeIndex] = 99999999;
    		Data.sort.after[Data.sort.afterIndex] = 0;

			Data.beforeItem = Data.items.eq( Data.row + Data.sort.beforeIndex );
			Data.afterItem = Data.items.eq( (Data.row - cutCount) + Data.sort.afterIndex );

		}

        Data.beforeItem.css({
            'top': cutCount ? function() {
				return Data.afterItem.position().top +
					Data.afterItem.outerHeight(true) + Data.bounce;
					// # css 의 position 위치를 기준으로 계산.
					// # 시작 위치가 Data.bounce 만큼 위로 올라가 있기 때문에 Data.bounce 만큼 더해준다.

            }() : 0,
            'left': i ? function() {
				var result = prev.position().left + prev.outerWidth(true);

            	return i%cutCount ? Data.afterItem.position().left : function() {
					return iCount ? result : Data.afterItem.position().left

            	}();

            }() : 0,
            'margin-top': Data.bounce*-1

        }).delay(70*i).animate({ 
        	'opacity': 1, 
        	'margin-top': 0

        }, 1000, 'easeOutExpo');

        iCount++;

    }

    Data.endPosition = document.querySelector(Social.target).scrollHeight;

    $(Social.target).css({ 
    	'overflow': 'hidden',
    	'height': Data.endPosition + Data.bounce + $(Event.node.more).outerHeight(true)

    });

	return 1;
};

_social.prototype.onRequest = function(args, callback) {

	var SCOPE = this;
	var request, data;

	if(typeof args === 'object') {
		request = ( args.type ? args.url + 'feed' : args.url ) + '?callback=?';
		data = { 
			'fields': args.fields, 
			'access_token': args.access_token, 
			'limit': args.limit

		}
	}
	else{
		request = args;
		data = {};

	}

	return $.getJSON(request, data, ( callback ? function(res) {
		return callback.call(SCOPE,res);

	} : ''));
};

_social.prototype.onRender = function(args, callback) {

	var SCOPE = this;
	var Social = SCOPE.option;
	var Data = Social.data;

	var RegEx = function(key) {
		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	return SCOPE.onRequest(args, function(res) {

		Data.paging = res.paging;

		var ELEMENT = Social.element,
			BODY = Social.body,
			customer = {
				list: { get: '', set: '' }
			}, 
			storege = {
				list: '', control: ELEMENT.control
			};

		for(var fbNumber in res.data) {

			customer.list.get = ELEMENT.list;

			var picture = res.data[fbNumber].full_picture;
			var message = res.data[fbNumber].message;
				message = ( message ? message.length : 0 ) > 100 ? message.substr(0, 100)+' ...': message;

			var id = res.data[fbNumber].from.id;
			var name = res.data[fbNumber].from.name;
			var time = res.data[fbNumber].created_time.substr(0, 10).replace(/\-/g,".");

			if(id != '147563161958624') {
				// 페이지 고유 id 가 아니면 믿고 거른다
				continue;
			}

			customer.list.set = '\n'+
				'\n<a href="'+res.data[fbNumber].link+'" target="_blank" title="새창열기">'+
					'\n<div class="photos"><img src="'+Data.fb.profile+'" alt="'+name+'"></div>'+
					'\n<div class="name">'+name+'</div>'+
					'\n<div class="time">'+time+'</div>'+
					function() {
						var result ='\n'+
							'\n<div class="picture">'+
								'\n<img src="'+picture+'" alt="'+message+'">'+
							'\n</div>';

						return picture ? result : '';
					}()+
					( message ? '\n'+(message?'<div class="message">'+message+'</div>':'') : '' )+
				'\n</a>';

			storege.list += customer.list.get.replace(RegEx('LIST'), customer.list.set);

			Data.index++;

		}

		for(var el in storege) {

			BODY = BODY.replace(RegEx(el.toUpperCase()), function(){

				var result = storege[el];

				if(typeof storege[el] === 'object') {
					
					if(Data.page < storege[el].count) {
						result = storege[el].string;

					}
					else{
						result = '';
					}

				}

				return result;

			}());
		}

		$(Social.target).html(BODY);

		Data.page++; // 페이지 가 생성되었음을 알리는 용도

		if(callback) {

			var loadLength = $DOCUMENT.find('img').length;
			var loadCounter = 0;

			$DOCUMENT.find('img').load(function() {
				// 그림들 불러오는 중인지 확인
				loadCounter++;

				if(loadCounter > loadLength-1) {
					// 마지막 그림을 완전히 불러오면
					for(var callNumber in callback) {
						callback[callNumber].call(SCOPE);
					}

					return 1;
				}

				return 0;
			});
		}
	}); 

	return 1;
};

_social.prototype.onEvent = function(args) {
	
	var SCOPE = this;
	var Event = args || SCOPE.option.event;
	var Data = SCOPE.option.data;

	$DOCUMENT.off('.def').on(
		Event.def, Event.node.more, function(event) {
			event.preventDefault();

			var t = $(this);
			var dir = t.data('control');

			var parentUrl = Data.paging.next.split('');

			console.log()

			// SCOPE.onRender( Data.paging(dir), [ SCOPE.setDefault ] );

		});

	return 1;
};

window.Social = new _social({
	type: 'linear',
	target: '#uiSocial',
	body: '{{LIST}}{{CONTROL}}',
	element: {
		list: '\n<div style="opacity:0" class="uiSocial-item">{{LIST}}</div>',
		control: '\n'+
			'\n<div class="uiSocial-button">'+
				'\n<button data-control="prev" type="button">PREV</button>'+
				'\n<button data-control="next" type="button">NEXT</button>'+
			'\n</div>'
	},
	data: {
		request: {
			css: '/kor/js/uiSocial/css/style.css',
		},
		bounce: 25,  // 상, 하 어느 한쪽 면의 패딩 간격 만큼
		limit: 10,
		index: 0,
		page: 0
	},
	event: {
		def: 'click.def',
		touch: 'touchstart.touch touchmove.touch touchend.touch',
		node: {
			item: '.uiSocial-item',
			more: '.uiSocial-button button'

		}
	}

});

