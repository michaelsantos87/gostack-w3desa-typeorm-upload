import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    try {
      transactionRepository
        .createQueryBuilder()
        .delete()
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw new AppError('Invalid ID', 401);
    }
  }
}

export default DeleteTransactionService;
