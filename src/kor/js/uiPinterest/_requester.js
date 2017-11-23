import Config from './_config';

export default class Requester extends Config {

	request (callback) {

		const SCOPE = this;
		const request = SCOPE.option.request;

		return $.ajax({
			type: request.type,
			url: request.url,
			data: request.data,
			dataType: request.dataType,
			success: callback,
			error: res => {
				console.log('ERROR', res);
			}
		});
	}
};
	