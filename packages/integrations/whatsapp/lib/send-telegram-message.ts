import { CreateAttachmentSchema } from '@chaindesk/lib/types/dtos';
import axios from 'axios';

async function sendTelegramMessage({
  message,
  chatId,
  messageId,
  token,
  attachments,
}: {
  message: string;
  chatId: string;
  messageId: string;
  token: string;
  attachments: CreateAttachmentSchema[];
}) {
  try {
    if (attachments.length > 0) {
      // seperate media from documents (telegram does not allow mix in both.)
      const { media, documents } = attachments.reduce(
        (acc, obj) => {
          if (obj.mimeType.includes('/image')) {
            obj = { ...obj, mimeType: 'photo' };
            acc.media.push(obj);
          } else if (obj.mimeType.includes('/video')) {
            obj = { ...obj, mimeType: 'video' };
            acc.media.push(obj);
          } else if (obj.mimeType.includes('/audio')) {
            obj = { ...obj, mimeType: 'audio' };
            acc.media.push(obj);
          } else {
            acc.documents.push({ ...obj, mimeType: 'document' });
          }
          return acc;
        },
        {
          media: [],
          documents: [],
        } as Record<string, CreateAttachmentSchema[]>
      );

      const uploads = [
        ...(documents.length > 0
          ? [
              axios.post(
                `https://api.telegram.org/bot${token}/sendMediaGroup`,
                {
                  chat_id: chatId,
                  media: documents.map((document) => {
                    return {
                      type: document.mimeType,
                      media: document.url,
                    };
                  }),
                  reply_parameters: {
                    message_id: messageId,
                  },
                }
              ),
            ]
          : []),
        media.length > 0
          ? [
              axios.post(
                `https://api.telegram.org/bot${token}/sendMediaGroup`,
                {
                  chat_id: chatId,
                  media: media.map((media) => {
                    return {
                      type: media.mimeType,
                      media: media.url,
                    };
                  }),
                  reply_parameters: {
                    message_id: messageId,
                  },
                }
              ),
            ]
          : [],
      ];

      await Promise.all(uploads);
    }

    if (message.trim() !== '') {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        text: message,
        chat_id: chatId,
        reply_parameters: {
          message_id: messageId,
        },
      });
    }
  } catch (e) {
    console.error(e);
    throw new Error('Unable to send message through telegram');
  }
}

export default sendTelegramMessage;
