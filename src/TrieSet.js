/*!
 * Copyright (c) @crzyj
 *
 * Released under the MIT license:
 * https://opensource.org/licenses/MIT
 */

var Class = require("./Class");
var Map = require("./Map");
var UID = require("./UID");

var NativeMap = Map.NativeMap || null;

module.exports = Class("@frontgear/lang/TrieSet", Object, function(TrieSet, base)
{

	// Private Static Methods

	if (NativeMap)
	{
		var _add = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var key = keys[keyIndex];
				var entry = node._entries.get(key);
				if (!entry)
				{
					entry = { _entries: new NativeMap(), _size: 0, key: key };
					node._entries.set(key, entry);
				}

				if (!_add(entry, keyIndex + 1, keyCount, keys))
					return false;

				node._size++;
				return true;
			}

			if (node.hasOwnProperty("has"))
				return false;

			node.has = true;
			node._size++;
			return true;
		};

		var _del = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var key = keys[keyIndex];
				var entry = node._entries.get(key);
				if (!entry)
					return false;

				if (!_del(entry, keyIndex + 1, keyCount, keys))
					return false;

				if (entry._size === 0)
					node._entries["delete"](key);

				node._size--;
				return true;
			}

			if (!node.hasOwnProperty("has"))
				return false;

			delete node.has;
			node._size--;
			return true;
		};

		var _has = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var entry = node._entries.get(keys[keyIndex]);
				if (!entry)
					return false;

				return _has(entry, keyIndex + 1, keyCount, keys);
			}

			return node.hasOwnProperty("has");
		};

		var _size = function(node, keyIndex, keyCount, prefixKeys)
		{
			if (keyIndex < keyCount)
			{
				var entry = node._entries.get(prefixKeys[keyIndex]);
				if (!entry)
					return 0;

				return _size(entry, keyIndex + 1, keyCount, prefixKeys);
			}

			return node._size;
		};

		var _clear = function(node, keyIndex, keyCount, prefixKeys)
		{
			var clearCount;

			if (keyIndex < keyCount)
			{
				var key = prefixKeys[keyIndex];
				var entry = node._entries.get(key);
				if (!entry)
					return 0;

				clearCount = _clear(entry, keyIndex + 1, keyCount, prefixKeys);
				if (clearCount === 0)
					return 0;

				if (entry._size === 0)
					node._entries["delete"](key);

				node._size -= clearCount;
				return clearCount;
			}

			clearCount = node._size;
			if (clearCount === 0)
				return 0;

			delete node.has;
			node._entries = new NativeMap();
			node._size = 0;
			return clearCount;
		};

		var _traverse = function(node, keyIndex, keyCount, prefixKeys, pathKeys, callback)
		{
			var entries = node._entries;

			if (keyIndex < keyCount)
			{
				var key = prefixKeys[keyIndex];
				var entry = entries.get(key);
				if (!entry)
					return;

				pathKeys.push(entry.key);
				_traverse(entry, keyIndex + 1, keyCount, prefixKeys, pathKeys, callback);
				pathKeys.pop();
				return;
			}

			if (node.hasOwnProperty("has"))
				callback(pathKeys.concat());

			entries.forEach(function(entry)
			{
				pathKeys.push(entry.key);
				_traverse(entry, keyIndex, keyCount, prefixKeys, pathKeys, callback);
				pathKeys.pop();
			});
		};
	}
	else
	{
		var _add = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var entries = node._entries;
				var uid = UID.get(keys[keyIndex]);
				if (!entries.hasOwnProperty(uid))
					entries[uid] = { _entries: {}, _size: 0, key: keys[keyIndex] };

				if (!_add(entries[uid], keyIndex + 1, keyCount, keys))
					return false;

				node._size++;
				return true;
			}

			if (node.hasOwnProperty("has"))
				return false;

			node.has = true;
			node._size++;
			return true;
		};

		var _del = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var entries = node._entries;
				var uid = UID.get(keys[keyIndex], false);
				if (!uid || !entries.hasOwnProperty(uid))
					return false;

				if (!_del(entries[uid], keyIndex + 1, keyCount, keys))
					return false;

				if (entries[uid]._size === 0)
					delete entries[uid];

				node._size--;
				return true;
			}

			if (!node.hasOwnProperty("has"))
				return false;

			delete node.has;
			node._size--;
			return true;
		};

		var _has = function(node, keyIndex, keyCount, keys)
		{
			if (keyIndex < keyCount)
			{
				var entries = node._entries;
				var uid = UID.get(keys[keyIndex], false);
				if (!uid || !entries.hasOwnProperty(uid))
					return false;

				return _has(entries[uid], keyIndex + 1, keyCount, keys);
			}

			return node.hasOwnProperty("has");
		};

		var _size = function(node, keyIndex, keyCount, prefixKeys)
		{
			if (keyIndex < keyCount)
			{
				var entries = node._entries;
				var uid = UID.get(prefixKeys[keyIndex], false);
				if (!uid || !entries.hasOwnProperty(uid))
					return 0;

				return _size(entries[uid], keyIndex + 1, keyCount, prefixKeys);
			}

			return node._size;
		};

		var _clear = function(node, keyIndex, keyCount, prefixKeys)
		{
			var clearCount;

			if (keyIndex < keyCount)
			{
				var entries = node._entries;
				var uid = UID.get(prefixKeys[keyIndex], false);
				if (!uid || !entries.hasOwnProperty(uid))
					return 0;

				clearCount = _clear(entries[uid], keyIndex + 1, keyCount, prefixKeys);
				if (clearCount === 0)
					return 0;

				if (entries[uid]._size === 0)
					delete entries[uid];

				node._size -= clearCount;
				return clearCount;
			}

			clearCount = node._size;
			if (clearCount === 0)
				return 0;

			delete node.has;
			node._entries = {};
			node._size = 0;
			return clearCount;
		};

		var _traverse = function(node, keyIndex, keyCount, prefixKeys, pathKeys, callback)
		{
			var entries = node._entries;
			var uid;

			if (keyIndex < keyCount)
			{
				uid = UID.get(prefixKeys[keyIndex], false);
				if (!uid || !entries.hasOwnProperty(uid))
					return;

				pathKeys.push(entries[uid].key);
				_traverse(entries[uid], keyIndex + 1, keyCount, prefixKeys, pathKeys, callback);
				pathKeys.pop();
				return;
			}

			if (node.hasOwnProperty("has"))
				callback(pathKeys.concat());

			for (uid in entries)
			{
				if (entries.hasOwnProperty(uid))
				{
					pathKeys.push(entries[uid].key);
					_traverse(entries[uid], keyIndex, keyCount, prefixKeys, pathKeys, callback);
					pathKeys.pop();
				}
			}
		};
	}

	// Private Properties

	this._entries = null;
	this._size = 0;

	// Constructor

	this.constructor = function(entries)
	{
		this._entries = NativeMap ? new NativeMap() : {};

		if (entries != null)
		{
			for (var i = 0, l = entries.length; i < l; i++)
				this.add(entries[i]);
		}
	};

	// Public Methods

	this.add = function(keys)
	{
		if (keys == null)
			throw new Error("Parameter keys must be non-null.");
		if (!Class.isArray(keys))
			throw new Error("Parameter keys must be of type Array.");

		var keyCount = keys.length;
		if (keyCount === 0)
			throw new Error("Parameter keys must be non-empty.");

		_add(this, 0, keyCount, keys);
		return this;
	};

	this.del = function(keys)
	{
		if (keys == null)
			throw new Error("Parameter keys must be non-null.");
		if (!Class.isArray(keys))
			throw new Error("Parameter keys must be of type Array.");

		var keyCount = keys.length;
		if (keyCount === 0)
			throw new Error("Parameter keys must be non-empty.");

		_del(this, 0, keyCount, keys);
		return this;
	};

	this.has = function(keys)
	{
		if (keys == null)
			throw new Error("Parameter keys must be non-null.");
		if (!Class.isArray(keys))
			throw new Error("Parameter keys must be of type Array.");

		var keyCount = keys.length;
		if (keyCount === 0)
			throw new Error("Parameter keys must be non-empty.");

		return _has(this, 0, keyCount, keys);
	};

	this.size = function(prefixKeys)
	{
		if (prefixKeys == null)
			return _size(this, 0, 0, null);
		else if (Class.isArray(prefixKeys))
			return _size(this, 0, prefixKeys.length, prefixKeys);
		else
			throw new Error("Parameter prefixKeys must be of type Array.");
	};

	this.clear = function(prefixKeys)
	{
		if (prefixKeys == null)
			_clear(this, 0, 0, null);
		else if (Class.isArray(prefixKeys))
			_clear(this, 0, prefixKeys.length, prefixKeys);
		else
			throw new Error("Parameter prefixKeys must be of type Array.");

		return this;
	};

	this.keys = function(prefixKeys)
	{
		var keys = [];

		if (prefixKeys == null)
			_traverse(this, 0, 0, null, [], function(key) { keys.push(key); });
		else if (Class.isArray(prefixKeys))
			_traverse(this, 0, prefixKeys.length, prefixKeys, [], function(key) { keys.push(key); });
		else
			throw new Error("Parameter prefixKeys must be of type Array.");

		return keys;
	};

	this.values = function(prefixKeys)
	{
		return this.keys(prefixKeys);
	};

	this.pairs = function(prefixKeys)
	{
		var pairs = [];

		if (prefixKeys == null)
			_traverse(this, 0, 0, null, [], function(key) { pairs.push([ key, key ]); });
		else if (Class.isArray(prefixKeys))
			_traverse(this, 0, prefixKeys.length, prefixKeys, [], function(key) { pairs.push([ key, key ]); });
		else
			throw new Error("Parameter prefixKeys must be of type Array.");

		return pairs;
	};

	this.entries = function(prefixKeys)
	{
		return this.pairs(prefixKeys);
	};

	this.forEach = function(prefixKeys, callback, scope)
	{
		if (prefixKeys == null)
			throw new Error("Parameter 0 must be non-null.");

		if (Class.isFunction(prefixKeys))
		{
			scope = callback;
			callback = prefixKeys;
			prefixKeys = null;
		}
		else if (Class.isArray(prefixKeys))
		{
			if (callback == null)
				throw new Error("Parameter callback must be non-null.");
			if (!Class.isFunction(callback))
				throw new Error("Parameter callback must be of type Function.");

			// copy prefixKeys since callback could modify original
			prefixKeys = prefixKeys.concat();
		}
		else
		{
			throw new Error("Parameter 0 must be of type Array or Function.");
		}

		if (scope == null)
			scope = this;

		var self = this;
		if (prefixKeys == null)
			_traverse(this, 0, 0, null, [], function(key) { callback.call(scope, key, key, self); });
		else
			_traverse(this, 0, prefixKeys.length, prefixKeys, [], function(key) { callback.call(scope, key, key, self); });

		return this;
	};

});
