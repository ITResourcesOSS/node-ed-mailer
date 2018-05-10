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
 * lib/events-consumer/events-consumer.js
 */

'use strict';

const amqp = require('amqplib');
const { initEventsChannel } = require('../mediator');
const { LoggerWrapper } = require('../logger');

class EventsConsumer {
  constructor(config) {
    this.logger = new LoggerWrapper(this.constructor.name);
    this._url = config.url;
    this._queueName = config.queue;
    this._eventChannel = initEventsChannel();
  }

  /**
   * Consumes messages from AMQP queue. For each received message emits an internal 'amqp-evt' message to the
   * application mediator.
   * The main Mailer class will react to each 'amqp-evt' and will try to send the right e-mail.
   * @returns {Promise<void>}
   */
  async startConsuming() {
    try {
      const connection = await amqp.connect(this._url);
      this.logger.debug('AMQP server connection established');

      const channel = await connection.createChannel();
      this.logger.debug('connection channel initialized');

      await channel.assertQueue(this._queueName, {durable: true});
      this.logger.info(`AMQP queue "${this._queueName}" connection established`);

      await channel.consume(this._queueName, (msg) => {
        // grab the event from the message
        const evt = JSON.parse(msg.content);
        this.logger.info(`event received [timestamp: ${evt.timestamp}]`);
        this.logger.debug(`event: ${JSON.stringify(evt)}`);

        // emit an 'event-received' event to the mediator with the received event
        this._eventChannel.emit('event-received', evt);
        this.logger.debug('event emitted to the mediator');
      }, {noAck: true});
    } catch (err) {
      throw err;
    }
  }
}

module.exports = EventsConsumer;