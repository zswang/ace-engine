var AceHeatmap = /^u/.test(typeof exports) ? AceHeatmap || {} : exports;

void function(exports){
	/**
	 * Ace Engine Template
	 * 一套基于HTML和JS语法自由穿插的模板系统
	 * @link http://www.patrick-wied.at/static/heatmapjs
	 * @see http://code.google.com/p/ace-engine/wiki/AceHeatmap
	 * @author 王集鹄(wangjihu,http://weibo.com/zswang) 徐山川(xushanchuan,http://weibo.com/alistapart)
	 * @version 2011-07-06 
 	 * @copyright (c) 2011, Baidu Inc, All rights reserved.
	 */
	
	/*
	 * 生成热力图调色板
	 * @param{Object} gradient 透明度对应颜色变化
	 */
	function colorPalette(gradient){
		var canvas = document.createElement("canvas");
		canvas.width = "1";
		canvas.height = "256";
		var ctx = canvas.getContext("2d"),
			grad = ctx.createLinearGradient(0, 0, 1, 256);
		gradient = gradient || {
			0.45: "#00f",
			0.55: "#0ff",
			0.65: "#0f0",
			0.95: "#ff0",
			1.00: "#f00"
		};
		for (var x in gradient){
			grad.addColorStop(x, gradient[x]);
		}
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 1, 256);
		return ctx.getImageData(0, 0, 1, 256).data;
	}
	/*
	 * 创建热力图对象
	 * @param{Object} options 选项
	 */
	function Heatmap(options){
		if (!options.canvas) return;
		var _points = {},
			/*
			 * 固定最大值
			 */
			_staticMax = options.staticMax || 0,
			_max = options.max || 1, 
			_papercut = options.papercut || 0,
			_radiusIn = options.radiusIn || 15,
			_radiusOut = options.radiusOut || 40,
			_origin = options.origin || [0, 0, 0],
			_canvasMap = options.canvas,
			_width = _canvasMap.width,
			_height = _canvasMap.height,
			_canvasAlpha = document.createElement('canvas'),
			_contextMap = _canvasMap.getContext("2d"),
			_contextAlpha = _canvasAlpha.getContext("2d"),
			_palette = colorPalette(options.gradient);
		_canvasAlpha.width = _width;
		_canvasAlpha.height = _height;
		//document.body.appendChild(_canvasAlpha);
		/*
		 * 对指定区域进行alpha着色
		 * @param{Number} x
		 * @param{Number} y
		 * @param{Number} width
		 * @param{Number} height
		 */
		function colorize(x, y, width, height){
			x = Math.max(0, x);
			y = Math.max(0, y);
			width = Math.min(width, _width - x);
			height = Math.min(height, _height - y);
			var image = _contextAlpha.getImageData(x, y, width, height),
				imageData = image.data,
				length = imageData.length;
			for(var i = 3; i < length; i+=4){
				var alpha = imageData[i];
				if (_papercut){
					imageData[i - 3] = imageData[i - 2] = imageData[i - 1] = 0;
					imageData[i] = 255 - alpha;
				} else if (alpha) {
					var offset = alpha * 4;
					imageData[i - 3] = _palette[offset];
					imageData[i - 2] = _palette[offset + 1];
					imageData[i - 1] = _palette[offset + 2];
					imageData[i] = alpha;
				}
			}

			image.data = imageData;
			_contextMap.putImageData(image, x, y);
		}
		/*
		 * 绘制热力点
		 * @param{Number} x
		 * @param{Number} y
		 * @param{Number} rate 比率
		 */
		function drawAlpha(x, y, rate){
			var gradient = _contextAlpha.createRadialGradient(x, y, _radiusIn, x, y, _radiusOut),
				xb = x - _radiusOut, yb = y - _radiusOut, mul = 2 * _radiusOut;
				gradient.addColorStop(0, 'rgba(0,0,0,' + rate.toFixed(2) + ')');
				gradient.addColorStop(1, 'rgba(0,0,0,0)');
			_contextAlpha.fillStyle = gradient;  
			_contextAlpha.fillRect(xb, yb, mul, mul);
		}
		/*
		 * 设置需要绘制的点阵
		 */
		function _setData(data){
			if (!data) return;
			
			_max = 0;
			_points = {};
			data.forEach(function(item){
				_addPoint(
					item[0] || item.x || 0, item[1] || item.y || 0, 
					item[2] || item.total || item.count || 0
				);
			});
		}
		
		function _addPoint(x, y, total){
			var point = _points[[x, y]];
			if (!point){
				point = _points[[x, y]] = {
					x: x,
					y: y,
					total: 0
				};
			}
			point.total += total;
			_max = Math.max(_max, point.total);
		}
		
		function _draw(data){
			data && _setData(data);
			_contextAlpha.clearRect(0, 0, _width, _height);
			_contextMap.clearRect(0, 0, _width, _height);
			for (var p in _points){
				var item = _points[p];
				var x = item.x - _origin[0],
					y = item.y - _origin[1];
				xb = x - _radiusOut, yb = y - _radiusOut, mul = 2 * _radiusOut;
				if (xb + mul < 0 || yb + mul < 0) continue;
				if (xb > _width || yb > _height) continue;
				drawAlpha(x, y, item.total / (_staticMax || _max));
			}
			colorize(0, 0, _width, _height);
		}
		function _setOrigin(value){
			if (!value) return;
			if (!(value instanceof Array)) value = [value.x || 0, value.y || 0];
			if (value.join() == _origin) return;
			_origin = value;
			_draw();
		}
		function _getOrigin(){
			return _origin;
		}
		function _moveOrigin(offset){
			_setOrigin([
				_origin[0] + (offset[0] || offset.x || 0),
				_origin[1] + (offset[1] || offset.x || 0)
			]);
		}
		function _clear(){
			_max = 0;
			_points = {};
			_contextAlpha.clearRect(0, 0, _width, _height);
			_contextMap.clearRect(0, 0, _width, _height);
		}
		function _free(){
			_contextAlpha.width = _contextAlpha.height = 0; // 回收内存
		}
		function _add(data, inOrigin){
			var x = data[0] || data.x || 0,
				y = data[1] || data.y || 0,
				total = data[2] || data.total || data.count || 0,
				oldMax = _max;
			if (inOrigin){
				x += _origin[0];
				y += _origin[1];
			}
			_addPoint(x, y, total);
			if (_staticMax || oldMax == _max){
				x -= _origin[0];
				y -= _origin[1];
				drawAlpha(x, y, total / (_staticMax || _max));
				colorize(x - _radiusOut, y - _radiusOut, _radiusOut * 2, _radiusOut * 2);
			} else {
				_draw();
			}
		}
		function _setPapercut(value){
			if (!value == !_papercut) return;
			_papercut = value;
			_draw();
		}
		function _getCanvas(){
			return _canvasMap;
		}
		return {
			setData: _setData,
			setOrigin: _setOrigin,
			getOrigin: _getOrigin,
			moveOrigin: _moveOrigin,
			setPapercut: _setPapercut,
			add: _add,
			getCanvas: _getCanvas,
			clear: _clear,
			draw: _draw,
			free: _free
		};
	}

	exports.createHeatmap = function(options){
		return Heatmap(options);
	}
}(AceHeatmap);