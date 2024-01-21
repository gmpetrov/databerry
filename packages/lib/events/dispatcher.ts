import axios from 'axios';

import appEventHandlers from '@chaindesk/lib/events/handlers';
import {
  AppeEventHandlerSchema,
  AppEventSchema,
} from '@chaindesk/lib/types/dtos';

export class EventDispatcher {
  constructor() {}

  static async dispatch(appEvent: AppEventSchema) {
    // return axios.post(`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/events`, {
    //   event: appEvent,
    //   token: process.env.JWT_SECRET,
    // } as AppeEventHandlerSchema);
    return appEventHandlers[appEvent.type](appEvent as any);
  }
}

export default EventDispatcher;
