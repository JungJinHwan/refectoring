function _shift_img_20170926(args) {

	if(!args) { 
		
		console.log(args);

		return 0; 

	}

    var SCOPE = this;
    
    SCOPE.option = args;

    var Shift = SCOPE.option;

    SCOPE.setDefault();
    SCOPE.onEvent();

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

_shift_img_20170926.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;

	Data.control = SCOPE.option.parent+' '+Event.node.control;
	Data.items = SCOPE.option.parent+' '+Event.node.item;
	Data.descriptView = SCOPE.option.parent+' '+Event.node.descriptView;
	Data.thumb = SCOPE.option.parent+' '+Event.node.thumb;
	Data.imageView = SCOPE.option.parent+' '+Event.node.imageView;
	Data.pt = SCOPE.option.parent+' '+Event.node.pt;
	Data.animate = SCOPE.option.parent+' '+Event.node.animate;

	Data.index = 0;

    var src = $(Data.thumb).eq(Data.index).attr('href');
    var alt = $(Data.thumb).eq(Data.index).attr('alt');
    var pt = $(Data.pt).eq(Data.index).html();

    $(Data.imageView).html('<img src="'+src+'" alt="'+alt+'">');

    $(Data.descriptView).html(pt);

    $(Data.thumb).removeClass('ov').eq(Data.index).addClass('ov');

    if($(Data.thumb).length <= 1) {
    	$(Data.control).css({ 'display': 'none' });
    }

	$(Data.animate).removeAttr('style');

	Data.itemslen = $(Data.items).length;

	// 각 슬라이드 이동할 거리 구함
	Data.offset = function() {
		var result = [];

		for(var i=0; i<Data.itemslen; i++) {
			result[i] = i != 0 ? result[i-1] + $(Data.items).eq(i).outerWidth(true) : 0;
		}

		return result;
	}();

	Data.clientBlock = $(Data.animate).parent().outerWidth();

	Data.break = function() {
		 
		var result = false;

		for(var i=0; i<Data.itemslen; i++) {
			result = ( Math.floor($(Data.items).eq(i).position().left + $(Data.items).eq(i).outerWidth(true)) ) > Data.clientBlock;

			if(result) {
				result = i;
				break;
			}

		}

		return result;

	}();

	return 1;
};

_shift_img_20170926.prototype.onEvent = function() {

    var SCOPE = this;
    var Data = SCOPE.option.data;
    var Event = SCOPE.option.event;

    var indexing = function(getValue) {

        switch(getValue) {
            case 'prev' :
                if(Data.index > 0) {
                    Data.index--;
                }

                break;

            case 'next' :
                if(Data.index < $(Data.items).length-1) {
                    Data.index++;
                }

                break;

        }

        return Data.index;
    }

    var movement = function(getValue) {


        if(getValue.order) {
            Data.index = indexing(getValue.order);
        }

        var src = $(Data.thumb).eq(Data.index).attr('href');
        var alt = $(Data.thumb).eq(Data.index).attr('alt');
        var pt = $(Data.pt).eq(Data.index).html();

		$(Data.imageView+' img').attr('src', src).attr('alt', alt);

		$(Data.descriptView).html(pt);

		$(Data.thumb).removeClass('ov').eq(Data.index).addClass('ov');

		$(Data.animate).stop(1, 0).animate({
			'left': Data.offset[function() {

                if(Data.break) {
    				var result = Data.index > 1 ? Data.index-1 : 0;

                    if(Data.index > ( Data.itemslen - Data.break )) {
                        result = Data.itemslen - Data.break;
                    }

                }

				return result;

			}()]*-1

		}, 600, 'easeOutCubic');

        return 1;
    }

    Data.swipe = {
        prev: 0, 
        next: 0

    };

    Data.touchDir = '';

    $DOCUMENT.on(
        Event.control, Data.control, function(event) {
            event.preventDefault();

            var t = $(this);

            return movement({
                order: t.data('control'),
                useShield: 0
            });
        }

    ).on(
        Event.thumb, Data.thumb, function(event) {
            event.preventDefault();

            var t = $(this);

            Data.index = $(Data.thumb).index(t);

            return movement({
                order: 0, 
                useShield: 0
            });
        }

    ).on(
        Event.touch, Data.imageView, function(event) {

    		if(!Data.mouseDown && ( event.type == "touchstart" || event.type == "mousedown" )) {

    			Data.mouseDown = true;
    			Data.start = Math.floor(event.pageX);
				Data.half =  Data.sensit || $(Data.items).eq(Data.index).outerWidth(true)/4;

    		}

    		if(Data.mouseDown && ( event.type == "touchmove" || event.type == "mousemove" )) {
    			event.preventDefault();

    			Data.move = Math.floor(event.pageX) - Data.start;

		    	Data.range = Data.move - Data.prev;

                if(Data.range < 0){
                    Data.swipe.next = 0;
                    Data.swipe.prev += Data.range;

                    if(Data.half < Data.swipe.prev*-1) {
                        // prev, next 교체로 좌, 우 방향을 변경할 수 있습니다.
                        Data.touchDir = 'next';
                    }
                }

                if(Data.range > 0){
                    Data.swipe.prev = 0;
                    Data.swipe.next += Data.range;

                    if(Data.half < Data.swipe.next) {
                        // prev, next 교체로 좌, 우 방향을 변경할 수 있습니다.
                        Data.touchDir = 'prev';

                    }
                }

				Data.prev = Data.move;

    		}

    		if(Data.mouseDown && ( event.type == "touchend" || event.type == "mouseup" || event.type == "mouseleave" )) {

    			Data.mouseDown = false;

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

//  id 를 차례로 추가 [ 마지막 콤마(,) 없음 ]
var objectArray = [
	'#uiShiftImages-0',
	'#uiShiftImages-1',
	'#uiShiftImages-2',
	'#uiShiftImages-3'
];

for(var arrayNumber in objectArray) {

    window.SHIFT = {
       scoping: arrayNumber,
       parent: objectArray[arrayNumber],
       data: {
           index: 0,
			// sensit : 가로이동 판단 기준 거리가 25 이상인 것이 세로 터치이동시에 영향이 적다.
			// sensit : 삭제하면 기본 4 분의 1 거리 만큼이 판단 기준이 된다.
           sensit: 25
       },
       event: {
           control: 'click.control',
           thumb: 'click.thumb',
           touch: 'touchstart.touch touchmove.touch touchend.touch mousedown.touch mousemove.touch mouseup.touch mouseleave.touch',
           node: {
           	   animate: '.list',
               control: '.control .arr',
               thumb: '.item a',
               pt: '.pt',
               item: '.item',
               imageView: '.galleryView',
               descriptView: '.descriptView'

           }
		}
	};

	new Function("window.SHIFT_CHILDREN_"+arrayNumber+" = new arguments[0](SHIFT)")(_shift_img_20170926);

}
