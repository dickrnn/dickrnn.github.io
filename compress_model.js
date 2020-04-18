/*
compress_model.js
Compress JSON model to b64 encoded version to save bandwidth. only works for decoder-only sketch-rnn model.
*/

const assert = require('assert');
const fs = require('fs');

/**
 * deals with decompressing b64 models to float arrays.
 */
function btoa(s) {
  return Buffer.from(s, 'binary').toString('base64');
}
function string_to_uint8array(b64encoded) {
  var u8 = new Uint8Array(atob(b64encoded).split("").map(function(c) {
    return c.charCodeAt(0); }));
  return u8;
}
function uintarray_to_string(u8) {
  var s = "";
  for (var i = 0, len = u8.length; i < len; i++) {
    s += String.fromCharCode(u8[i]);
  }
  var b64encoded = btoa(s);
  return b64encoded;
};
function string_to_array(s) {
  var u = string_to_uint8array(s);
  var result = new Int16Array(u.buffer);
  return result;
};
function array_to_string(a) {
  var u = new Uint8Array(a.buffer);
  var result = uintarray_to_string(u);
  return result;
};

var args = process.argv.slice(2);

try {
  assert.strictEqual(args.length, 2);
} catch (err) {
  console.log("Usage: node compress_model.js orig_full_model.json compressed_model.json")
  process.exit(1);
}

var orig_file = args[0];
var target_file = args[1];

var orig_model = JSON.parse(fs.readFileSync(orig_file, 'ascii'));

var model_weights = orig_model[2];
var compressed_weights = [];

for (var i=0;i<model_weights.length;i++) {
  compressed_weights.push(array_to_string(new Int16Array(model_weights[i])));
}

var target_model = [orig_model[0], orig_model[1], compressed_weights];

fs.writeFileSync(target_file, JSON.stringify(target_model), 'ascii');
