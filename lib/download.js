/*
 * Copyright (c) 2014, Groupon, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * Neither the name of GROUPON nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';
var fs = require('fs');
var path = require('path');

var request = require('request');

function parseHashes(rawHash) {
  function parse(result, hash) {
    var parts = hash.trim().split('=');
    var key = parts[0];
    var value = parts.splice(1).join('=');
    result[key] = value;
    return result;
  }
  var hashes = rawHash.split(',');
  return hashes.reduce(parse, {});
}

function downloadWithMD5(url, destinationDir, fileName, callback) {
  var hash = null;
  var stream = request(url, { gzip: true });
  var fileStream = fs.createWriteStream(path.join(destinationDir, fileName));
  stream.pipe(fileStream);
  stream.on('response', function onResponse(response) {
    var rawHash;
    rawHash = response.headers['x-goog-hash'];
    hash = parseHashes(rawHash).md5;
  });
  stream.on('error', callback);
  fileStream.on('error', callback);

  fileStream.on('close', function returnHash() {
    callback(null, hash);
  });
}
module.exports = downloadWithMD5;
