var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ureca"
});

router.get("/database/area/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM area';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/area/area_records", {areas: results});
		})
})

router.get("/database/area/new", isLoggedIn, function(req, res){
	res.render('database/area/area_new');
})

router.post("/area/new", function(req, res){
	const new_area = {area_code: req.body.area_code, area_lead: req.body.area_lead, area_lead_email: req.body.area_lead_email, area_admin: req.body.area_admin, area_admin_email: req.body.area_admin_email};
	connection.query('INSERT INTO area SET ?', new_area, (error, res) => {
		if(error) throw error;
	})
	res.redirect("/database/area/records");
})

router.post("/database/area/update", function(req, res){
	connection.query(`SELECT * FROM area WHERE area_code = ${mysql.escape(req.body.area_code)}`, function(error, results, fields){
		if(error) throw error;
		res.render("database/area/area_update", {area: results[0]});
	})
})

router.post("/database/area/updating", function(req, res) {
	connection.query(
  'UPDATE area SET area_lead = ?, area_lead_email = ?, area_admin = ?, area_admin_email = ? WHERE area_code LIKE ?',
  [req.body.area_lead, req.body.area_lead_email, req.body.area_admin, req.body.area_admin_email, req.body.area_code],
  (error, result) => {
    if (error) throw error;
		res.redirect("/database/area/records");
  }
);
})

router.post("/database/area/delete", function(req, res){
	connection.query(`DELETE FROM area WHERE area_code LIKE ?`, [req.body.area_code], (error, result) => {
		if(error) throw error;
		res.redirect("/database/area/records");
	})
})

router.get("/database/courses/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM courses';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/courses/courses_records", {courses: results});
		})
})

router.post("/database/course/update", function(req, res){
	connection.query(`SELECT * FROM courses WHERE course_code = ${mysql.escape(req.body.course_code)}`, function(error, results, fields){
		if(error) throw error;
		res.render("database/courses/courses_update", {course: results[0]});
	})
})

router.post("/database/course/updating", function(req, res) {
	connection.query(
  'UPDATE courses SET alternative_course_code = ?, course_title = ?, area_code = ? WHERE course_code LIKE ?',
  [req.body.alternative_course_code, req.body.course_title, req.body.area_code, req.body.course_code],
  (error, result) => {
    if (error) throw error;
		res.redirect("/database/courses/records");
  }
);
})

router.post("/database/course/delete", function(req, res){
	connection.query(`DELETE FROM courses WHERE course_code LIKE ?`, [req.body.course_code], (error, result) => {
		if(error) throw error;
		res.redirect("/database/courses/records");
	})
})

router.get("/database/course/new", isLoggedIn, function(req, res){
	connection.query('SELECT area_code FROM area;', function(error, results, fields){
		if(error) throw error;
			res.render('database/courses/courses_new', {area_codes: results});
	})
})

router.post("/course/new", function(req, res){
	const new_course = {course_code: req.body.course_code, alternative_course_code: req.body.alternative_course_code, course_title: req.body.course_title, area_code: req.body.area_code};
	connection.query('INSERT INTO courses SET ?', new_course, (error, res) => {
		if(error) throw error;
	})
	res.redirect("/database/courses/records");
})

router.get("/database/faculty_staff/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM faculty_staff';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/faculty_staff/faculty_staff_records", {faculty_staff: results});
		})
})

router.post("/database/faculty_staff/update", function(req, res){
	var area_codes = connection.query('SELECT area_code FROM area;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	connection.query(`SELECT * FROM faculty_staff WHERE initial = ${mysql.escape(req.body.initial)}`, function(error, results, fields){
		if(error) throw error;
		res.render("database/faculty_staff/faculty_staff_update", {staff: results[0], area_codes: area_codes._results[0]});
	})
})

router.post("/database/faculty_staff/updating", function(req, res) {
	connection.query(
  'UPDATE faculty_staff SET faculty_name = ?, email_address = ?, current_appointment = ?, area_code = ? WHERE initial LIKE ?',
  [req.body.faculty_name, req.body.email_address, req.body.current_appointment, req.body.area_code, req.body.initial],
  (error, result) => {
    if (error) throw error;
		res.redirect("/database/faculty_staff/records");
  }
);
})

router.post("/database/faculty_staff/delete", function(req, res){
	connection.query(`DELETE FROM faculty_staff WHERE initial LIKE ?`, [req.body.initial], (error, result) => {
		if(error) throw error;
		res.redirect("/database/faculty_staff/records");
	})
})

router.get("/database/faculty_staff/new", isLoggedIn, function(req, res){
	connection.query('SELECT area_code FROM area;', function(error, results, fields){
		if(error) throw error;
			res.render('database/faculty_staff/faculty_staff_new', {area_codes: results});
	})
})

