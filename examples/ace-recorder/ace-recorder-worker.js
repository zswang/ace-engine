this.onmessage = function(e) {
	var data = e.data;
	if (!data) {
		return;
	}
	switch (data.command) {
		case 'record':
			var destLen = 1000;
			var bufferSource = data.buffer[0];
			var bufferDest = new Array(destLen);
			var offsetLen = bufferSource.length / destLen; // 每个单位几个像素
			for (var i = 0; i < destLen; i++) {
				var offset = i * offsetLen;
				var max = 0;
				for (var j = 0; j < offsetLen; j++) {
					max = Math.max(max, Math.abs(bufferSource[parseInt(offset + j)]));
				}
				bufferDest[i] = max;
			}
			this.postMessage({
				command: 'draw',
				buffer: bufferDest
			});
			break;
	}
};