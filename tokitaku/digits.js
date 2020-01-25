//  Copyright 2020 tokieng

Digits = function(d) {
	if (d && d instanceof Digits) {
		this.digits = d.digits;
		this.commaPos = d.commaPos;
	} else if (d && typeof d == "number") {
		this.setValue(d);
	} else {
		this.digits = [0];
		this.commaPos = 0;
	}
};

Digits.prototype = {
	addDigit: function(d) {
		if (this.digits.length == 1 && this.digits[0] == "0" && this.commaPos == 0) {
			this.digits = [d];
		} else {
			this.digits.push(d);
		}
	},
	addComma : function() {
		if (this.commaPos == 0) {
			this.commaPos = this.digits.length;
		}
	},
	setDigits : function(d) {
		this.digits = d.digits.slice(); // slice() for deep-copy
		this.commaPos = d.commaPos;
	},
	setValue: function(v) {
		this.reset();
		var ary = v.toString().split("");
		for ( s of ary ) {
			if (s == ".") {
				this.addComma();
			} else {
				this.addDigit(s);
			}
		}
	},
	getValue : function() {
		var val = this.digits.join("")*1;
		if (this.commaPos) {
			val /= Math.pow(10,this.digits.length - this.commaPos);
		}
		return val;
	},
	getKeta : function() {
		return this.digits.length;
	},
	getCommaPos : function() {
		return this.commaPos;
	},
	del: function() {
		this.digits.pop();
		if (this.digits.length < this.commaPos) {
			this.commaPos = 0;
		}
		if (this.digits.length == 0) {
			this.digits = [0];
		}
	},
	reset : function() {
		this.digits = [0];
		this.commaPos = 0;
	},
};

