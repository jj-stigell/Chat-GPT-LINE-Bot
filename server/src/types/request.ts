export type Register = {
  email: string;
  username: string;
  password: string;
  acceptTos: boolean;
  allowNewsLetter: boolean | undefined | null;
  language: string;
}

export type Login = {
  email: string;
  password: string;
}

export type ResetPassword = {
  confirmationId: string;
  password: string;
  passwordConfirmation: string;
}
