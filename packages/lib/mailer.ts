import nodemailer from 'nodemailer';

const mailer = nodemailer.createTransport(process.env.EMAIL_SERVER);

export default mailer;
