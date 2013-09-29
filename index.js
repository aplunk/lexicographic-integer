module.exports = function convert (n, enc) {
    n = Math.floor(n);
    if (n < 0 || n === Infinity) return undefined;
    
    var bytes;
    var max = 251;
    var x = n - max;
    
    if (n < max) {
        bytes = [ n ];
    }
    else if (x < 256) {
        bytes = [ max, x ];
    }
    else if (x < 256*256) {
        bytes = [ max + 1, Math.floor(x / 256), x % 256 ];
    }
    else if (x < 256*256*256) {
        bytes = [
            max + 2,
            Math.floor(x / 256 / 256),
            Math.floor(x / 256) % 256,
            x % 256
        ];
    }
    else if (x < 256*256*256*256) {
        bytes = [
            max + 3,
            Math.floor(x / 256 / 256 / 256),
            Math.floor(x / 256 / 256) % 256,
            Math.floor(x / 256) % 256,
            x % 256
        ];
    }
    else {
        var exp = Math.floor(Math.log(x) / Math.log(2)) - 32;
        bytes = [ 255 ];
        bytes.push.apply(bytes, convert(exp));
        var res = x / Math.pow(2, exp - 11);
        bytes.push.apply(bytes, bytesOf(x / Math.pow(2, exp - 11)));
    }
    if (enc === undefined || enc === 'array') return bytes;
    if (enc === 'hex') {
        var s = '';
        for (var i = 0, l = bytes.length; i < l; i++) {
            var b = bytes[i];
            var c = b.toString(16);
            if (b < 16) c = '0' + c;
            s += c;
        }
        return s;
    }
};

module.exports.unpack = function unpack (xs) {
    if (xs.length === 1 && xs[0] < 251) {
        return xs[0];
    }
    if (xs.length === 2 && xs[0] === 251) {
        return 251 + xs[1];
    }
    if (xs.length === 3 && xs[0] === 252) {
        return 251 + 256 * xs[1] + xs[2];
    }
    if (xs.length === 4 && xs[0] === 253) {
        return 251 + 256 * 256 * xs[1] + 256 * xs[2] + xs[3];
    }
    if (xs.length === 5 && xs[0] === 254) {
        return 251 + 256 * 256 * 256 * xs[1]
            + 256 * 256 * xs[2] + 256 * xs[3] + xs[4]
        ;
    }
    if (xs.length > 5 && xs[0] === 255) {
        var m = 0, x = 1;
        for (var i = xs.length - 1; i >= 2; i--) {
            m += x * xs[i];
            x *= 256;
        }
        var x = unpack([ xs[1] + 32 ]) - 11;
        return 251 + m / Math.pow(2, 32 - x);
    }
    return undefined;
};

function bytesOf (x) {
    x = Math.floor(x);
    var bytes = [];
    for (var i = 0, d = 1; i < 6; i++, d *= 256) {
        bytes.unshift(Math.floor(x / d) % 256);
    }
    return bytes;
}
