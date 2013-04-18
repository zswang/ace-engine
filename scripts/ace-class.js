var AceClass = /^u/.test(typeof exports) ? AceClass || {} : exports;

void function(exports){
	/**
	 * 运行上级方法
	 */
    function base(){
		var m = arguments.callee.caller; // 获得调用者
		if (!m.__parentMethod) return;
		return m.__parentMethod.apply(this, arguments)
	}
	
	/**
	 * 查询绑定关系
	 * @param {Function} parent 父类构造函数
	 * @param {Function} child 子类构造函数
	 */
	function bindFrom(parent, child){
		if (!(parent instanceof Function &&
			child instanceof Function)) return;
		return scanParent(child.prototype, function(item){
			return parent.prototype == item;
		});
	}

	/**
	 * 扫描父类原型链
	 * @param {Object} __child 原型链
	 * @param {Function} scaner 扫描函数 function(item){} item 为当前扫描的原型链
	 * @param {Boolean} start 是否扫描自己
	 */
	function scanParent(__child, scaner, start){
		if (!(__child && scaner instanceof Function)) return;
		if (start && scaner(__child)) return true;
		var __parents = __child.__parents, i;
		if (!__parents) return;
		for (i = 0; i < __parents.length; i++){
			if (scaner(__parents[i]) || scanParent(__parents[i], scaner)) return true;
		}
	}

	/**
	 * 绑定
	 * @param {Function} parent 父类构造器
	 * @param {Function} child 子类构造器
	 */
	function bind(parent, child){
		if (!(parent instanceof Function && child instanceof Function) ||
			bindFrom(parent, child) || // 不能重复继承
			bindFrom(child, parent) // 不能嵌套继承
		) return;
		//console.log(parent, child);
		var __child = child.prototype,
			__parent = parent.prototype,
			p, m;

		__child.__parents = __child.__parents || []; // 确保存在
		__child.__parents.push(__parent); // 添加父原型链
		__child.base = base; // 指定父方法

		for (p in __child){ // 寻找方法的上级方法
			m = __child[p];
			if (m instanceof Function && m != base){
				scanParent(__parent, function (item){
					if (item[p]){
						m.__parentMethod = item[p];
						return true;
					}
				}, true);
			}
		}

		scanParent(__parent, function (item){ // 克隆原型链属性
			for (var p in item){
				if (!(/^_/.test(p) || p in __child)){ // 不扫描克隆私有属性和覆盖
					__child[p] = item[p];
				}
			}
		}, true);
	}
	/*
	 * 进行树状绑定
	 * @param {Array} node 树状节点
	 * @param {Function} parent 父类构造器，可选项
	 * @example
[
	A, [
		A1, [
			A1a,
			A1b
		],
		A2
	],
	B,
	C
]
	 */
	function tree(node, parent){
		if (!node || !(node instanceof Array)) return;
		var last;
		for (var i = 0; i < node.length; i++){
			if (node[i] instanceof Array){
				last && tree(node[i], last);
			} else {
				bind(parent, last = node[i]);
			}
		}
	}
	exports.bind = bind;
	exports.tree = tree;
	exports.bindFrom = bindFrom;
}(AceClass);