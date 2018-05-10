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
 * lib/logger/logger-wrapper.js
 */

'use strict';

const Logger = require('./logger');

/** Helper wrapper for the logger. */
class LoggerWrapper {
  constructor(cname) {
    this._logger = (new Logger()).logger;
    this._cname = cname;
  }

  /** Logs out in INFO level. */
  info(msg) {
    this._logger.info(` [${this._cname}] - ${msg}`);
  }

  /** Logs out in DEBUG level. */
  debug(msg) {
    this._logger.debug(`[${this._cname}] - ${msg}`);
  }

  /** Logs out in ERROR level. */
  error(msg) {
    this._logger.error(`[${this._cname}] - ${msg}`);
  }

  /** Logs out in WARN level */
  warn(msg) {
    this._logger.warn(`[${this._cname}] - ${msg}`);
  }

}

module.exports = LoggerWrapper;