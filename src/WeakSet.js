/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");
var UID = require("./UID");

var NativeWeakSet = (function()
{
	try
	{
		if (typeof WeakSet !== "function")
			return null;

		var key1 = {};
		var key2 = {};
		var key3 = function(){};
		var key4 = function(){};
		var weakSet = new WeakSet([ key1, key2, key3, key4 ]);

		// ensure native implementation, not polyfill
		if (Object.prototype.toString.call(weakSet) !== "[object WeakSet]")
			return null;

		// ensure key equality is correct (key1 !== key2 !== key3 !== key4)
		weakSet["delete"](key2);
		weakSet["delete"](key4);
		if (!weakSet.has(key1) || !weakSet.has(key3))
			return null;

		// ensure has and delete methods do not throw when key is not an object
		weakSet.has(null);
		weakSet.has(1);
		weakSet["delete"](null);
		weakSet["delete"](1);

		return WeakSet;
	}
	catch (e)
	{
		return null;
	}
})();

module.exports = Class("@frontgear/lang/WeakSet", Object, function(WeakSet, base)
{
	if (NativeWeakSet)
	{
		// Public Static Properties

		WeakSet.NativeWeakSet = NativeWeakSet;

		// Private Properties

		this._weakSet = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._weakSet = (entries != null) ? new NativeWeakSet(entries) : new NativeWeakSet();
		};

		// Public Methods

		this.add = function(key)
		{
			this._weakSet.add(key);
			return this;
		};

		this.del = function(key)
		{
			this._weakSet["delete"](key);
			return this;
		};

		this.has = function(key)
		{
			return this._weakSet.has(key);
		};
	}
	else
	{
		// Private Static Constants

		var _WEAK_SET_KEY = "__weakSet_" + UID.random() + "__";

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
					this.add(entries[i]);
			}
		};

		// Public Methods

		this.add = function(key)
		{
			if (key == null)
				throw new Error("Parameter key must be non-null.");

			var weakSet;
			if (_hasOwnProperty.call(key, _WEAK_SET_KEY))
			{
				weakSet = key[_WEAK_SET_KEY];
			}
			else
			{
				if (!Class.isObject(key))
					throw new Error("Parameter key must be of type Object.");

				weakSet = key[_WEAK_SET_KEY] = { _entries: {}, _size: 0 };
			}

			if (weakSet._entries.hasOwnProperty(this._uid))
				return this;

			weakSet._entries[this._uid] = true;
			weakSet._size++;
			return this;
		};

		this.del = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_SET_KEY))
				return this;

			var weakSet = key[_WEAK_SET_KEY];
			if (!weakSet._entries.hasOwnProperty(this._uid))
				return this;

			delete weakSet._entries[this._uid];
			weakSet._size--;
			if (weakSet._size === 0)
				delete key[_WEAK_SET_KEY];

			return this;
		};

		this.has = function(key)
		{
			if ((key == null) || !_hasOwnProperty.call(key, _WEAK_SET_KEY))
				return false;

			var weakSet = key[_WEAK_SET_KEY];
			if (!weakSet._entries.hasOwnProperty(this._uid))
				return false;

			return true;
		};
	}
});
