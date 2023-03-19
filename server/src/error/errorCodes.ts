import { Errors } from '../types/general';

export const errors: Errors = {
  generalErrors: {
    invalidJlptLevelError: 'invalidJlptLevelError',
    invalidLanguageIdError: 'invalidLanguageIdError',
    internalServerError: 'INTERNAL_SERVER_ERROR',
    badUserInput: 'BAD_USER_INPUT',
    unauthenticated: 'UNAUTHENTICATED',
    unauthorized: 'UNAUTHORIZED',
    validationError: 'VALIDATION_ERROR',
    defaultError: 'DEFAULT_ERROR'
  },
  adminErrors: {
    noAdminRightsError: 'noAdminRightsError',
    noAdminReadRightsError: 'noAdminReadRightsError',
    noAdminWriteRightsError: 'noAdminWriteRightsError'
  },
  accountErrors: {
    accountNotFoundError: 'accountNotFoundError',
    usernameInUseError: 'usernameInUseError',
    emailInUseError: 'emailInUseError',
    emailNotFoundError: 'emailNotFoundError',
    memberFeatureError: 'memberFeatureError',
    emailNotConfirmedError: 'emailNotConfirmedError',
    confirmationCodeNotFoundError: 'confirmationCodeNotFoundError',
    confirmationCodeExpiredError: 'confirmationCodeExpiredError',
    alreadyConfirmedError: 'alreadyConfirmedError',
    incorrectActionType: 'incorrectActionType',
    emailOrPasswordIncorrectError: 'emailOrPasswordIncorrectError'
  },
  bugErrors: {
    bugByIdNotFoundError: 'bugByIdNotFoundError',
    bugMessageTooShortError: 'bugMessageTooShortError',
    bugMessageTooLongError: 'bugMessageTooLongError',
    bugSolveMessageTooShortError: 'bugSolveMessageTooShortError',
    bugSolveMessageTooLongError: 'bugSolveMessageTooLongError'
  },
  deckErrors: {
    noDecksFoundError: 'noDecksFoundError',
    nonActiveDeckError: 'nonActiveDeckError',
    nonExistingDeckIdError: 'nonExistingDeckIdError'
  },
  reviewErrors: {
    maxLimitReviewsError: 'maxLimitReviewsError',
    minLimitReviewsError: 'minLimitReviewsError',
    maxNewReviewsError: 'maxNewReviewsError',
    minNewReviewsError: 'minNewReviewsError',
    pushReviewsLimitError: 'pushReviewsLimitError',
    invalidResultTypeError: 'invalidResultTypeError'
  },
  cardErrors: {
    maxReviewIntervalError: 'maxReviewIntervalError',
    minReviewIntervalError: 'minReviewIntervalError',
    noDueCardsError: 'noDueCardsError',
    storyTooLongError: 'storyTooLongError',
    storyTooShortError: 'storyTooShortError',
    hintTooLongError: 'hintTooLongError',
    hintTooShortError: 'hintTooShortError',
    provideStoryOrHintError: 'provideStoryOrHintError',
    nonExistingCardIdError: 'nonExistingCardIdError',
    invalidCardTypeError: 'invalidCardTypeError'
  },
  validationErrors: {
    inputValueMissingError: 'inputValueMissingError',
    invalidDateError: 'invalidDateError',
    requiredDateError: 'requiredDateError',
    notValidEmailError: 'notValidEmailError',
    requiredPasswordError: 'requiredPasswordError',
    emailMaxLengthError: 'emailMaxLengthError',
    passwordMismatchError: 'passwordMismatchError',
    inputValueTypeError: 'inputValueTypeError',
    requiredEmailError: 'requiredEmailError',
    requiredResultTypeError: 'requiredResultTypeError',
    userOrPassIncorrectError: 'userOrPassIncorrectError',
    passwordNumberError: 'passwordNumberError',
    passwordUppercaseError: 'passwordUppercaseError',
    passwordLowercaseError: 'passwordLowercaseError',
    passwordMaxLengthError: 'passwordMaxLengthError',
    passwordMinLengthError: 'passwordMinLengthError',
    negativeNumberTypeError: 'negativeNumberTypeError',
    requiredPasswordConfirmError: 'requiredPasswordConfirmError',
    currAndNewPassEqualError: 'currAndNewPassEqualError',
    currentPasswordIncorrectError: 'currentPasswordIncorrectError',
    usernameMaxLengthError: 'usernameMaxLengthError',
    usernameMinLengthError: 'usernameMinLengthError',
    requiredUsernameError: 'requiredUsernameError',
    tosNotAcceptedError: 'tosNotAcceptedError',
    requiredAcceptToslError: 'requiredAcceptToslError',
    requiredConfirmationCodeError: 'requiredConfirmationCodeError'
  },
  sessionErrors: {
    sessionNotFoundError: 'sessionNotFoundError',
    sessionExpiredError: 'sessionExpiredError',
    notOwnerOfSessionError: 'notOwnerOfSessionError',
    jwtExpiredError: 'jwtExpiredError'
  }
};
