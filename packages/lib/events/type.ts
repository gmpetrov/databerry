import { AppEventSchema } from '../types/dtos';

export type AppEventHandler<T extends AppEventSchema> = (
  event: T
) => Promise<void>;
