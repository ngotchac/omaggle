var Reflux = require('reflux'),

    Peer = require('peerjs'),
    RSVP = require('rsvp'),
    request = require('superagent');

var LogActions = require('./LogActions'),
    StreamActions = require('./StreamActions');

var Actions = Reflux.createActions({
    load: {},
    findPartner: {
        asyncResult: true,
        children: ['callRemote', 'waitForCall', 'handleCall']
    },
    endCall: {},

    getCallId: {},
    setCallId: {},

    getPeerConnection: {},
    setPeerConnection: {},

    setCurrentCall: {},
    getCurrentCall: {},
    removeCurrentCall: {},

    setWaitingStatus: {}
});

Actions.findPartner.listen(function findPartner() {
    request
        .get('/streamer')
        .query({ myId: Actions.getCallId() })
        .end(function(err, res) {
            if (err || !res.ok) {
                this.failed(err);
                LogActions.addLog('An error occured while trying to find a partner. Error: ' + JSON.stringify(err) + ' - Response: ' + JSON.stringify(res));
                return;
            }

            /** Another user was wainting, we can call him! */
            if (res.body && res.body.id) {
                Actions.findPartner.callRemote(res.body.id);
                return;
            }

            /** Nobody was wainting, lets wait and answer to any call... */
            Actions.findPartner.waitForCall();
        });
});

Actions.findPartner.callRemote.listen(function callRemote(remoteCallId) {
    LogActions.addLog('Calling Remote: ' + remoteCallId);

    StreamActions.getLocalStream().then(myMediaStream => {
        var call = Actions.getPeerConnection().call(remoteCallId, myMediaStream);
        this
            .handleCall(call)
            .then(this.completed.bind(this));
    });
});

Actions.findPartner.waitForCall.listen(function waitForCall() {
    Actions.setWaitingStatus(true);
    Actions.getPeerConnection().on('call', call => {

        Actions.setWaitingStatus(true);
        StreamActions.getLocalStream().then(function(myMediaStream) {
            // Answer the call, providing our mediaStream
            call.answer(myMediaStream);
        });

        this
            .handleCall(call)
            .then(function() {
                request
                    .del('/streamer/' + Actions.getCallId())
                    .end(function(err, res) {
                        if (err || !res.ok) {
                            LogActions.addLog('An error occured while trying to delete our Id:' + JSON.stringify(err));
                            this.failed(err);
                        } else {
                            LogActions.addLog('Successfully deleted CallID from DB.');
                            this.completed();
                        }
                    });
            });
    });
});

Actions.findPartner.handleCall.listen(function handleCall(call) {
    Actions.setCurrentCall(call);

    /** Detach the Call Answering Event */
    Actions.getPeerConnection().on('call', function() {});

    call.on('stream', StreamActions.addRemoteStream.bind(StreamActions));

    call.on('error', function(err) {
        LogActions.addLog('No more Remote Stream, an error occured: ' + JSON.stringify(err));
        Actions.removeCurrentCall();
    });

    call.on('close', function() {
        LogActions.addLog('No more Remote Stream, the conncetion was closed...');
        Actions.removeCurrentCall();
    });
});

Actions.endCall.listen(function() {
    Actions.getCurrentCall().close();
    Actions.removeCurrentCall();
});

module.exports = Actions;
