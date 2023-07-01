import { Family, User } from '@prisma/client';
import myContainer from 'factory/inversify.config';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { Consumer } from 'sqs-consumer';
import { sqs } from 'sqs/SQS';

const familyRepository = myContainer.get<IFamilyRepository>(REPOSITORY_SYMBOLS.IFamilyRepository);
const userRepository = myContainer.get<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository);

const consumer = Consumer.create({
  queueUrl: process.env.SAGA_QUEUE_URL,
  handleMessage: async (message) => {
    console.log('Message received', message.Body);
    const { Body } = message;
    if (!Body) return;

    const { EventName, Payload } = JSON.parse(Body);

    if (!EventName || !Payload) return;

    if (EventName === 'family-created') {
      const { id, name, apiKey, createdAt, updatedAt } = Payload as Family;
      try {
        await familyRepository.createFamily({
          id,
          name,
          apiKey,
          createdAt,
          updatedAt,
        });
      } catch (e: any) {
        if (e.message.includes('duplicate key')) {
          console.log('Family already exists');
        }
      }
    }

    if (EventName === 'family-updated') {
      const { id, apiKey, updatedAt } = Payload as Family;
      await familyRepository.updateFamily(id, {
        apiKey,
        updatedAt,
      });
    }

    if (EventName === 'user-created') {
      const { id, familyId, createdAt, updatedAt, email, name, role } = Payload as User;
      try {
        await userRepository.createUser({
          id,
          familyId,
          createdAt,
          updatedAt,
          email,
          name,
          password: '',
          role,
        });
      } catch (e: any) {
        if (e.message.includes('duplicate key')) {
          console.log('User already exists');
        }
      }
    }
  },
  sqs: sqs,
  pollingWaitTimeMs: 1000,
});

consumer.on('error', (err) => {
  console.log(err.message);
});

consumer.on('processing_error', (err) => {
  console.log(err.message);
});

consumer.start();
