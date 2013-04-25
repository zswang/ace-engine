var AceSound = AceSound || {};

void function(exports){
    // 压缩代码相关
    /* compressor */    
    /**
     * Ace Engine Path
     * 播放声音
     * @see http://code.google.com/p/ace-engine/wiki/AceSound
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */
    var 
        ie = document.all && document.attachEvent,
        /*
         * 是否ie9+
         */
        ie9plus = ie && window.XMLHttpRequest && window.addEventListener && document.documentMode >= 9,

        firefox = /firefox\/\d+\.\d+/i.test(navigator.userAgent),

        opera = /opera(\/| )\d+/i.test(navigator.userAgent),
        /**
         * 只支持ogg声音类型
         */
        ogg = firefox || opera,
        /*
         * 是否支持audio
         */
        audio = !ie || ie9plus,
        /*
         * 声音对象
         */
        soundElement;
    /*
     * 播放声音
     * @param{String} file 文件路径
     * @param{Boolean} loop 是否循环播放
     * @param{pause} pause 是否暂停
     */
    function playSound(file, loop, pause){
        if (audio){ // 用audio播放
            soundElement = soundElement || {};
            try{
                if (!soundElement[file]){
                    soundElement[file] = new Audio(ogg ? file.replace(/\.mp3/, '.ogg') : file);
                    loop && soundElement[file].addEventListener('ended', function(){
                        this.currentTime = 0;
                        this.play();
                    }, false);
                }
                !pause && soundElement[file].play();
            } catch(ex){}
        } else { // 用bgsound播放
            if (!soundElement){
                soundElement = document.createElement('bgsound');
                document.body.appendChild(soundElement);
            }
            if (!pause){
                soundElement.src = file;
            }
            soundElement.loop = loop ? -1 : 0;
        }
    }

    /*
     * 停止声音
     */
    function stopSound(){
        if (!soundElement) return;
        if (audio){ // 用audio播放
            try{
                for (var p in soundElement){
                    soundElement[p].pause();
                }
            } catch(ex){}
        } else { // 用bgsound播放
            soundElement.src = '';
        }
    }

    exports.play = playSound;
    exports.stop = stopSound;
}(AceSound);