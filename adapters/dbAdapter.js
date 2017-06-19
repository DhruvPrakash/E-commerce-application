
let renameForUser = (req) => {
	let obj = {};
	if(req.username !== undefined) {
		obj.username = req.username;
	}
	if(req.password !== undefined) {
		obj.password = req.password;
	}
	if(req.fname !== undefined) {
		obj.first_name = req.fname;
	}
	if(req.lname !== undefined) {
		obj.last_name = req.lname;
	} 
	if(req.address !== undefined) {
		obj.address = req.address;
	}
	if(req.city !== undefined) {
		obj.city = req.city;
	}
	if(req.state !== undefined) {
		obj.state = req.state;
	}
	if(req.zip !== undefined) {
		obj.zip = req.zip;
	}
	if(req.email !== undefined) {
		obj.email = req.email;
	}
	return obj;
}


module.exports = (connection) => {
    return {
        registerUser: (username, password, firstName, lastName, address, city, state, zip, email) => {
            let promise = new Promise((resolve, reject) => {
                let columnNames = 'username, password, first_name, last_name, address, city, state, zip, email, is_admin'
                let columnValues = `'${username}', '${password}', '${firstName}', '${lastName}', '${address}', '${city}', '${state}', '${zip}', '${email}', 'N'`;
                let queryString = `INSERT INTO auth (${columnNames}) VALUES (${columnValues})`;

                connection.query(queryString, (err, rows) => {
                    if (!err) {
                        return resolve();
                    } else {
                        return reject();
                    }
                })
            })

            return promise;
        },

        viewUsers: (fname, lname) => {
            let promise = new Promise((resolve, reject) => {
            	let arr = [];
            	if ( fname !== undefined) {
            		arr.push(`first_name LIKE '%${fname}%'`);
            	}

            	if( lname !== undefined) {
            		arr.push(`last_name LIKE '%${lname}%'`);
            	}

            	let queryString = arr.join(' AND ');

            	if(fname === undefined && lname === undefined) {
            		connection.query('SELECT * FROM auth', (err, rows) => {
            			if(!err) {
            				return resolve(rows);
            			} else {
            				return reject();
            			}
            		});
            	} else {
            		connection.query(`SELECT * FROM auth WHERE ${queryString}`, (err, rows) => {
            		    if (!err) {
            		        return resolve(rows);
            		    } else {
            		        return reject();
            		    }
            		})
            	}

                
            })

            return promise;
        },

        updateUserInfo: (req, currentUsername) => {
        	console.log("in update user info");
        	let columnObj = renameForUser(req);
        	console.log("got the column obj");
        	console.log(columnObj);
        	let promise = new Promise((resolve, reject) => {
        		console.log("inside the promised land");
        		//check if columnobj username is undefined...
        		console.log(columnObj.username);
        		let usernameToQuery = (columnObj.username !== undefined) ? columnObj.username : currentUsername; 
        		//
        		// if(columnObj.username !== username) {
        		// 	connection.query(`UPDATE `)
        		// }
        		console.log(columnObj);
        		console.log(usernameToQuery);

        		connection.query(`UPDATE auth SET ? WHERE username = '${currentUsername}'`,columnObj, (err, rows) => {
        			if(!err) {
        				connection.query(`SELECT * FROM auth WHERE username = '${usernameToQuery}'`, (err, rows) => {
        					if(!err) {
        						console.log(rows[0]);
        						return resolve(rows[0]);
        					} else {

        						console.log("err in selecting");
        						console.log(err);
        						return reject();
        					}
        				})
        				
        			} else {
        				console.log("err in updating");
        				console.log(err);
        				return reject();
        			}
        		});
        	});
        	return promise;
        },

        addProducts: (asin, productName, productDescription, group) => {
            let promise = new Promise((resolve, reject) => {
                let columnNames = 'asin, product_name, product_description, group_name';
                let columnValues = `'${asin}', '${productName}', '${productDescription}', '${group}'`;
                let queryString = `INSERT INTO products (${columnNames}) VALUES (${columnValues})`;

                connection.query(queryString, (err, rows) => {
                    if (!err) {
                        return resolve();
                    } else {
                        return reject();
                    }
                })
            })

            return promise;
        },

        modifyProduct: (asin, productName, productDescription, group) => {
            let promise = new Promise((resolve, reject) => {
                let queryString = `UPDATE products set product_name = '${productName}', product_description = '${productDescription}', group_name = '${group}' WHERE asin = '${asin}'`;
                console.log(queryString);
                connection.query(queryString, (err, rows) => {
                    if (!err) {
                        return resolve();
                    } else {
                        return reject();
                    }
                })
            })

            return promise;
        },

        viewProducts: (asin, keyword, group) => {
            let promise = new Promise((resolve, reject) => {
                let arr = [];
                let asinPresent = !!asin;
                let keywordPresent = !!keyword;
                let groupPresent = !!group;
                
                if (asinPresent) {
                	arr.push(`asin = '${asin}'`);
                }

                if(groupPresent) {
                	arr.push(`group_name = '${group}'`);
                }

                if(keywordPresent) {
                	arr.push(`(product_name LIKE '%${keyword}%' OR product_description LIKE '%${keyword}%')`);
                }


                let queryString = arr.join(' AND ');

                if(!asinPresent && !groupPresent && !keywordPresent) {
                	connection.query('SELECT * FROM products', (err,rows) => {
                		if (!err) {
                		    return resolve(rows);
                		} else {
                		    return reject();
                		}
                	});
                } else {
                	connection.query(`SELECT * FROM products WHERE ${queryString}`, (err, rows) => {
                		if(!err) {
                			return resolve(rows);
                		} else {
                			return reject();
                		}
                	})
                }

                
            });

            return promise;
        }
    }
}
