var AceGeometric = /^u/.test(typeof exports) ? AceGeometric || {} : exports;
void function(exports){
    /**
     * Ace Engine Geometric
     * 几何函数
     * @see http://code.google.com/p/ace-engine/wiki/AceGeometric
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     */
    
    var 
        math = Math,
        cos = math.cos,
        sin = math.sin,
        PI = math.PI,
        PI2 = PI * 2,
        min = math.min,
        max = math.max,
        atan = math.atan,
        sqrt = math.sqrt,
        pow = math.pow;
        
    /**
     * 获取正负符号
     * @param {Number} x 数值
     * @return 返回x的符号
     */
    function sign(x){
        return x == 0 ? 0 : (x < 0 ? -1 : 1);
    }
    
    /**
     * 计算点到点之间的距离
     * @param {Array[Number,Number]} a 坐标1
     * @param {Array[Number,Number]} b 坐标2
     * @return {Number} 返回点与点间的距离
     */ 
    function pointToPoint(a, b){
          return sqrt(pow(a[0] - b[0], 2) + pow(a[1] - b[1], 2));
    }
    
    /**
     * 计算点的角度
     * @param {Array} origin 圆心坐标
     * @param {Array} point 点坐标
     * @param {Number} eccentricity 离心率
     * @return {Number} 返回角度,单位弧度
     */
    function pointToAngle(origin, point, eccentricity){
        if (typeof eccentricity == 'undefined') eccentricity = 1;
        if (point[0] == origin[0]){
            if (point[1] > origin[1])
                return PI * 0.5;
            return PI * 1.5
        } else if (point[1] == origin[1]){
            if (point[0] > origin[0])
                return 0;
            return PI;
        }
        var t = atan((origin[1] - point[1]) / (origin[0] - point[0]) * eccentricity);
        if (point[0] > origin[0] && point[1] < origin[1])
            return t + 2 * PI;
        if (point[0] > origin[0] && point[1] > origin[1])
            return t;
        return t + PI;
    }
    
    /**
     * 计算点到线段的距离
     * @param {Array[Number,Number]} point 点坐标
     * @param {Array[Number,Number]} a 线段坐标1
     * @param {Array[Number,Number]} b 线段坐标2
     * @return {Number} 返回点到线段的距离
     */
    function pointToLine(point, a, b){
        if (a[0] == b[0] && a[1] == b[1]) return 0;
        var t = ((a[0] - b[0]) * (a[0] - point[0]) + (a[1] - b[1]) * (a[1] - point[1])) /
            ((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
        t = max(0, min(1, t));
        return pointToPoint(point, bezier([a, b], t));
    }
    
    /**
     * 贝赛尔曲线
     * @param{Array[Array[Number, Number],...]} curve 曲线每个参考点
     * @param{Number} rate 比率
     * @return{}
     */
    function bezier(curve, rate){
        if (!curve || !curve.length) return [];
        if (curve.length == 1) return [curve[0][0], curve[0][1]];
        if (curve.length == 2) return [
            curve[0][0] + (curve[1][0] - curve[0][0]) * rate,
            curve[0][1] + (curve[1][1] - curve[0][1]) * rate
        ];
        var temp = [];
        for (var i = 1; i < curve.length; i++){
            temp.push(bezier([curve[i - 1], curve[i]], rate));
        }
        return bezier(temp, rate);
    }
    
    /**
     * 将一条曲线剪成两段
     * @param {Array[Array[Number, Number],...]} curve 曲线每个参考点
     * @param {Number} rate 比率
     * @return {Array[Array,Array]} 返回被裁剪后的两条曲线坐标
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
    /**
     * 旋转一个点坐标
     * @param {Array} point 目标坐标
     * @param {Array} center 中心点
     * @param {Number} angle 选择角度，单位:弧度
     * @return {Array} 返回旋转后的坐标
     */
    function rotatePoint(point, center, angle){
        var radius = pointToPoint(center, point);
        angle = pointToAngle(center, point) + angle;
        return [
            center[0] + Math.cos(angle) * radius,
            center[1] + Math.sin(angle) * radius
        ];
    }

    /**
     * 获取两条线段的交点
     * @param {Array[Number,Number]} a 第一条线段坐标1
     * @param {Array[Number,Number]} b 第一条线段坐标2
     * @param {Array[Number,Number]} c 第二条线段坐标1
     * @param {Array[Number,Number]} d 第二条线段坐标2
     * @return {Array[Number,Number]} 返回两条线段的交点坐标
     */
    function doubleLineIntersect(a, b, c, d){
        var delta = (b[1] - a[1]) * (d[0] - c[0]) -
            (d[1] - c[1]) * (b[0] - a[0]);
        if (delta == 0) return;
        var x = (                                                           
                (b[0] - a[0]) *
                (d[0] - c[0]) *
                (c[1] - a[1]) +
                
                (b[1] - a[1]) *
                (d[0] - c[0]) *
                a[0] -
                
                (d[1] - c[1]) *
                (b[0] - a[0]) * c[0]
            ) / delta,
            y = (
                (b[1] - a[1]) *
                (d[1] - c[1]) *
                (c[0] - a[0]) +
                
                (b[0] - a[0]) *
                (d[1] - c[1]) *
                a[1] -
                
                (d[0] - c[0]) *
                (b[1] - a[1]) *
                c[1]
            ) / -delta;
            
        if (
            (sign(x - a[0]) * sign(x - b[0]) <= 0) &&
            (sign(x - c[0]) * sign(x - d[0]) <= 0) &&
            (sign(y - a[1]) * sign(y - b[1]) <= 0) &&
            (sign(y - c[1]) * sign(y - d[1]) <= 0)
        ){
            return [x, y];
        }
    }

    function pointToPolyline(point, polyline){
        if (!point || !polyline || !polyline.length) return;
        var result = pointToPoint(point, polyline[0]);
        for (var i = 1, l = polyline.length; i < l; i++){
            result = min(result, pointToLine(point, polyline[i - 1], polyline[i]));
        }
        return result;
    }

    exports.pointToPoint = pointToPoint;
    exports.pointToLine = pointToLine;
    exports.pointToPolyline = pointToPolyline;
    exports.bezier = bezier;
    exports.cutBezier = cutBezier;
    exports.pointToAngle = pointToAngle;
    exports.doubleLineIntersect = doubleLineIntersect;
    exports.rotatePoint = rotatePoint;
}(AceGeometric);