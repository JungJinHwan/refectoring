import fs from 'fs';
import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import gutil from 'gulp-util';

const app = express();

app.use('/', express.static(__dirname + '/../dist'));

app.get('/hello', (req, res) => {
    return res.send('Can you hear me?');
});

app.use(fileUpload());

app.post('/upload', function(req, res) {

	if (!req.files) {
		return res.status(400).send('No files were uploaded.');

	}

	let files = req.files.uploadFile;
	let fileslen = files.length;

	if(fileslen) {

		let completed = 0;
		let sumstr = '';

		for(let i=0; i<fileslen; i++) {
			files[i].mv(__dirname + '/../files/' + files[i].name, function(err) {
				if(err) {
					gutil.log(gutil.colors.red(err));
				}
				else {
					completed++;

					gutil.log(gutil.colors.blue('[ '+files[i].name+' ]') + ' 업로드 끗');

					sumstr += 'index : ' + completed + ' [ '+files[i].name+' ] 업로드 끗<br>';

					if(fileslen == completed) {
						res.send(sumstr);
					}
				}
			});
		}

	}
	else {

		files.mv(__dirname + '/../files/' + files.name, function(err) {
			if(err) {
				gutil.log(gutil.colors.red(err));
			}
			else {
				gutil.log(gutil.colors.blue('[ '+files.name+' ]') + ' 업로드 끗');
				res.send('[ '+files.name+' ] 업로드 끗');
			}
		});
	}

});

const server = app.listen(3000, () => {
    gutil.log('Running Service port 3000',);
    gutil.log('Running Live port 7000');
});