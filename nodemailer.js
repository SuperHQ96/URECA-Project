const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
            service: 'Outlook365', // Office 365 server
            //"Gmail" "Hotmail" "Yahoo"
            auth: {
                user: "",
                pass: ""
            }
        });

        let mailOption = {
                    from: "ZHAO0269@e.ntu.edu.sg",
                    to: "zhaohanqing96@gmail.com",
                    subject: "Node Mailer Testing",
                    html: '<h1>Testing...</h1><p>Hello World</p>'
                };

                transporter.sendMail(mailOption, function(err, info){
                            if(err){
                                console.log(err);
                            } else {
                                console.log("Email Sent Successfully");
                            }
                        });
