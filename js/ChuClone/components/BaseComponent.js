/**
 File:
    BaseComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
     Components work by effectively 'hi-jacking' properties of their attachedEntity.
     These properties can by functions, or non-primitive data types.

     Instead of creating a new trivial subclass, considering creating a component and attaching it to that object

     For example to make an entity invincible for a period of time you might make a component like this

     [PSUEDO CODE START]
     // Inside a component subclass
     attach: function(anEntity)
     {
     this.callSuper();
     this.intercept(['onHit', 'getShotPower']);
     },

     onHit: function() {
     // Do nothing, im invincible!
     },

     getShotStrength: function() {
     return 100000000; // OMGBBQ! Thats high!
     }
     [PSUEDO CODE END]

     Be sure to call restore before detaching the component!

 Basic Usage:
     // Let my character be controlled by the KB
     if(newEntity.connectionID === this.netChannel.connectionID) {
     aCharacter.addComponentAndExecute( new ClientControlledComponent() );
     this.clientCharacter = aCharacter;

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 }
 */
(function() {
    "use strict";
    
    ChuClone.namespace("ChuClone.components");

    ChuClone.components.BaseComponent = function() {
        this.interceptedProperties = {};
        this.setupEditableProperties();
        return this;
    };

    ChuClone.components.BaseComponent.prototype = {
        /**
         * Array of properties intercepted, this is used when detaching the component
         * @type {Array}
         */
        interceptedProperties    : null,
        /**
         * @type {ChuClone.GameEntity}
         */
        attachedEntity            : null,
        /**
         * @type {Number}
         */
        detachTimeout            : 0,
        /**
         * Unique name for this component
         * @type {String}
         */
        displayName                : "BaseComponent",

        /**
         * If a component can stack, then it doesn't matter if it's already attached.
         * If it cannot stack, it is not applied if it's currently active.
         * For example, you can not be frozen after being frozen.
         * However you can be sped up multiple times.
         * @type {Boolean}
         */
        canStack                : false,

        /**
         * While true, this components 'update' method is called at the next frame
         * @type {Boolean}
         */
        requiresUpdate          : false,

		/**
		 * This is only used when editing, defines properties we want to have editable via component editor
		 * If you want to make a component property these are the steps:
		 * 		Overwrite '_editableProperties' in the subclass with a bunch of properties (Must be Number/Boolean/Strings)
		 * 		Overwrite 'onEditablePropertyWasChanged' and do something when those properties are modified.
		 */
		_editableProperties		: {},


        /**
         * If you use the _editableProperties option, this will be called when your entity is selected in the editor.
         * Set the properties of _editableProperties to the values for your specific instance
         *      // e.g.
         *      // this._editableProperties.angle.value = this._angle;
         */
        setupEditableProperties : function() {},
        
        /**
         * Attach the component to the host object
         * @param {ChuClone.GameEntity} anEntity
         */
        attach: function(anEntity) {
            this.attachedEntity = anEntity;
        },

        /**
         * Execute the component
         * For example if you needed to cause an animation to start when a character is 'unfrozen', this is when you would do it
         */
        execute: function() {},
        /**
         * This will be called by the attached entity everyframe
         * If you would like to be updated everyframe, set 'requiresUpdate' to true
         */
        update: function() { throw new Error("BaseComponent update method has been called. Overwrite!")},

        /**
         * Detaches a component from an 'attachedEntity' and restores the properties
         */
        detach: function() {
            clearTimeout(this.detachTimeout);
            this.restore();

            this.interceptedProperties = null;
            this.attachedEntity = null;
        },

        /**
         * Detach after N milliseconds, for example freeze component might call this to unfreeze
         * @param {Number} aDelay
         */
        detachAfterDelay: function(aDelay) {
            var that = this;
            this.detachTimeout = setTimeout(function() {
                that.attachedEntity.removeComponentWithName(that.displayName);
            }, aDelay);
        },

        /**w
         * Intercept properties from the entity we are attached to.
         * For example, if we intercept handleInput, then our own 'handleInput' function gets called.
         * We can reset all the properties by calling, this.restore();
         * @param {Array} arrayOfProperties
         */
        intercept: function(arrayOfProperties) {
            var len = arrayOfProperties.length;
            var that = this;
            while (len--) {
                var aKey = arrayOfProperties[len];
                this.interceptedProperties[aKey] = this.attachedEntity[aKey];
                this.attachedEntity[aKey] = this[aKey];

                // Wrap function calls in closure so that the 'this' object refers to the component, if not just overwrite
                if(this.attachedEntity[aKey] instanceof Function) {
                    this.attachedEntity[aKey] = (function(){
                        var myKey = aKey; // 'aKey' will always point to the last value of arrayOfProperties, so store the current value of it - e.g. i after a forloop
                        return function() {
                             return that[myKey].apply(that, arguments);
                        }
                    })();
                } else {
                    this.attachedEntity[aKey] = this[aKey];
                }

            }
        },

        /**
         * Restores poperties that were intercepted that were intercepted.
         * Be sure to call this when removing the component!
         */
        restore: function() {
            for (var key in this.interceptedProperties) {
                if (this.interceptedProperties.hasOwnProperty(key)) {
                    this.attachedEntity[key] = this.interceptedProperties[key];
                }
            }
        },

		/**
		 * Called when an editable property has been changed.
		 * Note this only occurs via the editor
		 */
		onEditablePropertyWasChanged: function() {
			 throw new Error("BaseComponent 'onEditablePropertyWasChanged' method has been called. Overwrite!")
		},

        /**
         * Called by our attachedEntity when it is dragged in case any of the components need to update something
         * Overwrite this function if you need to do something when your attachedEntity is dragged in the editor
         */
        onEditorDidDragAttachedEntity: function() {},


        /**
         * A chance for a component to store any extra information it might need when recreating itself
         */
        getModel: function() {
            return {
                displayName: this.displayName
            }
        },

        /**
         * When a level is created from a model, this is called on every component so that it can do any extra stuff on itself before
         * It starts being used, set it's maxspeed, maxSize, timeLimit, etc
         * @param {Object} data
         * @param {ChuClone.GameEntity} futureEntity The GameEntity this object WILL be attached to. Note it is not attached yet.
         */
        fromModel: function( data, futureEntity ) {

        }
    }
})();