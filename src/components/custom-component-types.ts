
import { React } from '@nlxai/touchpoint-ui';
import type { ConversationHandler } from '@nlxai/chat-core';

export type CustomComponent<Data = any> = React.FC<{
  data: Data;
  conversationHandler: ConversationHandler;
  enabled: boolean;
}>;