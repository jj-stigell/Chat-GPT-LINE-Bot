export type Constants = {
  general: {
    defaultLanguage: string;
    availableLanguages: Array<string>;
    jltpLevels: Array<number>;
  };
  account: {
    usernameMaxLength: number;
    usernameMinLength: number;
    passwordMaxLength: number;
    passwordMinLength: number;
    emailMaxLength: number;
  };
  login: {
    jwtExpiryTime: number;
    sessionLifetime: number;
    saltRounds: number;
  };
  deck: {
    maxAmountOfDecks: number;
  };
  review: {
    resultTypes: Array<string>;
    reviewTypes: Array<string>;
    maxLimitReviews: number;
    minLimitReviews: number;
    maxNewReviews: number;
    minNewReviews: number;
    maxPushReviewsDays: number;
    defaultInterval: number;
    defaultReviewPerDay: number;
    defaultNewPerDay: number;
    matureInterval: number;
    maxReviewInterval: number;
    minReviewInterval: number;
  };
  card: {
    cardTypes: Array<string>;
    storyMinLength: number;
    storyMaxLength: number;
    hintMinLength: number;
    hintMaxLength: number;
    defaultEasyFactor: number;
  };
  bugs: {
    bugMessageMinLength: number;
    bugMessageMaxLength: number;
    solvedMessageMinLength: number;
    solvedMessageMaxLength: number;
    bugTypes: Array<string>;
  };
  regex: {
    lowercaseRegex: RegExp;
    uppercaseRegex: RegExp;
    numberRegex: RegExp;
    dateRegex: RegExp;
  };
};

export type Errors = {
  generalErrors: {
    invalidJlptLevelError: string;
    invalidLanguageIdError: string;
    internalServerError: string;
    badUserInput: string;
    unauthenticated: string;
    unauthorized: string;
    validationError: string;
    defaultError: string;
  };
  adminErrors: {
    noAdminRightsError: string;
    noAdminReadRightsError: string;
    noAdminWriteRightsError: string;
  };
  accountErrors: {
    accountNotFoundError: string;
    usernameInUseError: string;
    emailInUseError: string;
    emailNotFoundError: string;
    memberFeatureError: string;
    emailNotConfirmedError: string;
    confirmationCodeNotFoundError: string;
    confirmationCodeExpiredError: string;
    alreadyConfirmedError: string;
    incorrectActionType: string;
    emailOrPasswordIncorrectError: string;
  };
  bugErrors: {
    bugByIdNotFoundError: string;
    bugMessageTooShortError: string;
    bugMessageTooLongError: string;
    bugSolveMessageTooShortError: string;
    bugSolveMessageTooLongError: string;
  };
  deckErrors: {
    noDecksFoundError: string;
    nonActiveDeckError: string;
    nonExistingDeckIdError: string;
  };
  reviewErrors: {
    maxLimitReviewsError: string;
    minLimitReviewsError: string;
    maxNewReviewsError: string;
    minNewReviewsError: string;
    pushReviewsLimitError: string;
    invalidResultTypeError: string;
  };
  cardErrors: {
    maxReviewIntervalError: string;
    minReviewIntervalError: string;
    noDueCardsError: string;
    storyTooLongError: string;
    storyTooShortError: string;
    hintTooLongError: string;
    hintTooShortError: string;
    provideStoryOrHintError: string;
    nonExistingCardIdError: string;
    invalidCardTypeError: string;
  };
  validationErrors: {
    inputValueMissingError: string;
    invalidDateError: string;
    requiredDateError: string;
    notValidEmailError: string;
    requiredPasswordError: string;
    emailMaxLengthError: string;
    passwordMismatchError: string;
    inputValueTypeError: string;
    requiredEmailError: string;
    requiredResultTypeError: string;
    userOrPassIncorrectError: string;
    passwordNumberError: string;
    passwordUppercaseError: string;
    passwordLowercaseError: string;
    passwordMaxLengthError: string;
    passwordMinLengthError: string;
    negativeNumberTypeError: string;
    requiredPasswordConfirmError: string;
    currAndNewPassEqualError: string;
    currentPasswordIncorrectError: string;
    usernameMaxLengthError: string;
    usernameMinLengthError: string;
    requiredUsernameError: string;
    tosNotAcceptedError: string;
    requiredAcceptToslError: string;
    requiredConfirmationCodeError: string;
  };
  sessionErrors: {
    sessionNotFoundError: string;
    sessionExpiredError: string;
    notOwnerOfSessionError: string;
    jwtExpiredError: string;
  };
};

export type JwtPayload = {
  id: number;
  sessionId: string;
};

export type LoginResult = {
  id: number;
  sessionId: string;
};
