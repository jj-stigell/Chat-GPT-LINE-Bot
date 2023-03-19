import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import handlebars from 'handlebars';
import Mail from 'nodemailer/lib/mailer';

import {
  ORIGIN_EMAIL, STMP_HOST, STMP_PORT, STMP_USER, STMP_PASSWORD
} from '../../../configs/environment';
import { EmailClientArgs } from '../../../types/email';

export async function sendMail<TemplateData>(
  data: EmailClientArgs<TemplateData>
): Promise<boolean> {
  try {
    const smtpTransport: Mail = nodemailer.createTransport({
      host: STMP_HOST,
      port: STMP_PORT,
      auth: {
        user: STMP_USER,
        pass: STMP_PASSWORD,
      },
    });

    const source: string = fs.readFileSync(data.templatePath, { encoding: 'utf-8' });
    const template: HandlebarsTemplateDelegate<TemplateData> = handlebars.compile(source);
    const html: string = template(data.templateData);

    const updatedData: Mail.Options = {
      to: data.to,
      html,
      from: `Yomiko App <${ORIGIN_EMAIL}>`,
      subject: data.subject,
    };

    await smtpTransport.sendMail(updatedData);
    return true;
  } catch(error) {
    console.log(error);
    return false;
  }
}
