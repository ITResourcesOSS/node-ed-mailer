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
 * lib/dotenv/dotenv-reader.js
 */

'use strict';

const path = require('path');

/** Reads the actual service configuration from the service .env file. */
class DotEnvReader {

  /**
   * Initialize and load envs from the .env file.
   * @param {string} envPath - The actual service .env file path.
   */
  constructor(envPath) {
    this._envPath = envPath;

    require('dotenv-safe').load({
      path: path.join(this._envPath, './.env'),
      sample: path.join(this._envPath, './.env.example'),
    });

    this._envs = {
      serviceBasePath: this._envPath,
      env: process.env.NODE_ENV,
      serviceGroup: process.env.SERVICE_GROUP || 'service-group',
      serviceName: process.env.SERVICE_NAME || 'service',
      serviceVersionMajor: process.env.SERVICE_VERSION_MAJOR || '0',
      serviceVersionMinor: process.env.SERVICE_VERSION_MINOR || '1',
      serviceVersionStatus: process.env.SERVICE_VERSION_STATUS || '0',
      amqp: {
        url: process.env.NODE_ENV === 'test'
          ? process.env.AMQP_URL_TESTS
          : process.env.AMQP_URL,
        queue: process.env.AMQP_QUEUE_NAME
      },
      smtp: {
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: process.env.SMTP_PORT || 465,
        secure: this._boolean(process.env.SMTP_SECURE, true),
        tls: {
          rejectUnauthorized: this._boolean(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true)
        },
        auth: {
          user: process.env.SMTP_AUTH_USER,
          pass: process.env.SMTP_AUTH_PWD
        },
        logger: this._boolean(process.env.NODEMAIL_LOGGER, true),
        debug: this._boolean(process.env.NODEMAIL_DEBUG, true)
      },
      messageDefaultFields: {
        from: process.env.MAIL_FROM,
        replyTo: process.env.MAIL_REPLY_TO
      },
      templatesConfigModule: process.env.TEMPLATES_CONFIG_MODULE,
      logs: {
        console: process.env.LOG_CONSOLE,
        path: process.env.LOG_PATH || '../../logs',
        level: process.env.LOG_LEVEL,
        json: process.env.LOG_JSON,
      }
    };

    this._envs.serviceVersion = `${this._envs.serviceVersionMajor}.${this._envs.serviceVersionMinor}.${this._envs.serviceVersionStatus}`;
    this._envs.serviceFullName = `${this._envs.serviceGroup}-${this._envs.serviceName}-${this._envs.env.substring(0, 3)}_${this._envs.serviceVersion}`;
  }

  _boolean(value, defualutValue)  {
    console.log('value: ' + value);
    if (value) {
      const boolValue = value == 'true' ? true : false;
      return boolValue;
    }

    return defualutValue;
  }

  /**
   * Returns the configuration data structure.
   * @return {object} envs - The actual service configuration data structure.
   */
  get envs() {
    return this._envs;
  }
}

module.exports = DotEnvReader;