import { IsIn } from 'class-validator';

export class RsvpDto {
  @IsIn(['going', 'interested', 'not_going'])
  status: 'going' | 'interested' | 'not_going';
}
