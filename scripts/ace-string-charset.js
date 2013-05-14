var AceString = AceString || {};
void function(exports){
    /**
     * 本机转换字符编码
     * @see 
     * @author 王集鹄(WangJihu,http//weibo.com/zswang)
     * @version 2013-05-13
     */
    if (/charset-escape-value/.test(location)) return;
    
    var iframe;
    
    /**
     * HTML编码
     * @param {String} text 
     */
    function encodeHTML(text){
        return String(text).replace(/["<>& ]/g, function(all){
            return "&" + {
                '"': 'quot',
                '<': 'lt',
                '>': 'gt',
                '&': 'amp',
                ' ': 'nbsp'
            }[all] + ";";
        });
    }
    function init(){
        if (iframe) return;
        iframe = document.createElement('iframe');
        iframe.src = "about:blank";
        iframe.style.visibility = 'hidden';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    // webkit
    function webkit_charsetEscape(text, charset, callback){
        if (typeof charset == 'function'){
            callback = charset;
            charset = '';
        }
        if (!callback) return;
        init();
        charset = charset || 'gbk';
        var d = iframe.contentWindow.document;
        d.open();
        d.charset = d.characterSet = charset;
        d.write('<body><a href="?' + encodeHTML(text) + '"></a></body>');
        d.close();
        callback(String(d.getElementsByTagName('a')[0].href).replace(/.*\?/, ''));
    }

    // firefox / ie
    var caches = {};
    function charsetEscape(text, charset, callback){
        if (typeof charset == 'function'){
            callback = charset;
            charset = '';
        }
        if (!callback) return;
        init();
        if (caches[text] || !text){
            callback(caches[text] || '');
            return;
        }
        charset = charset || 'gbk';
        var d = iframe.contentWindow.document;
        d.open();
        d.charset = d.characterSet = charset;
        d.write('\
<body>\
    <iframe name="iframe_encode"></iframe>\
    <form accept-charset="' +  charset + '" target="iframe_encode" method="GET">\
        <input id="text" name="charset-escape-value" value="' + encodeHTML(text) + '"/>\
    </form>\
</body>'
        );
        d.close();
        var form = d.getElementsByTagName('form')[0];
        var iframe_encode = d.getElementsByName('iframe_encode')[0];
        //console.log(form, iframe_encode);//debug
        iframe_encode.onload = function(){
            String(iframe_encode.contentWindow.location).replace(/charset-escape-value=([^&]*)/, function(all, value){
                caches[text] = value;
                callback(value);
            });
        }
        form.submit();
    }
    exports.charset = exports.charset || {};
    exports.charset.escape = /webkit/i.test(navigator.userAgent) ? webkit_charsetEscape : charsetEscape;
}(AceString);