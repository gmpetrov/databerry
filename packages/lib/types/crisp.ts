export enum AIStatus {
  enabled = 'enabled',
  disabled = 'disabled',
}

export enum Action {
  enable_ai = 'enable_ai',
  request_human = 'request_human',
  mark_as_resolved = 'mark_as_resolved',
}

export type ConversationMetadata = {
  aiStatus?: AIStatus;
  choice?: Action;
  aiDisabledDate?: Date;
};
