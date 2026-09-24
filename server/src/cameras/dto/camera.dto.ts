import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCameraDto {
  @IsString()
  @IsNotEmpty({ message: "Kamera nomi kiritilishi shart (Название камеры обязательно)" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Kamera joylashuvi kiritilishi shart (Локация камеры обязательна)" })
  location: string;

  @IsString()
  @IsNotEmpty({ message: "Kamera turi kiritilishi shart (Тип камеры обязателен)" })
  type: string;

  @IsOptional()
  @IsString()
  streamUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class UpdateCameraDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  streamUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}
