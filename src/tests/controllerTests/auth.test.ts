import { getMockReq, getMockRes } from '@jest-mock/express';
import { InvalidDataError } from 'errors/InvalidDataError';
import IAuthService from 'serviceTypes/IAuthService';
import AuthController from 'controllers/AuthController';

describe('User authentication', () => {
  test('Authenticated successfully', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'admin0@gmail.com',
        password: '12345678',
      },
    });

    const mock = jest.fn<IAuthService, []>(() => ({
      login: jest.fn().mockReturnValue(Promise.resolve('token')),
      createInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      createToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyToken: jest.fn().mockReturnValue(Promise.resolve()),
      getApiKey: jest.fn().mockReturnValue(Promise.resolve()),
      refreshApiKey: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const authService = new mock();
    const authController = new AuthController(authService);
    await authController.login(req, res);

    expect(authService.login).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Authenticated with email or password incorrect', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'admin0@gmail.com',
        password: '12345678',
      },
    });

    const mock = jest.fn<IAuthService, []>(() => ({
      login: jest.fn().mockImplementation(() => {
        throw new InvalidDataError('Email or password is incorrect');
      }),
      createInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      createToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyToken: jest.fn().mockReturnValue(Promise.resolve()),
      getApiKey: jest.fn().mockReturnValue(Promise.resolve()),
      refreshApiKey: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const authService = new mock();
    const authController = new AuthController(authService);
    await authController.login(req, res);

    expect(authService.login).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('Authentication has internal server error', async () => {
    const { res } = getMockRes();
    const req = getMockReq({
      body: {
        email: 'admin0@gmail.com',
        password: '12345678',
      },
    });

    const mock = jest.fn<IAuthService, []>(() => ({
      login: jest.fn().mockImplementation(() => {
        throw new Error();
      }),
      createInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyInviteToken: jest.fn().mockReturnValue(Promise.resolve()),
      createToken: jest.fn().mockReturnValue(Promise.resolve()),
      verifyToken: jest.fn().mockReturnValue(Promise.resolve()),
      getApiKey: jest.fn().mockReturnValue(Promise.resolve()),
      refreshApiKey: jest.fn().mockReturnValue(Promise.resolve()),
    }));

    const authService = new mock();
    const authController = new AuthController(authService);
    await authController.login(req, res);

    expect(authService.login).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
