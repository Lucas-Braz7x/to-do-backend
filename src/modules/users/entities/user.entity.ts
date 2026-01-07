import { IsDate, IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AuditCreatedUpdated {
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class User extends AuditCreatedUpdated {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
