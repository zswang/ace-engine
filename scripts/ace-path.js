var AcePath = AcePath || {};

void function(exports){
    /**
     * Ace Engine Path
     * 一套展示矢量图路径的控件
     * @see http://code.google.com/p/ace-engine/wiki/AcePath
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */
    var 
        ie = document.all && window.attachEvent,
        /*
         * 是否ie9+
         */
        ie9plus = ie && window.XMLHttpRequest && window.addEventListener, 
        /*
         * 是否支持svg
         */
        svg = !ie || ie9plus,
        /*
         * vml样式元素
         */
        vmlStyle,
        /*
         * 容器列表
         */
        parentList = [];
    
    /**
     * 格式化函数
     * @param {String} template 模板
     * @param {Object} json 数据项
     */
    function format(template, json){
        return template.replace(/#\{(.*?)\}/g, function(all, key){
            return json && (key in json) ? json[key] : "";
        });
    }
    
    function svg2paths(path){
        var current = [0, 0], movePos = [0, 0], result = [];
        String(path).replace(/([mlcza])((\s*,?\s*([+-]?\d+(?:\.\d+)?)+)*)/gi, function(all, flag, params){
            switch (flag){
                case 'M':
                case 'm':
                case 'L':
                case 'l':
                    var passing = false; // 是否已经处理过参数
                    params.replace(/\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi, function(all, x, y){
                        if (flag == flag.toUpperCase()){
                            current = [0, 0];
                        }
                        current = [+x + current[0], +y + current[1]];
                        result.push([flag.toUpperCase() == 'L' || passing ? 'L' : 'M', current]);
                        passing = true;
                        if (flag == 'M' || flag == 'm'){
                            movePos = current;
                        }
                    });
                    break;
                case 'C':
                case 'c':
                    params.replace(
                        /\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi, function(
                            all, x1, y1, x2, y2, x, y){
                        if (flag == 'C'){
                            current = [0, 0];
                        }
                        result.push(['C', [
                            +x1 + current[0], +y1 + current[1],
                            +x2 + current[0], +y2 + current[1],
                            +x + current[0], +y + current[1]
                        ]]);
                        current = [+x + current[0], +y + current[1]];
                    });
                    break;
                case 'A':
                case 'a':
                    // SVG (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
                    // VML: center (x,y) size(w,h) start-angle, end-angle
                    params.replace(
                        /\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi, function(
                            all, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y){
                        if (flag == 'A'){
                            current = [0, 0];
                        }
                        result.push(['A', [
                            +rx, +ry,
                            +xAxisRotation, +largeArcFlag, +sweepFlag,
                            +x + current[0], +y + current[1]
                        ]]);
                        current = [+x + current[0], +y + current[1]];
                    });
                    break;
                case 'Z':
                case 'z':
                    result.push(['Z']);
                    current = movePos;
                    break;
            }
        });
        return result;
    }
    // from raphael.js
    function q2c(x1, y1, ax, ay, x2, y2){
        var _13 = 1 / 3,
        _23 = 2 / 3;
        return [
            _13 * x1 + _23 * ax,
            _13 * y1 + _23 * ay,
            _13 * x2 + _23 * ax,
            _13 * y2 + _23 * ay,
            x2,
            y2
        ];
    }
    
    function rotate(x, y, rad) {
        var X = x * Math.cos(rad) - y * Math.sin(rad),
            Y = x * Math.sin(rad) + y * Math.cos(rad);
        return {x: X, y: Y};
    }
    
    // from raphael.js
    function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // for more information of where this Math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var _120 = Math.PI * 120 / 180,
            rad = Math.PI / 180 * (+angle || 0),
            res = [],
            xy;
        if (!recursive) {
            xy = rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            var cos = Math.cos(Math.PI / 180 * angle),
                sin = Math.sin(Math.PI / 180 * angle),
                x = (x1 - x2) / 2,
                y = (y1 - y2) / 2;
            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if (h > 1) {
                h = Math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            var rx2 = rx * rx,
                ry2 = ry * ry,
                k = (large_arc_flag == sweep_flag ? -1 : 1) *
                    Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                cx = k * rx * y / ry + (x1 + x2) / 2,
                cy = k * -ry * x / rx + (y1 + y2) / 2,
                f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
                f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

            f1 = x1 < cx ? Math.PI - f1 : f1;
            f2 = x2 < cx ? Math.PI - f2 : f2;
            f1 < 0 && (f1 = Math.PI * 2 + f1);
            f2 < 0 && (f2 = Math.PI * 2 + f2);
            if (sweep_flag && f1 > f2) {
                f1 = f1 - Math.PI * 2;
            }
            if (!sweep_flag && f2 > f1) {
                f2 = f2 - Math.PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        var df = f2 - f1;
        if (Math.abs(df) > _120) {
            var f2old = f2,
                x2old = x2,
                y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * Math.cos(f2);
            y2 = cy + ry * Math.sin(f2);
            res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = Math.cos(f1),
            s1 = Math.sin(f1),
            c2 = Math.cos(f2),
            s2 = Math.sin(f2),
            t = Math.tan(df / 4),
            hx = 4 / 3 * rx * t,
            hy = 4 / 3 * ry * t,
            m1 = [x1, y1],
            m2 = [x1 + hx * s1, y1 - hy * c1],
            m3 = [x2 + hx * s2, y2 - hy * c2],
            m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [m2, m3, m4].concat(res);
        } else {
            res = [m2, m3, m4].concat(res).join().split(",");
            var newres = [];
            for (var i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    }

    /**
     * @see http://code.google.com/p/svg2vml
     * 
     * 
     */
    function paths2vml(paths){
        var result = [], current = [0, 0], movePos = [0, 0];
        for (var i = 0; i < paths.length; i++){
            var item = paths[i];
            switch(item[0]){
                case 'Z':
                    result.push('X E');
                    current = [movePos[0], movePos[1]];
                    result.push('M ' + current);
                    break;
                case 'C':
                    current = [item[1][4], item[1][5]];
                    result.push(item.join(' '));
                    break;
                case 'M':
                    movePos = [item[1][0], item[1][1]];
                    current = [item[1][0], item[1][1]];
                    result.push(item.join(' '));
                    break;
                case 'L':
                    current = [item[1][0], item[1][1]];
                    result.push(item.join(' '));
                    break;
                case 'A':
                    //x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2
                    var temp = a2c(
                        current[0], current[1],
                        item[1][0], item[1][1], 
                        item[1][2],
                        item[1][3],
                        item[1][4],
                        item[1][5], item[1][6]
                    );
                    for (var j = 0; j < temp.length; j++){
                        temp[j] = parseInt(temp[j]);
                    }
                    result.push(['C'].concat(temp).join(' '));
                    current = [item[1][5], item[1][6]];
                    break;
            }
        }
        //alert(result.join('\n'));
        return result.join(' ');
    }
    
    /**
     * 矢量路径类
     * @param {Object} options 配置
     *    @field {String|Element} parent 容器
     *    @field {String} fill 填充色
     *    @field {String} stroke 描边色
     *    @field {Number} strokeWidth 描边宽度
     *    @field {String} path 路径
     */
    function Path(options){
        if (typeof options.parent == 'string'){
            this.parent = document.getElementById(options.parent);
        } else {
            this.parent = options.parent || document.body;
        }

        this.fill = options.fill || 'none';
        this.stroke = options.stroke || 'black';
        this.strokeWidth = options.strokeWidth || options['stroke-width'] || 1;
        this.path = options.path || 'M 0,0';
        this.paths = svg2paths(this.path);
        
        // 处理相同的容器
        var parentInfo;
        for (var i = 0; i < parentList.length; i++){
            var item = parentList[i];
            if (item.parent == this.parent){
                parentInfo = item;
                break;
            }
        }
        if (/^canvas$/i.test(this.parent.tagName)){
            this.canvas = this.parent;
            if (parentInfo){
                this.canvasPaths = parentInfo.paths;
            } else {
                this.canvasPaths = [];
                var paths = [];
                parentList.push({
                    parent: this.parent,
                    paths: this.canvasPaths
                });
            }
            this.canvasPaths.push(this);
            this.repaint(true);
            return;
        }
        
        var div = document.createElement('div');
        if (svg){
            div.innerHTML = format('\
<svg width=100% height=100% xmlns="http://www.w3.org/2000/svg">\
    <path fill="#{fill}" stroke="#{stroke}" stroke-width="#{strokeWidth}" d="#{path}"/>\
</svg>', this);
            this.elementPath = div.lastChild.lastChild;
            if (parentInfo){
                this.element = parentInfo.element;
                this.element.appendChild(this.elementPath);
            } else {
                this.element = div.lastChild;
                parentList.push({
                    parent: this.parent,
                    element: this.element
                });
                this.parent.appendChild(this.element);
            }
        } else {
            //div.style.height = '100%';
            //div.style.width = '100%';
            div.innerHTML = format('\
<v:shape class="ace_path_shape" coordsize="1,1" stroked="t" filled="f" path="#{path}">\
    <v:stroke color="#{stroke}" weight="#{strokeWidth}"></v:stroke>\
    <v:fill></v:fill>\
</v:shape>', this);
            this.elementPath = div.lastChild;
            if (parentInfo){
                this.element = parentInfo.element;
                this.element.appendChild(this.elementPath);
            } else {
                this.element = div;
                div.className = 'ace_path_panel';
                parentList.push({
                    parent: this.parent,
                    element: this.element
                });
                this.parent.appendChild(this.element);
            }
            this.elementFill = this.elementPath.getElementsByTagName('fill')[0];
            this.elementStroke = this.elementPath.getElementsByTagName('stroke')[0];
        }
    }
    /**
     * @see http://code.google.com/p/canvg/
     */
    Path.prototype.repaint = function(all){
        if (!this.canvas || !this.canvas.getContext) return;
        if (all){
            this.canvas.width = this.canvas.width; // clear
            for (var i = 0; i < this.canvasPaths.length; i++){
                this.canvasPaths[i].repaint();
            }
            return;
        }
        var context = this.canvas.getContext('2d');
       
        if (!context) return;
        context.beginPath();
        context.save();
        var current = [0, 0], movePos = [0, 0];
        for (var i = 0; i < this.paths.length; i++){
            var item = this.paths[i];
            switch(item[0]){
                case 'Z':
                    context.closePath();
                    current = movePos;
                    break;
                case 'C':
                    context.bezierCurveTo(item[1][0], item[1][1], item[1][2], item[1][3], item[1][4], item[1][5]);
                    current = [item[1][2], item[1][3]];
                    break;
                case 'L':
                    current = [item[1][0], item[1][1]];
                    context.lineTo(item[1][0], item[1][1]);
                    break;
                case 'M':
                    current = [item[1][0], item[1][1]];
                    movePos = [item[1][0], item[1][1]];
                    context.moveTo(item[1][0], item[1][1]);
                    break;
                case 'A':
                    var current = current, 
                        rx = item[1][0],
                        ry = item[1][1],
                        xAxisRotation = item[1][2] * (Math.PI / 180),
                        largeArcFlag = item[1][3],
                        sweepFlag = item[1][4],
                        cp = [item[1][5], item[1][6]];
                    // Conversion from endpoint to center parameterization
                    // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
                    // x1', y1'
                    var currp = [
                        Math.cos(xAxisRotation) * (current[0] - cp[0]) / 2 + Math.sin(xAxisRotation) * (current[1] - cp[1]) / 2,
                        -Math.sin(xAxisRotation) * (current[0] - cp[0]) / 2 + Math.cos(xAxisRotation) * (current[1] - cp[1]) / 2
                    ];
                    // adjust radii
                    var l = Math.pow(currp[0], 2) / Math.pow(rx, 2) + 
                        Math.pow(currp[1], 2) / Math.pow(ry, 2);
                    if (l > 1) {
                        rx *= Math.sqrt(l);
                        ry *= Math.sqrt(l);
                    }
                    // cx', cy'
                    var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
                        ((Math.pow(rx, 2) * Math.pow(ry, 2)) - 
                         (Math.pow(rx,2) * Math.pow(currp[1], 2))
                         -(Math.pow(ry, 2) * Math.pow(currp[0], 2))) /
                        (Math.pow(rx, 2) * Math.pow(currp[1], 2)
                         + Math.pow(ry, 2) * Math.pow(currp[0], 2))
                    );
                    if (isNaN(s)) s = 0;
                    var cpp = [s * rx * currp[1] / ry, s * -ry * currp[0] / rx];
                    // cx, cy
                    var centp = [
                        (current[0] + cp[0]) / 2.0 + Math.cos(xAxisRotation) * cpp[0] - Math.sin(xAxisRotation) * cpp[1],
                        (current[1] + cp[1]) / 2.0 + Math.sin(xAxisRotation) * cpp[0] + Math.cos(xAxisRotation) * cpp[1]
                    ];
                    // vector magnitude
                    var m = function(v){
                        return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2));
                    };
                    // ratio between two vectors
                    var r = function(u, v){
                        return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));
                    };
                    // angle between two vectors
                    var a = function(u, v){
                        return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u,v));
                    }
                    // initial angle
                    var a1 = a([1,0], [(currp[0] - cpp[0]) / rx, (currp[1] - cpp[1]) / ry]);
                    // angle delta
                    var u = [(currp[0] - cpp[0]) / rx, (currp[1] - cpp[1]) / ry];
                    var v = [(-currp[0] - cpp[0]) / rx, (-currp[1] - cpp[1]) / ry];
                    var ad = a(u, v);
                    if (r(u,v) <= -1) ad = Math.PI;
                    if (r(u,v) >= 1) ad = 0;
                    
                    var r = rx > ry ? rx : ry;
                    var sx = rx > ry ? 1 : rx / ry;
                    var sy = rx > ry ? ry / rx : 1;
                    context.save();
                    
                    context.translate(centp[0], centp[1]);
                    context.rotate(xAxisRotation);
                    context.scale(sx, sy);
                    context.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
                    
                    context.restore();
                    current = cp;
                    break;
            }
        }
        context.restore();
        if (this.stroke != 'none'){
            context.strokeStyle = this.stroke;
            context.stroke();
        }
        context.lineWidth = this.strokeWidth;
        if (this.fill != 'none'){
            context.fillStyle = this.fill;
            context.fill();
        }
    }
    /*
     * 设置或获取属性
     * @param {Object} values
     * @or
     * @param {String} name
     * @param {String} value
     * @or
     * @param {String} name
     */
    Path.prototype.attr = function(name, value, batch){
        if (arguments.length == 1){
            if (typeof name == 'string'){
                if (name == 'stroke-width'){
                    name = 'strokeWidth';
                }
                return this[name];
            }
            if (typeof name == 'object'){
                for (var p in name){
                    this.attr(p, name[p], true);
                }
                this.canvas && this.repaint(true);
                return this;
            }
        } else if (arguments.length > 1){
            switch(name){
                case 'path':
                    if (this.path == value) break;
                    this.path = value;
                    this.paths = svg2paths(this.path);
                    if (this.canvas){
                        !batch && this.repaint(true);
                    } else if (svg){
                        this.elementPath.setAttribute('d', value || 'M 0,0');
                    } else {
                        this.elementPath.path = paths2vml(this.paths);
                    }
                    break;
                case 'fill':
                    if (this.fill == value) break;
                    this.fill = value;
                    if (this.canvas){
                        !batch && this.repaint();
                    } else if (svg){
                        this.elementPath.setAttribute('fill', value);
                    } else {
                        if (value == 'none'){
                            this.elementPath.Filled = 'f';
                        } else {
                            this.elementPath.Filled = 't';
                        }
                        this.elementFill.Color = value;
                    }
                    break;
                case 'stroke':
                    if (this.stroke == value) break;
                    this.stroke = value;
                    if (this.canvas){
                        !batch && this.repaint();
                    } else if (svg){
                        this.elementPath.setAttribute('stroke', value);
                    } else {
                        if (value == 'none'){
                            this.elementPath.Stroked = 'f';
                        } else {
                            this.elementPath.Stroked = 't';
                        }
                        this.elementStroke.Color = value;
                    }
                    break;
                case 'strokeWidth':
                case 'stroke-width':
                    if (this.strokeWidth == value) break;
                    this.strokeWidth = value;
                    if (this.canvas){
                        !batch && this.repaint();
                    } else if (svg){
                        this.elementPath.setAttribute('stroke-width', value);
                    } else {
                        this.elementStroke.weight = value;
                    }
                    break;
            }
            return this;
        }
        
    };

    function create(options){
        return new Path(options);
    }

    if (ie && !vmlStyle){
        vmlStyle = document.createStyleSheet();
        vmlStyle.cssText = '\
.ace_path_shape,.ace_path_shape*{behavior:url(#default#VML);}\
.ace_path_shape{width:1px;height:1px;padding:0;margin:0;left:0;top:0;position:absolute;}\
.ace_path_panel{width:100%;height:100%;overflow:hidden;padding:0;margin:0;position:relative;}\
';
    }
    
    exports.create = create;
}(AcePath);