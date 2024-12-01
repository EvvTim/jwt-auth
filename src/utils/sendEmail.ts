import nodemailer from "nodemailer";
import { EMAIL_SENDER, EMAIL_SENDER_PASSWORD } from "../constants/env";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_SENDER,
    pass: EMAIL_SENDER_PASSWORD,
  },
});

type SendEmailProps = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendEmailResult =
  | {
      messageId: string;
    }
  | undefined;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailProps): Promise<SendEmailResult> => {
  try {
    const message = await transporter.sendMail({
      from: EMAIL_SENDER,
      to,
      subject,
      text,
      html,
    });

    return {
      messageId: message.messageId,
    };
  } catch (error) {
    console.error("Error sending email: ", error);
    return undefined;
  }
};
