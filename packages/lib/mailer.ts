import nodemailer from 'nodemailer';

const mailer = nodemailer.createTransport(process.env.EMAIL_SERVER, {
  tls: {
    minVersion: 'TLSv1.2',
  },
});

export { nodemailer };

export default mailer;
