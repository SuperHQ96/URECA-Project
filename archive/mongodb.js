var express 	   = require('express');
var	app 		   		 = express();
var router = express.Router();
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var MongoClient = mongo.MongoClient;

var url = "mongodb://127.0.0.1:27017/";

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
