var AceRecorder = AceRecorder || {};
void function (exports) {
    /**
     * Ace Engine Recorder
     * 一套录音控件
     * @see http://www.w3.org/TR/webaudio
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     */

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

    function Recorder(options) {
        options = options || {};
        var bufferLen = options.bufferLen || 4096;
        var workerPath = options.workerPath || 'ace-recorder-worker.js';
        try {
            var context = options.context || new AudioContext;
        } catch (ex) {
        }
        var recording;
        var worker;
        var onmessage = options.onmessage;
        var onerror = options.onerror;
        var oninit = options.init;
        var input;
        var node;
        var initCompleted;

        function init() {
            if (initCompleted) {
                return;
            }
            initCompleted = true;
            getUserMedia.call(navigator, { audio: true }, function(stream) {
                worker = new Worker(workerPath);
                worker.onmessage = function(e) {
                    console.log('worker.onmessage');
                    if (onmessage) {
                        onmessage(e);
                    }
                };
                input = context.createMediaStreamSource(stream);
                node = (context.createScriptProcessor ||
                    context.createJavaScriptNode).call(
                    context, bufferLen, 2, 2);
                node.onaudioprocess = function(e) {
                    if (!recording) return;
                    var buffer = e.inputBuffer.getChannelData(0);
                    worker.postMessage({
                        command: 'record',
                        buffer: [
                            e.inputBuffer.getChannelData(0),
                            e.inputBuffer.getChannelData(1)
                        ]
                    });
                };

                if (oninit) {
                    oninit();
                }
                connect();
            }, function(e) {
                if (onerror) {
                    onerror(e);
                }
            });  
        }

        function connect() {
            input.connect(node);
            input.connect(context.destination);
            node.connect(input.context.destination); // this should not be necessary
        }

        this.start = function() {
            if (recording) {
                return;
            }
            recording = true;
            if (initCompleted) {
                connect();
            } else {
                init();
            }
        };

        this.stop = function() {
            if (!recording) {
                return;
            }
            recording = false;
            input.disconnect();
            node.disconnect();
        };

        this.postMessage = function(data) {
            if (!recording) {
                return;
            }
            worker.postMessage(data);
        };

        this.getRecording = function() {
            return recording;
        };
    }

    exports.create = function(options) {
        return new Recorder(options);
    }

}(AceRecorder);