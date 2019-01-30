function fBttBar (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Selector = SCOPE.option.selector;
	var Data = SCOPE.option.data;

	return 1;
}


window.FlowBottomBar = new fBttBar ({
	selector: {
		parent: "#fBttBar",

	},
	data: {
		screenLen: 3,
		map: []
	}

});