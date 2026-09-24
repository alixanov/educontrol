import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: "Noto'g'ri elektron pochta formati (Неверный формат email)" })
  @IsNotEmpty({ message: "Email kiritilishi shart (Email обязателен)" })
  email: string;

  @IsString({ message: "Parol matn bo'lishi kerak (Пароль должен быть строкой)" })
  @IsNotEmpty({ message: "Parol kiritilishi shart (Пароль обязателен)" })
  @MinLength(4, { message: "Parol kamida 4 belgidan iborat bo'lishi kerak (Пароль должен содержать не менее 4 символов)" })
  password: string;
}
