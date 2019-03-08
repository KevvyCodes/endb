'use strict';

const Error = require('./Error');
const fs = require('fs');
const path = require('path');
const SQLite = require('better-sqlite3');
const _ = require('lodash');

/**
 * @class
 * Endb – Enhanced Database, is a simplified and powerful database for storing, accessing, and managing database.
 */
class Database {
    constructor(options = {}) {

        /**
         * The name of the database
         * @type {string}
         */
        this.name = typeof options.name === 'string' ? options.name : 'endb';

        /**
         * The filename of the database
         * @type {string}
         */
        this.fileName = typeof options.fileName === 'string' ? options.fileName : 'endb';

        /**
         * The data directory for the database
         * @type {string}
         */
        this.path = typeof options.path === 'string' ? path.resolve(process.cwd(), options.path) : path.resolve(process.cwd(), './');

        /**
         * Whether or not, use the memory for database
         * @type {boolean}
         */
        this.memory = typeof options.memory === 'boolean' ? options.memory : false;

        /**
         * Whether or not, the database file must exist, if not throws and Error
         * @type {boolean}
         */
        this.fileMustExist = typeof options.fileMustExist === 'boolean' ? options.fileMustExist : false;

        /**
         * The timeout for the database
         * @type {number}
         */
        this.timeout = typeof options.timeout === 'number' ? options.timeout : 5000;

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);

        /**
         * The SQLite connection of the database
         * @type {*}
         */
        this.db = new SQLite(`${this.path}${path.sep}${this.fileName}.sqlite`, {
            memory: this.memory,
            fileMustExist: this.fileMustExist,
            timeout: this.timeout
        });
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
     * @example
     * Database.add('key', 1);
     */
    add(key, value) {
        this._check();
        if (_.isNil(key) || !['String', 'Number'].includes(key.constructor.name)) {
            throw new Error('Key must be string or number', 'EndbTypeError');
        }
        if (_.isNil(value) || _.isNaN(value)) {
            throw new Error('Value must be a number', 'EndbTypeError');
        }
        let selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?);`).get(key);
        let val;
        if (selected) {
            val = value;
        } else if (!selected) {
            val = 0;
        }
        this.set(key, _.toNumber(value) + _.toNumber(val));
        return value;
    }

    /**
     * Creates a backup of the database
     * @param {string} name
     * @returns {void}
     * @example
     * Database.backup('mybackup');
     */
    backup(name = `backup-${Date.now()}`) {
        if (name && typeof name !== 'string') throw new Error('Name is not specified', 'EndbParameterError');
        this.db.backup(`${name}.sqlite`);
        return undefined;
    }

    /**
     * Checks if the table exists in the database
     * @returns {null}
     * @private
     */
    _check() {
        this.db.prepare(`CREATE TABLE IF NOT EXISTS ${this.name} (key TEXT PRIMARY KEY, value TEXT);`).run();
    }

    /**
     * Closes the database
     * @returns {*}
     * @example
     * Database.close();
     */
    close() {
        return this.db.close();
    }

    /**
     * Deletes a key from the database
     * @param {string|number} key
     * @returns {boolean}
     * @example
     * Database.delete('key');
     */
    delete(key) {
        this._check();
        if (!key) return false;
        this.db.prepare(`DELETE FROM ${this.name} WHERE key = (?);`).run(key);
        return true;
    }

    /**
     * Deletes all the keys from the database
     * @returns {boolean}
     * @example
     * Database.deleteAll();
     */
    deleteAll() {
        this._check();
        this.db.prepare(`DELETE FROM ${this.name};`).run();
        return true;
    }

    /**
     * Destroys the database (THE DATABASE CANNOT BE REVERT BACK ONCE DESTROYED)
     * @returns {null}
     * @example
     * Database.destroy();
     */
    destroy() {
        this._check();
        this.deleteAll();
        this.db.prepare(`DROP TABLE IF EXISTS '${this.name}'`).run();
        return null;
    }

    /**
     * Finds a key matching the prefix supplied
     * @param {string|number} prefix
     * @returns {object}
     * @example
     * Database.find('key');
     */
    find(prefix) {
        this._check();
        if (!prefix) throw new Error('Prefix is not specified', 'EndbParameterError');
        const data = db.prepare(`SELECT * FROM ${this.name} WHERE key LIKE (?)`).all([`${prefix}%`]);
        if (!data) return null;
        const row2Obj = function (rows) {
            const _row = {};
            for (const i in rows) {
                const row = rows[i];
                const key = row.key;
                _row[key] = JSON.parse(row.value);
            }
            return _row;
        }
        const row = row2Obj(data);
        return row;
    }

    /**
     * Gets the specified key from the database, if exists
     * @param {string|number} key
     * @returns {string|number|Object}
     * @example
     * Database.get('key');
     */
    get(key) {
        this._check();
        if (!key) throw new Error('Key is not specified', 'EndbParameterError');
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?);`).get(key);
        if (!data) return null;
        try {
            data.value = JSON.parse(data.value);
        } catch (err) {
            data.value;
        }
        return data.value;
    }

    /**
     * Gets all the keys and values from the database
     * @returns {Array<Object>}
     * @example
     * Database.getAll();
     */
    getAll() {
        this._check();
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key IS NOT NULL`).all();
        if (!data) return null;
        return data;
    }

    /**
     * Whether or not, specified key exists
     * @param {string|number} key
     * @returns {boolean}
     * @example
     * Database.has('key');
     */
    has(key) {
        this._check();
        const data = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        return data ? true : false;
    }

    /**
     * Pushes a value into a key
     * @param {string|number} key
     * @param {string|number|Object} value
     */
    push(key, value) {}

    /**
     * Sets a key and value to the database
     * @param {string|number} key
     * @param {string|number|Object} value
     * @returns {Object}
     * @example
     * Database.set('key', 'value');
     */
    set(key, value) {
        this._check();
        if (_.isNil(key) || !['String', 'Number'].includes(key.constructor.name)) {
            throw new Error('Key must be string or number', 'EndbTypeError');
        }
        this.db.prepare(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`).run(key, JSON.stringify(value));
        return {
            key,
            value
        };
    }

    /**
     * Subtracts a value from the key
     * @param {string|number} key
     * @param {number} value
     * @returns {number}
     * @example
     * Database.subtract('key', 1);
     */
    subtract(key, value) {
        this._check();
        if (_.isNil(key) || !['String', 'Number'].includes(key.constructor.name)) {
            throw new Error('Key must be string or number', 'EndbTypeError');
        }
        if (_.isNil(value) || _.isNaN(value)) {
            throw new Error('Value must be a number', 'EndbTypeError');
        }
        let selected = this.db.prepare(`SELECT * FROM ${this.name} WHERE key = (?)`).get(key);
        if (!selected) {
            throw new Error('Muthafucka')
        }
        const val = _.toNumber(selected.value) - _.toNumber(value);
        this.set(key, val);
        return value;
    }
}

module.exports = Database;