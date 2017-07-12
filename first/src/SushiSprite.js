var SushiSprite = cc.Sprite.extend({
        disappearAction:null,
    onEnter:function () {
        cc.log("onEnter");
        this._super();
        this.addTouchEventListenser();
        this.disappearAction = this.createDisappearAction();
        this.disappearAction.retain();
      /*  上面的retain()方法表示对生成的消失动画增加一次引用。Cocos2d-JS遵循Cocos2d-x的内存管理原则。
        上面创建的disappearAction是自动释放的，我们需要为它增加一次引用，以避免它被回收，
        在我们不需要的时候对它执行release()方法,释放对它的引用。避免内存泄露。
        在使用Cocos2d-JS的jsb模式时，部分情况是需要我们手动管理内存的。*/
    },
    createDisappearAction : function() {
        /*帧动画的创建流程： 将连续的动作图片生成cc.spriteFrame对象放入到数组。
        然后通过cc.Animation创建动画序列，再通过cc.Animate制作成帧动画的动作。
        最后由该节点Node播放帧动画。*/
        var frames = [];
        for (var i = 0; i < 11; i++) {
            var str = "sushi_1n_"+i+".png"
            //cc.log(str);
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            frames.push(frame);
        }

        var animation = new cc.Animation(frames, 0.02);
        var action = new cc.Animate(animation);

        return action;
    },
    onExit:function () {
        cc.log("onExit");
        this.disappearAction.release();
        this._super();
    },
    addTouchEventListenser:function() {
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
            swallowTouches: true,
            //onTouchBegan event callback function
            onTouchBegan: function (touch, event) {
                var pos = touch.getLocation();
                var target = event.getCurrentTarget();
                if ( cc.rectContainsPoint(target.getBoundingBox(),pos)) {
                    target.removeTouchEventListenser();
                    //响应精灵点中
                    cc.log("pos.x="+pos.x+",pos.y="+pos.y);

                    target.stopAllActions();

                    var ac = target.disappearAction;
                    var seqAc = cc.Sequence.create( ac, cc.CallFunc.create(function () {
                        cc.log("callfun........");
                        //target.getParent().addScore();
                       // target.getParent().removeSushiByindex(target.index - 1);
                        target.removeFromParent();

                    },target) );

                    target.runAction(seqAc);

                    return true;
                }
                return false;
            }
     });
        cc.eventManager.addListener(this.touchListener, this);
},
    removeTouchEventListenser:function(){
        cc.eventManager.removeListener(this.touchListener);
    }
});
