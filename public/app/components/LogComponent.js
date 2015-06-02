var React = require('react'),
    Reflux = require('reflux');

var LogStore = require('../stores/LogStore');

module.exports = React.createClass({

    getInitialState: function() {
        return { logs: LogStore.getInitialState() };
    },

    onLogsChange: function(logs) {
        this.setState({ logs: logs });
    },

    componentDidMount: function() {
        this.unsubscribe = LogStore.listen(this.onLogsChange);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },

    render: function() {
        return (
            <div>
                <h3>Logs</h3>
                <div className="info" id="info">
                    {this.state.logs.map(log => (
                        <p key={log.id}>
                            <small><b>[{log.date.toLocaleString()}]</b></small> {log.message}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
});
