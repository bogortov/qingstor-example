var QsAuthService = require('./QsAuthService');
var fs = require('fs');
var http = require('http');

//al you need to change
QsAuthService.accessID = "";
QsAuthService.accessKey = "";
var bucket = 'testBucket';
//optional
var path = 'new-image.png';
var qingUrl = 'pek3a.qingstor.com';

var headers = {};

var fileStream = fs.createReadStream('test.png');
var fileSize = fs.statSync('test.png').size;
var fileContentType = 'image/' + 'png';

var authPath = "/" + bucket + "/" + path;

var headers = {};
headers["Date"] = new Date().toUTCString();
//when comment the next line its working and returns 201, when uncomment - 401
// headers["Content-Type"] = fileContentType;

headers["Content-Length"] = fileSize;
var signature = QsAuthService.genSignature("PUT", authPath, headers, {});
//generating auth
var authorization = QsAuthService.genAuthorization(signature);
headers["Authorization"] = authorization;

console.log("Headers", headers);
console.log("Signature", signature);
console.log("Authorization", authorization);

var host = bucket + '.' + qingUrl;

var options = {
  hostname: host,
  port: 80,
  method: "PUT",
  path: "/" + path,
  headers: headers
};

var req = http.request(options, function(response) {

  response.on('data', function(d) {
    process.stdout.write(d);
    console.log("Status", response.statusCode, "Message", response.statusMessage);
  });

  response.on('end', function() {
  	console.log("Status", response.statusCode, "Message", response.statusMessage);
  });
});

fileStream.pipe(req);
