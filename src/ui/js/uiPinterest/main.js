function pin (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Selector = SCOPE.option.selector;

	$.ajax({
		type: SCOPE.option.request.type,
		url: SCOPE.option.request.url,
		data: SCOPE.option.request.data,
		dataType: SCOPE.option.request.dataType,
		success: function (res) {

			var resLen = res.length;

			var str = '';

			for (var i=0; i<resLen; i++) {

				str += '\n'+
					'\n<div class="item">'+
					'\n\t<a href="#">'+
					'\n\t\t<strong class="title">'+res[i].title+'</strong>'+
					'\n\t\t<div class="pt">'+res[i].description+'</div>'+
					'\n\t\t<div class="date">'+res[i].date+'</div>'+
					'\n\t</a>'+
					'\n</div>';
			}


			// 정렬, 혹은 계산 완료 된 내용을 한번만 처리
			document.querySelector(Selector.parent).innerHTML = str;
		},
		error: function (res) {

			var err = '$UI_PINTEREST Request Error, AJAX 요청이 실패하였습니다';

			console.log('ERROR', res);

			document.write(err);

			throw err;
		}
	});

	$(document).ajaxStop(function () {

		// 좌표 정렬 계산할 시간 추가 
		// 크롬 똥멍청이가 리플로우 중에 수치를 가져오려고 하는것 같다.
		setTimeout(function () {

			SCOPE.listCreateMap();
			SCOPE.listCreateAlign();
		},(navigator.userAgent.match("AppleWebKit")) ? 1000 : 300);
	});

	window.onresize = function () {

		SCOPE.listCreateMap();
		SCOPE.listCreateAlign();
	};
}

pin.prototype.listCreateMap = function () {

	var SCOPE = this;
	var Selector = SCOPE.option.selector;
	var Data = SCOPE.option.data;

	var item = $(Selector.item);
	var itemLen = item.length;

	var docWidth = document.querySelector(Selector.parent).clientWidth;

	// 한줄에 몇개의 목록이 정렬가능한가 판단
	var docCount = 0;
	var sum = 0;

	for (var i=0; i<itemLen; i++) {

		sum += Math.ceil(item.eq(i).outerWidth());

		// 1부터 시작하는 정수를 만들기위해서는 여기있어야 한다.
		if (sum > docWidth) {

			docCount = i;

			break;
		}
	}

	Data.col = docCount;

	for (var i=0; i<itemLen; i++) {

		item.eq(i).removeAttr('style');

		if (i%Data.col == 0) {

			Data.map.push([]);

			// 매번 담아지는 것보다 필요한 지점에서만 다시담도록 하는것이 성능면에서 낫다고 생각
			var mapLen = Data.map.length-1;
		}

		var colLen = Data.map[mapLen].length;

		// 이전 행의 카드와 현재 행의 각 카드의 높이를 더해 현재 카드의 위치를 만든다
		Data.map[mapLen][colLen] = i >= Data.col ? Data.map[mapLen-1][colLen] + item.eq(i-Data.col).outerHeight() : 0;

		console.log(item.eq(i).outerHeight());
	}

	return 1;
}

pin.prototype.listCreateAlign = function () {

	var SCOPE = this;
	var Selector = SCOPE.option.selector;
	var Data = SCOPE.option.data;

	var item = $(Selector.item);
	var itemLen = item.length;

	var mapLen = Data.map.length;

	var itemIdx = 0;

	for (var i=0; i<mapLen; i++) {

		var colLen = Data.map[i].length;

		// 행 단위 col 의 시작 index
		var rowIdx = i > 0 ? colLen*i : 0; 

		for (var j=0; j<colLen; j++) {

			// 아이템 index
			if (colLen != Data.col) {

				itemIdx = Data.col*i+j;
			}
			else {

				itemIdx = rowIdx+j;
			}

			item.eq(itemIdx)
				.attr('style', 'position:absolute;top:'+Data.map[i][j]+'px;left:'+(item.eq(itemIdx).outerWidth()*j)+'px')
				.delay(50*(i*0.85)).animate({ 'opacity': 1 }, 300, 'easeOutCubic');
		}
	}

	return 1;
}

window.Pinterest = new pin ({
	selector: {
		parent: "#pin",
		item: "#pin .item",
	},
	request: {
		type: 'get',
		url: '/ui/js/uiPinterest/xhr/list.json',
		dataType: 'json'
	},
	data: {
		col: 0,
		map: []
	}

});