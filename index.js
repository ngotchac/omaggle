var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),

    ExpressPeerServer = require('peer').ExpressPeerServer,

    mongoose = require('mongoose');

var mongodbUri = process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost/omaggle';
                
mongoose.connect(mongodbUri);

var Streamer = mongoose.model('Streamer', mongoose.Schema({
    id: { type: String, index: { unique: true } }
}));


var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/streamer', function(req, res) {
    reqUserId = req.query.myId;
    if(!reqUserId) res.status(400).send('Please provide an Id.');

    Streamer.where('id').ne(reqUserId).findOne(function(err, streamer) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        else if (streamer) res.send(streamer);
        else {
            var streamer = new Streamer({ id: reqUserId });
            streamer.save(function(err, savedStreamer) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
                else res.sendStatus(200);
            });
        }
    });
});

app.delete('/streamer/:id', function(req, res, next) {
    Streamer.where({ id: req.params.id }).findOneAndRemove(function(err) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        else res.sendStatus(200);
    });
});


var server = app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

var peerOptions = {
        debug: true
    },
    peerServer = ExpressPeerServer(server, peerOptions);

peerServer.on('disconnect', function(id) {
    Streamer.where({ id: id }).findOneAndRemove(function(err) {
        if (err)
            console.log(err);
    });
});

app.use('/peer', peerServer);
