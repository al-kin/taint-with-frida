(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var taint = require("./taint");

Interceptor.attach(ptr("0x400603"), function () {
    //main
    console.log("[x] enter main()");
    taint.startTracing();
});

Interceptor.attach(ptr("0x400596"), { //foo
    onEnter: function (args) {
        console.log("[x] enter foo()");
        taint.memory.taint(this.context.rdi, 40);
        taint.report();
    },
    onLeave: function (retval) {
        console.log("[x] leave foo()");
        taint.stopTracing();
        taint.report();
    }
});

},{"./taint":5}],2:[function(require,module,exports){
'use strict';

exports.space = 920;

//"name": [address, size]  //TODO r8d etc add
exports.registers = {
    'ac': [192, 8],
    'acflag': [192, 8],
    'ah': [17, 1],
    'al': [16, 1],
    'ax': [16, 2],
    'bh': [41, 1],
    'bl': [40, 1],
    'bp': [56, 8],
    'bx': [40, 2],
    'cc_dep1': [152, 8],
    'cc_dep2': [160, 8],
    'cc_ndep': [168, 8],
    'cc_op': [144, 8],
    'ch': [25, 1],
    'cl': [24, 1],
    'cmlen': [880, 8],
    'cmstart': [872, 8],
    'cx': [24, 2],
    'd': [176, 8],
    'dflag': [176, 8],
    'dh': [33, 1],
    'di': [72, 2],
    'dih': [73, 1],
    'dil': [72, 1],
    'dl': [32, 1],
    'dx': [32, 2],
    'eax': [16, 4],
    'ebp': [56, 4],
    'ebx': [40, 4],
    'ecx': [24, 4],
    'edi': [72, 4],
    'edx': [32, 4],
    'emnote': [864, 4],
    'esi': [64, 4],
    'esp': [48, 4],
    'fc3210': [856, 8],
    'fpreg': [776, 64],
    'fpround': [848, 8],
    'fptag': [840, 8],
    'fpu_regs': [776, 64],
    'fpu_tags': [840, 8],
    'fs': [208, 8],
    'fs_const': [208, 8],
    'ftop': [768, 4],
    'gs': [904, 8],
    'gs_const': [904, 8],
    'id': [200, 8],
    'idflag': [200, 8],
    'ip': [184, 8],
    'ip_at_syscall': [912, 8],
    'mm0': [776, 8],
    'mm1': [784, 8],
    'mm2': [792, 8],
    'mm3': [800, 8],
    'mm4': [808, 8],
    'mm5': [816, 8],
    'mm6': [824, 8],
    'mm7': [832, 8],
    'nraddr': [888, 8],
    'pc': [184, 8],
    'r10': [96, 8],
    'r11': [104, 8],
    'r12': [112, 8],
    'r13': [120, 8],
    'r14': [128, 8],
    'r15': [136, 8],
    'r8': [80, 8],
    'r9': [88, 8],
    'rax': [16, 8],
    'rbp': [56, 8],
    'rbx': [40, 8],
    'rcx': [24, 8],
    'rdi': [72, 8],
    'rdx': [32, 8],
    'rip': [184, 8],
    'rsi': [64, 8],
    'rsp': [48, 8],
    'si': [64, 2],
    'sih': [65, 1],
    'sil': [64, 1],
    'sp': [48, 8],
    'sseround': [216, 8],
    'xmm0': [224, 16],
    'xmm1': [256, 16],
    'xmm10': [544, 16],
    'xmm11': [576, 16],
    'xmm12': [608, 16],
    'xmm13': [640, 16],
    'xmm14': [672, 16],
    'xmm15': [704, 16],
    'xmm16': [736, 16],
    'xmm2': [288, 16],
    'xmm3': [320, 16],
    'xmm4': [352, 16],
    'xmm5': [384, 16],
    'xmm6': [416, 16],
    'xmm7': [448, 16],
    'xmm8': [480, 16],
    'xmm9': [512, 16],
    'ymm0': [224, 32],
    'ymm1': [256, 32],
    'ymm10': [544, 32],
    'ymm11': [576, 32],
    'ymm12': [608, 32],
    'ymm13': [640, 32],
    'ymm14': [672, 32],
    'ymm15': [704, 32],
    'ymm16': [736, 32],
    'ymm2': [288, 32],
    'ymm3': [320, 32],
    'ymm4': [352, 32],
    'ymm5': [384, 32],
    'ymm6': [416, 32],
    'ymm7': [448, 32],
    'ymm8': [480, 32],
    'ymm9': [512, 32]
};

},{}],3:[function(require,module,exports){
'use strict';

//https://gist.github.com/binarymax/ab3e917c170ca95268e5

//------------------------------------------
//Compact BitMap datastructure
//Memory efficient array of bool flags

var BitMap = function (size) {
	this._cols = 8;
	this._shift = 3;
	this._rows = (size >> this._shift) + 1;
	this._buf = new ArrayBuffer(this._rows);
	this._bin = new Uint8Array(this._buf);
};

//Gets the bool at offset
BitMap.prototype.get = function (off) {
	var row = off >> this._shift;
	var col = off % this._cols;
	var bit = 1 << col;
	return (this._bin[row] & bit) > 0;
};

//Sets a bit at offset to bool
BitMap.prototype.set = function (off, bool) {
	var row = off >> this._shift;
	var col = off % this._cols;
	var bit = 1 << col;
	if (bool) {
		this._bin[row] |= bit;
	} else {
		bit = 255 ^ bit;
		this._bin[row] &= bit;
	}
};

//Flip a single bit at offset
BitMap.prototype.flip = function (off) {
	var row = Math.floor(off / this._cols);
	var col = off % this._cols;
	var bit = 1 << col;
	this._bin[row] ^= bit;
};

//Reset to all 1's
BitMap.prototype.fill = function () {
	for (var i = 0; i < this._rows; i++) {
		this._bin[i] = 255;
	}
};

//Reset to all 0's
BitMap.prototype.clear = function () {
	for (var i = 0; i < this._rows; i++) {
		this._bin[i] = 0;
	}
};

module.exports = BitMap;

},{}],4:[function(require,module,exports){
'use strict';

var BitMap = require("./bitmap.js");
var IntervalTree = require('./interval-tree.js').IntervalTree;

var Registers = function (arch) {
    this.arch = arch;
    this.regTaintMap = new BitMap(arch.space + 32); //+32 for safe cast
};

Registers.prototype.taint = function (reg) {
    var rm = this.arch.registers[reg];
    for (var i = rm[0]; i < rm[0] + rm[1]; ++i) this.regTaintMap.set(i, true);
};

Registers.prototype.untaint = function (reg) {
    var rm = this.arch.registers[reg];
    for (var i = rm[0]; i < rm[0] + rm[1]; ++i) this.regTaintMap.set(i, false);
};

Registers.prototype.isTainted = function (reg) {
    var rm = this.arch.registers[reg];
    for (var i = rm[0]; i < rm[0] + rm[1]; ++i) if (this.regTaintMap.get(i)) return true;
    return false;
};

Registers.prototype.isFullyTainted = function (reg) {
    var rm = this.arch.registers[reg];
    for (var i = rm[0]; i < rm[0] + rm[1]; ++i) if (this.regTaintMap.get(i)) return true;else return false;
    return false;
};

Registers.prototype.toRanges = function (reg, base) {
    var rm = this.arch.registers[reg];
    var ranges = [];
    for (var i = 0; i < rm[1]; ++i) {
        if (this.regTaintMap.get(rm[0] + i)) {
            var addr = base.add(i);

            if (ranges.length === 0) {
                ranges.push([addr, addr]);
            }
            if (ranges[ranges.length - 1][1].equals(addr)) ranges[ranges.length - 1][1] = addr.add(1);else {
                ranges.push([addr, addr.add(1)]);
            }
        }
    }
    return ranges;
};

Registers.prototype.spread = function (destReg, srcReg) {
    var rm0 = this.arch.registers[destReg];
    var rm1 = this.arch.registers[srcReg];
    for (var i = 0; i < rm0[1]; ++i) this.regTaintMap.set(rm0[0] + i, this.regTaintMap.get(rm1[0] + i));
};

Registers.prototype.fromBitMap = function (reg, bmap) {
    var rm = this.arch.registers[reg];
    for (var i = 0; i < rm[1]; ++i) this.regTaintMap.set(i + rm[0], bmap.get(i));
};

var Memory = function () {
    this.memTaintTree = new IntervalTree();
};

Memory.prototype.taint = function (addr, size) {
    this.memTaintTree.add([addr, addr.add(size)]);
};

Memory.prototype.untaint = function (addr, size) {
    this.memTaintTree.remove([addr, addr.add(size)]);
};

Memory.prototype.isTainted = function (addr, size) {
    return this.memTaintTree.intersects([addr, addr.add(size)]);
};

Memory.prototype.isFullyTainted = function (addr, size) {
    var inter = this.memTaintTree.intersection([addr, addr.add(size)]);
    if (inter.length != 1) return false;
    return inter[0][0].compare(addr) == 0 && inter[0][1].compare(addr.add(size)) == 0;
};

Memory.prototype.toArray = function () {
    function helper(node, arr) {
        if (node === undefined) return arr;

        helper(node.left, arr);
        if (arr.length > 0 && arr[arr.length - 1][1].equals(node.interval[0])) //consolidate
            arr[arr.length - 1][1] = node.interval[1];else arr.push(node.interval);
        helper(node.right, arr);

        return arr;
    }

    return helper(this.memTaintTree.root, []);
};

Memory.prototype.fromRanges = function (ranges) {
    for (var i in ranges) {
        this.memTaintTree.add(ranges[i]);
    }
};

Memory.prototype.toBitMap = function (addr, size) {
    var inter = this.memTaintTree.intersection([addr, addr.add(size)]);
    var bmap = new BitMap(size);

    for (var i in inter) {
        for (var j = inter[i][0].sub(addr).toInt32(); j < inter[i][1].sub(addr).toInt32(); ++j) {
            bmap.set(j, true);
        }
    }

    return bmap;
};

exports.Memory = Memory;
exports.Registers = Registers;

},{"./bitmap.js":3,"./interval-tree.js":6}],5:[function(require,module,exports){
'use strict';

var arch = require("./amd64.js");
var core = require("./core.js");

var memory = new core.Memory();
var regs = new core.Registers(arch);

function scaleSHL(addr, scale) {
    switch (scale) {
        case 1:
            return addr;
        case 2:
            return addr.shl(1);
        case 4:
            return addr.shl(2);
        case 8:
            return addr.shl(3);
    }
}

function movRegMem(ctx) {
    var instr = Instruction.parse(ctx.pc);
    var operands = instr.operands;
    var op0 = operands[0].value;
    var op1 = operands[1].value;
    var size0 = operands[0].size;

    if (op1.base === undefined) return;

    var addr = ctx[op1.base].add(op1.disp); //ex. ctx["rip"] + 0x32
    if (op1.index !== undefined) addr = addr.add(scaleSHL(ctx[op1.index], op1.scale));

    //if(memory.isTainted(addr, size0)) console.log(instr.address + "   " + instr);

    regs.fromBitMap(op0, memory.toBitMap(addr, size0));
}

function movMemReg(ctx) {
    var instr = Instruction.parse(ctx.pc);
    var operands = instr.operands;
    var op0 = operands[0].value;
    var op1 = operands[1].value;

    //var size1 = operands[1].size;

    if (op0.base === undefined) return;

    var addr = ctx[op0.base].add(op0.disp); //ex. ctx["rip"] + 0x32
    if (op0.index !== undefined) addr = addr.add(scaleSHL(ctx[op0.index], op0.scale));

    //if(regs.isTainted(op1)) console.log("write " + instr.address + "   " + instr);

    memory.fromRanges(regs.toRanges(op1, addr));
}

function movRegReg(ctx) {
    var instr = Instruction.parse(ctx.pc);
    var operands = instr.operands;
    var op0 = operands[0].value;
    var op1 = operands[1].value;

    regs.spread(op0, op1);
}

function movRegImm(ctx) {
    var instr = Instruction.parse(ctx.pc);
    var op0 = instr.operands[0].value;

    regs.untaint(op0);
}

function movMemImm(ctx) {
    var instr = Instruction.parse(ctx.pc);
    var operands = instr.operands;
    var op0 = instr.operands[0].value;
    var size1 = instr.operands[1].size;

    if (op0.base === undefined) return;

    var addr = ctx[op0.base].add(op0.disp); //ex. ctx["rip"] + 0x32
    if (op0.index !== undefined) addr = addr.add(scaleSHL(ctx[op0.index], op0.scale));

    memory.untaint(addr, size1);
}

function startTracing() {
    Stalker.follow(Process.getCurrentThreadId(), {
        transform: function (iterator) {
            var instr = iterator.next();

            try {
                do {
                    var operands = instr.operands;
                    //if(instr.mnemonic.startsWith("mov")) {
                    if (operands.length == 2) {
                        var mnemonic = instr.mnemonic;

                        if (operands[0].type == "reg" && operands[1].type == "mem") iterator.putCallout(movRegMem);else if (operands[0].type == "mem" && operands[1].type == "reg") iterator.putCallout(movMemReg);else if (operands[0].type == "reg" && operands[1].type == "reg") iterator.putCallout(movRegReg);else if (mnemonic.startsWith("mov") && operands[0].type == "reg" && operands[1].type == "imm") iterator.putCallout(movRegImm);else if (mnemonic.startsWith("mov") && operands[0].type == "mem" && operands[1].type == "imm") iterator.putCallout(movMemImm);
                        //console.log(instr);
                    }

                    iterator.keep();
                } while ((instr = iterator.next()) !== null);
            } catch (err) {
                console.log(err);
            }
        }
    });

    console.log("[x] started tracing");
}

function stopTracing() {
    Stalker.unfollow(Process.getCurrentThreadId());

    console.log("[x] stopped tracing");
}

function report() {
    //console.log(" tainted registers: " + JSON.stringify(taintedRegs));

    console.log(" tainted memory   : " + JSON.stringify(memory.toArray()));
}

exports.memory = memory;
exports.regs = regs;
exports.startTracing = startTracing;
exports.stopTracing = stopTracing;
exports.report = report;

},{"./amd64.js":2,"./core.js":4}],6:[function(require,module,exports){

// modified from https://github.com/mgechev/javascript-algorithms/blob/master/src/data-structures/interval-tree.js

/**
 * Interval tree is an ordered tree data structure to hold intervals.
 *
 * @example
 *
 * var IT = require('path-to-algorithms/src/data-structures/interval-tree');
 * var intervalTree = new IT.IntervalTree();
 *
 * intervalTree.add([0, 100]);
 * intervalTree.add([101, 200]);
 * intervalTree.add([10, 50]);
 * intervalTree.add([120, 220]);
 *
 * console.log(intervalTree.contains(150)); // true
 * console.log(intervalTree.contains(250)); // false
 * console.log(intervalTree.intersects([210, 310])); // true
 * console.log(intervalTree.intersects([310, 320])); // false
 *
 * @module data-structures/interval-tree
 */
(function (exports) {

  'use strict';

  /**
   * Node which describes an interval.
   *
   * @public
   * @constructor
   * @param {Number} start Start of the interval.
   * @param {Number} end End of the interval.
   * @param {Node} left Left child node.
   * @param {Node} right Right child node.
   */

  exports.Node = function (start, end, left, right) {
    /**
     * Node interval.
     * @member {Array}
     */
    this.interval = [start, end];
    /**
     * Max endpoint in subtree which starts from this node.
     * @member {Number}
     */
    this.max = ptr("0");
    /**
     * Parent node.
     * @member {Node}
     */
    this.parentNode = null;
    /**
     * Left child node.
     * @member {Node}
     */
    this.left = left;
    /**
     * Right child node.
     * @member {Node}
     */
    this.right = right;
  };

  /**
   * Interval tree.
   *
   * @public
   * @constructor
   */
  exports.IntervalTree = function () {
    /**
     * Root node of the tree.
     * @member {Node}
     */
    this.root = null;
  };

  function addNode(node, side, interval) {
    var child = new exports.Node(interval[0], interval[1]);
    child.max = interval[1];
    child.parentNode = node;
    node[side] = child;
    if (node.max.compare(interval[1]) < 0) {
      while (child) {
        if (child.max.compare(interval[1]) < 0) {
          child.max = interval[1];
        }
        child = child.parentNode;
      }
    }
  }

  function addHelper(node, interval) {
    if (node.interval[0].compare(interval[0]) > 0) {
      if (node.left) {
        addHelper(node.left, interval);
      } else {
        addNode(node, 'left', interval);
      }
    } else {
      if (node.right) {
        addHelper(node.right, interval);
      } else {
        addNode(node, 'right', interval);
      }
    }
  }

  /**
   * Add new interval to the tree.
   *
   * @public
   * @param {Array} intreval Array with start and end points of the interval.
   */
  exports.IntervalTree.prototype.add = function (interval) {
    if (!this.root) {
      this.root = new exports.Node(interval[0], interval[1]);
      this.root.max = interval[1];
      return;
    }
    addHelper(this.root, interval);
  };

  function contains(point, node) {
    if (!node) {
      return false;
    }
    if (node.interval[0].compare(point) <= 0 && node.interval[1].compare(point) >= 0) {
      return true;
    }
    var result = false;
    var temp;
    ['left', 'right'].forEach(function (key) {
      temp = node[key];
      if (temp) {
        if (temp.max > point) {
          result = result || contains(point, temp);
        }
      }
    });
    return result;
  }

  /**
   * Checks or point belongs to at least one intarval from the tree.<br><br>
   * Complexity: O(log N).
   *
   * @public
   * @method
   * @param {Number} point Point which should be checked.
   * @return {Boolean} True if point belongs to one of the intervals.
   */
  exports.IntervalTree.prototype.contains = function (point) {
    return contains(point, this.root);
  };

  function intersects(a, b) {
    return a[0].compare(b[0]) <= 0 && a[1].compare(b[0]) >= 0 || a[0].compare(b[1]) <= 0 && a[1].compare(b[1]) >= 0 || b[0].compare(a[0]) <= 0 && b[1].compare(a[0]) >= 0 || b[0].compare(a[1]) <= 0 && b[1].compare(a[1]) >= 0;
  }

  function intersectsHelper(interval, node) {
    if (!node) {
      return false;
    }
    if (intersects(node.interval, interval)) {
      return true;
    }
    var result = false;
    var temp;
    ['left', 'right'].forEach(function (side) {
      temp = node[side];
      if (temp && temp.max.compare(interval[0]) >= 0) {
        result = result || intersectsHelper(interval, temp);
      }
    });
    return result;
  }

  /**
   * Checks or interval belongs to at least one intarval from the tree.<br><br>
   * Complexity: O(log N).
   *
   * @public
   * @method
   * @param {Array} interval Interval which should be checked.
   * @return {Boolean} True if interval intersects with one of the intervals.
   */
  exports.IntervalTree.prototype.intersects = function (interval) {
    return intersectsHelper(interval, this.root);
  };

  function intersection(a, b) {
    if (a === null || b === null) return null;
    if (b[0].compare(a[1]) > 0 || a[0].compare(b[1]) > 0) return null;

    var o = new Array(2);
    if (a[0].compare(b[0]) >= 0) o[0] = a[0];else o[0] = b[0];
    if (a[1].compare(b[1]) <= 0) o[1] = a[1];else o[1] = b[1];
    return o;
  }

  function intersectionHelper(interval, node) {
    if (!node) {
      return null;
    }
    var result = [];
    var inter = intersection(node.interval, interval);
    if (inter !== null) result.push(inter);
    var temp;
    ['left', 'right'].forEach(function (side) {
      temp = node[side];
      if (temp && temp.max.compare(interval[0]) >= 0) {
        inter = intersectionHelper(interval, temp);
        if (inter !== null) result.push(inter);
      }
    });
    return result;
  }

  exports.IntervalTree.prototype.intersection = function (interval) {
    return intersectionHelper(interval, this.root);
  };

  function heightHelper(node) {
    if (!node) {
      return 0;
    }
    return 1 + Math.max(heightHelper(node.left), heightHelper(node.right));
  }

  /**
   * Returns height of the tree.
   *
   * @public
   * @method
   * @return {Number} Height of the tree.
   */
  exports.IntervalTree.prototype.height = function () {
    return heightHelper(this.root);
  };

  /**
   * Returns node with the max endpoint in subtree.
   *
   * @public
   * @method
   * @param {Node} node Root node of subtree.
   * @return {Node} Node with the largest endpoint.
   */
  exports.IntervalTree.prototype.findMax = function (node) {
    var stack = [node];
    var current;
    var max = -Infinity;
    var maxNode;
    while (stack.length) {
      current = stack.pop();
      if (current.left) {
        stack.push(current.left);
      }
      if (current.right) {
        stack.push(current.right);
      }
      if (current.interval[1].compare(max) > 0) {
        max = current.interval[1];
        maxNode = current;
      }
    }
    return maxNode;
  };

  // adjust the max value
  exports.IntervalTree.prototype._removeHelper = function (interval, node) {
    if (!node) {
      return;
    }
    if (node.interval[0] === interval[0] && node.interval[1] === interval[1]) {
      // When left and right children exists
      if (node.left && node.right) {
        var replacement = node.left;
        while (replacement.left) {
          replacement = replacement.left;
        }
        var temp = replacement.interval;
        replacement.interval = node.interval;
        node.interval = temp;
        this._removeHelper(replacement.interval, node);
      } else {
        // When only left or right child exists
        var side = 'left';
        if (node.right) {
          side = 'right';
        }
        var parentNode = node.parentNode;
        if (parentNode) {
          if (parentNode.left === node) {
            parentNode.left = node[side];
          } else {
            parentNode.right = node[side];
          }
          if (node[side]) {
            node[side].parentNode = parentNode;
          }
        } else {
          this.root = node[side];
          // last node removed
          if (this.root) {
            this.root.parentNode = null;
          }
        }
      }
      // Adjust the max value
      var p = node.parentNode;
      if (p) {
        var maxNode = this.findMax(p);
        var max = maxNode.interval[1];
        while (maxNode) {
          if (maxNode.max === node.interval[1]) {
            maxNode.max = max;
            maxNode = maxNode.parentNode;
          } else {
            maxNode = false;
          }
        }
      }
    } else {
      // could be optimized
      this._removeHelper(interval, node.left);
      this._removeHelper(interval, node.right);
    }
  };

  /**
   * Remove interval from the tree.
   *
   * @public
   * @method
   * @param {Array} intreval Array with start and end of the interval.
   */
  exports.IntervalTree.prototype.remove = function (interval) {
    return this._removeHelper(interval, this.root);
  };
})(typeof window === 'undefined' ? module.exports : window);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2ZyaWRhLWNvbXBpbGUvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImZvby5qcyIsInRhaW50L2FtZDY0LmpzIiwidGFpbnQvYml0bWFwLmpzIiwidGFpbnQvY29yZS5qcyIsInRhaW50L2luZGV4LmpzIiwidGFpbnQvaW50ZXJ2YWwtdHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUksUUFBUSxRQUFRLFNBQVIsQ0FBWjs7QUFFQSxZQUFZLE1BQVosQ0FBbUIsSUFBSSxVQUFKLENBQW5CLEVBQW9DLFlBQVk7QUFBRTtBQUM5QyxZQUFRLEdBQVIsQ0FBWSxrQkFBWjtBQUNBLFVBQU0sWUFBTjtBQUNILENBSEQ7O0FBS0EsWUFBWSxNQUFaLENBQW1CLElBQUksVUFBSixDQUFuQixFQUFvQyxFQUFFO0FBQ2xDLGFBQVMsVUFBUyxJQUFULEVBQWU7QUFDcEIsZ0JBQVEsR0FBUixDQUFZLGlCQUFaO0FBQ0EsY0FBTSxNQUFOLENBQWEsS0FBYixDQUFtQixLQUFLLE9BQUwsQ0FBYSxHQUFoQyxFQUFxQyxFQUFyQztBQUNBLGNBQU0sTUFBTjtBQUNILEtBTCtCO0FBTWhDLGFBQVMsVUFBUyxNQUFULEVBQWlCO0FBQ3RCLGdCQUFRLEdBQVIsQ0FBWSxpQkFBWjtBQUNBLGNBQU0sV0FBTjtBQUNBLGNBQU0sTUFBTjtBQUNIO0FBVitCLENBQXBDOzs7QUNQQTs7QUFFQSxRQUFRLEtBQVIsR0FBZ0IsR0FBaEI7O0FBRUE7QUFDQSxRQUFRLFNBQVIsR0FBb0I7QUFDaEIsVUFBTSxDQUFDLEdBQUQsRUFBTSxDQUFOLENBRFU7QUFFaEIsY0FBVSxDQUFDLEdBQUQsRUFBTSxDQUFOLENBRk07QUFHaEIsVUFBTSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBSFU7QUFJaEIsVUFBTSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBSlU7QUFLaEIsVUFBTSxDQUFDLEVBQUQs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
