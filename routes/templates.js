var express = require('express');
var router = express.Router();
var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var cmd=require('node-cmd');
var nrc = require('node-run-cmd');
const fileExists = require('file-exists');
var merge = require('easy-pdf-merge');
var oas_form = fs.readFileSync(path.resolve('./uploads', 'oas_form.docx'), 'binary');
var tracking_form = fs.readFileSync(path.resolve('./uploads', 'tracking_form.docx'), 'binary');
var process_flow_record = fs.readFileSync(path.resolve('./uploads', 'process_flow_record.docx'), 'binary');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ureca"
});

//Load oas form web page path
router.get('/oas_form', isLoggedIn, (req, res) => {
	connection.query('SELECT course_code, course_title, area_code, faculty_name AS course_coordinator, area_admin FROM faculty_staff NATURAL JOIN (SELECT course_code, course_title, area_code, initial, area_admin FROM coordinators NATURAL JOIN (SELECT * FROM courses NATURAL JOIN area) AS SUBQUERY) AS SUBQUERY2 ORDER BY faculty_name;', function(error, results, fields){
		if(error) throw error;
			res.render("templates/oas_form", {data: results});
		})
})

//Download a single pas form according to the course code in request body
router.post('/oas_form/download', async (req, res) => {
  await generateOASForm('oas_form.docx', req.body.course_code, req.body.course_title, req.body.area_code, req.body.course_coordinator, req.body.area_admin);
	var fileLocation = path.join('./downloads', 'oas_form.docx');
	res.download(fileLocation, 'output.docx');
})

//For the webpage to obtain oas form data
router.get('/oas_form_data', isLoggedIn, (req, res) => {
  connection.query('SELECT course_code, course_title, area_code, faculty_name AS course_coordinator, area_admin FROM faculty_staff NATURAL JOIN (SELECT course_code, course_title, area_code, initial, area_admin FROM coordinators NATURAL JOIN (SELECT * FROM courses NATURAL JOIN area) AS SUBQUERY) AS SUBQUERY2 ORDER BY faculty_name;', function(error, results, fields){
		if(error) throw error;
			res.json(results);
		})
})

//Generate the oas_form for all course codes
router.post('/oas_form/generate', async (req, res) => {
  var zip = new JSZip(oas_form);
	var doc = new Docxtemplater();
	doc.loadZip(zip);
  connection.query('SELECT course_code, course_title, area_code, faculty_name AS course_coordinator, area_admin FROM faculty_staff NATURAL JOIN (SELECT course_code, course_title, area_code, initial, area_admin FROM coordinators NATURAL JOIN (SELECT * FROM courses NATURAL JOIN area) AS SUBQUERY) AS SUBQUERY2 ORDER BY faculty_name;', async function(error, results, fields){
		if(error) throw error;
			results.forEach(async (result, index) => {
        doc.setData({
      	    course_code: result.course_code,
      	    course_title: result.course_title,
      	    area_code: result.area_code,
      	    course_coordinator: result.course_coordinator,
      			area_admin: result.area_admin
      	});
      	try {
      	    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      	    doc.render()
      	}
      	catch (error) {
      	    var e = {
      	        message: error.message,
      	        name: error.name,
      	        stack: error.stack,
      	        properties: error.properties,
      	    }
      	    console.log(JSON.stringify({error: e}));
      	    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      	    throw error;
      	}
      	var buf = doc.getZip().generate({type: 'nodebuffer'});

      	// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
      	fs.writeFileSync(path.resolve('./downloads', 'oas_form' + index + '.docx'), buf);
        await cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\downloads\\oas_form' + index + '.docx"');
		  })
      res.json({message: "Done"});
    })
})

//Merge all oas forms generated
router.post('/oas_form/merge', async (req, res) => {
  if(req.body.noOfFiles > 1) {
    var mergingArray = new Array();
    for(var index = 0; index < req.body.noOfFiles ; index++) {
      if(!fileExists.sync('.\\downloads\\oas_form' + index + '.pdf')) {
        await cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\downloads\\oas_form' + index + '.docx"');
        mergingArray.push('C:\\xampp\\htdocs\\downloads\\oas_form' + index + '.pdf');
      } else {
        mergingArray.push('C:\\xampp\\htdocs\\downloads\\oas_form' + index + '.pdf');
      }
    }
    await merge(mergingArray,'./downloads/merged.pdf',function(err){
            if(err) {
              res.json({merged: false});
            } else {
              res.json({merged: true});
            }
    });
  }
})

//Download the merged oas forms as a PDF
router.post('/oas_form/all', function (req, res) {
   var file = path.join('C:\\xampp\\htdocs\\downloads', 'merged.pdf');
   res.download(file);
});

//Load tracking form web page path
router.get('/tracking_form', isLoggedIn, (req, res) => {
    connection.query('SELECT course_code FROM coordinators UNION SELECT course_code FROM examiners UNION SELECT course_code FROM moderators', function(error, results, fields){
      if(error) throw error;
      res.render("templates/tracking_form", {course_codes: results});
    })
})

