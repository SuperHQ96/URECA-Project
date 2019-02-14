var DocxMerger = require('docx-merger');

var fs = require('fs');
var path = require('path');

var file1 = fs
    .readFileSync(path.resolve('./downloads', 'oas_form0.docx'), 'binary');

var file2 = fs
    .readFileSync(path.resolve('./downloads', 'oas_form1.docx'), 'binary');

var docx = new DocxMerger({},[file1,file2]);


//SAVING THE DOCX FILE

docx.save('nodebuffer',function (data) {
    // fs.writeFile("output.zip", data, function(err){/*...*/});
    fs.writeFile("output.docx", data);
});
