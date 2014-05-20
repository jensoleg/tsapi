var express = require("express"),
    app = express(),
    bodyParser = require('body-parser');
    moment = require('moment');

app.use(bodyParser());
app.use(function(err,req,res,next){
    if(err){
        console.log(err);
    }
    next();
});

app.all('/', function(req, res, next) {
    // set origin policy etc so cross-domain access wont be an issue

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,  Content-Type, Accept");
    console.log(req.body);
    next();
});
app.post('/', function(req, res) {
    console.log(req.body);
    console.log(Object.keys(req.body));
    if(!Object.keys(req.body))
        res.json('all good');
    else
        res.json(400,{
            success: false,
            error: "json invalid"
        });


});



app.listen(process.env.PORT || 3800);