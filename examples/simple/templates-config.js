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
    }
  ]
};