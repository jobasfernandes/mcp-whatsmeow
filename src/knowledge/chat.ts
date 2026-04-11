export interface PresenceTypeInfo {
  name: string
  goType: string
  constants: { name: string; value: string; description: string }[]
}

export interface DisappearingTimerInfo {
  name: string
  constant: string
  value: string
  description: string
}

export interface StatusPrivacyInfo {
  name: string
  value: string
  description: string
}

export interface ChatReference {
  presenceTypes: PresenceTypeInfo[]
  disappearingTimers: DisappearingTimerInfo[]
  disappearingParser: {
    signature: string
    description: string
    acceptedStrings: string[]
  }
  statusPrivacy: {
    getMethod: string
    defaultConstant: string
    types: StatusPrivacyInfo[]
  }
  receiptTypes: { name: string; value: string; description: string }[]
}

export const CHAT_REFERENCE: ChatReference = {
  presenceTypes: [
    {
      name: 'Presence',
      goType: 'types.Presence',
      constants: [
        { name: 'PresenceAvailable', value: '"available"', description: 'User is online and active' },
        { name: 'PresenceUnavailable', value: '"unavailable"', description: 'User is offline' },
      ],
    },
    {
      name: 'ChatPresence',
      goType: 'types.ChatPresence',
      constants: [
        { name: 'ChatPresenceComposing', value: '"composing"', description: 'User is typing a message' },
        { name: 'ChatPresencePaused', value: '"paused"', description: 'User stopped typing' },
      ],
    },
    {
      name: 'ChatPresenceMedia',
      goType: 'types.ChatPresenceMedia',
      constants: [
        { name: 'ChatPresenceMediaText', value: '""', description: 'Default — typing text (empty string)' },
        { name: 'ChatPresenceMediaAudio', value: '"audio"', description: 'Recording audio/voice message' },
      ],
    },
  ],
  disappearingTimers: [
    { name: 'Off', constant: 'DisappearingTimerOff', value: 'time.Duration(0)', description: 'Disable disappearing messages' },
    { name: '24 Hours', constant: 'DisappearingTimer24Hours', value: '24 * time.Hour', description: 'Messages disappear after 24 hours' },
    { name: '7 Days', constant: 'DisappearingTimer7Days', value: '7 * 24 * time.Hour', description: 'Messages disappear after 7 days' },
    { name: '90 Days', constant: 'DisappearingTimer90Days', value: '90 * 24 * time.Hour', description: 'Messages disappear after 90 days' },
  ],
  disappearingParser: {
    signature: 'func ParseDisappearingTimerString(val string) (time.Duration, bool)',
    description: 'Parse a human-readable string into a disappearing timer duration. Returns the duration and whether the string was valid.',
    acceptedStrings: [
      '"0" or "off" → DisappearingTimerOff',
      '"24h" or "1d" or "1day" → DisappearingTimer24Hours',
      '"7d" or "7days" or "1week" → DisappearingTimer7Days',
      '"90d" or "90days" → DisappearingTimer90Days',
    ],
  },
  statusPrivacy: {
    getMethod: 'func (cli *Client) GetStatusPrivacy(ctx context.Context) ([]types.StatusPrivacy, error)',
    defaultConstant: 'DefaultStatusPrivacy = StatusPrivacy{Type: StatusPrivacyTypeContacts}',
    types: [
      { name: 'StatusPrivacyTypeContacts', value: '"contacts"', description: 'All contacts can see status' },
      { name: 'StatusPrivacyTypeBlacklist', value: '"blacklist"', description: 'All contacts except blacklisted users' },
      { name: 'StatusPrivacyTypeWhitelist', value: '"whitelist"', description: 'Only whitelisted contacts can see status' },
    ],
  },
  receiptTypes: [
    { name: 'ReceiptTypeDelivered', value: '""', description: 'Message delivered (two gray ticks, empty string)' },
    { name: 'ReceiptTypeSender', value: '"sender"', description: 'Sender receipt for group messages' },
    { name: 'ReceiptTypeRetry', value: '"retry"', description: 'Request message retry/re-send' },
    { name: 'ReceiptTypeRead', value: '"read"', description: 'Message read (two blue ticks)' },
    { name: 'ReceiptTypeReadSelf', value: '"read-self"', description: 'Message read on own device' },
    { name: 'ReceiptTypePlayed', value: '"played"', description: 'Voice/video message played' },
    { name: 'ReceiptTypePlayedSelf', value: '"played-self"', description: 'Voice/video played on own device' },
    { name: 'ReceiptTypeServerError', value: '"server-error"', description: 'Server error receipt' },
    { name: 'ReceiptTypeInactive', value: '"inactive"', description: 'Inactive receipt' },
    { name: 'ReceiptTypePeerMsg', value: '"peer_msg"', description: 'Peer message receipt (device sync)' },
    { name: 'ReceiptTypeHistorySync', value: '"hist_sync"', description: 'History sync receipt' },
  ],
}

export function getChatTopic(topic: string): Partial<ChatReference> {
  switch (topic.toLowerCase()) {
    case 'presence':
    case 'typing':
      return { presenceTypes: CHAT_REFERENCE.presenceTypes }
    case 'disappearing':
    case 'timer':
      return {
        disappearingTimers: CHAT_REFERENCE.disappearingTimers,
        disappearingParser: CHAT_REFERENCE.disappearingParser,
      }
    case 'status':
    case 'broadcast':
    case 'privacy':
      return { statusPrivacy: CHAT_REFERENCE.statusPrivacy }
    case 'receipts':
      return { receiptTypes: CHAT_REFERENCE.receiptTypes }
    case 'all':
    default:
      return CHAT_REFERENCE
  }
}
