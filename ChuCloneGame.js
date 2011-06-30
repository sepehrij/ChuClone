/**
 * RibbonPaintCanvas
 * Mario Gonzalez
 * http://ribbonpaint.com
 */
(function(){
	var PTM_RATIO = ChuClone.Constants.PTM_RATIO;
    ChuClone.namespace("ChuClone");
    ChuClone.ChuCloneGame = function() {
        this.entities = [];
        this.listenForReady();
    };

    ChuClone.ChuCloneGame.prototype = {
        view: null,
        worldController: null,
        entities    :   [],
        player      : null,

        listenForReady: function() {
            var that = this;
            window.addEventListener('DOMContentLoaded', function(e){that.onReady()}, true);
        },

        onReady: function() {
            this.setupView();
            this.setupWorldController();
            this.setup();
            this.setupKeyboard();

            // MAIN LOOP
            var that = this;
            (function loop() {
                that.update();
                window.requestAnimationFrame( loop, null );
            })();
        },

        setupKeyboard: function() {
            var that = this;

			document.addEventListener('keydown', function(e) {
                that.player.handleKeyDown( e );


                // SPACEBAR
                if(e.keyCode == 32) {
                    var playerPosition = new Box2D.Common.Math.b2Vec2(that.player.getBody().GetPosition().x, that.player.getBody().GetPosition().y);
					playerPosition.y += 60/PTM_RATIO;
                    var size = 1/ChuClone.Constants.PTM_RATIO;
                    var aabb = new Box2D.Collision.b2AABB();
                    aabb.lowerBound.Set( playerPosition.x - size, playerPosition.y - size );
                    aabb.upperBound.Set( playerPosition.x + size, playerPosition.y + size );


                    var selectedBody = null;
                    that.worldController.getWorld().QueryAABB(function getBodyCB(fixture) {
                        if (fixture.GetBody().GetType() == Box2D.Dynamics.b2Body.b2_dynamicBody) {
                            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), playerPosition)) {
                                selectedBody = fixture.GetBody();
                                return false;
                            }
                        }
                        return false;
                    }, aabb);

					console.log(selectedBody)

                    if(!selectedBody) return;
                    var bodyPosition = selectedBody.GetPosition();

//				var prismaticJoint = new Box2D.Dynamics.b2PrismaticJointDef();
//				prismaticJoint.Initialize( body)
                    var impulse = new Box2D.Common.Math.b2Vec2(0, -20* selectedBody.GetMass());
                 //   impulse.y = 0;//force.y;
                    selectedBody.ApplyImpulse( impulse, bodyPosition );

                }
			}, false);

            document.addEventListener("keyup", function(e){
                that.player.handleKeyUp(e);
            }, true);
        },

        setupView: function() {
            this.view = new ChuClone.GameView();
        },

        setupWorldController: function() {
            this.worldController = new ChuClone.WorldController();
        },

        setup: function() {

            var boxSize = 30;
            for ( var i = 0; i < 100; i ++ ) {
                var x = i*(boxSize*2*2*2*2*2*2);
                var y = Math.abs(Math.sin(i/10))*-150 + 150;
                var body = this.worldController.createRect( x, y, 0, boxSize*2*2*2*2*2, boxSize, true );
                var view = this.view.createEntityView( x, y, boxSize*2*2*2*2*2*2, boxSize + Math.random() * 1000, 600  );
                var entity = new ChuClone.GameEntity();
                entity.setBody( body );
                entity.setView( view );

                this.entities.push( entity );
                this.view.addEntity( entity.view );
            }

            // Player-
            x = 600;
            y = -200;
            boxSize = 30;
            body = this.worldController.createRect( x, y, Math.random() * 6, boxSize, boxSize, false);
            view = this.view.createEntityView( x, y, boxSize * 2, boxSize*2, boxSize * 2);
            view.materials[0] = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0x666666, specular: 0xDDDDDD, shininess:1, shading: THREE.FlatShading } );
            entity = new ChuClone.PlayerEntity();
            entity.setBody( body );
            entity.setView( view );
//            body.ApplyImpulse( new Box2D.Dynamics.b2Vec2(1000, 0), body.GetPosition() );


            this.entities.push( entity );
            this.view.addEntity( entity.view );
            this.player = entity;
        },

        update: function() {
            for(var i = 0; i < this.entities.length; i++ ) {
                this.entities[i].update();
            }

            this.worldController.update();
            this.view.camera.target.position = this.player.view.position;
            this.view.camera.position.x = this.player.view.position.x - 700;
            this.view.render();
        }
    };
}());
