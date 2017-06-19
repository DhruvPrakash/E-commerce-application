let auth = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.json({"message": "You are not currently logged in"});
}

let hasAllRequiredFields = (requiredFields, req) => {
	let error = false;
	requiredFields.forEach((field) => {
		if(req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
			error = true;
		}
	});
	return !error;
}


module.exports = (app, passport, dbAdapter) => {
	
	app.post('/registerUser', (req, res) => {

		let requiredFields = ['username', 'password', 'fname', 'lname', 'address', 'city', 'state', 'zip', 'email'];
		if(!hasAllRequiredFields(requiredFields, req)) {
			res.json({"message": "The input you provided is not valid"});
		} else {

			let values = requiredFields.map((field) => {
				return req.body[field];
			});

			dbAdapter.registerUser(...values).then(() => {
				res.json({"message" : `${req.body.fname} was registered successfully`});
			},() => {
				res.json({"message" : "The input you provided is not valid"});
			});
		}

	});

	app.post('/viewUsers', auth, (req,res) => {
		if(req.user.is_admin === 'Y') {
			dbAdapter.viewUsers(req.body.fname, req.body.lname).then((users) => {
				let responseJson = {};
				let usersResponse = users.map((user) => {
					let renamedKeyUser = {};
					renamedKeyUser.fname = user.first_name;
					renamedKeyUser.lname = user.last_name;
					renamedKeyUser.userId = user.username;
					return renamedKeyUser;
				});
				responseJson.user = usersResponse;
				if(usersResponse.length === 0) {
					res.json({"message" : "There are no users that match that criteria"});
				} else {
					responseJson.message = "The action was successful";
					res.json(responseJson);
				}
			}, () => {
				res.json({"message" : "There are no users that match that criteria"});
			});
		} else {
			res.json({"message" : "You must be an admin to perform this action"});
		}
	});


	app.post('/login',(req, res, next) => {
		passport.authenticate('local-login', (err, user,info) => {
			if(!user) {
				res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
			} else {
				req.login(user, (err) => {
					res.json({"message": `Welcome ${user.first_name}`})
				});
				
			}
		})(req, res, next);
	});


	app.post('/updateInfo', auth, (req, res) => {

		console.log(req.user);


		console.log("captain planet");
		dbAdapter.updateUserInfo(req.body, req.user.username).then((user) => {
			
			req.login(user, function(err) {
			    res.json({"message": `${req.user.first_name} your information was successfully updated`});
			});
			
		}, () => {
			res.json({"message" : "The input you provided is not valid"});
		});


	});

	app.post('/addProducts', auth, (req, res) => {
		if(req.user.is_admin === 'Y') {
			let requiredFields = ['asin', 'productName', 'productDescription', 'group'];
			if(!hasAllRequiredFields(requiredFields, req)) {
				res.json({"message": "The input you provided is not valid"});
			} else {
				let values = requiredFields.map((field) => {
					return req.body[field];
				});

				dbAdapter.addProducts(...values).then(() => {
					res.json({"message" : `${req.body.productName} was successfully added to the system`});
				},() => {
					res.json({"message" : "The input you provided is not valid"});
				});
			}
		} else {
			res.json({"message" : "You must be an admin to perform this action"});
		}
	});

	app.post('/viewProducts', (req, res) => {
		dbAdapter.viewProducts(req.body.asin, req.body.keyword, req.body.group).then((products) => {
			let responseJson = {};
			let productsResponse = products.map((product) => {
				let renamedKeyProduct = {};
				renamedKeyProduct.asin = product.asin;
				renamedKeyProduct.productName = product.product_name;
				return renamedKeyProduct;
			});
			responseJson.product = productsResponse;
			if(productsResponse.length === 0) {
				res.json({"message" : "There are no products that match that criteria"});
			} else {
				res.json(responseJson);
			}
			
		}, () => {
			res.json({"message" : "There are no products that match that criteria"});
		});
	});

	app.post('/modifyProduct', auth, (req, res) => {
		if(req.user.is_admin === 'Y') {
			let requiredFields = ['asin', 'productName', 'productDescription', 'group'];
			if(!hasAllRequiredFields(requiredFields, req)) {
				res.json({"message": "The input you provided is not valid"});
			} else {
				let values = requiredFields.map((field) => {
					return req.body[field];
				});
				dbAdapter.modifyProduct(...values).then(()=>{
					res.json({"message": `${req.body.productName} was successfully updated`});
				}, () => {
					res.json({"message": "The input you provided is not valid"});
				});
			}
		} else {
			res.json({"message" : "You must be an admin to perform this action"});
		}
	});

	app.post('/logout', (req, res) => {
		//check if user has a session... 
		if(req.user) {
			req.session.destroy(function (err) {
		   		res.json({"message" : "You have been successfully logged out"});
			});
		} else {
			res.json({"message" : "You are not currently logged in"});
		}
	})
}

