require.config({
    baseUrl: '../../build',
    config: {
    }
});

require([
    'socialtools-full',
    'common/utils'
], function (_socialtools, _utils) {
    // the "full" distribution
    socialtools = _socialtools;
    // only the utils from the build tree
    utils = _utils;
    // output for verification
    console.log(['socialtools', socialtools]);
    console.log(['utils', utils]);

    // setting up an event listener in the requirejs callback context
    document.addEventListener('polled', function (e) {
        console.log(e); // eslint-disable-line no-console
    });

    // making the socialtools available in the global context
    window.Socialtools = socialtools;
});

// vim: set et ts=4 sw=4 :
