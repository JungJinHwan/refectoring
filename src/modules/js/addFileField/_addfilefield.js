import Config from './_config';

class main extends Config {

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let deletedLen = Status.deleted.length;

		if (!deletedLen) {

			Status.inserted++;
		}

		let appendDOM = Data.field.replace(SCOPE.reg('i'), deletedLen ? Status.deleted.sort().shift() : Status.inserted);

		$(Selector.draw).append(appendDOM);

		return SCOPE;
	}

	deleted (arg) {

		const SCOPE = this;

		let Status = SCOPE.option.status;

		let delTarget = SCOPE.select('#addFileField_'+arg)[0];

		delTarget.parentNode.removeChild(delTarget);

		Status.deleted.push(arg);

		return SCOPE;
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.request((res) => {

			SCOPE.option.data.field = res;

			SCOPE.select(SCOPE.option.selector.parent)[0].innerHTML = SCOPE.storage().body;

			return SCOPE.returnCall(callback);	
		});
	}
}

window.$ADDFILEFIELD = new main({/* user only => _config.js */});