import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = this.find();

    const sumIncome = (await transactions).reduce(
      (initValue, actualTransaction) =>
        initValue +
        (actualTransaction.type === 'income'
          ? Number(actualTransaction.value)
          : 0),
      0,
    );

    const sumOutcome = (await transactions).reduce(
      (initValue, actualTransaction) =>
        initValue +
        (actualTransaction.type === 'outcome'
          ? Number(actualTransaction.value)
          : 0),
      0,
    );

    const total = sumIncome - sumOutcome;

    const currentBalancy: Balance = {
      income: sumIncome,
      outcome: sumOutcome,
      total,
    };

    return currentBalancy;
  }
}

export default TransactionsRepository;
