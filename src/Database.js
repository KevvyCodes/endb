'use strict';

const SQLite = require('better-sqlite3');
const EventEmitter = require('events').EventEmitter;

/**
 * The database
 * @extends EventEmitter
 */
class Database extends EventEmitter {
    constructor(options = {}) {
        super(options);

        /**
         * The name of the database
         * @type {string}
         */
        this.name = options.name || 'endb';

        /**
         * Whether or not, use the memory for database
         * @type {boolean}
         */
        this.memory = typeof options.memory === 'boolean' ? options.memory : false;

        /**
         * The timeout for the database
         * @type {number}
         */
        this.timeout = typeof options.timeout === 'number' ? options.timeout : 5000;

        /**
         * The SQLite connection of the database
         * @type {SQLite}
         */
        this.db = new SQLite('database.sqlite', {
            memory: this.memory,
            timeout: this.timeout,
        });

        this._validateOptions(options);
    }

    /**
     * Gets the number of rows in the database
     * @returns {number}
     */
    get count() {
        const data = this.db.prepare(`SELECT count(*) FROM '${this.name}'`).get();
        return data['count(*)'];
    }

    /**
     * Gets all the indexes (keys) from the database
     * @returns {Array<string>}
     */
    get indexes() {
        const rows = this.db.prepare(`SELECT key FROM '${this.name}'`).all();
        return rows.map((row) => row.key);
    }

    /**
     * Adds a value to a key
     * @param {string|number} key
     * @param {number} value
     * @returns {number}
     */
    add(key, value) {
        this._check();
        if (typeof value !== 'number') throw new TypeError('Value must be a number');
        let selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!selected) {
            this.db.prepare(`INSERT INTO ${this.name} (key, value) VALUES (?, ?)`).run(key, '{}');
            selected = db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        }
        if (selected.value === '{}') {
            selected.value = 0;
        } else {
            selected.value = JSON.parse(selected.value);
        }
        try {
            selected.value = JSON.parse(selected);
        } catch (err) {}
        if (isNaN(selected.value)) throw new TypeError('Value must be a number');
        value = parseInt(selected.value, 10) - parseInt(value, 10);
        value = JSON.stringify(value);
        this.db.prepare(`UPDATE ${this.name} SET value = (?) WHERE key = (?)`).run(value, key);
        let updated = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key).value;
        if (updated === '{}') {
            return null;
        } else {
            updated = JSON.parse(updated);
            try {
                updated = JSON.parse(updated);
            } catch (err) {}
            return updated;
        }
    }

    /**
     * Creates a backup of the database
     * @param {string} name
     * @returns {*}
     */
    backup(name = `backup-${Date.now()}`) {
        if (name && typeof name !== 'string') throw new TypeError('Name must be a string');
        return this.db.backup(`${name}.sqlite`);
    }

    /**
     * Checks if the table exists in the database
     * @returns {*}
     * @private
     */
    _check() {
        this.db.prepare(`CREATE TABLE IF NOT EXISTS ${this.name} (key TEXT PRIMARY KEY, value TEXT)`).run();
    }

    /**
     * Closes the database
     * @returns {*}
     */
    close() {
        return this.db.close();
    }

    /**
     * Deletes a key from the database
     * @param {string|number} key
     * @returns {boolean}
     */
    delete(key) {
        this._check();
        this.db.prepare(`DELETE FROM ${this.name} WHERE key = (?)`).run(key);
        return true;
    }

    /**
     * Deletes all the keys from the database
     * @returns {boolean}
     */
    deleteAll() {
        this._check();
        const data = db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!data) return false;
        this.db.prepare(`DELETE FROM ${this.name}`).run();
        return true;
    }

    /**
     * Finds a key matching the prefix supplied
     * @param {string|number} prefix
     * @returns {object}
     */
    find(prefix) {
        this._check();
        const data = db.prepare(`SELECT * FROM ${this.name} WHERE key LIKE (?)`).all([`${prefix}%`]);
        const row = this._row2Obj(data);
        return row;
    }

    /**
     * Gets the specified key from the database, if exists
     * @param {string|number} key
     * @returns {string|number|Object}
     */
    get(key) {
        this._check();
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!data) return null;
        try {
            data.value = JSON.parse(data.value);
        } catch (err) {
            data.value;
        }

        /**
         * Emitted whenever get method is called
         * @event Database#get
         * @param {string|number|Object} data
         */
        this.emit('get', data);

        return data.value;
    }

    /**
     * Gets all the keys and values from the database
     * @returns {Array<Object>}
     */
    getAll() {
        this._check();
        const rows = this.db.prepare(`SELECT * FROM ${this.name} WHERE key IS NOT NULL`).all();
        return rows;
    }

    /**
     * Whether or not, specified key exists
     * @param {string|number} key
     * @returns {boolean}
     */
    has(key) {
        this._check();
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        return data ? true : false;
    }

    _row2Obj(rows) {
        const _row = {};
        for (const i in rows) {
            const row = rows[i];
            const key = row.key;
            _row[key] = JSON.parse(row.value);
        }
        return _row;
    }

    /**
     * Sets a key and value to the database
     * @param {string|number} key
     * @param {string|number|Object} value
     * @returns {Object}
     */
    set(key, value) {
        this._check();
        if (!key || !value) throw new TypeError('No key and value supplied');
        let selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!selected) {
            this.db.prepare(`INSERT INTO ${this.name} (key, value) VALUES (?, ?)`).run(key, '{}');
            selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        }
        selected = JSON.parse(selected.value);
        try {
            selected = JSON.parse(selected);
        } catch (err) {}
        value = typeof value === 'object' ? JSON.stringify(value) : value;
        this.db.prepare(`UPDATE ${this.name} SET value = (?) WHERE key = (?)`).run(key, value);
        let updated = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key).value;
        if (updated === '{}') {
            return null;
        } else {
            updated = JSON.parse(updated);
            try {
                updated = JSON.parse(updated);
            } catch (err) {}
        }

        /**
         * Emitted whenever set method is called
         * @event Database#set
         * @param {string|number|Object} data
         */
        this.emit('set', updated);

        return updated;
    }

    /**
     * Subtracts a value from the key
     * @param {string|number} key
     * @param {number} value
     * @returns {number}
     */
    subtract(key, value) {
        this._check();
        if (typeof value !== 'number') throw new TypeError('Value must be a number');
        let selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!selected) {
            this.db.prepare(`INSERT INTO ${this.name} (key, value) VALUES (?, ?)`).run(key, '{}');
            selected = db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        }
        if (selected.value === '{}') {
            selected.value = 0;
        } else {
            selected.value = JSON.parse(selected.value);
        }
        try {
            selected.value = JSON.parse(selected);
        } catch (err) {}
        if (isNaN(selected.value)) throw new TypeError('Value must be a number');
        value = parseInt(selected.value, 10) - parseInt(value, 10);
        value = JSON.stringify(value);
        this.db.prepare(`UPDATE ${this.name} SET value = (?) WHERE key = (?)`).run(value, key);
        let updated = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key).value;
        if (updated === '{}') {
            return null;
        } else {
            updated = JSON.parse(updated);
            try {
                updated = JSON.parse(updated);
            } catch (err) {}
            return updated;
        }
    }

    /**
     * Validates the database options
     * @param {DatabaseOptions} options
     * @private
     */
    _validateOptions(options) {
        if (options.name && typeof options.name !== 'string') {
            throw new TypeError('Database name must be a string');
        }
        if (options.memory && typeof options.memory !== 'boolean') {
            throw new TypeError('The option "memory" must be a boolean');
        }
    }
}

module.exports = Database;