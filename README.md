## node-ed-mailer

A node.js event driven service to send emails. The Mailer instance will consume messages from the configured AMQP queue,
and for each message it sends the corresponding email using the registered mail template.<br/>

### Overview
```text
         +-----------------+
         |                 |
         | events producer |
         |                 |
         +-------+---------+
                 |
                 |
                 |
+----------------v------------------+               +------------------+
|                                   |               |                  |  1. consume event
| AMQP events queue (a.e. RabbitMQ) +--------------->   node-ed-mailer |  2. compile template
|                                   |               |                  |  3. send email
+-----------------------------------+               +--------+---------+
                                                             |
                                                             |
                                                          +--v---+
                                                          | SMTP |
                                                          +------+
```

### Installation
Using npm:
```text
$ npm install --save node-edmailer
```
using Yarn:
```text
$ yarn add node-ed-mailer
```

### Usage
```javascript
const { Mailer } = require('node-ed-mailer');

const simpleMailer = new Mailer({
  basePath: __dirname,
  mailTemplates: require('./templates-config')
});
simpleMailer.run();
```
#### .env configurations
```text
# environment
NODE_ENV=development

# service info
SERVICE_GROUP=ServiceGroupName
SERVICE_NAME=ServiceName
SERVICE_VERSION_MAJOR=1
SERVICE_VERSION_MINOR=0
# 0: alpha - 1: beta - 2: release - 3: final
SERVICE_VERSION_STATUS=0

# AMQP connection
AMQP_URL=amqp://set-here-a-user:set-here-a-pwd@set-here-the-host:5672/set-here-a-VHOST
AMQP_URL_TESTS=amqp://set-here-a-TEST-user:set-here-a-pwd@set-here-the-TEST-host:5672/set-here-a-TEST-VHOST
AMQP_QUEUE_NAME=set_here_the_name_of_an_exchange

# SMTP connection
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_SECURE=ssl_true_or_false
SMTP_TLS_REJECT_UNAUTHORIZED=true_or_false
SMTP_AUTH_USER=your_smtp_username
SMTP_AUTH_PWD=your_smtp_password

# nodemail specific
NODEMAIL_LOGGER=true_or_false_for_nodemail_logger
NODEMAIL_DEBUG=true_or_false_for_nodemail_logger_debug_level

# Mail messages defaults
MAIL_FROM=set_here_your_FROM_mail_address
MAIL_REPLY_TO=set_here_your_REPLY_TO_mail_address

# logging
LOG_PATH=../path/for/log/file
LOG_CONSOLE=true-or-false
LOG_LEVEL=set-here-your-log-level_(INFO,DEBUG,...)
LOG_JSON=true-or-false
```
You can use node-ed-mailer as module in your app or as a standalone service. The option _mailTemplates_ is a configuration
object and could be in the same .js file or in a separate module (like here in the sample).

### Events and email templates

Events, as AMQP message, must have the following fields and format:
```javascript
{
    type: <your-application-custom-event-type>,
    spec: <your-custom-event-specification>,
    producer: <name-or-id-or-whatever-to-recognize-the-producer>,
    timestamp: <timestamp-of-the-publication-into-the-queue>,
    mailto: <the-address-to-send-email-to>
    payload: {
        ....
        ....
        ....
    }

```

The event payload will be filled with the event data. Here you set, at least,the fields to be used in the email template.
This fields will be used during the Handlebars compilation of the template.

##### event example

```javascript
{
    type: "NewUser",
    spec: "NormalUser",
    producer: "user-service",
    timestamp: "2018-05-10T07:35:04.806Z",
    mailto: "frank.zappa@this-is-an-example.com"
    payload: {
        id: 1833,
        username: "frank.zappa",
        name: "Frank",
        surname: "Zappa"
    }

```

Later you can see how to specify the fields mapping function to specify which one has to be used to compile the template.
Templates can be stored in any path you want, usually a path under your *__dirname*.

##### _mailTemplates_ configuration example
You can configure templates in your service exporting the configuration object as in the following example.<br/>
You specify the templates base path and an array of templates configuration. Each template configuration will specify:
+ **name**: the name of the template used in the templates map to retrieve the template when an event is consumed.<br/>
The name MUST be composed as **event_type:\[event_spec\]** (a.e. _"NewUser:NormalUser"_)
+ **params**
  - _htmlTemplate_: the name of the handlebars template (a.e. _"new-user.hbs"_)
  - _subject_: the mail subject text
  - _attachments_: the array of the attachment files for this temaplate, if any. Each entry in the array will specify:
      * _filename_: the filename showed in the attachment list
      * _path_: the real file name (path is relative to the _basePath_)
      * _contentType_: optional MIME type of the attachment file
  - _templateData_: a function to specify which of the event's payload fields have to be used in the template compilation

```javascript
// template-config.js
'use strict';

module.exports = {
  basePath: `${__dirname}/templates`,
  templates: [
    {
      name: 'NewUser:NormalUser',
      params: {
        htmlTemplate: 'new-user.hbs',
        subject: 'User registration',
        attachments: [
          {
            filename: 'Privacy.pdf',
            path: 'attachments/Privacy.pdf',
            contentType: 'application/pdf'
          },
          {
            filename: 'TermsAndConditions.pdf',
            path: 'attachments/TermsAndConditions.pdf',
            contentType: 'application/pdf'
          }
        ],
        templateData: (evtData) => {
          return {
            username: evtData.username,
            name: `${evtData.name} ${evtData.surname}`
          };
        }
      }
    },
    {
      // ...
      // ...
    },
    {
      // ...
      // ...
    }
  ]
};
```

### Default directory scaffold for your Mailer project
Your Mailer project (or module) should have the following common scaffolding structure:
```text
your-mailer-project/
├── templates/
│   ├── attachments/
│   │   ├── Privacy.pdf
│   │   └── TermsAndConditions.pdf
│   └── new-user.hbs
├── .env
├── .env.example
├── index.js
└── template-config.js
```

### License
Licensed under the [MIT license](https://github.com/ITResourcesOSS/node-ed-mailer/blob/master/LICENSE).