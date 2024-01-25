import { WhatsAppSendMessagechema } from '@chaindesk/lib/types/dtos';
import { ServiceProviderWhatsapp } from '@chaindesk/lib/types/dtos';
import axios from 'axios';

type Props<T> = {
  to: string;
  message: WhatsAppSendMessagechema;
  credentials: T;
};

type WhatsAppSendMessageResponse = {
  messaging_product: 'whatsapp';
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
};

export const sendWhatsAppMessage = async <T extends ServiceProviderWhatsapp>({
  to,
  message,
  credentials,
}: Props<T>) =>
  axios.post<WhatsAppSendMessageResponse>(
    `https://graph.facebook.com/v17.0/${credentials.config.phoneNumberId}/messages`,
    {
      to,
      messaging_product: 'whatsapp',
      ...message,
    },

    {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    }
  );

export default sendWhatsAppMessage;
