import { Controller, Post } from '@nestjs/common';
import { safeAsync, ZBody, zDto, ZRes } from '@st-api/core';
import { FirebaseAdminAuth, FirebaseAuth } from '@st-api/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { z } from 'zod';

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

  // TODO remove this
  private async checkUser({ password, email }: LoginDto) {
    const [error] = await safeAsync(() =>
      this.firebaseAdminAuth.getUserByEmail(email),
    );
    if (error) {
      await this.firebaseAdminAuth.createUser({
        email,
        password,
      });
    }
  }

  // TODO remove this
  @ZRes(z.object({ token: z.string() }))
  @Post('login')
  async login(@ZBody() { password, email }: LoginDto) {
    await this.checkUser({ password, email });
    const user = await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    );
    const token = await user.user.getIdToken();
    await signOut(this.firebaseAuth);
    return {
      token,
    };
  }
}
