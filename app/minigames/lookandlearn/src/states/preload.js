define([
    'phaser-bundle'
], function (
    Phaser
) {
    'use strict';
    
    /**
	 * Boot is in charge of the boot options
	 * @class
     * @memberof Template
	 * @param game {Phaser.Game} game instance
	**/
    function PreloadState (game) {}

    /**
     * Load assets to be used later in the preloader
    **/
    PreloadState.prototype.preload = function preloadStatePreload() {

        this.loadSpecificAssets();
        this.loadSharedAssets();
    };

    /**
     * Add to the loading queue the assets specific to this module
    **/
    PreloadState.prototype.loadSpecificAssets = function preloadStateLoadSpecificAssets () {
        
        this.game.load.json('layouts'           , 'lookandlearn/assets/config/layouts.json');
        this.game.load.json('progression'       , 'lookandlearn/assets/config/progression.json');
        this.game.load.json('game'              , 'lookandlearn/assets/config/game.json');
        this.game.load.json('audio'             , 'lookandlearn/assets/config/audio.json');            
        this.game.load.json('config'            , 'lookandlearn/assets/config/config.json');            
        this.game.load.json('letters-descriptor', 'lookandlearn/assets/config/letters-descriptor.json');

        this.game.load.audio(this.game.config.pedagogicData.sound, this.game.config.pedagogicData.sound);
    };

    /**
     * Add to the loading queue the assets specific generic to all minigames modules
    **/
    PreloadState.prototype.loadSharedAssets = function preloadStateLoadSharedAssets() {

        //UI 
        this.game.load.image('black_overlay', 'assets_shared/images/ui/pause.png');
        this.game.load.atlasJSONHash('ui', 'assets_shared/images/ui/ui.png', 'assets_shared/images/ui/ui.json');

        //FX 
        this.game.load.atlasJSONHash('fx', 'assets_shared/images/fx/fx.png', 'assets_shared/images/fx/fx.json');
        this.game.load.image('wrong', 'assets_shared/images/fx/wrong.png');

        //KaluluGraphics
        this.game.load.atlasJSONHash('kaluluIntro', 'assets_shared/images/kalulu_animations/kaluluIntro.png', 'assets_shared/images/kalulu_animations/kaluluIntro.json');
        this.game.load.atlasJSONHash('kaluluOutro', 'assets_shared/images/kalulu_animations/kaluluOutro.png', 'assets_shared/images/kalulu_animations/kaluluOutro.json');
        this.game.load.atlasJSONHash('kaluluIdle1', 'assets_shared/images/kalulu_animations/kaluluIdle1.png', 'assets_shared/images/kalulu_animations/kaluluIdle1.json');
        this.game.load.atlasJSONHash('kaluluIdle2', 'assets_shared/images/kalulu_animations/kaluluIdle2.png', 'assets_shared/images/kalulu_animations/kaluluIdle2.json');
        this.game.load.atlasJSONHash('kaluluSpeaking1', 'assets_shared/images/kalulu_animations/kaluluSpeaking1.png', 'assets_shared/images/kalulu_animations/kaluluSpeaking1.json');
        this.game.load.atlasJSONHash('kaluluSpeaking2', 'assets_shared/images/kalulu_animations/kaluluSpeaking2.png', 'assets_shared/images/kalulu_animations/kaluluSpeaking2.json');

        //General Audio
        this.game.load.audio('menuNo', 'assets_shared/audio/sfx/ButtonCancel.ogg');
        this.game.load.audio('menuYes', 'assets_shared/audio/sfx/ButtonOK.ogg');
        this.game.load.audio('winGame', 'assets_shared/audio/sfx/GameOverWin.ogg');
        this.game.load.audio('loseGame', 'assets_shared/audio/sfx/GameOverLose.ogg');
        this.game.load.audio('kaluluOn', 'assets_shared/audio/sfx/KaluluOn.ogg');
        this.game.load.audio('kaluluOff', 'assets_shared/audio/sfx/KaluluOff.ogg');
        this.game.load.audio('menu', 'assets_shared/audio/sfx/OpenPopin.ogg');
        this.game.load.audio('right', 'assets_shared/audio/sfx/ResponseCorrect.ogg');
        this.game.load.audio('wrong', 'assets_shared/audio/sfx/ResponseIncorrect.ogg');            
    };

    /**
     * Stores the config Json in the this.game.config object
    **/
    PreloadState.prototype.create = function preloadStateCreate () {
        
        if (this.game.load.hasLoaded) console.info("Preload State has correctly completed loading.");
        
        this.game.config.layouts      = this.game.cache.getJSON('layouts');
        this.game.config.progression  = this.game.cache.getJSON('progression');
        this.game.config.game         = this.game.cache.getJSON('game');
        this.game.config.audio        = this.game.cache.getJSON('audio');
        this.game.config.letters      = this.game.cache.getJSON('letters-descriptor');
        console.log('before');
        this.game.add.audio(this.game.config.pedagogicData.sound);
        console.log('after');
        console.info("Preload Complete, Starting Phase1Video...");
        this.state.start('Phase1Video');
    }
    
    return PreloadState;
});