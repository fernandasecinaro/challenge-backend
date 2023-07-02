import { Gender } from '@prisma/client';

export interface RegisteredUser {
  fullName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
}
