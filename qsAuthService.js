var crypto = require('crypto');

var service = {};

//set keys after requirea
//TODO: add error if not pass
service.accessID = null;
service.accessKey = null;

service.genAuthorization = function(signature){
  if(!signature){ throw "Missed signature"  }
  //TODO: check keys
  var authorization = "QS-HMAC-SHA256 " + service.accessID + ":" + signature;
  return authorization;
};

service.genSignature = function(method, authpath, headers, params){
  if(!method || !authpath || !headers|| !params){ throw "Missed params"  }
  //TODO: check params and keys
  // Append method
  var stringToSign = "";
  stringToSign += method.toUpperCase();

  // Append Content-Type and Content-Md5
  var ContentType = headers['Content-Type'] || "";
  var ContentMD5 = headers['Content-MD5'] || "";
  stringToSign += "\n" + ContentMD5 + "\n" + ContentType;

  // Append time
  var dateStr = headers['X-QS-Date'] || "";
  if (!dateStr) {
    dateStr = params['X-QS-Date'] || "";
    if (dateStr) {
      stringToSign += "\n";
    }
  }
  if (!dateStr) {
    dateStr = headers['Date'] || "";
    if (!dateStr) {
      throw "Error: Date not set";
    } else {
      stringToSign += "\n" + dateStr;
    }
  }

  // Generate canonicalized headers
  var signedHeaders = genSignedHeaders(headers);
  for (var item in signedHeaders.sort()) {
    var key = signedHeaders[item];
    stringToSign += "\n" + key.toLowerCase() +":" + headers[key];
  }

  // Generate canonicalized resource
  var canonicalizedQuery = genCanonicalizedQuery(params);
  var canonicalizedResource = authpath;
  if (canonicalizedQuery) {
    canonicalizedResource += "?" + canonicalizedQuery;
  }
  stringToSign += "\n" + canonicalizedResource;
  var signature = crypto.createHmac('sha256', service.accessKey).update(
    stringToSign).digest().toString('base64').trim();
  return signature;

};

function genSignedHeaders(headers) {
  var signedHeaders = [];
  for (var key in headers) {
    if (key.toLowerCase().indexOf('x-qs-') === 0) {
      signedHeaders.push(headers[key]);
    }
  }
  return signedHeaders;
};

function genCanonicalizedQuery(params) {
  var canonicalizedQuery = "";
  for (var key in params) {
    if (canonicalizedQuery) {
      canonicalizedQuery += "&";
    }
    canonicalizedQuery += encodeURIComponent(key);
    if (params[key]) {
      canonicalizedQuery += "=" + encodeURIComponent(params[key]);
    }
  }
  return canonicalizedQuery;
};

module.exports = service;