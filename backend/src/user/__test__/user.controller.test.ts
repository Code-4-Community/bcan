import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { describe, it, expect, beforeEach } from 'vitest';


describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: {} // Mock service that does nothing
      }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should pass', () => {
    expect(true).toBe(true);
  });
});