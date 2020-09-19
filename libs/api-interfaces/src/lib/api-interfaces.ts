export interface Payment {
  from: string;
  to: string;
  amount: number;
}

export interface Expense {
  id: number;
  personId: number;
  description: string;
  amount: number;
}

export type Expenses = Record<number, Expense>;

export interface Person {
  id: number;
  name: string;
}

export type People = Record<number, Person>;
