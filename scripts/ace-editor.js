var AceEditor = /^u/.test(typeof exports) ? AceEditor || {} : exports;
void function(exports){
    /**
     * Ace Engine Editor
     * 文本编辑器函数
     * @see http://code.google.com/p/ace-engine/wiki/AceEditor
     * @author 王集鹄(wangjihu,http://weibo.com/zswang)
     * @version 1.0
     * @copyright www.baidu.com
     * @date 2012-01-29
     */
    /*
     * 简写
     */
    var str_selectionStart = 'selectionStart';

    /**
     * 设置选择范围
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @param{Array[start,end]} range 选择范围
     */
    function setSelectRange(editor, range){
        if (!editor) return;
        var start = Math.min(range[0], range[1]),
            end = Math.max(range[0], range[1]);
        if (editor.setSelectionRange){
            editor.focus();
            editor.setSelectionRange(start, end);
        } else if (editor.createTextRange){
            var textRange = editor.createTextRange();
            textRange.collapse(true);
            textRange.moveEnd("character", end);
            textRange.moveStart("character", start);
            textRange.select();
        }
    }

    /**
     * 修改选中处文本
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @param{String} value 文本值
     * @param{Array[start,end]} range 指定选择范围
     */
    function setSelectText(editor, value, range){
        if (!editor) return;
        range ? setSelectRange(editor, range) : editor.focus();
        if (str_selectionStart in editor){
            var str = editor.value,
                start = editor.selectionStart,
                scroll = [editor.scrollLeft, editor.scrollTop];
            editor.value = str.slice(0, start) + value +
                str.slice(editor.selectionEnd);
            editor.selectionStart = editor.selectionEnd = start + value.length;
            editor.scrollLeft = scroll[0]
            editor.scrollTop = scroll[1];
        } else if (editor.document && editor.document.selection){
            var textRange = editor.document.selection.createRange();
            textRange.text = value;
            textRange.select();
        }
    }
    
    function _calcBookmark(bookmark) {
        return (bookmark.charCodeAt(0) - 1) +
            (bookmark.charCodeAt(3) - 1) * 65536 +
            (bookmark.charCodeAt(2) - 1);
    }

    function _getSelectPos(editor, isend) {
        if (!editor) return;
        if (str_selectionStart in editor)
            return isend ? editor.selectionEnd : editor.selectionStart;
        if (!editor.createTextRange || !editor.document) return;
        editor.focus();
        var range = editor.document.selection.createRange().duplicate();
        if (!isend) range.collapse(true)
        range.setEndPoint("StartToEnd", range);
        return _calcBookmark(range.getBookmark()) -
            _calcBookmark(editor.createTextRange().getBookmark());
    }

    /**
     * 获取选中开始位置
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @return{Number} 返回选中开始位置
     */
    function getSelectStart(editor){
        return _getSelectPos(editor);
    }
    /**
     * 获取选中结束位置
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @return{Number} 返回选中结束位置
     */
    function getSelectEnd(editor){
        return _getSelectPos(editor, true);
    }
    /**
     * 获取选中范围
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @return{Array[start,end]} 返回选中范围
     */
    function getSelectRange(editor){
        return [getSelectStart(editor), getSelectEnd(editor)];
    }
    /**
     * 返回当前选中的文字
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @return{String} 返回当前选中文字（会去掉\r）
     */
    function getSelectText(editor){
        if (!editor) return;
        if (str_selectionStart in editor)
            return editor.value.slice(editor.selectionStart, editor.selectionEnd);
        if (editor.document && editor.document.selection){
            editor.focus();
            return editor.document.selection.createRange().text.replace(/\r\n?/g, '\n');
        }
    }
    /*
     * 获取编辑框内容(去掉ie中"\r"的干扰)
     * @param{Element} editor 编辑器(<input>|<textarea>)
     * @return{String} 返回编辑框内容（会去掉\r）
     */
    function getValue(editor){
        if (!editor) return;
        return editor.value.replace(/\r\n?/g, '\n')
    }

    exports.setSelectRange = setSelectRange;
    exports.getSelectRange = getSelectRange;

    exports.setSelectText = setSelectText;
    exports.getSelectText = getSelectText;

    exports.getSelectStart = getSelectStart;
    exports.getSelectEnd = getSelectEnd;
    
    exports.getValue = getValue;
    var extend = (window.jQuery && jQuery.fn.extend) || 
        (window.baidu && baidu.dom && baidu.dom.extend); // http://tangram.baidu.com
    extend && extend({
        selectRange: function(range){
            if (/^u/.test(typeof range)){ // 取值
                return getSelectRange(this.first());
            } else {
                return this.each(function(){
                    setSelectRange(this, range);
                });
            }
        },
        selectText: function(text){
            if (/^u/.test(typeof text)){ // 取值
                return getSelectText(this.first());
            } else {
                return this.each(function(){
                    setSelectText(this, text);
                });
            }
        },
        selectStart: function(position){
            if (/^u/.test(typeof position)){ // 取值
                return getSelectStart(this.first());
            } else {
                return this.each(function(){
                    setSelectStart(this, position);
                });
            }
        },
        selectEnd: function(position){
            if (/^u/.test(typeof position)){ // 取值
                return getSelectEnd(this.first());
            } else {
                return this.each(function(){
                    setSelectEnd(this, position);
                });
            }
        }
    });
}(AceEditor);

