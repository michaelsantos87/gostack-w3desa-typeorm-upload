import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import Category from '../models/Category';
import uploadConfig from '../config/upload';

import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

interface CsvRequest {
  title: string;
  value: number;
  category: string;
  type: 'outcome' | 'income';
}

transactionsRouter.get('/', async (request, response) => {
  // const categoryRepository = getRepository(Category);
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    select: ['id', 'title', 'value', 'type'],
    relations: ['category_id'],
  });
  // const allCategory = await categoryRepository.find();

  /* console.log(allCategory);
  const transactions = allTransactions.map(transaction => {
    const categoryIndex = allCategory.findIndex(
      category => category.id === transaction.category_id,
    );

    const newTransactions = {
      id: transaction.id,
      title: transaction.title,
      value: Number(transaction.value),
      type: transaction.type,
      category: {
        id: transaction.category_id,
        title: allCategory[categoryIndex - 1].title,
      },
    };

    return newTransactions;
  });
 */
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteServiceTransaction = new DeleteTransactionService();

  deleteServiceTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
