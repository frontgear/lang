/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");

module.exports = Class("@frontgear/lang/ErrorUtil", function(ErrorUtil)
{

	// Public Static Methods

	ErrorUtil.nonBlockingThrow = function(err)
	{
		if ((typeof console !== "undefined") && (typeof console.error === "function"))
		{
			try
			{
				console.error(err);
				return;
			}
			catch (e)
			{
				// ignore console errors
			}
		}

		setTimeout(function() { throw err; }, 0);
	};

});
