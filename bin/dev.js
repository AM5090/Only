const webpack =require('webpack');
const [webpackClientConfig, webpackServerConfig] = require('../webpack.config');
const nodemon = require('nodemon');
const path = require('path');
const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const cors = require('cors');

const hmrServer = express();
const clientCompiler = webpack(webpackClientConfig);

const allowedOrigins = ["http://localhost:3000","http://localhost:3001"];

hmrServer.use(
    cors({
        origin: function (origin, callback) {
            if(!origin) return callback(null, true);
            if(allowedOrigins.indexOf(origin) === -1) {
                var msg = "The CORS policy for this site does not " + "allow access from the specified Origin";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
    })
);

hmrServer.use(webpackDevMiddleware(clientCompiler, {
    publicPath: "//localhost:3001/static/",
    serverSideRender: true,
    noInfo: true,
    watchOptions: {
        ignore: /dist/,
    },
    writeToDisk: true,
    stats: 'errors-only',
}));

hmrServer.use(webpackHotMiddleware(clientCompiler, {
    path: '/static/__webpack_hmr',
}));

hmrServer.listen(3001, () => {
    console.log('HMR server successful started');
});

const compiler = webpack(webpackServerConfig);

compiler.run((err) => {
    if(err) {
        console.log('Compilation failed: ', err);
    }

    compiler.watch({}, (err) => {
        if(err) {
            console.log('Compilation failed: ', err);
        }
        console.log('Compilation was succesfully');
    });

    nodemon({
        script: path.resolve(__dirname, '../dist/server/server.js'),
        watch: [
            path.resolve(__dirname, '../dist/server'),
            path.resolve(__dirname, '../dist/client'),
        ]
    });
});