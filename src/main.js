/* global require poller:true */

var Poller = require('./poller/poller');

poller = new Poller({
    url: 'https://api.example.com/endpoint'
});
document.addEventListener('polled', function (e) {
    console.log(e); // eslint-disable-line no-console
});

// vim: set et ts=4 sw=4 :
