//src/types/index.ts
import type {
  Hall,
  User,
  ResidentStudentList,
  MealToken,
  RechargeRequest,
  BalanceTransaction,
  SmsLog,
  DailyAnalyticsSnapshot,
  Settings,
  Notification,
} from "@prisma/client";

export type {
  Hall,
  User,
  ResidentStudentList,
  MealToken,
  RechargeRequest,
  BalanceTransaction,
  SmsLog,
  DailyAnalyticsSnapshot,
  Settings,
  Notification,
};

export type UserRole = "STUDENT" | "MANAGER" | "ADMIN";
export type TokenType = "LUNCH" | "DINNER";
export type TokenStatus = "ACTIVE" | "USED" | "EXPIRED";
export type RechargeProvider = "BKASH" | "NAGAD" | "ROCKET" | "SSLCOMMERZ";
export type RechargeStatus = "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";

export interface UserWithRelations extends User {
  hall?: Hall | null;
  tokens?: MealToken[];
  rechargeRequests?: RechargeRequest[];
  balanceTransactions?: BalanceTransaction[];
  notifications?: Notification[];
}

export interface MealTokenWithRelations extends MealToken {
  user?: User;
  hall?: Hall;
}

export interface HallWithCounts extends Hall {
  _count?: {
    users: number;
    tokens: number;
    residentStudents: number;
  };
}

export interface RechargeRequestWithRelations extends RechargeRequest {
  user?: User;
  reviewedBy?: User | null;
}

export interface BalanceTransactionWithUser extends BalanceTransaction {
  user?: User;
}

export interface ApiError {
  error: string | Record<string, string[]>;
}