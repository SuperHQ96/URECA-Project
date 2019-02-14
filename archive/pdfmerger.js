var merge = require('easy-pdf-merge');

// merge([__dirname + '/uploads/input.pdf',__dirname + '/uploads/oas_form.pdf'],'./merged.pdf',function(err){
//
//         if(err)
//         return console.log(err);
//
//         console.log('Successfully merged!');
//
// });

var mergingArray = new Array();
for(var index = 0; index < 54 ; index++) {
  mergingArray.push(__dirname + '\\downloads\\oas_form' + index + '.pdf');
}

merge(mergingArray,'./merged.pdf',function(err){

        if(err)
        return console.log(err);

        console.log('Successfully merged!');

});
