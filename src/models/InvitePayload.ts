import { Role } from '@prisma/client';

export type InvitePayload = {
  familyId: number;
  email: string;
  role: Role;
};
