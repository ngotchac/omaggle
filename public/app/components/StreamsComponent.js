var React = require('react');

var StreamStore = require('../stores/StreamStore'),
    StreamActions = require('../actions/StreamActions');

var Video = require('./VideoComponent.js');

module.exports = React.createClass({

    getInitialState: function() {
        return {};
    },

    handleFindPartner: function() {
        console.log('Finding a partner...');
    },

    onStreamChange: function onStreamChange(state) {
        this.setState(state);
    },


    componentDidMount: function() {
        this.unsubscribe = StreamStore.listen(this.onStreamChange);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },


    render: function render() {
        var endCallButton,
            remoteVideoStream;

        if (this.state.remoteStream) {
            endCallButton = <div className="end-call"><button>End Call</button></div>;
            remoteVideoStream = <Video stream={this.state.remoteStream}></Video>;
        } else if (this.state.waiting) {
            remoteVideoStream = <div><p>Waiting for partner...</p></div>;
        } else {
            remoteVideoStream = <div><button id="find-partner" onClick={this.handleFindPartner}>Find a partner</button></div>;
        }

        return (
            <div>
                <div className="videos-container">
                    <div className="container-item">
                        <Video stream={this.state.localStream}></Video>
                    </div>

                    <div className="container-item">
                        {remoteVideoStream}                            
                    </div>

                </div>

                {endCallButton}
            </div>
        );
    }

});
