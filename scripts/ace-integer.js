var AceInteger = typeof exports == "undefined" ? AceInteger || {} : exports;

void function(exports){
	/**
	 * Ace Engine Integer
	 * 无限进制转换
	 * @see http://code.google.com/p/ace-engine/wiki/AceInteger
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 * @version 1.0
	 * @copyright www.baidu.com
	 */
	/**
	 * 进制字符串
	 */
	var scaleChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";
	
	/**
	 * 向前补零 "1",5 -> "00001"
	 * @param {String} n 整数字符串
	 * @param {Number} len 长度
	 * @return {String} 返回补零后的字符串
	 */
	function fullZero(n, len){
		return new Array(len - n.length + 1).join("0") + n;
	}
	
	/**
	 * 清理整数前面无效的零 "000000001" -> "1"
	 * @param {String} n 整数字符串
	 * @return {String} 返回格式化后的整数字符串
	 */
	function format(n){
		return String(n).replace(/^0+(.+)$/, "$1");
	}
	
	/**
	 * 比较两个整数的大小 "1","0" -> +1
	 * @param {String} a
	 * @param {String} b
	 * @return {Number} a>b返回+1,a==b返回0,a<b返回-1
	 */
	function compare(a, b){
		var i = Math.max(a.length, b.length), ta, tb;
		a = fullZero(a, i);
		b = fullZero(b, i);
		for (i = 0; i < a.length; i++) {
			ta = scaleChars.indexOf(a.charAt(i));
			tb = scaleChars.indexOf(b.charAt(i));
			if (ta < tb) return -1;
			if (ta > tb) return +1;
		}
		return 0;
	}
	
	//console.log(compare("01", "1"));
	//console.log(compare("0a1", "ab1"));
	
	/**
	 * 无限整数加法
	 * @param {String} a 整数1
	 * @param {String} b 整数2
	 * @param {Number} scale 进制 2-64
	 * @return {String} 返回两个数的和
	 */
	function add(a, b, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64) return;
		a = format(a);
		b = format(b);
		var i = Math.max(a.length, b.length), t = 0, result = [];
		a = fullZero(a, i);
		b = fullZero(b, i);
		while (i--) {
			t += scaleChars.indexOf(a.charAt(i));
			t += scaleChars.indexOf(b.charAt(i));
			result.unshift(scaleChars.charAt(t % scale));
			t = t / scale;
		}
		if (t) result.unshift(scaleChars.charAt(t % scale));
		return format(result.join(""));
	}
	
	//console.log(add("19", "1234", 10));
	
	/**
	 * 无限位数乘法函数,单个数乘无限进制整数
	 * @param {String} n 整数
	 * @param {Number} b 单个数
	 * @param {Number} scale 进制 2-64
	 * @return {String} 返回n和b的乘积
	 */
	function byteMul(n, b, scale){
		scale = scale || 10;
		//if (scale < 2 || scale > 64) return;
		var result = [], t = 0, i = n.length;
		while (i--) {
			t = scaleChars.indexOf(n.charAt(i)) * b + t;
			result.unshift(scaleChars.charAt(t % scale));
			t = t / scale;
		}
		if (t) result.unshift(scaleChars.charAt(t % scale));
		return result.join("");
	}
	
	//console.log(byteMul("555", 12, 10));
	//console.log(byteMul("25", 8, 10));
	
	/**
	 * 无限整数乘法
	 * @param {String} a 整数1
	 * @param {String} b 整数2
	 * @param {Number} scale 进制 2-64
	 * @return {String} 返回两个数的乘积
	 */
	function mul(a, b, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64) return;
		a = format(a);
		b = format(b);
		var t = "", result = "", i = b.length;
		while (i--) {
			result = add(result, byteMul(a, scaleChars.indexOf(b.charAt(i)), scale) + t, scale);
			t += "0";
		}
		return result;
	}
	
	//console.log(mul("555", "12", 10)); // 6660
	//console.log(mul("25", "8", 10)); // 200
	
	/**
	 * 无限整数的次方
	 * @param {String} base 指数
	 * @param {String} exponent 幂数
	 * @param {Number} scale 进制 2-64
	 * @return {String} 返回base的exponent次方
	 */
	function power(base, exponent, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64 || exponent < 0) return;
		base = format(base);
		var result = "1", i = exponent;
		while (i--) {
			result = mul(result, base, scale);
		}
		return result;
	}
	
	//console.log(power("2", 10, 10)); // 1024
	
	/**
	 * 将一个字符转换为指定进制
	 * @param {String} c 单个字符
	 * @param {Number} from 来源进制 2-64
	 * @param {Number} to 目标进制 2-64
	 * @return {String} 返回转换后的数字
	 */
	function charDigit(c, from, to){
		//if (from == to || from < 2 || from > 64 || to < 2 || to > 64 || c == "0") return c;
		var result = "0", t = "0";
		while (compare(t, c) < 0) {
			result = add(result, "1", to);
			t = add(t, "1", from);
		}
		return result;
	}
	
	//console.log(charDigit("7", 10, 2)); // 111
	
	/**
	 * 无限整数进制间的转换
	 * @param {String} n 整数
	 * @param {Number} from 来源进制 2-64
	 * @param {Number} to 目标进制 2-64
	 * @return {String} 返回转换后的数字
	 */
	function digit(n, from, to){
		if (from == to || from < 2 || from > 64 || to < 2 || to > 64) return n;
		n = format(n);
		if (n == "0") return n;
		var result = "", base = "1", t = "1", m = scaleChars.charAt(from - 1), l = n.length, i;
		while (compare(t, m) <= 0) {
			base = add(base, "1", to);
			t = add(t, "1", from);
		}
		for (i = 0; i < l; i++) {
			result = add(result, mul(charDigit(n.charAt(l - i - 1), from, to), power(base, i, to), to), to);
		}
		return result;
	}
	
	//console.log(digit("1024", 10, 2)); // 10000000000
	//console.log(digit("7", 10, 2)); // 111
	//console.log(digit("askdjfas91231as", 64, 7)); // 43425343430315560320062336416102
	//console.log(digit(digit("askdjfas91231as", 64, 7), 7, 64)); // askdjfas91231as
	
	
	/**
	 * 无限整数减法
	 * @param {String} a 减数
	 * @param {String} b 被减数
	 * @param {Number} scale 进制 2-64
	 * @return {String} 返回转换后的数字
	 */
	function sub(a, b, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64) return;
		a = format(a);
		b = format(b);
		var i = Math.max(a.length, b.length), t = 0, result = [];
		a = fullZero(a, i);
		b = fullZero(b, i);
		if (a < b) return;
		var t = 0;
		while (i-- > 0) {
			t = scaleChars.indexOf(a.charAt(i)) - t - scaleChars.indexOf(b.charAt(i));
			result.unshift(scaleChars.charAt((t + scale) % scale));
			t = t >= 0 ? 0 : 1;
		}
		result.unshift(scaleChars.charAt(t % scale));
		return format(result.join(""));
	}
	
	//console.log(sub("32", "3", 10)); // 29
	//console.log(sub("1234", "234", 10)); // 1000
	//console.log(sub("23", "17", 10)); // 6
	//console.log(sub("101", "10", 2)); // 11
	
	/**
	 * 无限整数除法
	 * @param {String} a 除数
	 * @param {String} b 被除数
	 * @param {Number} scale 进制 2-64
	 * @return {Array} 返回[商数,余数]
	 */
	function div(a, b, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64) return;
		b = format(b);
		if (b == "0") return;
		a = format(a);
		var div = 0;
		while (compare(a, b) >= 0) {
			var t = b;
			var k = '1';
			while (compare(a, t + "0") >= 0) {
				t += "0";
				k += "0";
			}
			a = sub(a, t, scale);
			div = add(div, k, scale);
		}
		return [div, a];
	}
	//console.log(div("32", "3", 10)); // ["10", "2"]
	
	/**
	 * 无限整数除法，如果是循环小数，则在循环部分加上括号
	 * @param {String} a 除数
	 * @param {String} b 被除数
	 * @param {Number} scale 进制 2-64
	 * @return {Array} 返回[商数,余数]
	 */
	function div2(a, b, scale){
		scale = scale || 10;
		if (scale < 2 || scale > 64) return;
		b = format(b);
		if (b == "0") return;
		a = format(a);
		var num = {};
		var i = 0;
		a = div(a, b, scale);
		var result = "";
		var x = a[0];
		a = a[1];
		while (a != 0 && !(a in num)) {
			num[a] = i++;
			a = div(a + "0", b, scale);
			result += a[0];
			a = a[1];
		}
		if (a != "0") {
			i = num[a];
			return x + "." + result.substring(0, i) + "(" + result.substring(i) + ")";
		}
		return result ? x + "." + result : x;
	}
	//console.log(div2(1, 3)); // 0.(3)
	//console.log(div2(1, 4)); // 0.25
	//console.log(div2(8, 29)); // 0.(2758620689655172413793103448)
	//console.log(div2(58, 7)); // 8.(285714)
	//console.log(div2("11010", "111", 2)); // 11.(101) 
	
	// 公开接口
	exports.add = add;
	exports.mul = mul;
	exports.div = div;
	exports.div2 = div2;
	exports.power = power;
	exports.digit = digit;
	exports.sub = sub;

}(AceInteger);
