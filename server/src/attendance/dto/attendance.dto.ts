import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class DetectionDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsString()
  @IsNotEmpty({ message: "Kamera identifikatori kiritilishi shart (ID камеры обязателен)" })
  cameraId: string;

  @IsNumber({}, { message: "Aniqlik darajasi son bo'lishi kerak (Уверенность должна быть числом)" })
  confidence: number;

  @IsOptional()
  @IsArray()
  boundingBox?: number[];

  @IsOptional()
  @IsString()
  snapshotUrl?: string;

  @IsOptional()
  @IsIn(['ARRIVAL', 'DEPARTURE', 'AUTO'], {
    message: "Amal turi noto'g'ri (Неверный тип действия)",
  })
  actionType?: 'ARRIVAL' | 'DEPARTURE' | 'AUTO';

  @IsOptional()
  @IsString()
  lateCutoff?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkAbsentDto {
  @IsOptional()
  @IsString()
  date?: string;
}
