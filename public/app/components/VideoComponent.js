var React = require('react');

module.exports = React.createClass({

    componentWillReceiveProps: function(props) {
        var video = this.getDOMNode();
        video.onloadedmetadata = video.play.bind(video);
        video.src = window.URL.createObjectURL(this.props.stream);
    },

    render: function render() {
        return (
                <video></video>
        );
    }

});
