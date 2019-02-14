var express 	   = require('express'),
	app 		   = express(),
	passport 	   = require("passport"),
	bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	flash          = require("connect-flash"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	path 					 = require('path'),
	passportLocalMongoose = require("passport-local-mongoose");

var databaseRoutes = require('./routes/database');
var templatesRoutes = require('./routes/templates');
var paperRoutes = require('./routes/papers')
var emailRoutes = require('./routes/email')
//var mongoDBRoutes = require('./routes/mongodb');

mongoose.connect("mongodb://localhost/ureca")

var UserSchema = new mongoose.Schema({
   username: String,
   password: String
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

app.use(require("express-session")({
	secret: "",
	resave: false,
	saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//app.use('', mongoDBRoutes);

app.get('/', isLoggedIn, function(req, res){
	res.render('landing');
})

app.get("/login", function(req, res){
	res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/",
    failureRedirect: "/login"
}),function(req, res){

})

app.get("/signup", function(req, res){
	res.render("signup");
});

app.post("/signup", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err)
			return res.render('signup');
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/");
		})
	});
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/login");
})

app.get("/templates/new", isLoggedIn, function(req, res){
	res.render("template");
});

app.get("/templates/id", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM area';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("use_template", {results: results[1]});
		})
})

app.use('', databaseRoutes);
app.use('', templatesRoutes);
app.use('', paperRoutes);
app.use('', emailRoutes);

app.get("/users", isLoggedIn, function(req, res){
	User.find({}//, {fields: {username: 1, _id: 0}}
	).exec(function(err, results){
		if (err) throw err;
		res.render("user_management/users", {users: results});
	})
})

app.get("/users/new", isLoggedIn, function(req, res){
	res.render('user_management/user_new');
})

app.post("/user/new", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err)
			return res.render('user_management/user_new');
		}
		res.redirect("/users");
	});
})

app.post("/user/change_password", isLoggedIn, function(req, res){
	res.render('user_management/change_password', {username: req.body.username, error_message: null});
})

app.post("/user/update_password", isLoggedIn, function(req, res){
	User.findByUsername(req.body.username).then(function(user){
    if (user){
				user.changePassword(req.body.old_password, req.body.password, function(err){
					if(err) throw err;
					res.redirect("/users");
				})
    } else {
        res.render('user_management/change_password', {username: req.body.username, error_message: "An error occurred"});
    }
	},function(err){
    console.error(err);
	})
})

app.post("/user/delete", function(req, res){
	User.deleteOne({username: req.body.username}, function(err, results){
		if (err) throw err;
		res.redirect('/users');
	})
})

app.post("/user/assign_paper", function(req, res){

})

app.get("*", function(req, res){
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(80, '127.0.0.1');
