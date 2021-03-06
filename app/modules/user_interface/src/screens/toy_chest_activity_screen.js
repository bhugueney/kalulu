/**
 * This module allow to create the ToyChest Screen.
 * This screen is tightly coupled with the Kalulu Project : it is designed to display the 2 courses of Kalulu :
 * Swahili + Maths (or English + Maths for the jury), which are divided in 20 chapters each.
 * The Burrow Screen will display the Chapters, first level of the discipline modules hierarchy we are using.
 * It must be reworked if Discipline Modules are modified.
**/
(function () {

	'use strict';

	var Screen 		= require ('../utils/ui/screen');
    var VideoPlayer = require ('../elements/video_player');
    var Story 		= require ('../elements/story');
    var AnimBackground	= require ('../elements/anim_background');
    var Kalulu 		= require ('../elements/kalulu_character');

    var Button 		= require ('../utils/ui/button');


	function ToyChestActivityScreen (interfaceManager, activityType) {
		
		Screen.call(this);
		this._activityType = activityType;
		this.name = "mcBurrow"+activityType+"Screen";
		this._interfaceManager = interfaceManager;
		this.build();
		
		// Reference auto-built parts :
		this._backgroundContainer = this.getChildByName("mcBurrowScreenBg");
        this._background = new AnimBackground("BurrowScreenBg", 2);

        this._backgroundContainer.addChild(this._background);
        this._background.position.set(0,0);

		this._activitiesButtons = this.getChildByName("mcButtonsContainer");
		this._currActivitiesPage = 0;
		this._nextActivitiesButtonContainer = this.getChildByName("mcActivitiesNext");
		this._nextActivitiesButton = new Button("ArrowButton")
		this._nextActivitiesButtonContainer.addChild(this._nextActivitiesButton);
        this._nextActivitiesButton.position.set(0,0);

		this._prevActivitiesButtonContainer = this.getChildByName("mcActivitiesPrev");
		this._prevActivitiesButton = new Button("ArrowButton")
		this._prevActivitiesButtonContainer.addChild(this._prevActivitiesButton);
        this._prevActivitiesButton.position.set(0,0);

		this._prevActivitiesButton.onClick = this._onClickOnPrevActivities.bind(this);
		this._nextActivitiesButton.onClick = this._onClickOnNextActivities.bind(this);

		this._hud = {
			topLeft : this.getChildByName("mcBurrowTLHud"),
			top : this.getChildByName("mc"+activityType+"THud"),
			bottomLeft: this.getChildByName("mcBurrowBLHud")
		};

		this._kaluluButton = this._hud.bottomLeft.getChildByName("mcKaluluButton");
		this._kaluluButton.onClick = this._onClickOnKaluluButton.bind(this);
		this._backButton = this._hud.topLeft.getChildByName("mcBackButton");

		// Buttons Management
		var lLocked;
        var lActivitiesCount;
        var lRewards = this._interfaceManager.rewards;
        switch (activityType) {
            case "Story":
                lActivitiesCount = lRewards.levelRewards.bookCount;
                lLocked = lRewards.levelRewards.locked.book;
                break;

            case "Video":
                lActivitiesCount = lRewards.levelRewards.videoCount;
                lLocked = lRewards.levelRewards.locked.video;
                break;

            case "MiniGame":
                lActivitiesCount = lRewards.levelRewards.gameCount;
                lLocked = lRewards.levelRewards.locked.game;
                break;
        }
        this._activitiesCount = lActivitiesCount;
        this._lockedActivities = lLocked;
        this._unlockedActivities = this._interfaceManager.unlockedRewards;

		this._prevActivitiesButton.visible = false;
		if (this._activitiesCount<=6) this._nextActivitiesButton.visible = false;
		if (this._activitiesButtons!=null)	this._updateActivitiesButtons(true);


		this._backButton.onClick = this._onClickOnBackButton.bind(this);

		this._kalulu = Kalulu;
	}

	ToyChestActivityScreen.prototype = Object.create(Screen.prototype);
	ToyChestActivityScreen.prototype.constructor = ToyChestActivityScreen;

	/**
	 * Manage the transition after click on a garden button, emits the relevant events.
	**/

	ToyChestActivityScreen.prototype._onClickOnBackButton = function _onClickOnBackButton (pEventData) {
		this._interfaceManager.requestToyChestScreen();
	};
	
	ToyChestActivityScreen.prototype._onClickOnPrevActivities = function _onClickOnPrevActivities (pEventData) {
		this._currActivitiesPage--;
		this._updateActivitiesButtons();
		if (this._currActivitiesPage===0) this._prevActivitiesButton.visible = false;
		if (!this._nextActivitiesButton.visible) this._nextActivitiesButton.visible = true;
	};

	ToyChestActivityScreen.prototype._onClickOnNextActivities = function _onClickOnNextActivities (pEventData) {
		this._currActivitiesPage++;
		this._updateActivitiesButtons();
		if (this._currActivitiesPage==this._activitiesCount.toString().slice(0,-1)) this._nextActivitiesButton.visible = false;
		if (!this._prevActivitiesButton.visible) this._prevActivitiesButton.visible = true;
	};

	ToyChestActivityScreen.prototype._updateActivitiesButtons = function _updateActivitiesButtons (pIsListening) {
		var colorFilter = new PIXI3.filters.ColorMatrixFilter();
        colorFilter.greyscale(0.3);
        for (var k = 0; k < this._activitiesButtons.children.length; k++) {
            var lButton = this._activitiesButtons.children[k];
            var lNum = k + (6 * this._currActivitiesPage);
            // lButton._txt.text = this._lockedActivities[k].replace("_"," ");
            lButton.name = this._lockedActivities[lNum];
            lButton.locked = this._activityType === 'MiniGame' ? true : false ;//!this._unlockedActivities.includes(this._lockedActivities[lNum]);

            if (lNum >= this._activitiesCount)
            {
            	lButton.visible = false;
            	continue;	
            } 
            else lButton.visible = true;

            if (pIsListening) lButton.onClick = this._onClickOnActivitiesButton.bind(this);
            else lButton.removeChildAt(lButton.children.length - 1);
            var lCover = new PIXI3.Sprite(PIXI3.Texture.fromImage(Config.imagesPath + "activity_covers/" + this._activityType.toLowerCase() + "/" + lButton.name + ".png"));
            lCover.anchor.set(0.5);
            lCover.scale.set(0.7);
            lButton.addChild(lCover);
            if (lButton.locked) {
                lCover.filters = [colorFilter];
                lButton.setModeDisabled();
            } else {
                lCover.filters = null;
                lButton.setModeEnabled();
            }
        }
	};

	ToyChestActivityScreen.prototype._onClickOnActivitiesButton = function _onClickOnActivitiesButton (pEventData) {
		
		switch (this._activityType)
		{
			case "Video":
				var video = new VideoPlayer(pEventData.target.name, this._interfaceManager);
				this._interfaceManager.openPopin(video);
			break;

			case "MiniGame":
				this._interfaceManager.requestBonusMinigame(this._activityType + pEventData.target.name);
			break;

			case "Story":
				var story = new Story(pEventData.target.name, this._interfaceManager);
				this._interfaceManager.openPopin(story);
			break;

		}
	};

	ToyChestActivityScreen.prototype._onClickOnKaluluButton = function _onClickOnKaluluButton (pEventData) {
        this._kalulu.x = this._kalulu.width/2;
        this._kalulu.y = -this._kalulu.height/3 - 50;

        this._hud.bottomLeft.addChild(this._kalulu);


        var lType = this._activityType === "Story"?"book":(this._activityType=== "MiniGame"?"game":"video");
        this._kalulu.startTalk("kalulu_"+ lType +"menu_toychest");
    };

	module.exports = ToyChestActivityScreen;
})();