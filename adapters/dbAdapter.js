
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

let constructPermstring = (asinArr) => {
    let permString = '';
    let asinsToBePermed = [];
    asinArr.forEach((asin) => {
        if(asinsToBePermed.length === 0) {
            asinsToBePermed.push(asin);
        } else {
            asinsToBePermed.forEach((asinToBePermed) => {
                permString = permString + `('${asinToBePermed}','${asin}'),('${asin}','${asinToBePermed}')`; 
            });
            asinsToBePermed.push(asin);
        }
    });

    return permString;
} 


module.exports = (connectionPool) => {
    return {
        registerUser: (username, password, firstName, lastName, address, city, state, zip, email) => {
            let promise = new Promise((resolve, reject) => {
                let columnNames = 'username, password, first_name, last_name, address, city, state, zip, email, is_admin'
                let columnValues = `'${username}', '${password}', '${firstName}', '${lastName}', '${address}', '${city}', '${state}', '${zip}', '${email}', 'N'`;
                let queryString = `INSERT INTO auth (${columnNames}) VALUES (${columnValues})`;

                connectionPool.getConnection((err, connection) => {
                    connection.query(queryString, (err, rows) => {
                        connection.release();
                        if (!err) {
                            return resolve();
                        } else {
                            return reject();
                        }
                    })
                });
                
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
                    connectionPool.getConnection((err, connection) => {
                        connection.query('SELECT * FROM auth', (err, rows) => {
                            connection.release();
                            if(!err) {
                                return resolve(rows);
                            } else {
                                return reject();
                            }
                        });
                    });
            		
            	} else {
                    connectionPool.getConnection((err, connection) => {
                        connection.query(`SELECT * FROM auth WHERE ${queryString}`, (err, rows) => {
                            connection.release();
                            if (!err) {
                                return resolve(rows);
                            } else {
                                return reject();
                            }
                        })
                    });
            		
            	}

                
            })

            return promise;
        },

        updateUserInfo: (req, currentUsername) => {
        	let columnObj = renameForUser(req);
        	let promise = new Promise((resolve, reject) => {
        		let usernameToQuery = (columnObj.username !== undefined) ? columnObj.username : currentUsername; 

                connectionPool.getConnection((err, connection) => {
                    connection.query(`UPDATE auth SET ? WHERE username = '${currentUsername}'`,columnObj, (err, rows) => {
                        connection.release();
                        if(!err) {
                            connectionPool.getConnection((err, connection) => {
                                connection.query(`SELECT * FROM auth WHERE username = '${usernameToQuery}'`, (err, rows) => {
                                    connection.release();
                                    if(!err) {
                                        console.log(rows[0]);
                                        return resolve(rows[0]);
                                    } else {

                                        console.log("err in selecting");
                                        console.log(err);
                                        return reject();
                                    }
                                });
                            });
                            
                            
                        } else {
                            console.log("err in updating");
                            console.log(err);
                            return reject();
                        }
                    });
                });
        		
        	});
        	return promise;
        },

        addProducts: (asin, productName, productDescription, group) => {
            let promise = new Promise((resolve, reject) => {
                let columnNames = 'asin, product_name, product_description, group_name';
                let columnValues = `'${asin}', '${productName}', '${productDescription}', '${group}'`;
                let queryString = `INSERT INTO products (${columnNames}) VALUES (${columnValues})`;
                connectionPool.getConnection((err, connection) => {
                    connection.query(queryString, (err, rows) => {
                        connection.release();
                        if (!err) {
                            return resolve();
                        } else {
                            return reject();
                        }
                    });
                });
                
            })

            return promise;
        },

        modifyProduct: (asin, productName, productDescription, group) => {
            let promise = new Promise((resolve, reject) => {
                let queryString = `UPDATE products set product_name = '${productName}', product_description = '${productDescription}', group_name = '${group}' WHERE asin = '${asin}'`;
                console.log(queryString);
                connectionPool.getConnection((err, connection) => {
                    connection.query(queryString, (err, rows) => {
                        connection.release();
                        if (!err) {
                            return resolve();
                        } else {
                            return reject();
                        }
                    })
                });
                
            });

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
                    //arr.push(`MATCH (product_name, product_description) against ('${keyword}') limit 1000`);
                	//arr.push(`(product_name LIKE '%${keyword}%' OR product_description LIKE '%${keyword}%')`);
                    arr.push(`MATCH (product_name, product_description) against ('${keyword}')`);

                }

                let queryString = arr.join(' AND ');

                if(!asinPresent && !groupPresent && !keywordPresent) {
                	connectionPool.getConnection((err, connection) => {
                        connection.query('SELECT * FROM products limit 1000', (err,rows) => {
                            connection.release();
                            if (!err) {
                                return resolve(rows);
                            } else {
                                return reject();
                            }
                        });
                    });
                    
                } else {
                    console.log(queryString);
                    connectionPool.getConnection((err, connection) => {
                        if(err !== undefined) {
                            console.log(err);
                        }
                        if(asinPresent || groupPresent) {
                            connection.query(`SELECT * FROM products WHERE ${queryString} limit 5`, (err, rows) => {
                                connection.release();
                                if(!err) {
                                    return resolve(rows);
                                } else {
                                    return reject();
                                }
                            });
                        } else {
                            connection.query(`SELECT *, CASE WHEN product_name = '${keyword}' THEN 1 ELSE 0 END AS score, MATCH (product_name, product_description) AGAINST('${keyword}') AS score2 FROM products WHERE MATCH (product_name, product_description) AGAINST('${keyword}') ORDER BY score DESC, score2 DESC limit 5`, (err, rows) => {
                                connection.release();
                                if(!err) {
                                    return resolve(rows);
                                } else {
                                    return reject();
                                }
                            });
                        }
                        
                    });
                	
                }

                
            });

            return promise;
        },


        buyProducts: (productsAsin, username) => {
            let promise = new Promise((resolve, reject) => {
                
                let valuesToBeInserted = productsAsin.map((productAsin) => {
                    return `('${productAsin}','${username}')`;
                });

                let valuesToBeInsertedString = valuesToBeInserted.join(',');
                console.log(`INSERT INTO purchased_products (asin, username) values ${valuesToBeInsertedString}`);
                connectionPool.getConnection((err, connection) => {
                    connection.query(`INSERT INTO purchased_products (asin, username) values ${valuesToBeInsertedString}`, (err,rows) => {
                        connection.release();
                        if(!err) {
                            console.log("productsAsin " + productsAsin);
                            let unqiqueAsins = [...new Set(productsAsin)];
                            console.log("unqiqueAsins " + unqiqueAsins);
                            if(unqiqueAsins.length > 1) {
                                let permString = constructPermstring(unqiqueAsins);
                                connectionPool.getConnection((err, connection) => {
                                    console.log("RECOMMENDATIONS INSERT");
                                    console.log(`INSERT INTO recommendations (bought_product, co_bought_product) values ${permString}`);
                                    connection.query(`INSERT INTO recommendations (bought_product, co_bought_product) values ${permString}`, (err, rows) => {
                                        connection.release();
                                        if(!err) {
                                            console.log("resolve reached 1");
                                            return resolve();
                                        } else {
                                            console.log(err);
                                            console.log("reject reached 1");
                                            return reject();
                                        }
                                    });
                                });
                                
                            } else {
                                console.log("resolve reached 1")
                                return resolve();
                            }                        
                        } else {
                            console.log(err);
                            console.log("reject reached 2");
                            return reject();
                        }
                    });
                });
                

            });

            return promise;
        }, 

        getPurchaseHistory: (username) => {
            let promise = new Promise((resolve, reject) => {
                connectionPool.getConnection((err, connection) => {
                    connection.query(`SELECT product_name, count(*) as frequency FROM purchased_products JOIN products ON purchased_products.asin = products.asin GROUP BY username, purchased_products.asin HAVING username='${username}'`, (err, rows) => {
                        connection.release();
                        if(!err) {
                            return resolve(rows);
                        } else {
                            return reject();
                        }
                    });
                })
                
            });

            return promise;
        },

        getReccomendations: (asin) => {
            let promise = new Promise((resolve, reject) => {
                connectionPool.getConnection((err, connection) => {
                    connection.query(`SELECT co_bought_product, bought_product FROM recommendations GROUP BY co_bought_product HAVING bought_product = '${asin}' ORDER BY count(*) DESC LIMIT 5`, (err, rows) => {
                        connection.release();
                        if(!err) {
                            return resolve(rows);
                        } else {
                            console.log(err);
                            return reject();
                        }
                    });
                })
                
            });
            return promise;
        }
    }
}
