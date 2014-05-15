var AcePathData = AcePathData || {};

void function(exports) {
    /**
     * Ace Engine Path Data
     * 路径数据处理
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */

    function lineToCurve(p1, p2) {
        return [[p1[0], p1[1]], [p2[0], p2[1]], [p2[0], p2[1]]];
    }

    /**
     * 解析路径字符串
     * @param{String} path 路径字符串
     * return{Array} 返回路径数组
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

    /**
     * 将路径数组格式化
     * @param{Array} arr 路径数组
     * return{String} 返回路径字符串
     */
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

    /**
     * 将路径节点处理成曲线节点
     * @param{Array|String} arr 路径数组或路径字符串
     * return{Array} 返回路径数组
     */
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
    				result.push(['C', lineToCurve(moved, start)]);
    				break;
    			case 'L':
    			 	result.push(['C', lineToCurve(start, item[1][0])]);
    				break;
    		}
    	}
    	return result;
    }

    /**
     * 对齐两条路径
     * @param{Array|String} path1 路径数组或路径字符串1
     * @param{Array|String} path2 路径数组或路径字符串2
     * return{Array} 返回路径数组
     */
    function alignment(path1, path2) {
    	if (!path1 || !path2) {
    		return;
    	}
    	var curve1 = parseCurve(path1);
    	var curve2 = parseCurve(path2);
    	var moved1 = [0, 0];
    	var moved2 = [0, 0];
    	var maxLength = Math.max(curve1.length, curve2.length);

    	function fix(c1, c2, m1, m2, index) {
    		var item1 = c1[index];
    		if (!item1) {
    			return;
    		}
    		var item2 = c2[index];
    		if (!item2) {
    			c2.splice(index, 0, ["C", lineToCurve(m2, m2)]);
    			return true;
    		}
    		switch (item1[0]) {
    			case 'M':
    				m1[0] = item1[1][0][0];
    				m1[1] = item1[1][0][1];
    				if (item2[0] != 'M') {
    					c2.splice(index, 0, ["M", [[m2[0], m2[1]]]]);
    					return true;
    				}
    				break;
    			case 'C':
    				m1[0] = item1[1][2][0];
    				m1[1] = item1[1][2][1];
    				break;
    		}
    	}

    	var i = 0;
    	while(true) {
    		if (!curve1[i] && !curve2[i]) {
    			break;
    		}
			if (fix(curve1, curve2, moved1, moved2, i)) {
				continue;
			}
			if (fix(curve2, curve1, moved2, moved1, i)) {
				continue;
			}
    		i++;
    	}
    	return [curve1, curve2];
    }

    exports.alignment = alignment;

    exports.parseData = parseData;
    exports.stringify = stringify;
    exports.parseCurve = parseCurve;
}(AcePathData);