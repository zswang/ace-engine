void function(){
    
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var inputFile = process.argv[2];
    var outputFile = process.argv[3];
    if (!inputFile || !outputFile) return;
    var body = String(fs.readFileSync(inputFile)).replace(/\r\n/g, '\n');
    var dict = {};
    
    body.replace(/([+\s()\[\]]+)(Math|parseInt|encodeURIComponent)\b/g, function(all, space, word){
        if (dict[word]){
            dict[word]++;
        } else {
            dict[word] = 1;
        }
    });
    
    var var_list = [], var_dict = {};
    for (var key in dict){
        // 原始长度 key.length * dict[key]
        // 替换后长度 2 * (dict[key] - 1)
        if (key.length * dict[key] > 2 * dict[key] + key.length){
            var alias = util.format('var_alias_%s', key);
            var_list.push(util.format('%s=%s', alias, key));
            var_dict[key] = alias;
        }
        
    }
    
    body.replace(/\.[a-z]\w*/ig, function(all, key){
        if (dict[all]){
            dict[all]++;
        } else {
            dict[all] = 1;
        }
    });
    //*
    var prop_dict = {};
    for (var key in dict){
        // 原始长度 key.length * dict[key]
        // 替换后长度 3 * dict[key] + key.length
        if (key.length * dict[key] > 3 * dict[key] + key.length){
            var alias = util.format('prop_alias_%s', key.substr(1));
            
            var_list.push(util.format('%s="%s"', alias, key.substr(1)));
            prop_dict[key] = '[' + alias + ']';
        }
    }
    body = body
        .replace(/[ \f\t\v]*\/\*\s*debug\s+start\s*\*\/[\s\S]*?\/\*\s*debug\s+end\s*\*\/[ \f\t\v]*/ig, "")
        .replace(/[ \f\t\v]*\/\*\s*background\s+start\s*\*\/[\s\S]*?\/\*\s*background\s+end\s*\*\/[ \f\t\v]*/ig, "")
        .replace(/([+\s()\[\]]+)(window|document|Math|parseInt|encodeURIComponent)\b/g, function(all, space, word){
            return var_dict[word] ? space + var_dict[word] : all;
        })
        .replace(/\.[a-z]\w*/ig, function(all){
            return prop_dict[all] || all;
        })
        .replace(/\/\*\s*compressor\s*\*\//, 
            'var\n        ' + var_list.join(',\n        ') + ';'
        );
    
    fs.writeFileSync(outputFile, body)
}();