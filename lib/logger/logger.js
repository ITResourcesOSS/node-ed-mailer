/*!
 * node-ed-mailer
 * AMQP event driven e-mail sender.
 * 
 * Copyright(c) 2018 IT Resources s.r.l.
 * Copyright(c) 2018 Luca Stasio <joshuagame@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * See node-ed-mailer license text even in LICENSE file.
 * 
 * lib/logger/logger.js
 */

'use strict';

const path = require('path');
const Config = require('../config');
const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');

let _instance = null;

/** Singleton for the main logger class. */
class Logger {
  constructor() {
    if (!_instance) {
      this._configuration = (new Config()).configuration;
      this._initialize();
      _instance = this;
    } else {
      return _instance;
    }
  }

  /**
   * Initialize the logger Winston transport.
   * @private
   */
  _initialize() {
    const fullPath = path.join(this._configuration.serviceBasePath, this._configuration.logs.path);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }

    //const fullname = path.join(fullPath, this._configuration.logs.file);
    //this._envs.logs.file = `${this._envs.serviceFullName}.log`;
    const fullname = path.join(fullPath, this._configuration.serviceFullName);

    const fileTransport = new (winston.transports.DailyRotateFile)({
      filename: fullname + '-%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: this._configuration.logs.level,
      json: false
    });
  
    const transports = [fileTransport];
    if (this._configuration.logs.console) {
      transports.push(new winston.transports.Console({ json: false, colorize: true, level: this._configuration.logs.level }));
    }
  
    this._logger = new (winston.Logger)({
      transports,
    });
    this._logger.exitOnError = false;

    this._logger.info(` [${this.constructor.name}] - logger initialized`);
  }

  /**
   * Returns this logger object.
   * @return {winston.Logger} _logger - The internal winston logger instance.
   */
  get logger() {
    return this._logger;
  }
}

module.exports = Logger;
