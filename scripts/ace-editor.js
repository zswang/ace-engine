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
	var str_document = 'document',
		str_charCodeAt = 'charCodeAt',
		str_selectionStart = 'selectionStart',
		str_selectionEnd = 'selectionEnd',
		str_createTextRange = 'createTextRange',
		str_selection = 'selection',
		str_createRange = 'createRange',
		str_getBookmark = 'getBookmark',
		str_scrollLeft = 'scrollLeft',
		str_scrollTop = 'scrollTop',
		str_value = 'value',
		str_focus = 'focus',
		str_setSelectionRange = 'setSelectionRange';

	/**
	 * 设置选择范围
	 * @param{Element} editor 编辑器(<input>|<textarea>)
	 * @param{Array[start,end]} range 选择范围
	 */
	function setSelectRange(editor, range){
		if (!editor) return;
		var start = Math.min(range[0], range[1]),
			end = Math.max(range[0], range[1]);
		if (editor[str_setSelectionRange]){
			editor[str_focus]();
			editor[str_setSelectionRange](start, end);
		} else if (editor[str_createTextRange]){
			var textRange = editor[str_createTextRange]();
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
		range ? setSelectRange(editor, range) : editor[str_focus]();
		if (str_selectionStart in editor){
			var str = editor[str_value],
				start = editor[str_selectionStart],
				scroll = [editor[str_scrollLeft], editor[str_scrollTop]];
			editor[str_value] = str.slice(0, start) + value +
				str.slice(editor[str_selectionEnd]);
			editor[str_selectionStart] = editor[str_selectionEnd] = start + value.length;
			editor[str_scrollLeft] = scroll[0]
			editor[str_scrollTop] = scroll[1];
		} else if (editor[str_document] && editor[str_document][str_selection]){
			var textRange = editor[str_document][str_selection][str_createRange]();
			textRange.text = value;
			textRange.select();
		}
	}
	
	function _calcBookmark(bookmark) {
		return (bookmark[str_charCodeAt](0) - 1) +
			(bookmark[str_charCodeAt](3) - 1) * 65536 +
			(bookmark[str_charCodeAt](2) - 1);
	}

	function _getSelectPos(editor, isend) {
		if (!editor) return;
		if (str_selectionStart in editor)
			return isend ? editor[str_selectionEnd] : editor[str_selectionStart];
		if (!editor[str_createTextRange] || !editor[str_document]) return;
		editor[str_focus]();
		var range = editor[str_document][str_selection][str_createRange]().duplicate();
		if (!isend) range.collapse(true)
		range.setEndPoint("StartToEnd", range);
		return _calcBookmark(range[str_getBookmark]()) -
			_calcBookmark(editor[str_createTextRange]()[str_getBookmark]());
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
			return editor[str_value].slice(editor[str_selectionStart], editor[str_selectionEnd]);
		if (editor[str_document] && editor[str_document][str_selection]){
			editor[str_focus]();
			return editor[str_document][str_selection][str_createRange]().text.replace(/\r\n?/g, '\n');
		}
	}

	exports.setSelectRange = setSelectRange;
	exports.getSelectRange = getSelectRange;

	exports.setSelectText = setSelectText;
	exports.getSelectText = getSelectText;

	exports.getSelectStart = getSelectStart;
	exports.getSelectEnd = getSelectEnd;
}(AceEditor);