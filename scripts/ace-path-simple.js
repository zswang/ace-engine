var AcePath = AcePath || {};

void function(exports){
    // 压缩代码相关
    /* compressor */    
    /**
     * Ace Engine Path
     * 一套展示矢量图路径的控件 简单版本
     * @see http://code.google.com/p/ace-engine/wiki/AcePath
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */
    var 
        ie = document.all && document.attachEvent,
        /**
         * IE 放大的倍数
         */
        ieZoom = 1000,
        /*
         * 是否ie9+
         */
        ie9plus = ie && window.XMLHttpRequest && window.addEventListener && document.documentMode >= 9,
        /*
         * 是否支持svg
         */
        svg = !ie || ie9plus,
        /*
         * vml样式元素,避免重复创建
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

    /**
     * 矢量路径类
     * @param {Object} options 配置
     *    @field {String|Element} parent 容器
     *    @field {String} fill 填充色
     *    @field {Number} fillOpacity 填充透明度
     *    @field {String} stroke 描边色
     *    @field {Number} strokeOpacity 描边透明度
     *    @field {Number} strokeWidth 描边宽度
     *    @field {String} path 路径
     */
    function Path(options){
        options = options || {};
        if (typeof options.parent == 'string'){
            this.parent = document.getElementById(options.parent);
        } else {
            this.parent = options.parent || document.body;
        }

        this.fill = options.fill || 'none';
        this.fillOpacity = options.fillOpacity || options['fill-opacity'] || 1;
        this.stroke = options.stroke || 'black';
        this.strokeWidth = options.strokeWidth || options['stroke-width'] || 1;
        this.strokeOpacity = options.strokeOpacity || options['stroke-opacity'] || 1;
        this.path = options.path || 'M 0,0';
        
        // 处理相同的容器
        var parentInfo;
        for (var i = 0; i < parentList.length; i++){
            var item = parentList[i];
            if (item.parent == this.parent){
                parentInfo = item;
                break;
            }
        }
        
        var div = document.createElement('div');
        if (svg){
            div.innerHTML = format('\
<svg width=100% height=100% xmlns="http://www.w3.org/2000/svg">\
    <path fill="#{fill}" fill-rule="evenodd" stroke-linejoin="round" fill-opacity="#{fillOpacity}" stroke="#{stroke}" stroke-opacity="#{strokeOpacity}" stroke-width="#{strokeWidth}" d="#{path}"/>\
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
            this.filled = this.fill == 'none' ? 'f' : 't';
            this.stroked = this.stroke == 'none' ? 'f' : 't';
            //div.style.height = '100%';
            //div.style.width = '100%';
            this.zoom = ieZoom;
            div.innerHTML = format('\
<v:shape class="ace_path_shape ace_vml" coordsize="#{zoom},#{zoom}" stroked="#{stroked}" filled="#{filled}" path="#{path}">\
    <v:stroke class="ace_vml" opacity="#{strokeOpacity}" color="#{stroke}" weight="#{strokeWidth}"></v:stroke>\
    <v:fill class="ace_vml" opacity="#{fillOpacity}" color="#{fill}"></v:fill>\
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
    /*
     * 设置或获取属性
     * @param {Object} values
     * @or
     * @param {String} name
     * @param {String} value
     * @or
     * @param {String} name
     */
    Path.prototype.attr = function(name, value){
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
                return this;
            }
        } else if (arguments.length > 1){
            switch(name){
                case 'path':
                    if (this.path == value) break;
                    this.path = value;
                    if (svg){
                        this.elementPath.setAttribute('d', value || 'M 0,0');
                    } else {
                        this.elementPath.path = String(value || 'M 0,0')
                            .replace(/\d+(\.\d+)?/g, function(number){
                                return parseInt(number * ieZoom);
                            }) // 清理小数
                            .replace(/z/ig, 'X'); // 处理闭合
                    }
                    break;
                case 'fill':
                    if (this.fill == value) break;
                    this.fill = value;
                    if (svg){
                        this.elementPath.setAttribute('fill', value);
                    } else {
                        this.elementPath.Filled = this.filled = this.fill == 'none' ? 'f' : 't';
                        this.elementFill.Color = value;
                    }
                    break;
                case 'stroke':
                    if (this.stroke == value) break;
                    this.stroke = value;
                    if (svg){
                        this.elementPath.setAttribute('stroke', value);
                    } else {
                        this.elementPath.Stroked = this.stroked = this.stroke == 'none' ? 'f' : 't';
                        this.elementStroke.Color = value;
                    }
                    break;
                case 'fillOpacity':
                case 'fill-opacity':
                    if (this.fillOpacity == value) break;
                    this.fillOpacity = value;
                    if (svg){
                        this.elementPath.setAttribute('fill-opacity', value);
                    } else {
                        this.elementFill.Opacity = Math.min(Math.max(0, value), 1);
                    }
                    break;
                case 'strokeOpacity':
                case 'stroke-opacity':
                    if (this.strokeOpacity == value) break;
                    this.strokeOpacity = value;
                    if (svg){
                        this.elementPath.setAttribute('stroke-opacity', value);
                    } else {
                        this.elementStroke.Opacity = Math.min(Math.max(0, value), 1);
                    }
                    break;
                case 'strokeWidth':
                case 'stroke-width':
                    if (this.strokeWidth == value) break;
                    this.strokeWidth = value;
                    if (svg){
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
.ace_vml{behavior:url(#default#VML);}\
.ace_path_shape{width:1px;height:1px;padding:0;margin:0;left:0;top:0;position:absolute;}\
.ace_path_panel{width:100%;height:100%;overflow:hidden;padding:0;margin:0;position:relative;}\
';
    }

    exports.create = create;
}(AcePath);
