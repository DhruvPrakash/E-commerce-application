var LocalStrategy = require('passport-local').Strategy;


module.exports = (passport, connectionPool) => {
	passport.serializeUser( (user, done) => {
		done(null, user.username);
	});

	passport.deserializeUser((username, done) => {
		connectionPool.getConnection((err, connection) => {
			connection.query(`SELECT * FROM auth WHERE username = '${username}' `, (err, rows) => {
				connection.release();
				done(err, rows[0]);
			});
		});
		
	});


	passport.use('local-login', new LocalStrategy((username, password, done) => {
		connectionPool.getConnection((err, connection) => {
			connection.query(`SELECT * FROM auth WHERE username = '${username}' AND password = '${password}'`, (err,rows) => {
				connection.release();
				if(rows[0] === undefined) {
					return done(null);
				}
				return done(null,rows[0]);
			});
		});
		
	}))


}