import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<any, any>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): any {
    return (next.handle() as any).pipe(
      map((data: any) => {
        // If the data already has a 'data' property (e.g. from paginated results), keep it
        if (data && data.data && data.meta) {
          return {
            statusCode: context.switchToHttp().getResponse().statusCode,
            timestamp: new Date().toISOString(),
            ...data,
          };
        }
        
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp: new Date().toISOString(),
          data: data,
        };
      }),
    );
  }
}
