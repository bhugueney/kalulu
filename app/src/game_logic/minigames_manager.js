define([
    'dat.gui',
    './core/minigame_dst_record',
    './core/stimulus_apparition',
    './timer'
], function (
    dat,
    MinigameDstRecord,
    StimulusApparition,
    Timer
) {

    'use strict';


    // ###############################################################################################################################################
    // ###  CONSTRUCTOR  #############################################################################################################################
    // ###############################################################################################################################################
    

    /**
     * The MinigamesManager is in charge of :
     * - starting the minigames
     * - reactivating Kalulu interface at the end of the minigimae
     * - and the most important : providing them with a simple interface for getting/savingData, and ending the minigame.
     * @class
     * @memberof Kalulu.GameLogic
    **/
    function MinigamesManager (gameManager) {

        this._gameManager = gameManager;
        this._currentExerciseSetup = null;

        if (Config.enableKaluluGlobalDebug) {
            window.kalulu.minigamesManager = this;
            window.kalulu.Config = Config;

        }
    }



    // ###############################################################################################################################################
    // ###  GETTERS & SETTERS  #######################################################################################################################
    // ###############################################################################################################################################

    // Object.defineProperties(MinigamesManager.prototype, {});



    // ##############################################################################################################################################
    // ###  PUBLIC METHODS  #########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Starts an Activity and remove Kalulu Main Canvas
     * @param progressionNode {ProgressionNode} the node of the activity we want to start (i.e. a Lecture or a Minigame)
    **/
    MinigamesManager.prototype.startActivity = function startActivity (progressionNode, debugPanel) {
        
        // DEBUG TOOL TO REMOVE :
        if (progressionNode.discipline.id === "maths") {
            console.log("debug maths here");
            console.log(progressionNode);
        }

        this._currentProgressionNode = progressionNode;

        var Launcher = Config.minigames[progressionNode.activityType];
        console.log("[MinigamesManager] " + progressionNode.activityType + " about to be launched with ");
        console.log(Launcher);
        if (progressionNode.discipline.id === "maths" && progressionNode.activityType === "lookandlearn") {
            Launcher = Config.minigames.lecturemu;
        }

        console.log(Launcher);
        if (typeof Launcher.Launcher === "function") {
            console.log("Jeu HaXe");
            this._currentMinigame = Launcher.Launcher(this._getInterface(debugPanel));
        }
        else {
            console.log("Jeu Phaser");
            this._currentMinigame = new Launcher(this._getInterface(debugPanel));
        }
        
        this._currentProgressionNode.isStarted = true;
        Timer.start();
    };

    MinigamesManager.prototype.startBonusMinigame = function startBonusMinigame (debugPanel) {
        this._currentProgressionNode = null;
        var Launcher = Config.minigames.patrimath;
        console.log(Launcher);
        this._currentMinigame = new Launcher(this._getInterface(debugPanel));
    };

    MinigamesManager.prototype.startDebugActivity = function startDebugActivity (progressionNode) {

        console.log("debug here");
        console.log(progressionNode);
        this._currentProgressionNode = progressionNode;

        var debugInterface = this._getInterface();
        var debugPanel = new dat.GUI();

        debugPanel.add(this, "_debugGetDifficultyParams");
        debugPanel.add(debugInterface, "getPedagogicData");
        debugPanel.add(this, "_debugSave");

        return;
    };

    /**
     * Provide the interface of Kalulu for Minigames
     * @private
     * @return an object containing 3 functions ready to be called
    **/
    MinigamesManager.prototype._getInterface = function _getInterface (debugPanel) {

        return {
            getDifficultyLevel  : this._getDifficultyParams.bind(this),
            getPedagogicData    : this._getPedagogicData.bind(this), // We let to the discipline module the logic of providing the appropriate setup depending on the node
            save                : this._saveMiniGameData.bind(this),
            close               : this._closeMiniGame.bind(this),
            MinigameDstRecord   : MinigameDstRecord,
            StimulusApparition  : StimulusApparition,
            debugPanel          : debugPanel,
            recordResponseOnWord : function () { console.warn("Not Implemented"); },
            recordResponseOnSentence : function () { console.warn("Not Implemented"); }
        };
    };


    MinigamesManager.prototype._getDifficultyParams = function _getDifficultyParams () {
        return this._currentProgressionNode.discipline.getDifficultyParams(this._currentProgressionNode);
    };


    /**
     * Record the setup and return it.
     * @private
     * @return the activity setup
    **/
    MinigamesManager.prototype._getPedagogicData = function _getPedagogicData (params) {
        // We let to the discipline module the logic of providing the appropriate setup depending on the node :
        this._latestSetupSent = this._currentProgressionNode.discipline.getPedagogicData(this._currentProgressionNode, params);
        console.log("Pedagogic Data Received : ");
        console.log(this._latestSetupSent);
        return this._latestSetupSent;
    };


    /**
     * Records the result of a minigame in the player's profile
     * @private
     * @param results {object} the results of the Minigame
    */
    MinigamesManager.prototype._saveMiniGameData = function _saveMiniGameData (data) {
        
        console.info("[MinigamesManager] Received request for minigame data saving");
        
        if (this._currentProgressionNode) {
            this._gameManager.Rafiki.savePedagogicResults(this._currentProgressionNode, data);
        }
        else {
            this._saveBonusGameData(data);
        }
    };

    MinigamesManager.prototype._debugGetDifficultyParams = function _debugGetDifficultyParams () {
        console.log(this._currentProgressionNode.discipline.getDifficultyParams(this._currentProgressionNode));
    };

    /**
     * Records the result of a minigame in the player's profile
     * @private
     * @param results {object} the results of the Minigame
    */
    MinigamesManager.prototype._saveBonusGameData = function _saveBonusGameData (data) {
        
        console.info("[MinigamesManager] Received request for minigame data saving");
        this._gameManager.currentPlayer.saveResults(this._currentProgressionNode, record);
    };


    /**
     * Reactivate Kalulu Canvas and reopens the current LessonScreen
     * @private
    */
    MinigamesManager.prototype._closeMiniGame = function _closeMiniGame () {
        
        this._currentMinigame = null;
        this._gameManager.onCloseActivity(this._currentProgressionNode);
        Timer.stop();
    };


    // ##############################################################################################################################################
    // ###  DEBUG METHODS  ##########################################################################################################################
    // ##############################################################################################################################################

    /**
     * Send a fake dataset to save the game as a Success
     * @private
    **/
    MinigamesManager.prototype._debugSave =  function _debugSave () {
        //console.log(this._currentProgressionNode);
        
        var activityType = this._currentProgressionNode.activityType;
        var data;

        if (activityType === "lecture") {
            data =  {
                test : 1,
                isCompleted : true,
                setup : this._latestSetupSent
            };
        }
        else {
            if (true) {
                data = {
                    key : "value"
                };
            }
        }

        this._saveMiniGameData(data);
    };

    /**
     * Force close the minigame
     * @private
    **/
    MinigamesManager.prototype._debugClose =  function _debugClose () {

        this._currentMinigame.destroy();

        var canvases = document.getElementsByClassName("canvas");
        
        if (canvases.length > 1) {
            console.log("Canvas manually removed");
            for (var i = 0 ; i < canvases.length ; i++) {
                if (canvases[i].id !== this._displayManager.mainCanvasName) {
                    document.removeChild(canvases[i]);
                }
            }
        }

        this._closeMiniGame();
    };

    return MinigamesManager;
});