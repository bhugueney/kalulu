var path              = require('path');
var webpack           = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var components        = require('./components.webpack.config.js');


module.exports = components.mergeConfigs(
    
    {
        entry : {
            main : 'modules/minigame_tester_interface/src'
        },
        plugins : [
            new webpack.ProvidePlugin({ // the plugin is a wrapper for libraries and objects we need in all the modules, so we don't need to require them all the time
                Config       : 'application/config'
            }),
            new CopyWebpackPlugin([
                { from: 'app/config', to: 'config' }
            ]),
            new webpack.DefinePlugin({
              KALULU_LANGUAGE : JSON.stringify(process.env.kaluluLanguage),
              KALULU_MINIGAME : JSON.stringify(process.env.kaluluMinigame)
            })
        ]
    },
    components.copyAssetsForMinigames(['common', 'crabs'], process.env.kaluluLanguage),
    components.generateHtml()
);

// console.log('\n Test Crabs English :');
// console.log(module.exports);