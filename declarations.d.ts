declare module "@paystack/inline-js" {
  interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    onSuccess?: (transaction: any) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
    onLoad?: (response?: any) => void;
    [key: string]: any;
  }

  export default class Paystack {
    newTransaction(options: PaystackTransactionOptions): void;
  }
}