router.post("/faculty_staff/new", function(req, res){
	const new_faculty_staff = {initial: req.body.initial, faculty_name: req.body.faculty_name, email_address: req.body.email_address, current_appointment: req.body.current_appointment, area_code: req.body.area_code};
	connection.query('INSERT INTO faculty_staff SET ?', new_faculty_staff, (error, res) => {
		if(error) throw error;
	})
	res.redirect("/database/faculty_staff/records");
})

router.get("/database/coordinators/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM coordinators';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/coordinators/coordinators_records", {coordinators: results});
		})
})

router.post("/database/coordinator/delete", function(req, res){
	connection.query(`DELETE FROM coordinators WHERE initial LIKE ? AND course_code LIKE ?`, [req.body.initial, req.body.course_code], (error, result) => {
		if(error) throw error;
		res.redirect("/database/coordinators/records");
	})
})


router.get("/database/coordinator/new", isLoggedIn, function(req, res){
	var initials = connection.query('SELECT initial FROM faculty_staff;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	connection.query('SELECT course_code FROM courses', function(error, results, fields){
		if(error) throw error;
			res.render('database/coordinators/coordinators_new', {course_codes: results, initials: initials._results[0], error_message: null});
	})
})

router.post("/coordinator/new", function(req, res) {
	const new_coordinator = {initial: req.body.initial, course_code: req.body.course_code};
	var initials = connection.query('SELECT initial FROM faculty_staff;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	var course_codes = connection.query('SELECT course_code FROM courses', function(error, results, fields){
		if(error) throw error;
			return results;
		})
	connection.query('INSERT INTO coordinators SET ?', new_coordinator, (error, results, fields) => {
		if(error) {
			res.render('database/coordinators/coordinators_new', {course_codes: course_codes._results[0], initials: initials._results[0], error_message: error.sqlMessage});
		}
		else {
			res.redirect("/database/coordinators/records");
		}
	})
})

router.get("/database/examiners/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM examiners';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/examiners/examiners_records", {examiners: results});
		})
})

router.post("/database/examiner/delete", function(req, res){
	connection.query(`DELETE FROM examiners WHERE initial LIKE ? AND course_code LIKE ?`, [req.body.initial, req.body.course_code], (error, result) => {
		if(error) throw error;
		res.redirect("/database/examiners/records");
	})
})

router.get("/database/examiner/new", isLoggedIn, function(req, res){
	var initials = connection.query('SELECT initial FROM faculty_staff;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	connection.query('SELECT course_code FROM courses', function(error, results, fields){
		if(error) throw error;
			res.render('database/examiners/examiners_new', {course_codes: results, initials: initials._results[0], error_message: null});
	})
})

router.post("/examiner/new", function(req, res) {
	const new_examiner = {initial: req.body.initial, course_code: req.body.course_code};
	var initials = connection.query('SELECT initial FROM faculty_staff;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	var course_codes = connection.query('SELECT course_code FROM courses', function(error, results, fields){
		if(error) throw error;
			return results;
		})
	connection.query('INSERT INTO examiners SET ?', new_examiner, (error, results, fields) => {
		if(error) {
			res.render('database/examiners/examiners_new', {course_codes: course_codes._results[0], initials: initials._results[0], error_message: error.sqlMessage});
		}
		else {
			res.redirect("/database/examiners/records");
		}
	})
})

router.get("/database/moderators/records", isLoggedIn, function(req, res){
	var q = 'SELECT * FROM moderators ORDER BY course_code, initial;';
	connection.query(q, function(error, results, fields){
		if(error) throw error;
			res.render("database/moderators/moderators_records", {moderators: results});
		})
})

router.post("/database/moderator/delete", function(req, res){
	connection.query(`DELETE FROM moderators WHERE initial LIKE ? AND course_code LIKE ?`, [req.body.initial, req.body.course_code], (error, result) => {
		if(error) throw error;
		res.redirect("/database/moderators/records");
	})
})

router.get("/database/moderator/new", isLoggedIn, function(req, res){
	var initials = connection.query('SELECT initial FROM faculty_staff ORDER BY initial;', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	connection.query('SELECT course_code FROM courses ORDER BY course_code;', function(error, results, fields){
		if(error) throw error;
			res.render('database/moderators/moderators_new', {course_codes: results, initials: initials._results[0], error_message: null});
	})
})

router.post("/moderator/new", function(req, res) {
	const new_moderator = {initial: req.body.initial, course_code: req.body.course_code};
	var initials = connection.query('SELECT initial FROM faculty_staff', function(error, results, fields){
		if(error) throw error;
			return results;
	})
	var course_codes = connection.query('SELECT course_code FROM courses', function(error, results, fields){
		if(error) throw error;
			return results;
		})
	connection.query('INSERT INTO moderators SET ?', new_moderator, (error, results, fields) => {
		if(error) {
			res.render('database/moderators/moderators_new', {course_codes: course_codes._results[0], initials: initials._results[0], error_message: error.sqlMessage});
		}
		else {
			res.redirect("/database/moderators/records");
		}
	})
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
