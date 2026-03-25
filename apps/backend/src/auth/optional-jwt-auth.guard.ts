import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, just return null instead of throwing 401
    // This allows RolesGuard to decide what to do based on the presence of user
    if (err || !user) {
      return null;
    }
    return user;
  }
}
