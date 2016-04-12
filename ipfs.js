var ipfs = {};

ipfs.currentProvider = {host: null, port: null};
ipfs.defaultProvider = {host: 'localhost', port: '5001'};

ipfs.setProvider = function(opts) {
  if (!opts) opts = this.defaultProvider;
  if (typeof opts === 'object' && !opts.hasOwnProperty('host')) {
    return;
  }
  ipfs.currentProvider = opts;
};

ipfs.api_url = function(path) {
  return "http://" + ipfs.currentProvider.host + ":" + ipfs.currentProvider.port + "/api/v0" + path;
}

ipfs.add = function(input, callback) {
  var oReq = new XMLHttpRequest();
  oReq.enctype = "multipart/form-data";
  oReq.addEventListener("load", function() {
    if (oReq.status != 200)
      callback(oReq.responseText,null);
    else {
      var response = JSON.parse(oReq.responseText);
      callback(null,response["Hash"]);
    }

  });
  var form = new FormData();
  form.append("file",new Blob([input],{}));
  oReq.open("POST", ipfs.api_url("/add"));
  oReq.setRequestHeader("accept", "application/json");
  oReq.send(form);
};

ipfs.catText = function(ipfsHash, callback) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function() {
    if (oReq.status != 200)
      callback(oReq.responseText,null);
    else
      callback(null,oReq.responseText);
  });
  oReq.open("GET", ipfs.api_url("/cat/" + ipfsHash));
  oReq.send();
};
ipfs.cat = ipfs.catText; // Alias this for now

ipfs.addJson = function(jsonObject, callback) {
  var jsonString = JSON.stringify(jsonObject);
  ipfs.add(jsonString, callback);
};

ipfs.catJson = function(ipfsHash, callback) {
  ipfs.catText(ipfsHash, function (err, jsonString) {
    if (err) callback(err, {});

    var jsonObject = {};
    try {
      jsonObject = typeof jsonString === 'string' ?  JSON.parse(jsonString) : jsonString;
    } catch (e) {
      err = e;
    }
    callback(err, jsonObject);
  });
};

if (window !== 'undefined') {
  window.ipfs = ipfs;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ipfs;
}

