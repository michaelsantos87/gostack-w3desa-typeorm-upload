// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('No balance to this transaction');
    }

    const categoryRepository = getRepository(Category);

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
    });

    let category_id = null;

    const checkCategory = await categoryRepository.find();

    const check = checkCategory.find(
      thisCategory => thisCategory.title === category,
    );

    /*  const checkCategoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    }); */

    if (check) {
      category_id = check.id;
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      category_id = newCategory.id;
    }

    transaction.category_id = category_id;

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
