/**
 File:
    ParticleEmitterComponent.js
 Created By:
    Mario Gonzalez
 Project    :
    ChuClone
 Abstract:
    This
 Basic Usage:

  License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    "use strict";
    
	ChuClone.namespace("ChuClone.components.effect");
	ChuClone.components.effect.ParticleEmitterComponent = function() {
		ChuClone.components.effect.ParticleEmitterComponent.superclass.constructor.call(this);
		this.requiresUpdate = false;
	};

	ChuClone.components.effect.ParticleEmitterComponent.prototype = {
        /**
         * @type {String}
         */
		displayName		: "ParticleEmitterComponent",					// Unique string name for this Trait

		/**
		 * Amount of particles created
		 * @type {Number}
		 */
		_count			: 20,

		/**
		 * @type {THREE.Color}
		 */
		_color			: null,

		/**
		 * @type {Number}
		 */
		_sizeMin		: 4,

		/**
		 * @type {Number}
		 */
		_sizeMax		: 12,

		/**
		 * @type {THREE.Mesh}
		 */
		_geometry		: null,

		/**
		 * @type {THREE.ParticleSystem}
		 */
		_system			: null,

        /**
         * @inheritDoc
         */
        attach: function( anEntity ) {
            ChuClone.components.effect.ParticleEmitterComponent.superclass.attach.call(this, anEntity);

			this._geometry = new THREE.Geometry();
            var radius = 600;
            for( var i = 0; i < this._count; i++) {
                var vector = new THREE.Vector3(
						this.attachedEntity.getView().position.x + (Math.random()*this.attachedEntity.getDimensions().width*2) - this.attachedEntity.getDimensions().width,
						-this.attachedEntity.getView().position.y + this.attachedEntity.getDimensions().height + Math.random() * radius,
						this.attachedEntity.getView().position.z + (Math.random() * this.attachedEntity.getDimensions().depth*2) - this.attachedEntity.getDimensions().depth);
                this._geometry.vertices.push( new THREE.Vertex( vector ) );
            }

			this._color = new THREE.Color();
			this._color.setHSV(Math.random() * 0.2 + 0.8, 0.5, 1.0);

			var material = new THREE.ParticleBasicMaterial({size: ChuClone.utils.randFloat(this._sizeMin, this._sizeMax) });
			material.color.setRGB(this._color.r, this._color.g, this._color.b);

			this._system = new THREE.ParticleSystem(this._geometry, material);
        },

        update: function() {
			return;
			for( var i = 0; i < this._count; i++) {
                this._geometry.vertices[i].position.y -= Math.random();
            }
			this._geometry.__dirtyVertices = true;
        },

        /**
         * Restore material and restitution
         */
        detach: function() {
			this._system.parent.removeChild( this._system );
			this._geometry = null;
			this._color = null;

			ChuClone.components.effect.ParticleEmitterComponent.superclass.detach.call(this);
        },


		 /**
         * @inheritDoc
         */
        getModel: function() {
            var returnObject = ChuClone.components.effect.ParticleEmitterComponent.superclass.getModel.call(this);
			 returnObject.count = this._count;
			 returnObject.color = {r: this._color.r,  g: this._color.g, b: this._color.b};

            return returnObject;
        },

        /**
         * @inheritDoc
         */
        fromModel: function( data ) {
            ChuClone.components.effect.ParticleEmitterComponent.superclass.fromModel.call(this, data);
            this._count = data.count;
			this._color = new THREE.Color().setRGB( data.color.r, data.color.g, data.color.b );
        }
	};

    ChuClone.extend( ChuClone.components.effect.ParticleEmitterComponent, ChuClone.components.BaseComponent );
})();