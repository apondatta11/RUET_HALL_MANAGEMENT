// App-wide constants — not secrets, just config values
// used in multiple places across the codebase

export const ROLES = {
  STUDENT:  "STUDENT",
  MANAGER: "MANAGER",
  ADMIN:    "ADMIN",
} as const;
export type UserRole = typeof ROLES[keyof typeof ROLES];

export const TOKEN_TYPES = {
    LUNCH: "LUNCH",
    DINNER: "DINNER"
} as const;
export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];

export const TOKEN_STATUS = {
    ACTIVE: "ACTIVE",
    USED: "USED",
    EXPIRED: "EXPIRED"
} as const;
export type TokenStatus = typeof TOKEN_STATUS[keyof typeof TOKEN_STATUS];

export const RECHARGE_PROVIDERS = {
    BKASH: "BKASH",
    NAGAD: "NAGAD",
    ROCKET: "ROCKET",
    SSLCOMMERZ: "SSLCOMMERZ"
} as const;
export type RechargeProvider = typeof RECHARGE_PROVIDERS[keyof typeof RECHARGE_PROVIDERS];

export const RECHARGE_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    AUTO_APPROVED: "AUTO_APPROVED"
} as const;
export type RechargeStatus = typeof RECHARGE_STATUS[keyof typeof RECHARGE_STATUS];

export const HALLS : string[] = [
  "Shere Bangla A.K Fozlul Haque Hall",
  "Shohid Ziaur Rahman Hall",
  "Selim Hall",
  "Hamid Hall",
  "Shohidul Islam Hall",
  "Tinshed Hall",
  "Male Hall-1",
  "Male Hall-2",
  "Male Hall-3",
];

export const MALE_HALLS: string[] = [
  "Shere Bangla A.K Fozlul Haque Hall",
  "Shohid Ziaur Rahman Hall",
  "Selim Hall",
  "Hamid Hall",
  "Shohidul Islam Hall",
  "Tinshed Hall",
  "Male Hall-1",
  "Male Hall-2",
  "Male Hall-3",
];

export const FEMALE_HALLS: string[] = [
  "Female Hall-1",
  "Female Hall-2",
];

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;
export type UserGender = typeof GENDER[keyof typeof GENDER];
