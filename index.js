
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = require('./router/router')
const port = 3004

require('dotenv').config({path: __dirname + '/.env'})

app.use(bodyParser.urlencoded({
	extended: false
}))

app.use(bodyParser.json())

app.use((req, res, next) => {
	//puede ser consumida desde cualquier lugar
	res.header('Access-Control-Allow-Origin', '*')
	//Cabeceras permitidas
	res.header('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization')
	//Metodos permitidos
	res.header('Access-Control-Allow-Methods', 'GET')
	res.header('Allow', 'GET')

	next()
})

app.use('/', router)
app.use(NotFoundHandler)
app.use(ErrorHandler)


function NotFoundHandler(req, res, next) {
	let err = new Error('Page not Found');
	err.status = 404;
	next(err);
}

function ErrorHandler(err, req, res, next) {
	if (err.status !== 404) {
		console.log('=> ', err);
	}
	let status = err.status || 500
	res.type('json').status(responses[status].status).json({
			status: responses[status].status,
			name: err.name || responses[status].name,
			message: err.message || responses[status].message,
			customMessage: err.customMessage || responses[status].customMessage,
		}).end();
}

app.listen(port, () => {
	console.log('OK running on http://localhost:' + port)
})
// module.exports = app

