var liveServer = require("live-server");
 
var params = {
    port: process.env.PORT || 8080,
    host: "0.0.0.0",
    root: "app/",
    open: true,
    file: "index.html",
    mount: [
                ['/artifacts', './build/contracts'],
                ['/noty', './node_modules/noty/lib'],
                ['/jquery', './node_modules/jquery/dist'],
                ['/keyframes', './node_modules/jquerykeyframes/dist'],
                ['/bootstrap', './node_modules/bootstrap/dist']
            ],
    logLevel: 2
};
liveServer.start(params);