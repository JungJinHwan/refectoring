
function _circle(args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Circle = SCOPE.option;

	var doc = document;
	var getEl = doc.getElementsByTagName('script')[0];
	var mkEl = doc.createElement("link");

	mkEl.id = 'uiCircleStyle';
	mkEl.rel = 'stylesheet';
	mkEl.href = Circle.data.request.css;

	getEl.parentNode.insertBefore(mkEl, getEl);

	SCOPE.onRender([ SCOPE.setDefault, SCOPE.onEvent ]);

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

_circle.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Event = SCOPE.option.event;

	Data.point = [],
	Data.xx = ClientWidth()/2, // 가로 중점
	Data.yy = 550, // 세로 중점
	Data.r = 500; // 반지름
	Data.vn = 0;

	for(var i=Math.PI; i<Math.PI*2.0000000000001; i+=Math.PI/10) {

		Data.point.push({
			x:Data.xx + (Math.cos(i)) * Data.r, // sin 쎄타
			y:Data.yy + (Math.sin(i)) * Data.r // cose 쎄타
		});

		Data.vn++;

	}

	Data.item = $(Event.node.item);
	Data.itemlen = Data.item.length;

	Data.cn = Math.floor(Data.vn/2);

	for(var itemNumber=0; itemNumber<Data.itemlen; itemNumber++){
		
		if(itemNumber < Data.vn){

			Data.item.eq(itemNumber).css({
				'top': Data.point[itemNumber].y*.65,
				'left': Data.point[itemNumber].x,
				'margin-left': Data.item.eq(itemNumber).width()*-1,
				'z-index': '+='+function(){

					if(itemNumber >= Data.cn){
						return Data.cn--;
					}

				}()
			});

		}
		else{
			Data.item.eq(itemNumber).css({
				'display': 'none'
			});
		}

	}

	return 1;
};

_circle.prototype.onRequest = function(args, callback) {

	var SCOPE = this;
	var Request = args || SCOPE.option.data.request;

	return $.getJSON(Request.json, function(res) {
		return callback.call(SCOPE,res);

	});

};

_circle.prototype.onRender = function(callback){

	var SCOPE = this;
	var Circle = SCOPE.option;
	var Data = Circle.data;

	var RegEx = function(key) {
		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	return SCOPE.onRequest(0, function(res) {

		var Element = Circle.element,
			Body = Circle.body,
			customer = {
				list: { get: '', set: '' }
			};

		Circle.data.allCount = res.count;

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
			Body = Body.replace(RegEx(El.toUpperCase()), Element[El]);
		}

		$(Circle.target).html(Body);

		for(var callNumber in callback) {
			callback[callNumber].call(SCOPE);
		}

	}); 

	return 1;
};

_circle.prototype.onEvent = function(args) {
	
	var Event = args || this.option.event;
	var Data = this.option.data;

	return 1;
};

window.Circle = new _circle({
	type: 'linear',
	target: '#uiCircle',
	body: '{{LIST}}',
	element: {
		list: '\n'+
			'\n<div class="uiCircle-item" style="background-image:url({{THUMBNAIL}});"></div>'
	},
	data: {
		request: {
			json: '/kor/js/uiCircle/xhr/list.json',
			css: '/kor/js/uiCircle/css/style.css',
		}

	},
	event: {
		def: 'click.circleClick',
		touch: 'touchstart.circleTouch touchmove.circleTouch touchend.circleTouch',
		node: {
			item: '.uiCircle-item'

		}
	}

});

