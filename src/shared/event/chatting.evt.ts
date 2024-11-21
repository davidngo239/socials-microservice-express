import { AppEvent } from "@shared/model/event";
import { EvtChatMessageSent } from "@shared/utils/const";

export interface ChatMessageSentPayload {
  roomId: string;
  content: string;
}

export class ChatMessageSentEvent extends AppEvent<ChatMessageSentPayload> {
  getEventName() {
    return EvtChatMessageSent;
  }
}
