(function() {

    require('./main.less');

    var React = require('react');
    var Navigation = require('react-router').Navigation;

    var Logs = require('./components/LogComponent'),
        Streams = require('./components/StreamsComponent');

    var PeerActions = require('./actions/PeerActions');

    var Home = React.createClass({
        mixins: [Navigation],

        handleStart: function() {
            PeerActions.load();
            this.transitionTo('call');
        },
        
        render: function() {
            return (
                <div className="start">
                    <button onClick={this.handleStart}>Start</button>
                </div>
            );
        }
    });

    var Main = React.createClass({

        render: function() {
            return (
                <div className="container">
                    <div className="header">OMaggle!</div>
                    <Streams></Streams>
                    <Logs></Logs>
                </div>
            );
        }
    });

    var Router = require('react-router');
    var Route = Router.Route;
    var DefaultRoute = Router.DefaultRoute;
    var RouteHandler = Router.RouteHandler;

    var App = React.createClass({
        render: function() {
            return (
                <RouteHandler></RouteHandler>
            );
        }
    });

    var routes = (
        <Route handler={App} path="/">
            <DefaultRoute handler={Home}/>
            <Route name="call" handler={Main} />
        </Route>
    );

    Router.run(routes, function(Handler) {
        React.render(<Handler/>, document.body);
    });

})();
