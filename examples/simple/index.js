const { Mailer } = require('../..');

const simpleMailer = new Mailer({
  basePath: __dirname,
  mailTemplates: require('./templates-config')
});
simpleMailer.run();
