const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySqlStore = require('express-mysql-session')(session);
let sessionStore = new MySqlStore(require('./config/database.js'));

const mysql = require('mysql');
const dbConfig = require('./config/database');
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
	if(err){
		console.log('error connecting to db');
		return;
	}
	console.log('connection established');
});

require('./config/passport')(passport, connection);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
	secret: 'asynchronoussynchronization',
	cookie: {
		maxAge: 15 * 60 * 1000,
		saveUninitialized: false,
		resave: false
	},
	rolling: true,
	store: sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());

const dbAdapter = require('./adapters/dbAdapter')(connection);

//========== routes==========
require('./app/routes.js')(app, passport, dbAdapter);


app.listen(port, (err) => {
	if(err) {
		return console.log('something bad happened', err);
	}

	console.log(`server listening on ${port}`);
})



