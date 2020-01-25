//  Copyright 2020 tokieng

CalcToki = CalcBase(
	function() {
		var c= {
			lastOpe : null,
			isError : false,
			lastDigits : new Digits,
			inputDigits : new Digits,
			memoryDigits : new Digits,
			percentPlusDigits : null,

			lastType : null,
			lastKey : null,
		};
		var init = function() {
			reset();
			c.memoryDigits = new Digits;
		};
		var reset = function() {
			c.lastOpe = null;
			c.isError = false;
			c.lastDigits = new Digits;
			c.inputDigits = new Digits;
			c.percentPlusDigits = null;

			c.lastType = null;
			c.lastKey = null;
			Disp.setValue(0);
			Disp.E(false);
			Disp.K(false);
			Disp.ope(null);
		};

		var addVal = function(key) {
			console.log("casio addVal key:"+key);
			if (c.inputDigits.getKeta() >=12) {
				// 入力可能な桁数を超えた
				return;
			}
			c.inputDigits.addDigit(key);
			Disp.setDigits(c.inputDigits);
			console.log(c.inputDigits.getValue());
		};

		var enterComma = function() {
			if (c.inputDigits.getKeta() >=12) {
				// 入力可能な桁数を超えた
				return;
			}
			c.inputDigits.addComma();
			Disp.setDigits(c.inputDigits);
		};

		var enterPlusMinus = function() {
			var tmpDigits = new Digits;
			[tmpDigits, c.isError] = Common.calc(Disp.getDigits(), "*", -1);
			Disp.setDigits(tmpDigits);
			c.inputDigits.setDigits(tmpDigits);
		};

		var enterROOT = function() {
			if (Disp.getDigits().getValue() < 0) {
				c.isError=true;
				Disp.E(true);
				Disp.setValue(0);
				return "error";
			}
			var newValue = Math.sqrt(Disp.getDigits().getValue());
			Disp.setValue(newValue);
		};

		var enterOpe2 = function(key) {
			Disp.ope(key);
			[c.lastDigits, c.isError] = Common.calc(c.lastDigits, c.lastOpe, Disp.getDigits());
			c.inputDigits.reset();
			Disp.setDigits(c.lastDigits);
			if (c.isError) {
				Disp.E(c.isError);
				c.lastOpe = null;
				return "error";
			}
			c.lastOpe = key;
		};
		var enterOpe = function(key) {
			if (c.lastOpe == key) {
				Disp.K(true);
				return "K_first";
			}

			c.lastDigits.setDigits(Disp.getDigits());
			c.inputDigits.setValue(0);

			// 入力した演算子を訂正したい＝演算子情報を更新する
			c.lastOpe = key;
			Disp.ope(key);

			return;
		};

		// 「+」→「%」計算時の、利益を表示するモードの場合
		var enterOpePercentPlus = function(key) {
			if (key != "-") {
				return enterOpe(key);
			}

			Disp.setDigits(c.percentPlusDigits);
			c.inputDigits.reset();
			c.percentPlusDigits = null;
			c.lastOpe = null;
			Disp.ope(null);
			return "first";
		};

		// 「*」→「%」計算後に、演算子が押された場合
		var enterOpePercentMul = function(key) {
			c.lastOpe = key;
			Disp.ope(key);
			return "ope";
		};

		var enter_K_Ope = function(key) {
			Disp.K(false);
			c.lastOpe = null;
			return enterOpe(key);
		};

		// firstからの遷移の時は、演算子が+と-のときの処理がなんか違う
		var enterEqualFirst = function() {
			return enterEqual();
		};

		var enterEqual = function() {
			console.log("計算結果が出るはず"+c.lastDigits.getValue()+" "+c.lastOpe+" "+Disp.getDigits().getValue());

			[c.lastDigits, c.isError] = Common.calc(c.lastDigits, c.lastOpe, Disp.getDigits());

			c.inputDigits.reset();
			Disp.setDigits(c.lastDigits);
			c.lastOpe = null;
			Disp.ope(null);
			if (c.isError) {
				Disp.E(true);
				return "error";
			}
		};

		var enter_K_Equal = function() {
			var resultDigits = new Digits;
			[resultDigits, c.isError] = Common.calc(Disp.getDigits(), c.lastOpe, c.lastDigits);
			c.inputDigits.reset();
			Disp.setDigits(resultDigits);
			if (c.isError) {
				Disp.E(true);
				return "K_error";
			}
		};

		var memorySetOnly = function(key) {
			var digits = new Digits;
			var ope = key.substr(1,1);
			[digits, c.isError] = Common.calc(c.memoryDigits, ope, Disp.getDigits());
			if (c.isError) {
				// メモリ操作時のエラーは、0表示
				Disp.setValue(0);
				Disp.M("blink");
				Disp.E(true);
				return "error";
			}
			c.memoryDigits.setDigits(digits);

			c.inputDigits.reset();
			Disp.M(c.memoryDigits.getValue()!=0);
			Disp.dispMemoryValue(c.memoryDigits);
		};

		var memoryCalcAndSet = function(key) {
			var next = null;
			enterEqual();
			if (c.isError) {
				return "error";
			}
			memorySetOnly(key);
			if (c.isError) {
				return "error";
			}
		};
		var memory_K_CalcAndSet = function(key) {
			enter_K_Equal();
			if (c.isError) {
				return "K_error";
			}
			memorySetOnly(key);
			if (c.isError) {
				return "K_error";
			}
		};
		var memoryClear = function() {
			Disp.M(false);
			c.memoryDigits.setValue(0);
			Disp.dispMemoryValue(c.memoryDigits);
		};
		var memoryRestore = function() {
			c.inputDigits.reset();
			Disp.setDigits(c.memoryDigits);
		};
		var del = function() {
			if (c.isError) {
				c.isError = false;
				Disp.E(false);
				if (c.memoryDigits.getValue() != 0) {
					Disp.M(true);
				} else {
					Disp.M(false);
				}
				return;
			}
			while (Disp.getDigits().getKeta() > 12) {
				Disp.getDigits().del();
			}
			Disp.getDigits().del();
			c.inputDigits.setDigits(Disp.getDigits());
			Disp.dispValue();
		};

		var inputReset = function() {
			c.inputDigits.reset();
			c.lastOpe = null;
			Disp.ope(null);
		};

		var calcPercent = function() {
			var nextStatus = null;
			nextStatus = calcPercent_main(c.lastDigits, Disp.getDigits());
			if (c.isError) {
				return "error";
			}
			return nextStatus;
		};
		var calc_K_Percent = function() {
			calcPercent_main(Disp.getDigits(), c.lastDigits);
			if (c.isError) {
				return "K_error";
			}
			return null;  // 特殊なstatusへは変更しない
		};

		var calcPercent_main = function(firstDigits, secondDigits) {
			var centDigits = new Digits;
			var tmpDigits = new Digits;
			var resultDigits = new Digits;
			var tmpError;
			var nextStatus = null;
			[centDigits, tmpError] = Common.calc(secondDigits, "/", 100);
			switch (c.lastOpe) {
				case "*":
					[resultDigits, c.isError] = Common.calc(firstDigits, "*", centDigits);
					c.lastOpe = null;
					Disp.ope(null);
					nextStatus = "percent_*";
					break;

				case "/":
					[resultDigits, c.isError] = Common.calc(firstDigits, "/", centDigits);
					c.lastOpe = null;
					Disp.ope(null);
					nextStatus = "percent_*";
					break;

			case "+":
			case "-":
				var err1, err2;
				[resultDigits, c.isError] = Common.calc(firstDigits, "*", centDigits);
				break;
			}
			Disp.setDigits(resultDigits);
			c.inputDigits.reset();
			Disp.E(c.isError);
			return nextStatus;
		};

		return {
			"first" : {
				numeric   : { next: null, func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: "first_ope", func: enterOpe },
				"="       : { next: null, func: inputReset},
				"%"       : { next: null, func: inputReset},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: null, func: memorySetOnly},
				"MR"      : { next: null, func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: null, func: del},
			},
			"ope" : {
				numeric   : { next: "num2", func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: null, func: enterOpe },
				"="       : { next: "first", func:  enterEqual },
				"%"       : { next: "first", func: inputReset},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: "first", func: memoryCalcAndSet},
				"MR"      : { next: "num2", func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: "num2", func: del},
			},
			"first_ope" : {
				// first状態で演算子が押されたとき。 "ope"と比べて、 "="入力時のみ異なる。
				numeric   : { next: "num2", func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: null, func: enterOpe },
				"="       : { next: "first", func:  enterEqualFirst },
				"%"       : { next: "first", func: inputReset},
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
				"%"       : { next: null, func: calcPercent},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: "first", func: memoryCalcAndSet},
				"MR"      : { next: null, func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: null, func: del},
			},
			"percent_*" : {
				numeric   : { next: null, func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: "ope", func: enterOpePercentMul },
				"="       : { next: "first", func: inputReset},
				"%"       : { next: null, func: inputReset},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: null, func: memorySetOnly},
				"MR"      : { next: null, func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: null, func: del},
			},

			"K_first": {
				numeric   : { next: "K_num", func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: "first_ope", func: enterOpe },
				"="       : { next: null, func:  enter_K_Equal },
				"%"       : { next: null, func: calcPercent},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: null, func: memory_K_CalcAndSet},
				"MR"      : { next: null, func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: null, func: del},
			},
			"K_num": {
				numeric   : { next: null, func: addVal },
				comma     : { next: null, func: enterComma },
				"PM"      : { next: null, func: enterPlusMinus },
				ope       : { next: "first_ope", func: enter_K_Ope },
				"="       : { next: null, func:  enter_K_Equal },
				"%"       : { next: null, func: calc_K_Percent},
				"ROOT"    : { next: null, func: enterROOT},
				memoryset : { next: null, func: memory_K_CalcAndSet},
				"MR"      : { next: null, func: memoryRestore},
				"MC"      : { next: null, func: memoryClear},
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: null, func: del},
			},
			"error": {
				"AC"      : { next: "first", func: reset},
				"DEL"     : { next: "first", func: del},
			},
			"K_error": {
				"AC"      : { next: "K_first", func: reset},
				"DEL"     : { next: "K_first", func: del},
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
					return "TOKI";
				},
			},
		};
	}()
);
