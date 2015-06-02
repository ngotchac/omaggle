var Reflux = require('reflux');

var PeerActions = require('../actions/PeerActions'),
    PeerUtils = require('../utils/PeerUtils');

module.exports = Reflux.createStore({

    init: function init() {
        this.listenTo(PeerActions.load, this.onLoad);

        this.listenTo(PeerActions.findPartner, this.findPartner);
        this.listenTo(PeerActions.endCall, this.endCall);

        this.listenTo(PeerActions.getCallId, this.getCallId);
        this.listenTo(PeerActions.setCallId, this.setCallId);

        this.listenTo(PeerActions.getPeerConnection, this.getPeerConnection);
        this.listenTo(PeerActions.setPeerConnection, this.setPeerConnection);
    },


    onLoad: function onLoad() {
        PeerUtils
            .createPeerConnection(this, PeerActions)
            .then(this.setPeerConnection.bind(this));
    },
    findPartner: function findPartner() {
        this.output();
    },
    endCall: function endCall() {
        this.output();
    },

    getCallId: function getCallId() {
        return this.callId;
    },
    setCallId: function setCallId(callId) {
        this.callId = callId;
    },

    getPeerConnection: function getPeerConnection() {
        return this.peerConnection;
    },
    setPeerConnection: function setPeerConnection(peerConnection) {
        this.peerConnection = peerConnection;
        this.output();
    },

    getCurrentCall: function getCurrentCall() {
        this.trigger(this.currentCall);
    },
    setCurrentCall: function setCurrentCall(call) {
        this.currentCall = call;
        this.output();
    },
    removeCurrentCall: function removeCurrentCall() {
        delete this.currentCall;
        this.output();
    },

    setWaitingStatus: function setWaitingStatus(status) {
        this.waitingStatus = status;
        this.output();
    },

    output: function output() {
        this.trigger({
            currentCall: this.currentCall,
            waiting: this.waitingStatus
        });
    }

});









