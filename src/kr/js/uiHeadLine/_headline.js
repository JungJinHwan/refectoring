import Config from './_config';

class main extends Config {

	resize (callback) {

		const SCOPE = this;

		return SCOPE.returnCall(callback);
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.returnCall(callback);
	}
}

window.$UI_HEADLINE = new main({/* user only => _config.js */});