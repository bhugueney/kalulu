﻿  define([
    'common/src/ui',
    './remediation',
    'common/src/kalulu',
    'eventemitter3',
    './sentence'
], function (
    Ui,
    Remediation,
    Kalulu,
    EventEmitter,
    Sentence
) {
    
    'use strict';
    
    /**
     * Game is in charge of linking together the different objects
	 * @class
     * @memberof Jellyfish    
	 * @param game {Phaser.Game} game instance
	**/
    function Game(game) {
        /**
	     * background 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.background = null;

        /**
	     * freaking big leef ! 
         * @private
	     * @type {Phaser.Sprite}
	    **/
        this.backgroundLeef = null;
        
        /**
	     * In charge of all the game events
	     * @type {EventEmitter}
	    **/
        this.eventManager = null;
        
        /**
         * User interface 
	     * @type {Ui}
	    **/
        this.ui = null;
        
        /**
	     * In charge of the kalulu animations and audio
	     * @type {Kalulu}
	    **/
        this.kalulu = null;

        /**
	     * In charge of all the local Remediation and game loop
	     * @type {Remediation}
	    **/
        this.remediation = null;
    }
    
    Game.prototype = {
        /*
        NDLR : No sound in this game I think ? 

        preload : function preloadGame () {
            console.info("[Game State] Preloading new game");
            var data = this.game.pedagogicData;
            var roundsCount = data.rounds.length;
            var stimuliCount, stimulus;

            // load audiofiles for the current data
            for (var i = 0; i < roundsCount; i++) {
                
                stimuliCount = data.rounds[i].stimuli.length;

                for (var j = 0; j < stimuliCount; j++) {
                    
                    stimulus = data.rounds[i].stimuli[j];
                    if (stimulus.value !== "") {
                        this.game.load.audio(stimulus.value, stimulus.soundPath);
                    }
                }
            }
        },
        */

        /**
         * Fires 'startGame' event when done
         * Instanciates : 
         * - eventManager
         * - kalulu
         * - ui
         * - remediation
         **/
        create: function () {
            console.info("[Game State] Creating new game");
            if (Config.globalVars) {
                window.jellyfishes = {};
                window.jellyfishes.game = this.game;
            }

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            
            this.game.eventManager = new EventEmitter();
            
            this.background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
            this.background.anchor.setTo(0.5, 0.5);
            this.background.width = this.game.width;
            this.background.height = this.game.height;

            this.backgroundLeef = this.add.sprite(this.world.centerX + 100, -100, 'leef');
            this.backgroundLeef.width = this.game.width - 300;
            this.backgroundLeef.height = this.game.height - 200;
            this.backgroundLeef.anchor.setTo(0.5, 0);
            
            this.remediation = new Remediation(this.game);
            this.ui = new Ui(this.game.params.getGlobalParams().totalTriesCount, this.game,false,true,false);
            this.kalulu = new Kalulu(this.game);
            
            this.game.eventManager.emit('startGame');

            this.game.time.advancedTiming = true; //Needed for rendering debug fps
        },
        
        /** 
         * Show FPS in top left corner
         * Used for debugging purposes only
         * @private
         **/
        render: function () {
            this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
        }
    };
    
    
    return Game;
});