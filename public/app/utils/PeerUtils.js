
'use strict';

var RSVP = require('rsvp'),
    Peer = require('peerjs');

var setIntervalId;
function pingHeroku(PeerStore) {
    try {
        var peerConnection = PeerStore.getPeerConnection();
        peerConnection.socket.send({type: 'PING'});
    } catch(e) {
        clearInterval(setIntervalId);
        setIntervalId = null;
    }
}

var retries = 0,
    connectionTroubleTimeoutId;

var createPeerConnection,
    handleConnectionTrouble;

createPeerConnection = function createPeerConnection(PeerStore) {
    // var options = { host: 'omaggle.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3, path: '/peer' };
    var options = { host: 'localhost', port: 5000, debug: 3, path: '/peer' };
    connectionTroubleTimeoutId = null;

    return new RSVP.Promise(resolve => {

        var callId = PeerStore.getCallId(),
            peerConnection;

        if (!callId)
            peerConnection = new Peer(options);
        else
            peerConnection = new Peer(callId, options);

        peerConnection.on('open', () => {
            retries = 0;
            if (!setIntervalId)
                setIntervalId = setInterval(pingHeroku.bind(this, PeerStore), 1000);

            resolve(peerConnection);
        });

        peerConnection.on('disconnected', handleConnectionTrouble.bind(this, PeerStore));
        peerConnection.on('error', handleConnectionTrouble.bind(this, PeerStore));
    });
};

handleConnectionTrouble = function handleConnectionTrouble(PeerStore) {
    if (!connectionTroubleTimeoutId) {
        retries++;
        connectionTroubleTimeoutId = setTimeout(() => {
            createPeerConnection(PeerStore).then(peerConnection => PeerStore.setPeerConnection(peerConnection));
        }, retries * 1000 + Math.floor(Math.random() * 5000));
    }
};

module.exports = {
    createPeerConnection
};

