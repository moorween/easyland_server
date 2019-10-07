const fs = require('fs');
const path = require('path');
const relations = require('./relations');

module.exports = (sequelize) => {
	const db = {};

	fs.readdirSync(path.join(__dirname, '../models/')).forEach((filename) => {
		const model = {};
		model.path = path.join(__dirname, '../models/', filename);
		model.name = filename.replace(/\.[^/.]+$/, '');
		model.resource = sequelize.import(model.path);
		db[model.name] = model.resource;
		console.debug('Loaded model:', model.name);
	});

	relations(sequelize.models);

	return db;
};
