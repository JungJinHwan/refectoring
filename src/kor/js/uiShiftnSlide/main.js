
function _ShiftnSlide (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	SCOPE.option.rgxp = new RegExp('\{\%[a-zA-Z\u0020]+\%\}');
	SCOPE.option.rgxp.end = new RegExp('[{%\u0020]+(end)');

	SCOPE.renderer([ 'setDefault',  ]);

	return this;
}

_ShiftnSlide.prototype.renderer = function (callback) {

	var SCOPE = this;
	var Data = SCOPE.option.data;

	var Reg = SCOPE.option.rgxp;
	var indicate = SCOPE.option.indicate;
	var ParseString = SCOPE.option.parseString;

	if (callback) {
		for (var i=0; i<callback.length; i++) {
			SCOPE[callback[i]].call(SCOPE);
		}
	}

	return this;
};

_ShiftnSlide.prototype.setIndicator = function () {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	Process.setQuery = function (node, parsed){
		// Process.setQuery(null, null); 이면 전체 삭제

		if(!node && !parsed) {
			$(Data.config.loop).empty();
		}

		if($(Data.config.empty)) {
			$(Data.config.empty).remove();
		}

		$(node).prepend(parsed);

		return this;
	};

	// 템플릿 뷰
	Process.setQuery(SCOPE.option.parent, ParseString.template);
	Process.setQuery(Data.config.loop, ParseString.empty);

	SCOPE.option.indicate = null;
	delete SCOPE.option.indicat;

	return this;
};

_ShiftnSlide.prototype.setStyleSheet = function(args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;

	var doc = document;
	var GET_ELEMENT_POSITION = doc.getElementsByTagName('script')[0];

	var MAKE_ELEMENT = doc.createElement("link");

	MAKE_ELEMENT.id = 'uiUploadMachineStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = Data.config.request.css;

	GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);

	return this;
}

_ShiftnSlide.prototype.setDefault = function (args) {
	
	console.log(args);

	return this;
};


window.SHIFTnSLIDE = new _ShiftnSlide({

	parent: '#ShiftnSlide',
	data: {
		request: {
			css: '',
			ajax: {
				url: './',
				type: 'GET',
				dataType: 'json',
				data: {},
				success: function (res) {},
				error: function (res) {

				}
			}
		}
	},
	parseString: {},
	indicate: {},
	process: {}

});