import Mixpanel from 'mixpanel';

export enum AnalyticsEvents {
  USER_SIGNUP = 'User Signup',
  USER_SUBSCRIBED = 'User Subscribed',
  USER_UNSUBSCRIBED = 'User Unsubscribed',
  USER_SWITCHED_PLAN = 'User Switched Plan',
  USER_RENEWED_PLAN = 'User Renewed Plan',

  DATASOURCE_CREATED = 'Datasource Created',
  INTERNAL_AGENT_QUERY = 'Internal Agent Query',
  EXTERNAL_AGENT_QUERY = 'External Agent Query',
  DATASTORE_QUERY = 'Datastore Query',

  INBOX_FILTER = 'Inbox Filter',
  BUTTON_CLICK = 'Button Click',
}

let mixpanel = undefined as Mixpanel.Mixpanel | undefined;

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel = Mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    host: 'api-eu.mixpanel.com',
  });
}

type Payload = Record<string, unknown> & {
  userId?: string;
};

export const capture = ({
  event,
  payload = {},
}: {
  event: string;
  payload?: Payload;
}) => {
  const { userId, ...otherProps } = payload;

  if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && mixpanel) {
    try {
      mixpanel.track(event, {
        distinct_id: userId,
        ...otherProps,
      });
    } catch (err) {
      console.error(err);
    }
  }
};

type ProfileProps = Record<string, unknown> & {
  userId: string;
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
};

export const profile = (props: ProfileProps) => {
  const { userId, firstName, lastName, createdAt, ...otherProps } = props;

  if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && mixpanel) {
    try {
      mixpanel.people.set(userId, {
        $first_name: firstName,
        $last_name: lastName,
        $created: createdAt?.toISOString?.(),
        ...otherProps,
      });
    } catch (err) {
      console.error(err);
    }
  }
};
