import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(_dto: LoginDto) {
    return { accessToken: 'placeholder' };
  }
}
