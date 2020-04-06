let AWS = require('aws-sdk');
var mysql2 = require('mysql2/promise');

exports.handler = async(event) => {
	console.log(`event: ${JSON.stringify(event)}`);

	let response = {};

	console.log("Starting query...");

	console.log("IAM auth");

	var signer = new AWS.RDS.Signer({
		region: process.env['region'],
		hostname: process.env['proxyendpoint'],
		port: parseInt(process.env['port'], 10),
		username: process.env['user']
	});

	let token = signer.getAuthToken({
		username: process.env['user']
	});

	console.log("IAM Token obtained");

	const connectionConfig = {
		host: process.env['proxyendpoint'],
		user: process.env['user'],
		database: process.env['database'],
		ssl: { rejectUnauthorized: false },
		password: token,
		authSwitchHandler: function({ pluginName, pluginData }, cb) {
			console.log("Setting new auth handler.");
		}
	};

	// Adding the mysql_clear_password handler
	connectionConfig.authSwitchHandler = (data, cb) => {
		if (data.pluginName === 'mysql_clear_password') {
			// See https://dev.mysql.com/doc/internals/en/clear-text-authentication.html
			console.log("pluginName: " + data.pluginName);
			let password = token + '\0';
			let buffer = Buffer.from(password);
			cb(null, password);
		}
	};

	let connection;

	try {
		connection = await mysql2.createConnection(connectionConfig);
	} catch(err) {
		console.error('error connecting to the database');
		console.error(err);
		response = {	
			statusCode: 500,
			"headers": {
				"Content-Type": "application/json"
			},
			body: 'error connecting to the database'
		};
		return response;
	}		

	console.log(`connected as id ${connection.threadId}`);

	try {
		const [rows, fields] = await connection.execute('SELECT * FROM contacts');
		console.log(`rows: ${JSON.stringify(rows)}`);
		console.log(`fields: ${JSON.stringify(fields)}`);
		const responseBody = {
			number: rows.length,
			contacts: rows
		};
		response = {	
			statusCode: 200,
			"headers": {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(responseBody)
		};
	} catch(err) {
		console.error('error running query');
		console.error(err);
		response = {	
			statusCode: 500,
			"headers": {
				"Content-Type": "application/json"
			},
			body: 'error executing query'
		};
	}
	
	await connection.end();
	
	return response;
};


