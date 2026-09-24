import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty({ message: "Xodim kodi kiritilishi shart (Код сотрудника обязателен)" })
  studentCode: string;

  @IsString()
  @IsNotEmpty({ message: "Ism kiritilishi shart (Имя обязательно)" })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: "Familiya kiritilishi shart (Фамилия обязательна)" })
  lastName: string;

  @IsEmail({}, { message: "Noto'g'ri elektron pochta formati (Неверный формат email)" })
  @IsNotEmpty({ message: "Email kiritilishi shart (Email обязателен)" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Kafedra kiritilishi shart (Кафедра обязательна)" })
  department: string;

  @IsString()
  @IsNotEmpty({ message: "Lavozim kiritilishi shart (Должность обязательна)" })
  grade: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  faceDescriptor?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: "Noto'g'ri elektron pochta formati (Неверный формат email)" })
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  faceDescriptor?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
