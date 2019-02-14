//In order to convert into pdf, you need to install LibreOffice first
//You will also have to install unoconv manually
//Refer to https://ask.libreoffice.org/en/question/4648/windows-install-unoconv/ for more information

 // var cmd=require('node-cmd');
 //
 // cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\downloads\\output.docx"');
 //
 // cmd.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\trackingForms\\EE4265.docx"')

 var nrc = require('node-run-cmd');

 nrc.run('"\\xampp\\htdocs\\LibreOffice\\program\\python.exe" unoconv -f pdf "\\xampp\\htdocs\\trackingForms\\EE0040.docx"').then(function(exitCodes) {
  console.log("Done");
}, function(err) {
  console.log('Command failed to run with error: ', err);
});
