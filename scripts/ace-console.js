var AceConsole = typeof exports == 'undefined' ? {} : exports;

void function(exports){

    if (typeof console == 'undefined') return;
    
    var browser = typeof window != 'undefined' && typeof document != 'undefined'; // 是否在浏览器环境
    
    /**
     * @fileoverview 控制台输出彩色字
     * @see http://en.wikipedia.org/wiki/ANSI_escape_code
     * @author 王集鹄(WangJihu,http://weibo.com/zswang)
     * @date 2013年05月09日
     */
    
    /**
     * color table 颜色表
     */
    var colors = {
        black: 0, // lightgrey
        red: 1, // lightcoral
        green: 2, // lightgreen
        yellow: 3, // lightyellow
        blue: 4, // lightblue
        magenta: 5, // lightpink
        cyan: 6, // lightcyan
        white: 7 // lightyellow
    };
    
    var lightColors = {
        black: 'lightgrey',
        red: 'lightcoral',
        green: 'lightgreen',
        yellow: 'lightyellow',
        blue: 'lightblue',
        magenta: 'lightpink',
        cyan: 'lightcyan',
        white: 'white'
    };
    
    /**
     * 样式表
     */
    var styles = {
        reset: 0,
        bold: 1,
        b: 1,
        faint: 2,
        italic: 3,
        i: 3,
        underline: 4,
        u: 4,
        blink: 5,
        'blink:slow': 5,
        'blink:rapid': 6,
        reverse: 7,
        conceal: 8
    };
    
    /**
     * color offset 颜色起始偏移
     */
    var colorOffsets = {
        foreground: 30, // 前景色
        background: 40, // 背景色
        foregroundHight: 90, // Set foreground color, high intensity
        backgroundHight: 100 // Set background color, high intensity
    };
    
    /**
     * 前缀
     */
    var prefix = '\x1b[';
    /**
     * 后缀
     */
    var suffix = 'm';
    
     /**
      * 克隆对象
      */
    function cloneObject(source){
        if (!source || typeof source != 'object') return source;
        var result = {};
        for (var p in source){
            result[p] = cloneObject(source[p]);
        }
        return result;
    }
    
    /**
     * 将状态转换为字符串
     * @param {Object} status 状态集合
     *  @field {String} style 样式
     *  @field {String} foregroundColor 前景色
     *  @field {Boolean} foregroundHight 前景色是否高亮
     *  @field {String} backgroundColor 背景色
     *  @field {Boolean} backgroundHight 背景色是否高亮
     * @param {Array} fonts 字体输出
     */
    function status2text(status, fonts){
        if (!status) return '';
        
        var result = [];
        if (fonts){
            if (status.styles){
                if (status.styles.bold ||  status.styles.b){
                    result.push('font-weight:bold');
                }
                if (status.styles.italic ||  status.styles.i){
                    result.push('font-style:italic');
                }
                if (status.styles.underline ||  status.styles.u){
                    result.push('text-decoration:underline');
                }
            }
            if (status.backgroundColor){
                if (status.backgroundHight){
                    result.push('background:' + lightColors[status.backgroundColor]);
                } else {
                    result.push('background:' + status.backgroundColor);
                }
            }
            
            if (status.foregroundColor){
                if (status.foregroundHight){
                    result.push('color:' + lightColors[status.foregroundColor]);
                } else {
                    result.push('color:' + status.foregroundColor);
                }
            }
            if (!result.length) return '';
            fonts.push(result.join(';'));
            return '%c';
        }
        
        if (status.styles){
            for (var style in status.styles){
                result.push(styles[style]);
            }
        }
        if (status.backgroundColor){
            if (status.backgroundHight){
                result.push(colorOffsets.backgroundHight + colors[status.backgroundColor]);
            } else {
                result.push(colorOffsets.background + colors[status.backgroundColor]);
            }
        }
        
        if (status.foregroundColor){
            if (status.foregroundHight){
                result.push(colorOffsets.foregroundHight + colors[status.foregroundColor]);
            } else {
                result.push(colorOffsets.foreground + colors[status.foregroundColor]);
            }
        }
        if (!result.length) return prefix + styles.reset + suffix;
        return prefix + result.join(';') + suffix;
    }
    
    /*
     * 输出带颜色的日志
     * @param {...} arguments
     * @example
AceConsole.log('[blink]<foreground:red;background:blue;style:blink>[/blink]');
AceConsole.log('[color=red,blue]<foreground:red;background:blue;style:default>[/color]');
AceConsole.log('[color=red,light:blue]<foreground:red;background:light blue;style:default>[/color]');
AceConsole.log('[b][yellow]<foreground:yellow;background:default;style:bold>[/yellow]<foreground:default;background:default;style:bold>[/b]');
AceConsole.log('[bg:red]<foreground:default;background:red;style:default>[/bg:red][bg:red:light]<foreground:default;background:light red;style:default>[/bg:red:light]');
AceConsole.log('[light:red]<foreground:light red;background:default;style:default>[b]<foreground:ligth red;background:default;style:default>[/b][/light:red]');
AceConsole.log('[bg:light:red][blue]<foreground:blue;background:light red;style:default>[b]<foreground:blue;background:light red;style:bold>[/b][/blue]<foreground:default;background:light red;style:default>[/bg:light:red]');

AceConsole.log('[color=red,blue]hello world![/color]');
AceConsole.log('[color=red,light:blue]hello world![/color]');
AceConsole.log('[b][red]hello world![/red][/b]');
AceConsole.log('[bg:red]hello world![/bg:red]');
AceConsole.log('[light:red]hello world![/light:red]');
AceConsole.log('[bg:light:red][blue]hello [b]world![/b][/blue][/bg:light:red]');
     */
    function log(){
        var messages = [];
        var fonts = [];
        for (var i = 0; i < arguments.length; i++){
            var statuses = []; // 状态堆
            messages.push(String(arguments[i]).replace(/\[(\/?)([^\]]*)\]/g, function(all, close, flag){
                var color = flag.replace(/\b(light?|bg)\b|:|\s/ig, '');
                if (close){
                    if (flag == 'color' || color in colors || flag in styles){
                        statuses.pop(); // 移除最后一个
                        if (browser){
                            fonts.push('');
                            return '%c' + status2text(statuses[statuses.length - 1], fonts);
                        }
                        return prefix + styles.reset + suffix + status2text(statuses[statuses.length - 1]);
                    }
                    return all; // 不能识别的语法
                }
                
                var status = cloneObject(statuses[statuses.length - 1]) || {};
                status.styles = status.styles || {};
                var changed;
                
                flag.replace(/^color\s*=\s*([\w+:]+)(?:\s*,\s*([\w+:]+))\s*$/i, function(all, foreground, background){
                    status.foregroundColor = foreground.replace(/\b(light?)\b|:/ig, '') || '';
                    status.foregroundHight = /\b(light?)\b/i.test(foreground);
                    
                    background = background || '';
                    status.backgroundColor = background.replace(/\b(light?)\b|:/ig, '') || '';
                    status.backgroundHight = /\b(light?)\b/i.test(background);
                    
                    changed = true;
                });
                
                if (!changed){
                    if (flag in styles){
                        status.styles[flag] = true;
                        changed = true;
                    }
                }

                if (!changed){
                    if (color in colors){
                        var bg = /\b(bg)\b/i.test(flag);
                        var light = /\b(light?)\b/i.test(flag);
                        if (bg){
                            status.backgroundColor = color;
                            status.backgroundHight = light;
                        } else {
                            status.foregroundColor = color;
                            status.foregroundHight = light;
                        }
                        changed = true;
                    }
                }
                if (!changed) return all; // 无效数据
                statuses.push(status);
                
                if (browser){
                    return status2text(status, fonts);
                }
                return status2text(status);
            }));
        }
        if (browser){ // 浏览器环境
            fonts.unshift(messages.join(' '));
            // console.log(JSON.stringify(fonts)); // debug
            console.log.apply(console, fonts);
        } else{
            // console.log(JSON.stringify(messages.join(' '))); // debug
            console.log(messages.join(' '));
        }
    }
    
    exports.log = log;

}(AceConsole);