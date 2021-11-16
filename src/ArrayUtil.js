/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");

module.exports = Class("@frontgear/lang/ArrayUtil", function(ArrayUtil)
{

	// Public Static Methods

	ArrayUtil.indexOf = function(arr, value, start)
	{
		var l = arr.length;
		var i = 0;

		if (start != null)
		{
			start = +start;
			if (start >= 0)
				i = Math.floor(start);
			else if (start < 0)
				i = Math.max(l + Math.ceil(start), 0);
		}

		for (i; i < l; i++)
		{
			if (arr[i] === value)
				return i;
		}

		return -1;
	};

	ArrayUtil.lastIndexOf = function(arr, value, start)
	{
		var l = arr.length;
		var i = l - 1;

		if (start != null)
		{
			start = +start;
			if (start >= 0)
				i = Math.min(Math.floor(start), l - 1);
			else if (start < 0)
				i = l + Math.ceil(start);
		}

		for (i; i >= 0; i--)
		{
			if (arr[i] === value)
				return i;
		}

		return -1;
	};

	ArrayUtil.binarySearch = function(arr, value, comparator)
	{
		var high = arr.length - 1;
		if (high < 0)
			return -1;

		if (!comparator)
			comparator = _naturalComparator;

		var low = 0;
		var mid;
		var comp;

		while (low <= high)
		{
			mid = low + Math.floor((high - low) / 2);
			comp = comparator(arr[mid], value);
			if (comp < 0)
				low = mid + 1;
			else if (comp > 0)
				high = mid - 1;
			else
				return mid;
		}

		return -low - 1;
	};

	ArrayUtil.forEach = function(arr, callback, scope)
	{
		if (scope == null)
			scope = arr;

		for (var i = 0, l = arr.length; i < l; i++)
			callback.call(scope, arr[i], i, arr);
	};

	// Private Static Methods

	var _naturalComparator = function(value1, value2)
	{
		if (value1 < value2)
			return -1;
		if (value1 > value2)
			return 1;
		return 0;
	};

});
