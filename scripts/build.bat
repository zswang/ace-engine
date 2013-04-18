node build ace-path-simple.js ace-path-simple.lovely.js
node delblock ace-path-simple.lovely.js ace-path-simple.lovely.js debug
call uglifyjs ace-path-simple.lovely.js -o ace-path-simple.min.js --unsafe --lift-vars -c -nm
pause