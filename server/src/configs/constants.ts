import { Constants } from '../types/general';

export const FrontendUrl: string = 'https://www.app.yomiko.io';

export const ConfirmationExpiryTime: number =  86400000; // 24 hours

export const JwtExpiry: number = 86400; // 24 hours

export const constants: Constants = {
  general: {
    defaultLanguage: 'EN',
    availableLanguages: ['EN', 'FI', 'JP'],
    jltpLevels: [1, 2, 3, 4, 5] // Available JLPT levels, officially
  },
  account: {
    usernameMaxLength: 14,
    usernameMinLength: 4,
    passwordMaxLength: 50,
    passwordMinLength: 8,
    emailMaxLength: 255
  },
  login: {
    jwtExpiryTime: 2419200,
    sessionLifetime: 28, // How long a new session will last in days, same as jwt expiry time
    saltRounds: 10
  },
  deck: {
    maxAmountOfDecks: 50
  },
  review: {
    resultTypes: ['AGAIN', 'GOOD'],
    reviewTypes: ['RECALL', 'RECOGNISE'],
    maxLimitReviews: 999,
    minLimitReviews: 0,
    maxNewReviews: 100,
    minNewReviews: 0,
    maxPushReviewsDays: 7, // How many days can user at maximum push reviews ahead
    defaultInterval: 999,
    defaultReviewPerDay: 999,
    defaultNewPerDay: 15,
    matureInterval: 21,
    maxReviewInterval: 999,
    minReviewInterval: 1
  },
  card: {
    cardTypes: ['KANJI', 'HIRAGANA', 'KATAKANA', 'WORD', 'SENTENCE'],
    storyMinLength: 1,
    storyMaxLength: 160,
    hintMinLength: 1,
    hintMaxLength: 25,
    defaultEasyFactor: 2.5,
  },
  bugs: {
    bugMessageMinLength: 5,
    bugMessageMaxLength: 100,
    solvedMessageMinLength: 1,
    solvedMessageMaxLength: 160,
    bugTypes: ['TRANSLATION', 'UI', 'FUNCTIONALITY', 'OTHER']
  },
  regex: {
    lowercaseRegex: /^(?=.*[a-z])/,
    uppercaseRegex: /^(?=.*[A-Z])/,
    numberRegex: /^(?=.*[0-9])/,
    // eslint-disable-next-line max-len
    dateRegex:  /^(?:(?:1[6-9]|[2-9]\d)?\d{2})(?:(?:(\/|-|\.)(?:0?[13578]|1[02])\1(?:31))|(?:(\/|-|\.)(?:0?[13-9]|1[0-2])\2(?:29|30)))$|^(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)0?2\3(?:29)$|^(?:(?:1[6-9]|[2-9]\d)?\d{2})(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:0?[1-9]|1\d|2[0-8])$/
  }
};
