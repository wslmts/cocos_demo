if(typeof RunnerStat == "undefined") {
    var RunnerStat = {};
    RunnerStat.running = 0;
    RunnerStat.jumpUp = 1;
    RunnerStat.jumpDown = 2;
};
var AnimationLayer=cc.Layer.extend({
    spriteSheet:null,
    runningAction:null,
    sprite:null,
    space:null,
    body:null,
    shape:null,
    jumpUpAction:null,
    jumpDownAction:null,
    recognizer:null,
    stat:RunnerStat.running,// init with running status
    ctor:function(space){
        this._super();
        this.space = space;
        //Chipmunk physics, you'd better to enable debug drawing. So the debug process will be more handy.
        this._debugNode = new cc.PhysicsDebugNode(this.space);
        this._debugNode.setVisible(false);

        // Parallax ratio and offset
        this.addChild(this._debugNode, 10);
        this.init();
    },
    init:function(){
        this._super();
        //1.load spritesheet
        cc.spriteFrameCache.addSpriteFrames(res.runner_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.runner_png);
        this.addChild(this.spriteSheet);
        this.initAction();
        //2.create spriteframe array
       /* var animFrames = [];
        for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        //3.create a animation with the spriteframe array along with a period time
        var animation = new cc.Animation(animFrames, 0.1);

        //4.wrap the animate action with a repeat forever action
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));*/
        /* The dash ("#") character at the beginning of the sprite's filename is a convention,
         and that means it will create a sprite from the sprite frame's name. In our case "runner0.png" is part of the sprite sheet.*/
       /* this.sprite = new cc.Sprite("#runner0.png");
        this.sprite.attr({x:80, y:85});
        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite);*/


        //1. create PhysicsSprite with a sprite frame name
        this.sprite = new cc.PhysicsSprite("#runner0.png");
        var contentSize = this.sprite.getContentSize();
        // 2. init the runner physic body
        this.body = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        //3. set the position of the runner
        this.body.p = cc.p(g_runnerStartX, g_groundHeight + contentSize.height / 2);
        //4. apply impulse to the body
        this.body.applyImpulse(cp.v(150, 0), cp.v(0, 0));//run speed
        //5. add the created body to space
        this.space.addBody(this.body);
        //6. create the shape for the body
        this.shape = new cp.BoxShape(this.body, contentSize.width - 14, contentSize.height);
        //7. add shape to space
        this.space.addShape(this.shape);
        //8. set body to the physic sprite
        this.sprite.setBody(this.body);
        this.sprite.attr({x:80, y:85});
        this.sprite.runAction(this.runningAction);
        this.spriteSheet.addChild(this.sprite);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
        this.recognizer = new SimpleRecognizer();
        this.scheduleUpdate();
    },
    jump:function () {
        cc.log("jump");
        if (this.stat == RunnerStat.running) {
            this.body.applyImpulse(cp.v(0, 250), cp.v(0, 0));
            this.stat = RunnerStat.jumpUp;
            this.sprite.stopAllActions();
            this.sprite.runAction(this.jumpUpAction);
            cc.audioEngine.playEffect(res.jump_mp3);
        }
    },
    getEyeX:function () {
        return this.sprite.getPositionX() - g_runnerStartX;
    },
    initAction:function () {
        // init runningAction
        var animFrames = [];
        // num equal to spriteSheet
        for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = new cc.Animation(animFrames, 0.1);
        this.runningAction = new cc.RepeatForever(new cc.Animate(animation));
        this.runningAction.retain();

        // init jumpUpAction
        animFrames = [];
        for (var i = 0; i < 4; i++) {
            var str = "runnerJumpUp" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = new cc.Animation(animFrames, 0.2);
        this.jumpUpAction = new cc.Animate(animation);
        this.jumpUpAction.retain();

        // init jumpDownAction
        animFrames = [];
        for (var i = 0; i < 2; i++) {
            var str = "runnerJumpDown" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        animation = new cc.Animation(animFrames, 0.3);
        this.jumpDownAction = new cc.Animate(animation);
        this.jumpDownAction.retain();
    },
    onExit:function() {
        this.runningAction.release();
        this.jumpUpAction.release();
        this.jumpDownAction.release();
        this._super();
    },
    update:function () {// update meter
        var statusLayer = this.getParent().getParent().getChildByTag(TagOfLayer.Status);
        statusLayer.updateMeter(this.sprite.getPositionX() - g_runnerStartX);
        //in the update method of AnimationLayer
        // check and update runner stat
        var vel = this.body.getVel();
        if (this.stat == RunnerStat.jumpUp) {
            if (vel.y < 0.1) {
                this.stat = RunnerStat.jumpDown;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.jumpDownAction);
            }
        } else if (this.stat == RunnerStat.jumpDown) {
            if (vel.y == 0) {
                this.stat = RunnerStat.running;
                this.sprite.stopAllActions();
                this.sprite.runAction(this.runningAction);
            }
        }
    }
});

