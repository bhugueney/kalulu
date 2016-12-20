/**
 * This module allow to create the Brain Screen.
 * This screen is tightly coupled with the Kalulu Project : it is designed to display the 2 courses of Kalulu :
 * Swahili + Maths (or English + Maths for the jury), which are divided in 20 chapters each.
 * The Brain Screen will display the Chapters, first level of the discipline modules hierarchy we are using.
 * It must be reworked if Discipline Modules are modified.
**/
define([
    'utils/ui/screen',
    'utils/events/mouse_event_type',
    'utils/events/touch_event_type',
    'interface/user/elements/garden_button',
    'datgui',
    'utils/sound/sound_manager',
    'interface/user/elements/kalulu_character'
], function (
    Screen,
    MouseEventType,
    TouchEventType,
    GardenButton,
    Dat,
    SoundManager,
    Kalulu
) {
    'use strict';

    var chapterCount = Config.gamedesign.territoriesCount; // 20

    function BrainScreen (interfaceManager, chaptersProgression) {
        

        Screen.call(this);
        
        this.name = "mcBrainScreen";
        this._interfaceManager = interfaceManager;
        this.build();
        
        // Reference auto-built parts :
        this._background = this.getChildByName("mcBrainScreenBg");
        this._gardenButtons = this.getChildByName("mcButtonsContainer");
        this._childHead = this._gardenButtons.getChildByName("mcChildHead");
        this._hud = {
            topLeft : this.getChildByName("mcBrainTLHud"),
            bottomLeft : this.getChildByName("mcBrainBLHud"),
            bottom : this.getChildByName("mcBrainBHud")
        };

        this._backButton = this._hud.topLeft.getChildByName("mcBackButton");
        this._kaluluButton = this._hud.bottomLeft.getChildByName("mcKaluluButton");
        this._toyChestButton = this._hud.bottom.getChildByName("mcBurrowButton");
        this._buttonsContainerOffset = this._gardenButtons.position.clone();

        // Buttons Management :
        
        this._childHead.alpha = 0.95;
        // if (Timer.elapsedTime <20&&!Config.debug)   this._toyChestButton.alpha = 0.2;
        // else this._toyChestButton.alpha = 1;

        // Init Position for Tween Anim

        this._arrayGardenButtons = [];

        if (Config.enableKaluluGlobalDebug) window.kalulu.gardenButtons = this._gardenButtons;

        this._onClickOnGardenButton = this._onClickOnGardenButton.bind(this);
        
        for (var k = this._gardenButtons.children.length-1 ; k >= 0 ; k--) {
            
            if (this._gardenButtons.children[k].name.indexOf("mcGardenButton") !== -1) {
                var lButton = this._gardenButtons.children[k];
                lButton.onClick = this._onClickOnGardenButton.bind(this);
                this._arrayGardenButtons.push(lButton);
            }
        }

        if (typeof chaptersProgression !== "undefined") {
            this.unlockChapters(chaptersProgression);
        }

        this._backButton.onClick = this._onClickOnBackButton.bind(this);
        this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);
        this._toyChestButton.onClick = this._onClickOnToyChestButton.bind(this);


        // Transition FX :
        this._blurFilter = new PIXI3.filters.BlurFilter();
        this._blurFilter.blur = 0;
        this._background.filters = [this._blurFilter];
        this._childHead.filters = [this._blurFilter];

        // Kalulu
        this._kalulu = new Kalulu();

        // Debug
        if (Config.enableKaluluGlobalDebug) window.kalulu.brainScreen = this;

        // Datgui
        if (Config.enableTransitionsTuningControls) {
            var GuiControls = function() {
                this.duration = 2;
                this.scale = 5;
                this.time = 1000;
                this.blur = 3;
            };

            this._guiControls = new GuiControls();
            this._guiFolderName = "BrainScreen : Transition Tween";
            this._gui = this._interfaceManager.debugPanel.addFolder(this._guiFolderName);
            this._gui.add(this._guiControls, 'duration', 1, 10).step(0.5);
            this._gui.add(this._guiControls, 'scale', 1, 10).step(0.5);
            this._gui.add(this._guiControls, 'time', 10, 3000).step(10);
            this._gui.add(this._guiControls, 'blur', 0, 10).step(0.5);
        }
    }

    BrainScreen.prototype = Object.create(Screen.prototype);
    BrainScreen.prototype.constructor = BrainScreen;

    BrainScreen.prototype.unlockChapters = function unlockChapters (chaptersProgression) {
        for (var i = 0 ; i < chaptersProgression.length ; i++) {
            if (chaptersProgression[i] != "Locked") this._gardenButtons.getChildByName("mcGardenButton" + (i+1)).unlockChapter(chaptersProgression[i]);
        }
    };

    BrainScreen.prototype.kaluluAppearance = function kaluluAppearance () {
        this._kalulu.start();

        this._kalulu.x = this._kalulu.width/2;
        this._kalulu.y = -this._kalulu.height/3;

        this._hud.bottomLeft.addChild(this._kalulu);
        //SoundManager.getSound("kalulu_intro_brainScreen").play();
    };

    BrainScreen.prototype.removeOnClickOnGargenButton = function removeOnClickOnGargenButton (){
        var length = this._arrayGardenButtons.length;
        var lButton;

        for(var i = length-1; i>=0; i--) {
            lButton = this._arrayGardenButtons[i];
            lButton.setModeVoid();
        }
    };


    BrainScreen.prototype.close = function close () {
        if (Config.enableTransitionsTuningControls) {
            this._interfaceManager.debugPanel.removeFolder(this._guiFolderName);
        }
        Screen.prototype.close.call(this);
    };



    BrainScreen.prototype._onGameStageResize = function _onGameStageResize (eventData) {
        Screen.prototype._onGameStageResize.call(this, eventData);
    };
    /**
     * Manage the transition after click on a garden button, emits the relevant events.
    **/
    BrainScreen.prototype._onClickOnGardenButton = function _onClickOnGardenButton (pEventData) {
        
        this.removeOnClickOnGargenButton();

        // concerned gardens
        var selectedGarden = pEventData.target;
        var nextGarden = this._gardenButtons.getChildByName("mcGardenButton" + (selectedGarden.id + 1));
        
        // transition params
        /*var duration = 2;
        var scale = 5;*/

        var rotationVector = new Victor(nextGarden.x - selectedGarden.x, nextGarden.y - selectedGarden.y);
        var targetPosition = new PIXI3.Point(-selectedGarden.x, -selectedGarden.y);
        var targetAngle = this._gardenButtons.rotation - rotationVector.angle();

        // Place pivot on selected Garden
        this._gardenButtons.pivot = selectedGarden.position.clone();
        this._gardenButtons.position = new PIXI3.Point(selectedGarden.position.x + this._buttonsContainerOffset.x, selectedGarden.position.y + this._buttonsContainerOffset.y);
        
        // // Center Camera on selected Garden
        createjs.Tween.get(this._gardenButtons).to({x: 0, y: 0}, this._guiControls.duration * this._guiControls.time / 2, createjs.Ease.linear());

        // // Rotate until rotationVector is horizontal from left to right
        createjs.Tween.get(this._gardenButtons).to({rotation: targetAngle}, this._guiControls.duration * this._guiControls.time / 2, createjs.Ease.linear());

        // // Zoom In
        createjs.Tween.get(this.scale).to({x: this._guiControls.scale, y: this._guiControls.scale}, this._guiControls.duration * this._guiControls.time, createjs.Ease.linear());
        
        // // Blur background
        createjs.Tween.get(this._blurFilter).to({blur : this._guiControls.blur}, this._guiControls.duration * this._guiControls.time, createjs.Ease.linear());

        if (Config.tuning) this._gui.destroy();
        this._interfaceManager.requestGardenScreen(selectedGarden.id, (this._guiControls.duration/3)*1000);
    };

    BrainScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
        this._interfaceManager.requestTitleCard();
    };

    BrainScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (pEventData) {
        this.kaluluAppearance();
    };

    BrainScreen.prototype._onClickOnToyChestButton = function _onClickOnToyChestButton (pEventData) {
        this._interfaceManager.requestToyChestScreen();
    };

    return BrainScreen;
});