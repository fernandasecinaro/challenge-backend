import UsersController from 'controllers/UsersController';
import { IUsersService } from 'serviceTypes/IUsersService';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { InvalidDataError } from 'errors/InvalidDataError';

describe('Register new administrator', () => {
  test('Register new admin successfully', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'john@gmail.com',
        password: '123456',
        name: 'John',
        familyName: 'Doe',
      },
    });

    const mock = jest.fn<IUsersService, []>(() => ({
      registerAdmin: jest.fn().mockReturnValue(Promise.resolve()),
      registerUser: jest.fn().mockReturnValue(Promise.resolve()),
      inviteUser: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const usersService = new mock();
    const usersController = new UsersController(usersService);
    await usersController.registerAdmin(req, res);

    expect(usersService.registerAdmin).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Register admin with existent email', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'john@gmail.com',
        password: '123456',
        name: 'John',
        familyName: 'Doe',
      },
    });

    const mock = jest.fn<IUsersService, []>(() => ({
      registerAdmin: jest.fn().mockImplementation(() => {
        throw new InvalidDataError('User already exists');
      }),
      registerUser: jest.fn().mockReturnValue(Promise.resolve()),
      inviteUser: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const usersService = new mock();
    const usersController = new UsersController(usersService);
    await usersController.registerAdmin(req, res);

    expect(usersService.registerAdmin).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('Register admin has internal server error', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'john@gmail.com',
        password: '123456',
        name: 'John',
        familyName: 'Doe',
      },
    });

    const mock = jest.fn<IUsersService, []>(() => ({
      registerAdmin: jest.fn().mockImplementation(() => {
        throw new Error('Some error');
      }),
      registerUser: jest.fn().mockReturnValue(Promise.resolve()),
      inviteUser: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const usersService = new mock();
    const usersController = new UsersController(usersService);
    await usersController.registerAdmin(req, res);

    expect(usersService.registerAdmin).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
