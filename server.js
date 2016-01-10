// npm requirement
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});

app.use(bodyParser.json());
app.use(urlencodedParser);

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/test';

var htmlDir = "/static";

// Connect to the db
var bucket;
var db = MongoClient.connect(url, function (err, db) {
    if (!err) {
        console.log("Connected to Mongo");
        bucket = db.collection('restaurants');
    } else {
        console.error("Ooops ! You are not connected to mongo server, Please log");
        process.exit(1);
    }
});

/* GET home page. */
app.get('/', function (req, res) {

    var html = '<p><center><h2>CRUD NodeJS Express MongoDB</h2></center></p>' +
        '<br /><br /><br /><br /> ' +
        '<center>' +
        '<a href="/connect"><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-off" aria-hidden="true"></span>Connected to Mongo</button></a>' +
        '<a href="/find"><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-off" aria-hidden="true"></span>Find document</button></a>' +
        '<a href="/create"><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-off" aria-hidden="true"></span>Insert document</button></a>' +
        '<a href="/delete"><button type="button" class="btn btn-default"><span class="glyphicon glyphicon-off" aria-hidden="true"></span>Delete document</button></a>' +
        '<p><img src="http://cdn.meme.am/instances/59664439.jpg" alt="connected" style="width:304px;height:228px;"></p>';
    '</center>';
    res.send(html);
});

// home page
app.get('/connect', function (req, res) {
    var html = '<center><h2>Connected : Mongo version 2.6.10 </h2>' +
        '<br/><br/><br/><br/><br/>' +
        '<p><img src="http://www.mememaker.net/static/images/memes/4062664.jpg" alt="connected" style="width:304px;height:228px;"></p>' +
        '<a href="http://0.0.0.0:3000/"><button type="button" class="btn btn-primary">Home</button></a></center>';

    if (!db) {
        res.send(html);
    } else {
        res.send("Ooops ! You are not connected to mongo server, Please log");
    }
});

// find document
app.get('/find', function (req, res) {
    res.sendfile(__dirname + '/' + htmlDir + '/findDocument.html');
});

app.get('/findMany', function (req, res) {
    bucket.find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
        } else if (result.length) {
            console.log('Found:', result);
            res.send(JSON.stringify(result));
        } else {
            console.log('search character not found');
        }
    });
    //res.send(html);
});

// find document with a specific character
app.get('/findOne/:critere/:id', function (req, res) {
    if (req.params.critere === 'idR') {
        bucket.find({"restaurant_id": req.params.id}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
                res.send(result);
            } else {
                console.log('search character not found');
            }
        });
    } else if (req.params.critere === 'cuisine') {
        bucket.find({"cuisine": req.params.id}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
                res.send(result);
            } else {
                console.log('search character not found');
            }
        });
    } else if (req.params.critere === 'borough') {
        bucket.find({"borough": req.params.id}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
                res.send(result);
            } else {
                console.log('search character not found');
            }
        });
    }
});

/* A browser address bar can only issue GET requests.
 GET form to fill in with new object details. */
app.get('/create', function (req, res) {
    res.sendfile(__dirname + '/' + htmlDir + '/insertDocument.html');
});

/* POST to parse form and create something specific. */
app.get('/insert/:id&:building&:coord1&:coord2&:street&:zipcode&:borough&:cuisine&:date&:grade&:score&:name', function (req, res) {
    bucket.insertOne({
        "address": {
            "street": req.params.street,
            "zipcode": req.params.zipcode,
            "building": req.params.building,
            "coord": [req.params.coord1, req.params.coord2]
        },
        "borough": req.params.borough,
        "cuisine": req.params.cuisine,
        "grades": [
            {
                "date": new Date(req.params.date),
                "grade": req.params.grade,
                "score": req.params.score
            }
        ],
        "name": req.params.name,
        "restaurant_id": req.params.id
    }, function (err, result) {
        if (err) {
            alert(err);
        } else {
            res.send("le restaurant a été inseré avec succès ");
        }
    });

});

app.get('/delete', function (req, res) {
    res.sendfile(__dirname + '/' + htmlDir + '/deleteDocument.html');
});

// delete
app.get('/delete/:id', function (req, res) {
    bucket.remove({'restaurant_id': req.params.id}, 1, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send("le restaurant a été supprimé avec succès " + result);
        }
    });
});

app.get('/deleteOne/:id', urlencodedParser, function (req, res, next) {
    bucket.remove({"restaurant_id": req.params.id});
    res.redirect('http://localhost:3000/find')

});

// TODO Complete update document
app.get('/update/:id', function (req, res) {
    var html = '<form method="post" action="/updated">' +
        '<div>' + req.params.id +
        ': <input type="text" name="something" placeholder="something"></div>' +
        '<input type="hidden" name="id" value="' + req.params.id + '">' +
        '<div><input type="submit" value="go"></div>' +
        '</form>';
    res.send(html);
});


/* POST to parse form and update something specific. */
app.post('/updated', urlencodedParser, function (req, res) {
    var html = '<p>edited and updated ' + req.body.id + ' : ' + req.body.something + ' in db</p>';
    res.send(html);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)

});