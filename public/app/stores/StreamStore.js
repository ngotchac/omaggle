var Reflux = require('reflux'),

    RSVP = require('rsvp');

var PeerStore = require('./PeerStore');

var StreamActions = require('../actions/StreamActions'),
    PeerActions = require('../actions/PeerActions.js');

module.exports = Reflux.createStore({

    init: function init() {
        this.listenTo(StreamActions.getLocalStream, this.getLocalStream);
        this.listenTo(StreamActions.addRemoteStream, this.addRemoteStream);
        this.listenTo(StreamActions.removeRemoteStream, this.removeRemoteStream);

        this.listenTo(PeerActions.endCall, this.onEndCall);

        initLocalStream().then(
            localStream => {
                PeerActions.init();
                this.localStream = localStream;
                this.output();
            },
            console.error.bind(console)
        );
    },

    onEndCall: function onEndCall() {
        this.removeRemoteStream();
    },

    getLocalStream: function getLocalStream() {
        return this.localStream;
    },

    addRemoteStream: function addRemoteStream(remoteStream) {
        this.remoteStream = remoteStream;
        this.output();
    },

    removeRemoteStream: function removeRemoteStream() {
        delete this.remoteStream;
        this.output();
    },


    output: function output() {
        this.trigger({
            localStream: this.localStream,
            remoteStream: this.remoteStream
        });
    }

});

/**
 * Return the current User's Media Stream.
 * If not already available, ask for permission and get the Stream.
 * 
 * @return {Promise => MediaStream}  The current User's Stream, from the `streamOptions` Object
 */
function initLocalStream() {
    var streamOptions = { audio: false, video: true };

    return new RSVP.Promise(function(resolve, reject) {
        navigator.getUserMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia;

        if (!navigator.getUserMedia) {
            reject('The method `getUserMedia` is not supported.');
            return;
        }

        navigator.getUserMedia(streamOptions, resolve, reject);
    });
}
