var Reflux = require('reflux');

var LogActions = require('../actions/LogActions');

module.exports = Reflux.createStore({

    init: function init() {
        this.logs = [];

        this.listenTo(LogActions.addLog, this.addLog);
    },

    addLog: function addLog(logMessage) {
        this.logs.push({
            message: logMessage,
            date: new Date(),
            id: Date.now()
        });

        this.trigger(this.logs);
    },

    getInitialState: function getInitialState() {
        return this.logs;
    }

});
