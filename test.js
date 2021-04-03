var liveServer = require("live-server");
liveServer.start({
    port: 8181,
    host: "localhost",
    root: "./",
    open: false,
    logLevel: 0,
});
console.log( "to test esm script go to http://localhost:8181/esm/test" );
console.log( "to test umd script go to http://localhost:8181/umd/test" );
console.log( "to test src script go to http://localhost:8181/src/test" );
console.log( "to stop the server press control-c" );
