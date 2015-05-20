
(function(window, document, Peer, RSVP, request) {

    init();

    function init() {
        initBinding();
    }

    function initBinding() {
        var startButton = document.getElementById('start').getElementsByTagName('button')[0];
        startButton.addEventListener('click', start);

        var findButton = document.getElementById('find-partner');
        findButton.addEventListener('click', findPartnerHandler);

        var endCallButton = document.getElementById('end-call');
        endCallButton.addEventListener('click', endCall);
        displayEndCallButton(false);
    }

    function start() {
        initMyVideo().then(function() {
            var startContainer = document.getElementById('start'),
                streamContainer = document.getElementById('streams');

            startContainer.style.display = 'none';
            streamContainer.style.display = 'block';

            connectToBack();
        });
    }

    function displayEndCallButton(displayIt) {
        var endCallButton = document.getElementById('end-call');

        if (displayIt) endCallButton.style.display = '';
        else endCallButton.style.display = 'none';
    }

    function findPartnerHandler() {
        var findContainer = document.getElementById('find-partner--container');
        findContainer.style.display = 'none';

        var waitingContainer = document.getElementById('waiting--container');
        waitingContainer.style.display = '';

        findPartner();
    }

    function goToFindState() {
        displayEndCallButton(false);

        var video = document.getElementById('you');
        video.parentElement.style.display = 'none';

        var findContainer = document.getElementById('find-partner--container');
        findContainer.style.display = '';
    }

    /** Global Object, within this context. */
    var peerConnection, myId, currentCall,
        myStream;

    /**
     * Return the current User's Media Stream.
     * If not already available, ask for permission and get the Stream.
     * 
     * @return {Promise => MediaStream}  The current User's Stream, from the `streamOptions` Object
     */
    function getMyStream() {
        var streamOptions = { audio: false, video: true };

        return new RSVP.Promise(function(resolve, reject) {
            if (myStream) resolve(myStream);
            else {
                navigator.getUserMedia = navigator.getUserMedia ||
                                         navigator.webkitGetUserMedia ||
                                         navigator.mozGetUserMedia;

                if (navigator.getUserMedia) {
                    navigator.getUserMedia(
                        streamOptions,
                        function(stream) {
                            myStream = stream;
                            resolve(myStream);
                        },
                        reject
                    );
                } else reject("The method `getUserMedia` is not supported.");
            }
        });
    }

    function addInfo(info) {
        var infoElement = document.getElementById('info');
        infoElement.innerHTML += '<p>'+ info +'</p>';
    }

    /**
     * Retrieves the current User's Media Stream, and displays it in the video DOM Element.
     * 
     * @return {Promise}  Promise resolved when the stream is correctly attached to the video Element.
     */
    function initMyVideo() {
        var video = document.getElementById('me');
        video.onloadedmetadata = video.play.bind(video);

        return getMyStream().then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
        });
    }

    function handleRemoteStream(remoteStream) {
        var video = document.getElementById('you');
        video.onloadedmetadata = video.play.bind(video);
        video.src = window.URL.createObjectURL(remoteStream);

        video.parentElement.style.display = '';

        var waitingContainer = document.getElementById('waiting--container');
        waitingContainer.style.display = 'none';
    }

    function connectToBack() {
        var options = { host: 'omaggle.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3, path: '/peer' };
        // peerConnection = new Peer({ host: 'localhost', port: 3000, path: '/peer' });
        if (!myId)
            peerConnection = new Peer(options);
        else
            peerConnection = new Peer(myId, options);

        peerConnection.on('open', function(id) {
            myId = id;
            addInfo('Got ID: ' + myId);
        });

        peerConnection.on('disconnected', connectToBack);
    }

    function findPartner() {
        request
            .get('/streamer')
            .query({ myId: myId })
            .end(function(err, res) {
                if (err || !res.ok) {
                    addInfo('An error occured while trying to find a partner. Error: ' + JSON.stringify(err) + ' - Response: ' + JSON.stringify(res));
                } else {
                    if (res.body && res.body.id) {
                        /** Another user was wainting, we can call him! */
                        callRemote(res.body.id);

                    } else {
                        /** Nobody was wainting, lets wait and answer to any call... */
                        waitForCall();
                    }
                }
            });
    }

    function callRemote(remoteId) {
        addInfo('Calling Remote: ' + remoteId);

        getMyStream().then(function(myMediaStream) {
            var call = peerConnection.call(remoteId, myMediaStream);
            handleCall(call);
        });
    }

    function waitForCall() {
        peerConnection.on('call', function(call) {

            getMyStream().then(function(myMediaStream) {
                // Answer the call, providing our mediaStream
                call.answer(myMediaStream);
            });

            handleCall(call);

            sendIdDeletion();
        });
    }

    function handleCall(call) {
        currentCall = call;
        displayEndCallButton(true);

        peerConnection.on('call', function() {});

        call.on('stream', handleRemoteStream);

        call.on('error', function(err) {
            addInfo('No more Remote Stream, an error occured: ' + JSON.stringify(err));
            goToFindState();
        });

        call.on('close', function() {
            addInfo('No more Remote Stream, the conncetion was closed...');
            goToFindState();
        });
    }

    function endCall() {
        currentCall.close();
    }

    function sendIdDeletion() {
        request
            .del('/streamer/' + myId)
            .end(function(err, res) {
                if (err || !res.ok) {
                    addInfo('An error occured while trying to delete our Id:' + JSON.stringify(err));
                } else {
                    addInfo('Successfully deleted Id from DB.');
                }
            });
    }

})(window, document, window.Peer, window.RSVP, window.superagent);
