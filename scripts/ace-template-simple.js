var AceTemplate = /^u/.test(typeof exports) ? AceTemplate || {} : exports;

void function(exports){
	/**
	 * Ace Engine Template Simple
	 * 一套基于HTML和JS语法自由穿插的模板系统
	 * 特殊版（只考虑“<>”为html、无xss防止的版本）
	 * @see http://code.google.com/p/ace-engine/wiki/AceTemplate
	 * @author 王集鹄(wangjihu,http://weibo.com/zswang) 鲁亚然(luyaran,http://weibo.com/zinkey)
	 * @version 2012-01-06 
 	 * @copyright (c) 2011, Baidu Inc, All rights reserved.
	 */

	/**
	 * 构造模板的处理函数
	 * 不是JS块的规则
	 * 	非主流字符开头
	 * 		示例：#、<div>
	 * 		正则：/^\s*[#<].*$/mg
	 * @param {String} template 模板字符
	 */
	function analyse(template) {
		var body = [];
		body.push("with(this){");
		body.push(template
			.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, function(all) {
				return ['#{decodeURIComponent("', encodeURIComponent(all), '")}'].join('');
			})
			.replace(/[\r\n]+/g, "\n") // 去掉多余的换行，并且去掉IE中困扰人的\r
			.replace(/^\n+|\s+$/mg, "") // 去掉空行，首部空行，尾部空白
			.replace(/((^\s*[#<].*$)\s?)+/mg, function(expression) { // 输出原文
				expression = ['"', expression
					.replace(/&none;/g, "") // 空字符
					.replace(/["'\\]/g, "\\$&") // 处理转义符
					.replace(/\n/g, "\\n") // 处理回车转义符
					.replace(/(!?#)\{(.*?)\}/g, function (all, flag, value) { // 变量替换
						value = value.replace(/\\n/g, "\n").replace(/\\([\\'"])/g, "$1"); // 还原转义
						var identifier = /^[a-z$][\w+$]+$/i.test(value) &&
							!(/^(true|false|NaN|null|this)$/.test(value)); // 单纯变量，加一个未定义保护
						return ['",', 
							identifier ? ['typeof ', value, '=="undefined"?"":'].join("") : "", 
							value, ',"'].join("");
					}), '"'].join("").replace(/^"",|,""$/g, "");
				if (expression)
					return ['_output_.push(', expression, ');'].join("");
				else return "";
			}));
		body.push("}");
		return new Function("_output_", "helper", body.join(""));
	}
	
	/**
	 * 获得模板渲染函数
	 * @param {String} template 模板本身
	 */
	function rander(template){
		var fn = analyse(template);
		return function(data, helper){
			var output = [];
			fn.call(data, output, helper);
			return output.join("");
		};
	}

	/**
	 * 格式化输出
	 * @param {String} template 模板本身
	 * @param {Object} data 格式化的数据，默认为空字符串
	 * @param {Object} helper 附加数据(默认为模板对象)
	 */
	exports.format = function(template, data, helper){
		if (!template) return "";
		return rander(template)(data, helper);
	};
	
	exports.rander = rander;
}(AceTemplate);