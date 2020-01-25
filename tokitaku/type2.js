//  Copyright 2020 tokieng

Type2Func =  function(rules) {

	var c= {
		lastOpe : null,
		constDigits : new Digits,
		isError : false,
		lastDigits : new Digits,
		inputDigits : new Digits,
		memoryDigits : new Digits,

		lastType : null,
		lastKey : null,
	};
	var init = function() {
		reset();
	};
	var reset = function() {
		c.lastOpe = null;
		c.constDigits.setValue(0);
		c.isError = false;
		c.lastDigits.setValue(0);
		c.inputDigits.setValue(0);
		c.memoryDigits = new Digits;

		c.lastType = null;
		c.lastKey = null;
		Disp.setValue(0);
		Disp.E(false);
		Disp.K(false);
		Disp.EQ(false);
		Disp.M(false);
		Disp.ope(null);
	};

	var addVal = function(key) {
		console.log("sharp addVal key:"+key);
		if (c.inputDigits.getKeta() >=12) {
			if (rules.errorWhenInput) {
				// 入力可能な桁数を超えた
				if (c.inputDigits.getCommaPos() == 0) {
					c.isError = true;
					Disp.E(true);
					return;
				} else {
					// 小数点以降の入力あふれは、無視する
				}
			}
			return;
		}
		Disp.EQ(false);
		c.inputDigits.addDigit(key);
		Disp.setDigits(c.inputDigits);
		console.log(c.inputDigits.getValue());
	};

	var enterComma = function() {
		if (c.inputDigits.getCommaPos()!=0) {
			// 入力可能な桁数を超えた
			return;
		}
		Disp.EQ(false);
		c.inputDigits.addComma();
		Disp.setDigits(c.inputDigits);
	};

	var enterPlusMinus = function() {
		var tmpDigits = new Digits;
		[tmpDigits, c.isError] = Common.calc(Disp.getDigits(), "*", -1);
		Disp.setDigits(tmpDigits);
		Disp.EQ(false);
		c.inputDigits.setDigits(tmpDigits);
	};

	var enterROOT = function() {
		var val = Disp.getDigits().getValue();
		if (val < 0) {
			c.isError=true;
			Disp.E(true);
			if (rules.displayNegativeRoot) {
				val *= -1;
			} else {
				Disp.setValue(0);
				return;
			}
		}
		var newValue = Math.sqrt(val);
		Disp.EQ(false);
		Disp.setValue(newValue);
	};

	var enterOpe2 = function(key) {
		[c.lastDigits, c.isError] = Common.calc(c.lastDigits, c.lastOpe, Disp.getDigits());
		if (c.isError) {
			Disp.E(true);
			// 演算子表示・計算結果の表示は行うので、処理は続行する
		}
		Disp.setDigits(c.lastDigits);
		c.lastOpe = null;
		enterOpe(key);
	};
	var enterOpe = function(key) {

		c.lastDigits.setDigits(Disp.getDigits());
		c.inputDigits.setValue(0);

		// 入力した演算子を訂正したい＝演算子情報を更新する
		c.lastOpe = key;
		Disp.ope(key);
		Disp.EQ(false);

		return;
	};

	// firstからの遷移の時は、演算子が+と-のときの処理がなんか違う
	var enterEqualFirst = function() {
		switch (c.lastOpe) {
			case "+":
				[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(), "+", c.constDigits);
				break;
			case "-":
				[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(), "-", c.constDigits);
				break;
			case "*":
				if (c.constDigits == null) {
					// 2乗
					[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(),"*", Disp.getDigits());
				} else {
					[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(), "*", c.constDigits);
				}
				break;
			case "/":
				if (c.constDigits == null) {
					// 逆数
					[c.lastDigits, c.isError] = Common.calc(1,"/", Disp.getDigits());
				} else {
					[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(), "/", c.constDigits);
				}
				break;
			default:
				// 演算子の入力なし
				c.lastDigits.setDigits(Disp.getDigits());
		}
		// constDigitsは、更新しない。
		Disp.setDigits(c.lastDigits);
		c.inputDigits.reset();
		Disp.ope(null);
		Disp.E(c.isError);
		if (!c.isError) {Disp.EQ(true); }
	};

	// first_opeからの遷移の時は、演算子が+と-のときの処理がなんか違う
	var enterEqualFirstOpe = function() {
		switch (c.lastOpe) {
			case "+":
				[c.lastDigits, c.isError] = Common.calc(c.constDigits, "+", Disp.getDigits());
				break;
			case "-":
				[c.lastDigits, c.isError] = Common.calc(c.constDigits, "-", Disp.getDigits());
				break;
			case "*":
				// 2乗
				[c.lastDigits, c.isError] = Common.calc(Disp.getDigits(),"*", Disp.getDigits());
				break;
			case "/":
				// 逆数
				[c.lastDigits, c.isError] = Common.calc(1,"/", Disp.getDigits());
				break;
		}
		c.constDigits.setDigits(Disp.getDigits());
		Disp.setDigits(c.lastDigits);
		c.inputDigits.reset();
		Disp.ope(null);
		Disp.E(c.isError);
		if (!c.isError) {Disp.EQ(true); }
	};

	var enterEqual = function() {
		switch (c.lastOpe) {
			case "*":
				c.constDigits.setDigits(c.lastDigits);
				break;
			default:
				c.constDigits.setDigits(Disp.getDigits());
		}

		[c.lastDigits, c.isError] = Common.calc(c.lastDigits, c.lastOpe, Disp.getDigits());

		c.inputDigits.reset();
		Disp.setDigits(c.lastDigits);
		Disp.E(c.isError);
		Disp.ope(null);
		if (!c.isError) {Disp.EQ(true); }
	};

	var memorySetOnly = function(key) {
		var digits = new Digits;
		var ope = key.substr(1,1);
		[digits, c.isError] = Common.calc(c.memoryDigits, ope, Disp.getDigits());

		c.inputDigits.reset();
		Disp.ope(null);
		Disp.E(c.isError);

		// M と = は、エラーの有無で異なる
		if (c.isError) {
			Disp.EQ(false);
			if (rules.displayValueWithMemoryError) {
				Disp.setDigits(digits);
			} else {
				Disp.setValue(0);
			}
			if (rules.displayMemoryErrorWithBlink) {
				Disp.M("blink");
				return "memoryError"
			} else {
				Disp.M(true);
			}
			return;
		}
		Disp.dispMemoryValue(digits);
		Disp.M(c.memoryDigits.getValue()!=0);
		c.memoryDigits.setDigits(digits);
		if (rules.displayEqualWhenMemorySet) {
			Disp.EQ(true);
		} else {
			Disp.EQ(false);
		}
	};

	var memoryCalcAndSet = function(key) {
		enterEqual();
		memorySetOnly(key);
	};

	var memoryClear = function() {
		Disp.M(false);
		c.memoryDigits.setValue(0);
		Disp.dispMemoryValue(c.memoryDigits);
	};
	var memoryRestore = function() {
		c.inputDigits.reset();
		Disp.setDigits(c.memoryDigits);
		Disp.EQ(false);
	};
	var del = function() {
		if (c.isError) {
			c.isError = false;
			Disp.E(false);
			if (Disp.getValue() === 0) {
				// 0除算・負値の平方根計算
				return;
			}
			return;
		}
		while (Disp.getDigits().getKeta() > 12) {
			Disp.getDigits().del();
		}
		Disp.getDigits().del();
		c.inputDigits.setDigits(Disp.getDigits());
		Disp.dispValue();
		Disp.EQ(false);
	};
	var delMemoryError = function() {
		Disp.E(false);
		Disp.M(true);
		c.isError = false;
		return "first"
	};

	var inputReset = function() {
		c.inputDigits.reset();
		c.lastOpe = null;
		Disp.ope(null);
		Disp.EQ(false);
	};

	var calcPercent = function() {
		var firstDigits = c.lastDigits;
		var secondDigits =  Disp.getDigits()
		var centDigits = new Digits;
		var tmpDigits = new Digits;
		var resultDigits = new Digits;
		var tmpError;
		var nextStatus = null;
		[centDigits, tmpError] = Common.calc(secondDigits, "/", 100);
		c.constDigits.setDigits(firstDigits);
		switch (c.lastOpe) {
			case "*":
				[resultDigits, c.isError] = Common.calc(firstDigits, "*", centDigits);
				nextStatus = "percent_*";
				break;

			case "/":
				[resultDigits, c.isError] = Common.calc(firstDigits, "/", centDigits);
				break;

			case "+":
				var err1, err2;
				// 割り増し計算
				[tmpDigits, err1] = Common.calc(1,"+",centDigits);
				[resultDigits, err2] = Common.calc(firstDigits, "*", tmpDigits);
				c.isError = err1 | err2;
				break;

			case "-":
				var err1, err2;
				// 割引計算
				[tmpDigits, err1] = Common.calc(1,"-",centDigits);
				[resultDigits, err2] = Common.calc(firstDigits, "*", tmpDigits);
				c.isError = err1 | err2;
				break;
		}
		Disp.setDigits(resultDigits);
		c.inputDigits.reset();
		Disp.E(c.isError);
		if (!c.isError) {
			if (rules.displayEqualWhenPercentCalc) {
				Disp.EQ(true);
			}
		}
		Disp.ope(null);
		return nextStatus;
	};

	return {
		"first" : {
			numeric   : { next: null, func: addVal },
			comma     : { next: null, func: enterComma },
			"PM"      : { next: null, func: enterPlusMinus },
			ope       : { next: "first_ope", func: enterOpe },
			"="       : { next: null, func: enterEqualFirst},
			"%"       : { next: null, func: inputReset},
			"ROOT"    : { next: null, func: enterROOT},
			memoryset : { next: null, func: memorySetOnly},
			"MR"      : { next: null, func: memoryRestore},
			"MC"      : { next: null, func: memoryClear},
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: null, func: del},
		},
		"first_ope" : {
			// first状態で演算子が押されたとき。 "ope"と比べて、 "="入力時のみ異なる。
			numeric   : { next: "num2", func: addVal },
			comma     : { next: null, func: enterComma },
			"PM"      : { next: null, func: enterPlusMinus },
			ope       : { next: null, func: enterOpe },
			"="       : { next: "first", func:  enterEqualFirstOpe },
			"%"       : { next: null, func: null},
			"ROOT"    : { next: null, func: enterROOT},
			memoryset : { next: "first", func: memoryCalcAndSet},
			"MR"      : { next: "num2", func: memoryRestore},
			"MC"      : { next: null, func: memoryClear},
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: "num2", func: del},
		},
		"ope" : {
			numeric   : { next: "num2", func: addVal },
			comma     : { next: null, func: enterComma },
			"PM"      : { next: null, func: enterPlusMinus },
			ope       : { next: null, func: enterOpe },
			"="       : { next: "first", func:  enterEqualFirstOpe },
			"%"       : { next: null, func: null},
			"ROOT"    : { next: null, func: enterROOT},
			memoryset : { next: "first", func: memoryCalcAndSet},
			"MR"      : { next: "num2", func: memoryRestore},
			"MC"      : { next: null, func: memoryClear},
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: "num2", func: del},
		},
		"num2": {
			numeric   : { next: null, func: addVal },
			comma     : { next: null, func: enterComma },
			"PM"      : { next: null, func: enterPlusMinus },
			ope       : { next: "ope", func: enterOpe2 },
			"="       : { next: "first", func:  enterEqual },
			"%"       : { next: "first", func: calcPercent},
			"ROOT"    : { next: null, func: enterROOT},
			memoryset : { next: "first", func: memoryCalcAndSet},
			"MR"      : { next: null, func: memoryRestore},
			"MC"      : { next: null, func: memoryClear},
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: null, func: del},
		},
		"percent_*" : {
			// 基本的に、firstと同じ。+ と - 押下時だけ異なる。
			numeric   : { next: null, func: addVal },
			comma     : { next: null, func: enterComma },
			"PM"      : { next: null, func: enterPlusMinus },
			ope       : { next: "first_ope", func: enterOpe },
			"="       : { next: "first", func: enterEqualFirst},
			"%"       : { next: null, func: inputReset},
			"ROOT"    : { next: null, func: enterROOT},
			memoryset : { next: null, func: memorySetOnly},
			"MR"      : { next: null, func: memoryRestore},
			"MC"      : { next: null, func: memoryClear},
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: null, func: del},
		},
		"memoryError": {
			"AC"      : { next: "first", func: reset},
			"DEL"     : { next: null, func: delMemoryError},
		},

		func : {
			init : function() {
				init();
			},
			isError : function () {
				return c.isError;
			},
			setLastKey : function(type, key) {
				c.lastType = type;
				c.lastKey = key;
			},
			getMemoryDigits : function() {
				return c.memoryDigits;
			},
			getName : function() {
				return rules.name;
			},
		},
	};
};

CalcSharp = CalcBase(
	Type2Func({
		errorWhenInput: true,
		displayNegativeRoot: false,
		displayEqualWhenMemorySet: true,
		displayEqualWhenPercentCalc: true,
		displayMemoryErrorWithBlink: false,
		displayValueWithMemoryError: false,
		name: "SHARP",
	})
);

CalcCanon = CalcBase(
	Type2Func({
		errorWhenInput: false,
		displayNegativeRoot: true,
		displayEqualWhenMemorySet: false,
		displayEqualWhenPercentCalc: true,
		displayMemoryErrorWithBlink: true,
		displayValueWithMemoryError: true,
		name: "Canon",
	})
);

CalcCitizen = CalcBase(
	Type2Func({
		errorWhenInput: true,
		displayNegativeRoot: true,
		displayEqualWhenMemorySet: false,
		displayEqualWhenPercentCalc: false,
		displayMemoryErrorWithBlink: false,
		displayValueWithMemoryError: true,
		name: "CITIZEN",
	})
);
