var LocalStrategy = require('passport-local').Strategy;


module.exports = (passport, connection) => {
	passport.serializeUser( (user, done) => {
		done(null, user.username);
	});

	passport.deserializeUser((username, done) => {
		connection.query(`SELECT * FROM auth WHERE username = '${username}' `, (err, rows) => {
			done(err, rows[0]);
		})
	});


	passport.use('local-login', new LocalStrategy((username, password, done) => {
		connection.query(`SELECT * FROM auth WHERE username = '${username}' AND password = '${password}'`, (err,rows) => {
			if(rows[0] === undefined) {
				return done(null);
			}
			return done(null,rows[0]);
		});
	}))


}