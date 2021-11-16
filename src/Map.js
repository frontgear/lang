/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");
var UID = require("./UID");

var NativeMap = (function()
{
	try
	{
		if (typeof Map !== "function")
			return null;

		var map = new Map([ [void(0), 1], [null, 2], [-0, 3], [0, 4], [0/0, 5], [0/0, 6] ]);

		// ensure native implementation, not polyfill
		if (Object.prototype.toString.call(map) !== "[object Map]")
			return null;

		// ensure forEach is available
		if (typeof map.forEach !== "function")
			return null;

		// ensure size is a property, not a function, and value is correct
		if ((typeof map.size !== "number") || (map.size !== 4))
			return null;

		// ensure key equality is correct (undefined !== null, -0 === 0, NaN === NaN)
		if ((map.get(void(0)) !== 1) || (map.get(null) !== 2) || (map.get(-0) !== 4) || (map.get(0) !== 4) || (map.get(0/0) !== 6))
			return null;

		return Map;
	}
	catch (e)
	{
		return null;
	}
})();

module.exports = Class("@frontgear/lang/Map", Object, function(Map, base)
{
	if (NativeMap)
	{
		// Public Static Properties

		Map.NativeMap = NativeMap;

		// Private Properties

		this._map = null;

		// Constructor

		this.constructor = function(entries)
		{
			this._map = (entries != null) ? new NativeMap(entries) : new NativeMap();
		};

		// Public Methods

		this.get = function(key)
		{
			return this._map.get(key);
		};

		this.set = function(key, value)
		{
			this._map.set(key, value);
			return this;
		};

		this.del = function(key)
		{
			this._map["delete"](key);
			return this;
		};

		this.has = function(key)
		{
			return this._map.has(key);
		};

		this.size = function()
		{
			return this._map.size;
		};

		this.clear = function()
		{
			this._map.clear();
			return this;
		};

		this.keys = function()
		{
			var keys = [];
			this._map.forEach(function(value, key) { keys.push(key); });
			return keys;
		};

		this.values = function()
		{
			var values = [];
			this._map.forEach(function(value, key) { values.push(value); });
			return values;
		};

		this.pairs = function()
		{
			var pairs = [];
			this._map.forEach(function(value, key) { pairs.push([ key, value ]); });
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

			this._map.forEach(function(value, key) { callback.call(scope, value, key, this); }, this);

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
					this.set(entries[i][0], entries[i][1]);
			}
		};

		// Public Methods

		this.get = function(key)
		{
			var uid = UID.get(key, false);
			if (!uid || !this._entries.hasOwnProperty(uid))
				return void(0);

			return this._entries[uid][1];
		};

		this.set = function(key, value)
		{
			var uid = UID.get(key);
			if (this._entries.hasOwnProperty(uid))
			{
				this._entries[uid][1] = value;
				return this;
			}

			this._entries[uid] = [ key, value ];
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
					keys.push(entries[uid][0]);
			}
			return keys;
		};

		this.values = function()
		{
			var values = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					values.push(entries[uid][1]);
			}
			return values;
		};

		this.pairs = function()
		{
			var pairs = [];
			var entries = this._entries;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
					pairs.push(entries[uid].concat());
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
			var entry;
			for (var uid in entries)
			{
				if (entries.hasOwnProperty(uid))
				{
					entry = entries[uid];
					callback.call(scope, entry[1], entry[0], this);
				}
			}

			return this;
		};
	}
});
