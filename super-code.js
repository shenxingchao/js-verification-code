/**
 * by sxc
 * 使用方法  var superCode = new superCode({option});
 *  superCode.is_pass() return true or false;
 */
;(function () {
    var superCode = function (options) {
        this.options = $.extend({
            x:0,//初始化抠图位置X
            y:140,//初始化抠图位置Y
            x_rang1:5,//左误差值
            x_rang2:5,//右误差值
            w:42,//抠图宽度
            r:10,//抠图小圆点半径
            PI: Math.PI,//圆周率
            width:'372',//画布宽度
            height:'228',//画布高度
            canvas:'canvas',//图片画布
            block:'block',//拼图画布
            src:'',//图片路径
            code_control:'code_control',//控制条id
            code_slide:'code_slide',//滑块id
            code_tips:'code_tips',//提示内容id
            code_true:'',//正确图标路径
            code_error:'',//错误图标路径
            code_right:'',//右滑图标路径
        },options);
        this.init();
        this.draggable();
    };

    superCode.prototype.init = function () {
        this.options.x = Math.floor(Math.random()*(this.options.width-(this.options.w+this.options.r*2)*2) + (this.options.w+this.options.r*2));
        this.pass = false;//返回标识 通过or 不通过
        this.speed1 = 0;//验证开始时间
        this.speed2 = 0;//验证结束时间
        var obj = this;
        var img = document.createElement('img');
        var canvas = document.getElementById(this.options.canvas);
        var block = document.getElementById(this.options.block);
        block.style.left = -this.options.x+"px";
        obj.canvas_ctx = canvas.getContext('2d');
        obj.block_ctx = block.getContext('2d');
        this.draw(this.canvas_ctx,'fill',this.options.x,this.options.y,this.options.w,this.options.r,this.options.PI);
        this.draw(this.block_ctx,'clip',this.options.x,this.options.y,this.options.w,this.options.r,this.options.PI);
        img.src = this.options.src;
        img.onload = function() {
            obj.canvas_ctx.drawImage(img, 0, 0, obj.options.width, obj.options.height);
            obj.block_ctx.drawImage(img, 0, 0, obj.options.width, obj.options.height);
        };
    };

    superCode.prototype.draw = function (ctx,operation,x,y,w,r,PI) {
        ctx.beginPath();
        ctx.moveTo(x,y) +  ctx.lineTo(x+w/2,y) +  ctx.arc(x+w/2,y-r+2, r,0,2*PI) +  ctx.lineTo(x+w/2,y);
        ctx.lineTo(x+w,y) +  ctx.lineTo(x+w,y+w/2) +  ctx.arc(x+w+r-2,y+w/2,r,0,2*PI) +  ctx.lineTo(x+w,y+w/2);
        ctx.lineTo(x+w,y+w);
        ctx.lineTo(x,y+w);
        ctx.lineTo(x,y);
        ctx.fillStyle = '#fff';
        ctx[operation]() +  ctx.beginPath() +  ctx.arc(x,y+w/2, r,1.5*PI,0.5*PI);
        ctx.globalCompositeOperation = "xor";
        ctx.fill();
    };

    superCode.prototype.draggable = function () {
        var obj = this;
        this.superCodeDrag = new superCodeDrag({
            slideId:this.options.code_slide,
            boxId:this.options.code_control,
            start:function () {
                obj.speed1 = new Date().getTime();
            },
            drag: function(e) {
                obj.updatePosition(e);
            },
            stop: function() {
                obj.speed2 = new Date();
                obj.checkCode();
            }
        });
    };

    /**************************************************************************************************************************/
    /**
     *封装一下拖拽函数
     * @param options
     */
    var superCodeDrag = function (options) {
        this.options = $.extend({
            slideId:'slideId',//slideId 拖拽物体
            boxId:'boxId',//boxId 限定范围的盒子
            start:function () {
            },
            drag: function(e) {
            },
            stop: function() {
            }
        },options);
        this.bindMouseDown();
    };
    superCodeDrag.prototype.bindMouseDown = function () {
        var slide = document.getElementById(this.options.slideId);
        var box = document.getElementById(this.options.boxId);
        var self = this;
        slide.onmousedown = function(evt) {
            self.options.start();//按下监听
            var oEvent = evt || event; //获取事件对象，这个是兼容写法
            var disX = oEvent.clientX - parseInt(slide.offsetLeft);
            var disY = oEvent.clientX - parseInt(slide.offsetTop);
            //这里就解释为什么要给document添加onmousemove时间，原因是如果你给slide添加这个事件的时候，当你拖动很快的时候就很快脱离这个onmousemove事件，而不能实时拖动它
            document.onmousemove = function(evt) { //实时改变目标元素slide的位置
                var oEvent = evt || event;
                slide.style.left = oEvent.clientX - disX + 'px';
                slide.style.top = oEvent.clientY - disY + 'px';
                if(parseInt(slide.offsetLeft) < 0){
                    slide.style.left = 0;
                }
                if(parseInt(slide.offsetTop) < 0){
                    slide.style.top = 0;
                }
                if(parseInt(slide.offsetLeft) > box.clientWidth - slide.clientWidth){
                    slide.style.left = (box.clientWidth-slide.clientWidth) + "px";
                }
                if(parseInt(slide.offsetTop) > box.clientHeight - box.clientHeight){
                    slide.style.top = (box.clientHeight-box.clientHeight) + "px";
                }
                self.options.drag(oEvent);//拖动监听
            };
            //停止拖动
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
                self.options.stop(oEvent);//弹起监听
            };
        }
    };
    superCodeDrag.prototype.unbindMouseDown = function () {
        var slide = document.getElementById(this.options.slideId);
        slide.onmousedown = null;
    };

    /**************************************************************************************************************************/


    superCode.prototype.updatePosition = function (e) {
        var offsetLeft = document.getElementById(this.options.code_slide).style.left;
        offsetLeft = offsetLeft.replace('px','');
        document.getElementById(this.options.block).style.left = -parseInt(this.options.x)+parseInt(offsetLeft)+"px";
    };

    superCode.prototype.checkCode = function () {
        var offsetLeft = document.getElementById(this.options.code_slide).style.left.replace('px','');
        if((this.options.x-this.options.x_rang1)<offsetLeft && offsetLeft<(this.options.x+this.options.x_rang2)){
            //验证通过
            document.getElementById(this.options.code_slide).style.background = "url('"+ this.options.code_true +"') center center";
            document.getElementById(this.options.code_slide).style.backgroundSize = "100% 100%";
            document.getElementById(this.options.code_tips).innerText = ((this.speed2- this.speed1)/1000).toFixed(1) +"s 验证通过";
            //禁用拖动
            this.superCodeDrag.unbindMouseDown();
            this.pass = true;
            return true;
        }else{
            //前端刷新抠图位置 也可后端刷新
            this.options.x = Math.floor(Math.random()*(this.options.width-(this.options.w+this.options.r*2)*2) + (this.options.w+this.options.r*2));
            //禁用拖动
            document.getElementById(this.options.code_slide).style.background = "url('"+ this.options.code_error +"') center center";
            document.getElementById(this.options.code_slide).style.backgroundSize = "100% 100%";
            this.superCodeDrag.unbindMouseDown();

            //回归原位
            var obj = this;
            setTimeout(function () {
                obj.refresh();
                //启用拖动
                document.getElementById(obj.options.code_slide).style.background = "url('"+ obj.options.code_right +"') center center";
                document.getElementById(obj.options.code_slide).style.backgroundSize = "100% 100%";
                obj.superCodeDrag.bindMouseDown();
                return false;
            },600);
        }
    };

    superCode.prototype.refresh = function () {
        var obj = this;
        var img = document.createElement('img');
        var canvas = document.getElementById(this.options.canvas);
        var block = document.getElementById(this.options.block);
        var code_slide = document.getElementById(this.options.code_slide);
        canvas.height = obj.options.height;//清空画布
        block.height = obj.options.height;//清空画布
        this.draw(this.canvas_ctx,'fill',this.options.x,this.options.y,this.options.w,this.options.r,this.options.PI);
        this.draw(this.block_ctx,'clip',this.options.x,this.options.y,this.options.w,this.options.r,this.options.PI);
        img.src = this.options.src;
        img.onload = function() {
            obj.canvas_ctx.drawImage(img, 0, 0, obj.options.width, obj.options.height);
            obj.block_ctx.drawImage(img, 0, 0, obj.options.width, obj.options.height);
        };
        block.style.left = -this.options.x+"px";
        code_slide.style.left = "-1px";
    };

    superCode.prototype.is_pass = function () {
        return this.pass;
    };

    window.superCode = superCode;
}());