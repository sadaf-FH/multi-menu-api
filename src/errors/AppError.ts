import { AppErrorShape } from './error.types';

export class AppError extends Error {
  public readonly code: number;
  public readonly key: string;

  constructor(error: AppErrorShape) {
    super(error.message);
    this.code = error.code;
    this.key = error.key;
  }
}
