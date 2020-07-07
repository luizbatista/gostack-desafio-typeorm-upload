import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transaction[]> {
    const customTransactionsRepository = getCustomRepository(
      TransactionsRepository,
    );

    const transactions = await customTransactionsRepository.find({
      select: ['id', 'title', 'value', 'type', 'createdAt', 'updatedAt'],
      relations: ['category'],
    });

    return transactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.all();

    const income = transactions
      .map(transaction =>
        transaction.type === 'income' ? Number(transaction.value) : 0,
      )
      .reduce((acc, cur) => acc + cur);

    const outcome = transactions
      .map(transaction =>
        transaction.type === 'outcome' ? Number(transaction.value) : 0,
      )
      .reduce((acc, cur) => acc + cur);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
