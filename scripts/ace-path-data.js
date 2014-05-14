var AcePathData = AcePathData || {};

void function(exports) {
    /**
     * Ace Engine Path Data
     * 路径数据处理
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */

    function l2c(p1, p2) {
        return [[p1[0], p1[1]], [p2[0], p2[1]], [p2[0], p2[1]]];
    }

    /**
     * 解析路径字符串
     */
    function parseData(path) {
        var result = []; // [flag, [p1, p2, p3...]]
        String(path).replace(/([MLCZ])((\s*,?\s*([+-]?\d+(?:\.\d+)?)+)*)/g, function(all, flag, params) {
            switch (flag) {
                case 'M':
                case 'L':
                    params.replace(/\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi, 
                        function(all, x, y) {
                            result.push([flag, [[+x, +y]]]);
                        }
                    );
                    break;
                case 'C':
                    params.replace(
                        /\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)\s*,?\s*([+-]?\d+(?:\.\d+)?)/gi, function(
                            all, x1, y1, x2, y2, x3, y3){
                        result.push(['C', [
                            [+x1, +y1],
                            [+x2, +y2],
                            [+x3, +y3]
                        ]]);
                    });
                    break;
                case 'Z':
                    result.push(['Z']);
                    break;
            }            
        });
		return result;
    }

    function stringify(arr) {
    	var result = [];
    	for (var i = 0; i < arr.length; i++) {
    		var item = arr[i];
    		if (item[0] == 'Z') {
    			result.push('Z');
    		} else {
    			result.push([item[0], item[1].join(' ')].join(' '));
    		}
    	}
    	return result.join(' ');
    }

    function parseCurve(arr) {
    	if (!arr) return arr;
    	if (typeof arr == 'string') {
    		arr = parseData(arr);
    	}
    	var result = [];
    	var start = [0, 0];
    	var moved = [0, 0];
    	for (var i = 0; i < arr.length; i++) {
    		var item = arr[i];
    		switch (item[0]) {
    			case 'M':
    				start = [item[1][0][0], item[1][0][1]];
    				moved = start;
    				result.push(['M', [[start[0], start[1]]]]);
    				break;
    			case 'C':
    				moved = [item[1][2][0], item[1][2][1]];
    				result.push(['C', [
    					[item[1][0][0], item[1][0][1]],
    					[item[1][1][0], item[1][1][1]],
    					[item[1][2][0], item[1][2][1]]
					]]);
    				break;
    			case 'Z':
    				result.push(['C', l2c(moved, start)]);
    				break;
    			case 'L':
    			 	result.push(['C', l2c(start, item[1][0])]);
    				break;
    		}
    	}
    	return result;
    }

    exports.parseData = parseData;
    exports.stringify = stringify;
    exports.parseCurve = parseCurve;
}(AcePathData);