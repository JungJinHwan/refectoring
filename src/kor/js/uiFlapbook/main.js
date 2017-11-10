
function _flaps(args) {

	const SCOPE = this;

	SCOPE.option = args || {};

	let Flaps = SCOPE.option;

	var doc = document;
	var GET_ELEMENT_POSITION = doc.getElementsByTagName('script')[0];

	var MAKE_ELEMENT = doc.createElement("link");

	MAKE_ELEMENT.id = 'uiFlapbookStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = '/kor/js/uiFlapbook/css/style.css';

	GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);

	SCOPE.setRender([ SCOPE.setDefault, SCOPE.onFPS, SCOPE.onEvent ]);

	return 1;
}

_flaps.prototype.getRequester = function(args, callback) {

	const SCOPE = this;

	let Request = args || SCOPE.option.data.request;

	return $.ajax({
		type: Request.type,
		url: Request.url,
		dataType: Request.dataType,
		data: Request.data,
		success: callback,
		error: function(res) {
			console.log('ERROR', res);
		}
	});
};

_flaps.prototype.setRender = function(callback) {

	const SCOPE = this;

	let Data = SCOPE.option.data;
	let Evnet = SCOPE.option.event;

	SCOPE.getRequester(null, function(res) {

		Data.images = res.images;

		if(callback) {

			$DOCUMENT.ready(function() {

				for (let callNumber in callback) {
					callback[callNumber].call(SCOPE);

				}

				return 1;
			});
		}
		else{

			return 0;
		}
	});
};

_flaps.prototype.setDefault = function(getValue) {

	const SCOPE = this;

	let Data = SCOPE.option.data;

	Data.scene = Data.images[Data.index].scene;
	Data.scenelen = Data.scene.length;

	Data.test = 0;

	for (let sceneNumber in Data.scene) {

		let style = 'style="'+
			'z-index:'+( Data.scenelen - sceneNumber )+';'+
			'position:absolute;top:0;left:0;width:100%;height:100%;'+
			'background:url('+Data.scene[sceneNumber]+') no-repeat 50% 50% / cover;'+
			'"';

		$(SCOPE.option.parent).append('<div '+style+' id="FLAPS_SCENE_'+sceneNumber+'" />');

	}

	return 1;
};

_flaps.prototype.onFPS = function(getValue) {

	const SCOPE = this;

	let Data = SCOPE.option.data;

	Data.frame = 0;

	cancelAnimationFrame(Data.playAnimationFrame);

	return function animate() {

		if(Data.frame < Data.scenelen-1){
			$('#FLAPS_SCENE_'+Data.frame).css({ 'display': 'none' });

			console.log(Data.frame++);

			Data.playAnimationFrame = requestAnimationFrame(animate);

			return 1;
		}
		else{
			cancelAnimationFrame(Data.playAnimationFrame);

			return 0;
		}

	}();
};

_flaps.prototype.onEvent = function(getValue) {

	const SCOPE = this;

	let Data = SCOPE.option.data;

	// console.log('on Evented');

	return 1;
};

_flaps.prototype.base64 = function() {

	const xmlHTTP = new XMLHttpRequest();

	xmlHTTP.open('GET','/kor/js/uiFlapbook/images/0/0.jpg',true);

	xmlHTTP.responseType = 'arraybuffer';

	xmlHTTP.onload = function(e){

	    let arr = new Uint8Array(this.response);

	    let raw = String.fromCharCode.apply(null,arr);

	    let b64 = btoa(raw);

	    let dataURL = "data:image/jpeg;base64,"+b64;

		console.log(dataURL);
	};

	xmlHTTP.send();

	return 1;
}

window.FLAPBOOK = new _flaps({
	parent: '#uiFlapbook',
	data: {
		request: {
			type: 'GET',
			url: '/kor/js/uiFlapbook/xhr/list.json',
			dataType: 'json',
			data: null
		},
		index: 0,
	event: {
			def: 'click.def'
		}
	}
});


