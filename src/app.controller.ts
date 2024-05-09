import { Controller, Post } from '@nestjs/common';
import { FirebaseAdminAuth, FirebaseAuth } from '@st-api/firebase';
import { ZBody, zDto, ZRes } from '@st-api/core';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';

class LoginDto extends zDto(
  z.object({
    email: z.string().trim().min(1).email(),
    password: z.string().trim().min(1),
  }),
) {}

@Controller()
export class AppController {
  constructor(
    private readonly firebaseAdminAuth: FirebaseAdminAuth,
    private readonly firebaseAuth: FirebaseAuth,
  ) {}

  @ZRes(z.object({ token: z.string() }))
  @Post('login')
  async login(@ZBody() { password, email }: LoginDto) {
    const user = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    );
    const token = await this.firebaseAdminAuth.createCustomToken(
      user.user.uid,
      {},
    );
    return {
      token,
    };
  }
}
