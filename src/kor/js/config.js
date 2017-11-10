
var $DOCUMENT = $(document);
var $WINDOW = $(window);
var ClientWidth = function(get) {
	var result = get || 'body';
	return document.querySelector(result).clientWidth;
};
