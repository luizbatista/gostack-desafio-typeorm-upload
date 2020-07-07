import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepositoryDb = getRepository(Transaction);
    const categoriesRepositoryDb = getRepository(Category);

    const TransactionsRepo = new TransactionsRepository();

    if (type === 'outcome' && value > 0) {
      const balance = await TransactionsRepo.getBalance();
      if (balance.total - value < 0) {
        throw new AppError(
          'Esta transação extrapola o valor total que o usuário tem em caixa',
        );
      }
    }

    const checkCategoryExists = await categoriesRepositoryDb.findOne({
      where: { title: category },
    });

    let categoryId;

    if (checkCategoryExists) {
      categoryId = checkCategoryExists.id;
    } else {
      const newCategory = categoriesRepositoryDb.create({
        title: category,
      });

      await categoriesRepositoryDb.save(newCategory);

      categoryId = newCategory.id;
    }

    const transaction = transactionsRepositoryDb.create({
      title,
      value,
      type,
      categoryId,
    });

    await transactionsRepositoryDb.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