//Get course codes
router.get('/tracking_form_data', isLoggedIn, (req, res) => {
  connection.query('SELECT course_code FROM coordinators UNION SELECT course_code FROM examiners UNION SELECT course_code FROM moderators', function(error, results, fields){
		if(error) throw error;
			res.json(results);
		})
})

//Download a single tracking form
router.post('/tracking_form/download', (req, res) => {
  var fileLocation = path.join('./trackingForms', req.body.course_code + '.docx');
  generateTrackingForm(req.body.course_code + '.docx', req.body.course_code)
  .then(
    () => {
      res.download(fileLocation, req.body.course_code + '.docx');
    }
);
})

//Generate tracking forms for all course codes
router.post('/tracking_form/generatedocx', (req, res) => {
  connection.query('SELECT course_code FROM coordinators UNION SELECT course_code FROM examiners UNION SELECT course_code FROM moderators', function(error, results, fields){
    if(error) throw error;
    results.forEach((result, index) => {
      generateTrackingForm(result.course_code + '.docx', result.course_code).then(function(){
        console.log("Generated " + result.course_code + ".docx");
      });
    })
    res.json({message: "Done"});
  })
})

router.post('/tracking_form/generatepdf', async(req, res) => {
    var promise = new Promise(async function(resolve, reject){
      var currentTime = new Date().getTime();
      cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\trackingForms\\' + req.body.course_code + '.docx"');
      while (currentTime + 10000 >= new Date().getTime()) {
   }
      resolve();
    });
    promise.then(function(data){
      res.json({message: "Done"});
    })
})

//Merge all tracking forms generated
router.post('/tracking_form/merge', (req, res) => {
  connection.query('SELECT course_code FROM coordinators UNION SELECT course_code FROM examiners UNION SELECT course_code FROM moderators', async function(error, results, fields){
    if(results.length > 1) {
      var mergingArray = new Array();
      results.forEach((result, index)=> {
        if(!fileExists.sync('.\\trackingForms\\' + result.course_code + '.pdf')) {
          cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\trackingForms\\' + result.course_code + '.docx"');
          while (currentTime + 10000 >= new Date().getTime()) {}

        mergingArray.push('C:\\xampp\\htdocs\\trackingForms\\' + result.course_code + '.pdf');
      }})
    await merge(mergingArray,'./trackingForms/merged.pdf',function(err){
            if(err) {
              res.json({merged: false});
            } else {
              res.json({merged: true});
            }
        });
  }
})
});

//Download the merged tracking forms as a PDF file
router.post('/tracking_form/all', function (req, res) {
   var file = path.join('C:\\xampp\\htdocs\\trackingForms', 'merged.pdf');
   res.download(file);
});

//Load process flow record web page path
router.get('/process_flow_record', isLoggedIn, (req, res) => {
  connection.query('SELECT DISTINCT course_code FROM examiners ORDER BY course_code;', function (error, results, fields){
    if(error) throw error;
    res.render("templates/process_flow_record", {course_codes: results});
  })
})

//Get course codes
router.get('/process_flow_data', isLoggedIn, (req, res) => {
  connection.query('SELECT DISTINCT course_code FROM examiners ORDER BY course_code', function(error, results, fields){
		if(error) throw error;
			res.json(results);
		})
})

//Download a single process flow record
router.post('/process_flow_record/download', (req, res) => {
  var fileLocation = path.join('./processFlowRecords', req.body.course_code + '.docx');
  generateProcessFlowRecord(req.body.course_code + '.docx', req.body.course_code)
  .then(
    () => {
      res.download(fileLocation, req.body.course_code + '.docx');
    }
);
})

//Generate process flow records for all course codes
router.post('/process_flow_record/generatedocx', (req, res) => {
  connection.query('SELECT DISTINCT course_code FROM examiners ORDER BY course_code;', function(error, results, fields){
    if(error) throw error;
      results.forEach((result, index) => {
        generateProcessFlowRecord(result.course_code + '.docx', result.course_code).then(function(){
          if(index + 1 == results.length) {
            res.end(res.json({message: "Done"}));
          }
        });
      })
  })
})

router.post('/process_flow_record/generatepdf', (req, res) => {
  nrc.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\processFlowRecords\\' + req.body.course_code + '.docx"').then(function(exitCodes) {
  console.log("Generated "+ req.body.course_code + ".pdf");
   res.json({message: "Done"});
 }, function(err) {
   res.json({message: "Error!"});
 });
})

//Merge all process flow records generated
router.post('/process_flow_record/merge', (req, res) => {
  connection.query('SELECT DISTINCT course_code FROM examiners ORDER BY course_code;', async function(error, results, fields){
    if(results.length > 1) {
      var mergingArray = new Array();
      var completionFlag = true;
      results.forEach((result, index)=> {
        if(!fileExists.sync('.\\processFlowRecords\\' + result.course_code + '.pdf')) {
          completionFlag = false;
          nrc.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\processFlowRecords\\' + req.body.course_code + '.docx"').then(function(exitCodes) {
           completionFlag = true;
         }, function(err) {
           throw err;
         });

         while (!completionFlag) {}
      }
      mergingArray.push('C:\\xampp\\htdocs\\processFlowRecords\\' + result.course_code + '.pdf');
    })
    await merge(mergingArray,'./processFlowRecords/merged.pdf',function(err){
            if(err) {
              res.json({merged: false});
            } else {
              res.json({merged: true});
            }
        });
  }
})
});

