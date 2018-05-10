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
 * lib/mailer/mailer.js
 */

'use strict';

const nodemailer = require('nodemailer');
const path = require('path');
const DotEnvReader = require('../dotenv');
const Config = require('../config');
const EventsConsumer = require('../events-consumer');
const { initEventsChannel, eventReceived } = require('../mediator');
const { LoggerWrapper } = require('../logger');

/** The main Mailer class from which derive our mailer. */
class Mailer {

  /**
   * Initialize the Mailer reading configuration .env from service base path.
   * @param options - The mailer options
   */
  constructor(options) {
    const dotEnvReader = new DotEnvReader(options.basePath);
    this._configuration = (new Config(dotEnvReader.envs)).configuration;

    this.logger = new LoggerWrapper(this.constructor.name);
    this.logger.debug(`service configuration: ${JSON.stringify(this._configuration, undefined, 2)}`);

    this._templatesMap = new Map();
    this.registerTemplates(options.mailTemplates);
    this.logger.info('email templates registered');

    // initialize internal mediator events channel
    this._eventsChannel = initEventsChannel();
    this._eventsChannel.on(eventReceived, (data) => this._onAmqpMessageReceived(data));
    this.logger.info('events mediator initialized');

    // SMTP trasporter
    this.transporter = nodemailer.createTransport(this._configuration.smtp, this._configuration.messageDefaultFields);
    this.logger.info('nodemail smtp transporter initialized');

    // AMQP message consumer
    this._consumer = new EventsConsumer(this._configuration.amqp);
    this.logger.info('AMQP consumer initialized');
  }

  registerTemplates(mailTemplates) {
    this._templatesBasePath = mailTemplates.basePath;
    for (let template of mailTemplates.templates) {
      this.registerTemplate(template);
    }
  }

  registerTemplate(mailTemplate) {
    this._templatesMap.set(mailTemplate.name, mailTemplate.params);
    this.logger.info(`"${mailTemplate.name}" template registered`);
  }

  async run() {
    try {
      // start consuming messages from AMQP server
      await this._consumer.startConsuming();
    } catch (err) {
      console.error(`exception: ${err} - ${JSON.stringify(err, null, 2)}`);
      process.exit(-1);
    }
  }

  async _onAmqpMessageReceived(evt) {
    this.logger.info('AMQP message received');
    this.logger.debug(`evt: ${JSON.stringify(evt)}`);

    const templateParams = this._templatesMap.get(`${evt.type}:${evt.spec}`);
    if (templateParams) {
      this.logger.debug(`template params: ${templateParams}`);

      const subject = templateParams.subject;
      const htmlFile = this._htmlTemplateFile(templateParams);
      const attachments = this._attachments(templateParams.attachments);
      const to = evt.mailto;

      const render = require('./render');
      const html = await render(htmlFile, templateParams.templateData(evt.payload));

      this.logger.info(`sending email to ${to}`);
      this.send(to, subject, html, attachments);
    } else {
      this.logger.error(`no template found for "${evt.type}:${evt.spec}". No mail has been sent to ${evt.mailto}.`);
    }

  }

  _htmlTemplateFile(params) {
    return path.join(this._templatesBasePath, params.htmlTemplate);
  }

  _attachments(attachments) {
    for (let attachment of attachments) {
      attachment.path = path.join(this._templatesBasePath, attachment.path);
    }
    return attachments;
  }

  send(to, subject, messageBody, attachments) {
    this.logger.debug(`email message body:\n${messageBody}`);
    let message = {
      to: to,
      subject: subject,
      html: messageBody
    };

    if (attachments.length > 0) {
      message.attachments = [];
      for (let attachment of attachments) {
        this.logger.debug(`message attachment: ${attachment.filename}`);
        message.attachments.push(attachment);
      }
    }

    this.transporter.sendMail(message, (error, info) => {
      if (error) {
        this.logger.error(`error sending email: ${error.message}`);
        // maybe is better to log the error... maybe into a Redis instance!
      }

      this.logger.info('email sent successfully!');
    });
  }
}

module.exports = Mailer;
