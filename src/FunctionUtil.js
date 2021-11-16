/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");

module.exports = Class("@frontgear/lang/FunctionUtil", function(FunctionUtil)
{

	// Private Static Properties

	var _slice = Array.prototype.slice;

	// Public Static Methods

	FunctionUtil.bind = function(func, scope)
	{
		if (arguments.length < 3)
			return function() { return func.apply(scope, arguments); };

		var args = _slice.call(arguments, 2);
		return function() { return func.apply(scope, args.concat(_slice.call(arguments))); };
	};

	FunctionUtil.noop = function()
	{
		// noop
	};

});
