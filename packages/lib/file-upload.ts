export const creatChatUploadKey = (props: {
  conversationId: string;
  organizationId: string;
  fileName?: string;
}) => {
  return `organizations/${props.organizationId}/conversations/${
    props.conversationId
  }/uploads${props.fileName ? `/${props.fileName}` : ``}`;
};
