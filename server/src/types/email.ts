export type ConfirmEmailPayload = {
  translation: object;
  email: string;
  username: string;
  url: string;
};

export type EmailClientArgs<TemplateData> = {
  to: string;
  subject: string;
  templatePath: string;
  templateData: TemplateData;
};
