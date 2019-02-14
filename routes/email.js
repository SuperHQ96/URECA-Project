var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var nodemailer = require('nodemailer');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ureca"
});

router.get('/email', isLoggedIn, function(req, res){
  connection.query('SELECT DISTINCT course_code FROM examiners ORDER BY course_code;', function(error, results, fields){
    res.render('email/send_email', {course_codes: results});
  })
})

router.post('/email/get_data', function(req, res){
  let course_title;
  let coordinator;
  let area_lead_appointment;
  let area_lead;
  let examiners = "";
  let moderators = "";
  connection.query(`SELECT course_title, current_appointment, area_lead FROM (SELECT * FROM courses NATURAL JOIN area WHERE course_code = '${req.body.course_code}') AS SUBQUERY NATURAL JOIN faculty_staff WHERE SUBQUERY.area_lead = faculty_name;`, function(error, results, fields){
    if(error) throw error;
    course_title = results[0].course_title;
    area_lead_appointment = results[0].current_appointment;
    area_lead = results[0].area_lead;
  })
  connection.query(`SELECT faculty_name FROM coordinators NATURAL JOIN faculty_staff WHERE course_code = '${req.body.course_code}';`, function(error, results, fields){
    if(error) throw error;
    coordinator = results[0].faculty_name;
  })
  connection.query(`SELECT faculty_name FROM examiners NATURAL JOIN faculty_staff WHERE course_code = '${req.body.course_code}';`, function(error, results, fields){
    if(error) throw error;
    results.forEach(function(examiner){
      examiners += examiner.faculty_name;
      examiners += " "
    })
  })
  connection.query(`SELECT faculty_name FROM moderators NATURAL JOIN faculty_staff WHERE course_code = '${req.body.course_code}';`, function(error, results, fields){
    if(error) throw error;
    results.forEach(function(moderator){
      moderators += moderator.faculty_name;
      moderators += " "
    })
    res.json({course_title: course_title, coordinator: coordinator, examiners: examiners, moderators: moderators, area_lead_appointment: area_lead_appointment, area_lead: area_lead});
  })

})

router.post('/send_email', isLoggedIn, function(req, res){
  let transporter = nodemailer.createTransport({service: 'Outlook365', auth: {user: req.body.user, pass: req.body.password}});
  let mailOption = {
              from: req.body.user,
              to: req.body.receiver,
              subject: req.body.subject,
              html: req.body.content
          };
  transporter.sendMail(mailOption, function(err, info){
              if(err){
                  console.log(err);
                  res.json({message: "Fail"});
              } else {
                  console.log("Email Sent Successfully");
                  res.json({message: "Success"});
              }
          });
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
