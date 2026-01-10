import { CashFlow, BankAccount } from "@/types";

export type CashFlowWithDetails = CashFlow & {
    bank_account: Pick<BankAccount, 'name' | 'bank_name'> | null;
};
