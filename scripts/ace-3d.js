var Ace3D = /^u/.test(typeof exports) ? Ace3D || {} : exports;

void function(exports){
	
	/*
	 * see http://www.bitstorm.it/blog/en/2011/05/3d-sphere-html5-canvas/
	 */
	
	var math = Math, sin = math.sin, cos = math.cos,
		rotate_changes = [[1, 2], [0, 2], [0, 1]];

	function rotate(point, radians, index){
		if (!point) return;
		var indexs = point instanceof Array ? [0, 1, 2] : ['x', 'y', 'z'],
			t = point[indexs[rotate_changes[index][0]]],
			p = point[indexs[rotate_changes[index][1]]];
		point[indexs[rotate_changes[index][0]]] = 
			t * cos(radians) - p * sin(radians);
		point[indexs[rotate_changes[index][1]]] = 
			t * sin(radians) + p * cos(radians);
	}

	function rotateX(point, radians){
		rotate(point, radians, 0);
	}

	function rotateY(point, radians){
		rotate(point, radians, 1);
	}

	function rotateZ(point, radians){
		rotate(point, radians, 2);
	}
	
	function projection(xy, z, xyOffset, zOffset, distance){
		return (distance * xy) / (z - zOffset) + xyOffset;
	}

	/*
	 * 贝赛尔曲线
	 * @param{Array[Array[Number, Number, Number],...]} curve 曲线每个参考点
	 * @param{Number} rate 比率
	 */
	function bezier(curve, rate){
		if (!curve || !curve.length) return [];
		if (curve.length == 1) return [curve[0][0], curve[0][1], curve[0][2]];
		if (curve.length == 2) return [
			curve[0][0] + (curve[1][0] - curve[0][0]) * rate,
			curve[0][1] + (curve[1][1] - curve[0][1]) * rate,
			curve[0][2] + (curve[1][2] - curve[0][2]) * rate
		];
		var temp = [];
		for (var i = 1; i < curve.length; i++){
			temp.push(bezier([curve[i - 1], curve[i]], rate));
		}
		return bezier(temp, rate);
	}
	
	/*
	 * 将一条曲线剪成两段
	 * @param{Array[Array[Number, Number, Number],...]} curve 曲线每个参考点
	 * @param{Number} rate 比率
	 */
	function cutBezier(curve, rate){
		if (!curve || curve.length < 2) return;
		var pa = curve[0], pb = curve[curve.length - 1],
			ta = [], tb = [],
			ra = [], rb = [];
		for (var i = 0; i < curve.length; i++){
			ta.push(curve[i]);
			ra.push(bezier(ta, rate));

			tb.unshift(curve[curve.length - i - 1]);
			rb.unshift(bezier(tb, rate));
		}
		return [ra, rb];
	}

	exports.rotateX = rotateX;
	exports.rotateY = rotateY;
	exports.rotateZ = rotateZ;
	exports.projection = projection;
	exports.bezier = bezier;
	exports.cutBezier = cutBezier;
}(Ace3D);