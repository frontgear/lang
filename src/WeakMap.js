/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");
var UID = require("./UID");

var NativeWeakMap = (function()
{
	try
	{
		if (typeof WeakMap !== "function")
			return null;

		var key1 = {};
		var key2 = {};
		var key3 = function(){};
		var key4 = function(){};
		var weakMap = new WeakMap([ [key1, 1], [key2, 2], [key3, 3], [key4, 4] ]);

		// ensure native implementation, not polyfill
		if (Object.prototype.toString.call(weakMap) !== "[object WeakMap]")
			return null;

		// ensure key equality is correct (key1 !== key2 !== key3 !== key4)
		if ((weakMap.get(key1) !== 1) || (weakMap.get(key2) !== 2) || (weakMap.get(key3) !== 3) || (weakMap.get(key4) !== 4))
			return null;

		// ensure get, has, and delete methods do not throw when key is not an object
		weakMap.get(null);
		weakMap.get(1);
		weakMap.has(null);
		weakMap.has(1);
		weakMap["delete"](null);
		weakMap["delete"](1);

		return WeakMap;
	}
	catch (e)
	{
		return null;
	}
})();

module.exports = Class("@frontgear/lang/WeakMap", Object, function(WeakMap, base)
{
	if (NativeWeakMap)
	{
		// Public Static Properties

		WeakMap.NativeWeakMap = NativeWeakMap;

		// Private Properties

		this._weakMap = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._weakMap = (entries != null) ? new NativeWeakMap(entries) : new NativeWeakMap();
		};

		// Public Methods

		this.get = function(key)
		{
			return this._weakMap.get(key);
		};

		this.set = function(key, value)
		{
			this._weakMap.set(key, value);
			return this;
		};

		this.del = function(key)
		{
			this._weakMap["delete"](key);
			return this;
		};

		this.has = function(key)
		{
			return this._weakMap.has(key);
		};
	}
	else
	{
		// Private Static Constants

		var _WEAK_MAP_KEY = "__weakMap_" + UID.random() + "__";

		// Private Static Properties

		var _hasOwnProperty = Object.prototype.hasOwnProperty;

		// Private Properties

		this._uid = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._uid = UID.get(this);

			if (entries != null)
			{
				for (var i = 0, l = entries.length; i < l; i++)
					this.set(entries[i][0], entries[i][1]);
			}
		};

		// Public Methods

		this.get = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return void(0);

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return void(0);

			return weakMap._entries[this._uid];
		};

		this.set = function(key, value)
		{
			if (key == null)
				throw new Error("Parameter key must be non-null.");

			var weakMap;
			if (_hasOwnProperty.call(key, _WEAK_MAP_KEY))
			{
				weakMap = key[_WEAK_MAP_KEY];
			}
			else
			{
				if (!Class.isObject(key))
					throw new Error("Parameter key must be of type Object.");

				weakMap = key[_WEAK_MAP_KEY] = { _entries: {}, _size: 0 };
			}

			if (weakMap._entries.hasOwnProperty(this._uid))
			{
				weakMap._entries[this._uid] = value;
				return this;
			}

			weakMap._entries[this._uid] = value;
			weakMap._size++;
			return this;
		};

		this.del = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return this;

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return this;

			delete weakMap._entries[this._uid];
			weakMap._size--;
			if (weakMap._size === 0)
				delete key[_WEAK_MAP_KEY];

			return this;
		};

		this.has = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_MAP_KEY))
				return false;

			var weakMap = key[_WEAK_MAP_KEY];
			if (!weakMap._entries.hasOwnProperty(this._uid))
				return false;

			return true;
		};
	}
});
