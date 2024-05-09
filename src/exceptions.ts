import { exception } from '@st-api/core';
import { HttpStatus } from '@nestjs/common';

export const UNAUTHORIZED = exception({
  status: HttpStatus.UNAUTHORIZED,
  errorCode: 'IAM-AUTH-0001',
  error: 'Unauthorized',
});
