var AceConsole = typeof exports == 'undefined' ? {} : exports;
void function(exports){

    if (typeof console == 'undefined') return;
    
    /*
     * @fileoverview 控制台输出彩色字
     * @see http://en.wikipedia.org/wiki/ANSI_escape_code
     * @author 王集鹄(WangJihu,http://weibo.com/zswang)
     */
    
    /**
     * color table 颜色表
     */
    var colors = {
        black: 0,
        red: 1,
        green: 2,
        yellow: 3,
        blue: 4,
        magenta: 5,
        cyan: 6,
        white: 7
    };
    
    var styles = {
        reset: 0,
        bold: 1,
        faint: 2,
        italic: 3,
        underline: 4,
        blink: 5,
        'blink:slow': 5,
        'blink:rapid': 6,
        reverse: 7,
        conceal: 8
    };
    
    styles['b'] = styles.bold;
    styles['i'] = styles.italic;
    styles['u'] = styles.underline;
    
    /**
     * color offset 颜色起始偏移
     */
    var colorOffsets = {
        foreground: 30,
        background: 40,
        foregroundHight: 90, // Set foreground color, high intensity
        backgroundHight: 100 // Set background color, high intensity
    }
    
    /**
     * 前缀
     */
    var prefix = '\x1b[';
    var suffix = 'm';
    
     /**
      * 克隆对象
      */
    function cloneObject(object){
        var result = {};
        if (object){
            for (var p in object){
                result[p] = object[p];
            }
        }
        return result;
    }
    
    function status2text(status){
        if (!status) return '';
        var result = [];
        if (status.style){
            result.push(styles[status.style]);
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
        var message = [];
        for (var i = 0; i < arguments.length; i++){
            var statuses = []; // 状态堆
            message.push(String(arguments[i]).replace(/\[\/?([^\]]*)\]/g, function(all, flag){
                if (all.slice(1, 2) == '/'){
                    var color = flag.replace(/\b(light?|bg)\b|:/ig, '');
                    if (flag == 'color' || color in colors || flag in styles){
                        statuses.pop(); // 移除最后一个
                        return prefix + styles.reset + suffix + status2text(statuses[statuses.length - 1]);
                    }
                    return all; // 不能识别的语法
                }
                
                var status = cloneObject(statuses[statuses.length - 1]);
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
                        status.style = flag;
                        changed = true;
                    }
                }

                if (!changed){
                    var color = flag.replace(/\b(light?|bg)\b|:/ig, '');
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
                
                return status2text(status);
            }));
        }
        // console.log(JSON.stringify(message.join(' '))); // debug
        console.log(message.join(' '));
    }
    
    exports.log = log;
}(exports);