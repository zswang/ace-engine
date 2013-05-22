var Ace3D = typeof exports == 'undefined' ? Ace3D || {} : exports;

void function(exports){
    
    /*
     * see http://www.bitstorm.it/blog/en/2011/05/3d-sphere-html5-canvas/
     */
    
    var math = Math,
        sin = math.sin,
        cos = math.cos,
        /**
         * 旋转轴线
         */
        rotate_axis = {
            x: [1, 2],
            y: [0, 2],
            z: [0, 1]
        };

    /**
     * 旋转坐标
     * @param{Array|Object} point 原坐标
     * @param{Number} radians 选择角度，单位弧度
     * @param{String} axis 轴线 'x','y','z'
     */
    function rotate(point, radians, axis){
        if (!point) return;
        var indexs = point instanceof Array ? [0, 1, 2] : ['x', 'y', 'z'],
            t = point[indexs[rotate_axis[axis][0]]],
            p = point[indexs[rotate_axis[axis][1]]];
        point[indexs[rotate_axis[axis][0]]] = 
            t * cos(radians) - p * sin(radians);
        point[indexs[rotate_axis[axis][1]]] = 
            t * sin(radians) + p * cos(radians);
        return point;
    }
    /**
     * 旋转x轴
     * @param{Array|Object} point 原坐标 
     * @param{Number} radians 选择角度，单位弧度
     */
    function rotateX(point, radians){
        return rotate(point, radians, 'x');
    }

    /**
     * 旋转y轴
     * @param{Array|Object} point 原坐标 
     * @param{Number} radians 选择角度，单位弧度
     */
    function rotateY(point, radians){
        return rotate(point, radians, 'y');
    }

    /**
     * 旋转z轴
     * @param{Array|Object} point 原坐标 
     * @param{Number} radians 选择角度，单位弧度
     */
    function rotateZ(point, radians){
        return rotate(point, radians, 'z');
    }
    
    /**
     * 将3D坐标投影到2D
     * @param{Array} point 原坐标
     * @param{Number} zOffset z轴偏移
     * @param{Number} distance 距离
     */
    function projection(point, zOffset, distance){
        var indexs = point instanceof Array ? [0, 1, 2] : ['x', 'y', 'z'];
        var result = point instanceof Array ? [] : {};
        result[indexs[0]] = (distance * point[indexs[0]]) / (point[indexs[2]] - zOffset);
        result[indexs[1]] = (distance * point[indexs[1]]) / (point[indexs[2]] - zOffset);
        return result;
    }
    
    // /**
     // * p1--------p2
     // * |          |
     // * p3--------p4
     // */
    // function matrix(p1, p2, p3, p4){
        // var indexs = p1 instanceof Array ? [0, 1] : ['x', 'y'];
        // var tx = p1[indexs[0]];
        // var ty = p1[indexs[1]];

        // var a = (p2[indexs[0]] - tx) / 2;
        // var b = (ty - p1[indexs[1]]) / 2;

        // var c = (p3[indexs[0]] - tx) / 2;
        // var d = (ty - p3[indexs[1]]) / 2;

        // return [a, b, c, d, tx, ty];
    // }
    
    exports.rotate = rotate;
    exports.rotateX = rotateX;
    exports.rotateY = rotateY;
    exports.rotateZ = rotateZ;
    exports.projection = projection;

}(Ace3D);