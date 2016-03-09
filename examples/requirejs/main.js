require.config({
    baseUrl: '../../build/umd',
    config: {
    }
});

require([
    'poller/poller',
    'progressbar/progressbar',
    'common/utils'
], function (Poller, Progressbar, utils) {
    // output for verification
    console.log(['utils', utils]);

    poller = new Poller();
    console.log(['poller', poller]);
    progressbar = new Progressbar({
        el: '#progressbar',
        targets: [ 100, 300, 1000, 10000 ],
        poller: null
    });
    console.log(['progressbar', progressbar]);
    progressbar.update(13);

    // setting up an event listener in the requirejs callback context
    document.addEventListener('polled', function (e) {
        console.log(e); // eslint-disable-line no-console
    });

});

// vim: set et ts=4 sw=4 :
