/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");
var UID = require("./UID");

var NativeSet = (function()
{
	try
	{
		if (typeof Set !== "function")
			return null;

		var set = new Set([ void(0), null, -0, 0, 0/0, 0/0 ]);

		// ensure native implementation, not polyfill
		if (Object.prototype.toString.call(set) !== "[object Set]")
			return null;

		// ensure forEach is available
		if (typeof set.forEach !== "function")
			return null;

		// ensure size is a property, not a function, and value is correct
		if ((typeof set.size !== "number") || (set.size !== 4))
			return null;

		// ensure key equality is correct (undefined !== null, -0 === 0, NaN === NaN)
		if (!set.has(void(0)) || !set.has(null) || !set.has(-0) || !set.has(0) || !set.has(0/0))
			return null;

		return Set;
	}
	catch (e)
	{
		return null;
	}
})();

module.exports = Class("@frontgear/lang/Set", Object, function(Set, base)
{
	if (NativeSet)
	{
		// Public Static Properties

		Set.NativeSet = NativeSet;

		// Private Properties

		this._set = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._set = (entries != null) ? new NativeSet(entries) : new NativeSet();
		};

		// Public Methods

		this.add = function(key)
		{
			this._set.add(key);
			return this;
		};

		this.del = function(key)
		{
			this._set["delete"](key);
			return this;
		};

		this.has = function(key)
		{
			return this._set.has(key);
		};

		this.size = function()
		{
			return this._set.size;
		};

		this.clear = function()
		{
			this._set.clear();
			return this;
		};

		this.keys = function()
		{
			var keys = [];
			this._set.forEach(function(key) { keys.push(key); });
			return keys;
		};

		this.values = function()
		{
			return this.keys();
		};

		this.pairs = function()
		{
			var pairs = [];
			this._set.forEach(function(key) { pairs.push([ key, key ]); });
			return pairs;
		};

		this.entries = function()
		{
			return this.pairs();
		};

		this.forEach = function(callback, scope)
		{
			if (callback == null)
				throw new Error("Parameter callback must be non-null.");
			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.")

			if (scope == null)
				scope = this;

			this._set.forEach(function(key) { callback.call(scope, key, key, this); }, this);

			return this;
		};
	}
	else
	{
		// Private Properties

		this._entries = null;
		this._size = 0;

		// Constructor

		this.constructor = function(entries)
		{
			this._entries = {};

			if (entries != null)
			{
				for (var i = 0, l = entries.length; i < l; i++)
					this.add(entries[i]);
			}
		};

		// Public Methods

		this.add = function(key)
		{
			var uid = UID.get(key);
			if (this._entries.hasOwnProperty(uid))
				return this;

			this._entries[uid] = key;
			this._size++;
			return this;
		};

		this.del = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return this;

			delete this._entries[uid];
			this._size--;
			return this;
		};

		this.has = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return false;

			return true;
		};

		this.size = function()
		{
			return this._size;
		};

		this.clear = function()
		{
			if (this._size === 0)
				return this;

			this._entries = {};
			this._size = 0;
			return this;
		};

		this.keys = function()
		{
			var keys = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					keys.push(entries[uid]);
			}
			return keys;
		};

		this.values = function()
		{
			return this.keys();
		};

		this.pairs = function()
		{
			var pairs = [];
			var entries = this._entries;
			var key;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
				{
					key = entries[uid];
					pairs.push([ key, key ]);
				}
			}
			return pairs;
		};

		this.entries = function()
		{
			return this.pairs();
		};

		this.forEach = function(callback, scope)
		{
			if (callback == null)
				throw new Error("Parameter callback must be non-null.");
			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.")

			if (scope == null)
				scope = this;

			var entries = this._entries;
			var key;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
				{
					key = entries[uid];
					callback.call(scope, key, key, this);
				}
			}

			return this;
		};
	}
});
