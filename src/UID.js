/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");

var NativeWeakMap = (function()
{
	try
	{
		if (typeof WeakMap !== "function")
			return null;

		// ensure native implementation, not polyfill
		if (Object.prototype.toString.call(WeakMap.prototype) !== "[object WeakMap]")
			return null;

		return WeakMap;
	}
	catch (e)
	{
		return null;
	}
})();

module.exports = Class("@frontgear/lang/UID", function(UID)
{

	// Private Static Constants

	var _UID_KEY;  // value initialized below

	// Private Static Properties

	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var _uidMap = NativeWeakMap ? new NativeWeakMap() : null;
	var _uidCount = 0;

	// Public Static Methods

	if (_uidMap)
	{
		UID.get = function(value, create)
		{
			if (value == null)
				return ("" + value);

			var type = (typeof value);
			switch (type)
			{
				case "object":
				case "function":
					var uid = _uidMap.get(value);
					if (uid)
						return uid;
					if (create === false)
						return null;
					uid = type + (++_uidCount);
					_uidMap.set(value, uid);
					return uid;
				default:
					return (type + value);
			}
		};
	}
	else
	{
		UID.get = function(value, create)
		{
			if (value == null)
				return ("" + value);

			var type = (typeof value);
			switch (type)
			{
				case "object":
				case "function":
					if (_hasOwnProperty.call(value, _UID_KEY))
						return value[_UID_KEY];
					if (create === false)
						return null;
					return (value[_UID_KEY] = type + (++_uidCount));
				default:
					return (type + value);
			}
		};
	}

	UID.random = function(digits, radix)
	{
		digits = (digits != null) ? +digits : 16;
		radix = (radix != null) ? +radix : 16;

		var str = "";
		for (var i = 0; i < digits; i++)
			str += Math.floor(radix * Math.random()).toString(radix);
		return str;
	};

	// Initialization

	_UID_KEY = "__uid_" + UID.random() + "__";

});