//Download the merged tracking forms as a PDF file
router.post('/process_flow_record/all', function (req, res) {
   var file = path.join('C:\\xampp\\htdocs\\processFlowRecords', 'merged.pdf');
   res.download(file);
});

function generateProcessFlowRecord(fileName, courseCode) {
  let courseTitle;
  let area;
  let coordinator;
  let examiners = [];
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM courses NATURAL JOIN area WHERE course_code = '${courseCode}'`, function(error, results, fields){
      if(error) return reject(error);
      area = results[0].area_code;
    })
    connection.query(`SELECT * FROM examiners NATURAL JOIN faculty_staff WHERE course_code = '${courseCode}'`, function(error, results, fields){
      if(error) return reject(error);
      results.forEach(function(dataRow, index){
        examiners.push(dataRow.faculty_name);
      });
      for(var j = examiners.length; j<5; j++){
        examiners.push('');
      }
    })
    connection.query(`SELECT * FROM courses WHERE course_code = '${courseCode}'`, function(error, results, fields){
      courseTitle = results[0].course_title;
    })
    connection.query(`SELECT * FROM coordinators NATURAL JOIN faculty_staff WHERE course_code = '${courseCode}'`, function(error, results, fields){
      coordinator = results[0].faculty_name;

      var zip = new JSZip(process_flow_record);
    	var doc = new Docxtemplater();
    	doc.loadZip(zip);
        doc.setData({
            course_code: courseCode,
            course_title: courseTitle,
            course_coordinator: coordinator,
            area: area,
            em1: examiners[0],
            em2: examiners[1],
            em3: examiners[2],
            em4: examiners[3],
            em5: examiners[4]
        });
        try {
            doc.render()
        }
        catch (error) {
            var e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({error: e}));
            return reject(error);
        }
        var buf = doc.getZip().generate({type: 'nodebuffer'});

        fs.writeFileSync(path.resolve('./processFlowRecords', fileName), buf);
        resolve();
    })
  })
}

function generateTrackingForm(fileName, courseCode){
  let moderators = [];
  let examiners = [];
  let coordinator = [];
  let courseTitle = [];

  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM moderators NATURAL JOIN faculty_staff WHERE course_code = '${courseCode}'`, function(error, results, fields) {
      if(error) return reject(error);
      results.forEach(function(dataRow, index){
        moderators.push(dataRow.faculty_name);
      })
    })

    connection.query(`SELECT * FROM examiners NATURAL JOIN faculty_staff WHERE course_code = '${courseCode}'`, function(error, results, fields){
      if(error) return reject(error);
      results.forEach(function(dataRow, index){
        examiners.push(dataRow.faculty_name);
      })
    })

    connection.query(`SELECT * FROM courses WHERE course_code = '${courseCode}'`, function(error, results, fields){
      courseTitle.push(results[0].course_title)
    })

    connection.query(`SELECT * FROM coordinators NATURAL JOIN faculty_staff WHERE course_code = '${courseCode}'`, function(error, results, fields){
      coordinator.push(results[0].faculty_name);
      var moderators_examiners = moderators.concat(examiners.filter(function(item){return moderators.indexOf(item) < 0}));
      for(var j = moderators_examiners.length; j<6; j++){
        moderators_examiners.push('');
      }

      var zip = new JSZip(tracking_form);
    	var doc = new Docxtemplater();
    	doc.loadZip(zip);
        doc.setData({
            course_code: courseCode,
            course_title: courseTitle[0],
            course_coordinator: coordinator[0],
            ema1: moderators_examiners[0],
            ema2: moderators_examiners[1],
            ema3: moderators_examiners[2],
            ema4: moderators_examiners[3],
            ema5: moderators_examiners[4],
            ema6: moderators_examiners[5],
        });
        try {
            doc.render()
        }
        catch (error) {
            var e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({error: e}));
            return reject(error);
        }
        var buf = doc.getZip().generate({type: 'nodebuffer'});

        fs.writeFileSync(path.resolve('./trackingForms', fileName), buf);
        resolve();
  })
  })


}

function generateOASForm(fileName, courseCode, courseTitle, areaCode, courseCoordinator, areaAdmin) {
  var zip = new JSZip(oas_form);
	var doc = new Docxtemplater();
	doc.loadZip(zip);
	doc.setData({
	    course_code: courseCode,
	    course_title: courseTitle,
	    area_code: areaCode,
	    course_coordinator: courseCoordinator,
			area_admin: areaAdmin
	});
	try {
	    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
	    doc.render()
	}
	catch (error) {
	    var e = {
	        message: error.message,
	        name: error.name,
	        stack: error.stack,
	        properties: error.properties,
	    }
	    console.log(JSON.stringify({error: e}));
	    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
	    throw error;
	}
	var buf = doc.getZip().generate({type: 'nodebuffer'});

	// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
	fs.writeFileSync(path.resolve('./downloads', fileName), buf);
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
