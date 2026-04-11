export interface HistoryMethodInfo {
  name: string
  signature: string
  description: string
}

export interface HistoryReference {
  overview: string
  downloadFlow: {
    steps: { step: number; description: string; detail: string }[]
    method: HistoryMethodInfo
  }
  requestFlow: {
    method: HistoryMethodInfo
    description: string
  }
  parsing: {
    method: HistoryMethodInfo
    description: string
  }
  pushNames: {
    method: HistoryMethodInfo
    description: string
  }
  loopHandler: {
    method: HistoryMethodInfo
    description: string
  }
  manualMode: {
    field: string
    description: string
  }
  historySyncTypes: { name: string; description: string }[]
  events: { name: string; description: string; fields: { name: string; type: string; description: string }[] }[]
  codeExamples: { title: string; code: string }[]
}

export const HISTORY_REFERENCE: HistoryReference = {
  overview: 'History sync allows a newly paired device to receive chat history from the primary device. Messages arrive as compressed protobuf blobs that need downloading, decompressing, and parsing. whatsmeow handles the download/decompress flow and provides parsed messages via events.',
  downloadFlow: {
    steps: [
      { step: 1, description: 'Receive notification', detail: 'Server sends history sync notification with encrypted blob reference' },
      { step: 2, description: 'Download encrypted blob', detail: 'Download from CDN using DirectPath + MediaKey from notification' },
      { step: 3, description: 'Decrypt', detail: 'Decrypt using standard media decryption (HKDF + AES-CBC)' },
      { step: 4, description: 'Decompress', detail: 'zlib decompress the decrypted payload' },
      { step: 5, description: 'Unmarshal protobuf', detail: 'Parse as waHistorySync.HistorySync protobuf' },
      { step: 6, description: 'Process messages', detail: 'Iterate conversations and messages, use ParseWebMessage for each' },
    ],
    method: {
      name: 'DownloadHistorySync',
      signature: 'func (cli *Client) DownloadHistorySync(ctx context.Context, notif *waHistorySync.HistorySyncNotification, synchronousStorage bool) (*waHistorySync.HistorySync, error)',
      description: 'Download, decrypt, decompress, and unmarshal a history sync notification. Set synchronousStorage=true to process synchronously (blocking).',
    },
  },
  requestFlow: {
    method: {
      name: 'BuildHistorySyncRequest',
      signature: 'func BuildHistorySyncRequest(lastKnownMessageInfo *types.MessageInfo, count int) *waE2E.Message',
      description: 'Build a history sync request message. Send via SendPeerMessage to trigger history delivery from primary device.',
    },
    description: 'To request more history: build a request message with the oldest known message info and desired count, then send it as a peer message. The primary device responds with history sync notifications.',
  },
  parsing: {
    method: {
      name: 'ParseWebMessage',
      signature: 'func (cli *Client) ParseWebMessage(ctx context.Context, chatJID types.JID, webMsg *waWeb.WebMessageInfo) (*events.Message, error)',
      description: 'Parse a WebMessageInfo from history sync into a standard events.Message. Handles sender resolution, timestamp conversion, and message type detection.',
    },
    description: 'Each message in history sync arrives as WebMessageInfo protobuf. ParseWebMessage converts it to the same events.Message format used for real-time messages, making processing uniform.',
  },
  pushNames: {
    method: {
      name: 'HandleHistoricalPushNames',
      signature: 'func (cli *Client) HandleHistoricalPushNames(ctx context.Context, names []*waHistorySync.Pushname)',
      description: 'Process push names from history sync. Updates the contact store with historical push names for JID-to-name resolution.',
    },
    description: 'History sync includes push names (display names) for all contacts in synced conversations. These must be stored for proper name resolution.',
  },
  loopHandler: {
    method: {
      name: 'HandleHistorySyncNotificationLoop',
      signature: 'func (cli *Client) HandleHistorySyncNotificationLoop()',
      description: 'Internal goroutine that processes history sync notifications as they arrive. Automatically started by Connect().',
    },
    description: 'This internal loop handles incoming history sync notifications automatically. It downloads, processes, and dispatches history sync events. Runs as a background goroutine.',
  },
  manualMode: {
    field: 'ManualHistorySyncDownload bool',
    description: 'When set to true on the Client struct, history sync blobs are NOT automatically downloaded. Instead, the raw notifications are dispatched as events and the caller must download them manually using DownloadHistorySync.',
  },
  historySyncTypes: [
    { name: 'INITIAL_BOOTSTRAP', description: 'First sync after pairing — recent messages across all chats' },
    { name: 'INITIAL_STATUS_V3', description: 'Status/story history sync' },
    { name: 'PUSH_NAME', description: 'Push names (display names) for contacts' },
    { name: 'RECENT', description: 'Recent messages (incremental sync)' },
    { name: 'FULL', description: 'Full history for specific chats (on-demand)' },
    { name: 'NON_BLOCKING_DATA', description: 'Non-critical data synced in background' },
    { name: 'ON_DEMAND', description: 'History requested explicitly by the client' },
  ],
  events: [
    {
      name: 'HistorySync',
      description: 'Dispatched when history sync data is received and processed',
      fields: [
        { name: 'Data', type: '*waHistorySync.HistorySync', description: 'Parsed history sync data' },
      ],
    },
  ],
  codeExamples: [
    {
      title: 'Handle history sync events',
      code: `cli.AddEventHandler(func(evt *events.HistorySync) {
    for _, conv := range evt.Data.GetConversations() {
        chatJID, _ := types.ParseJID(conv.GetId())
        for _, histMsg := range conv.GetMessages() {
            msg, err := cli.ParseWebMessage(ctx, chatJID, histMsg.GetMessage())
            if err != nil {
                log.Printf("Failed to parse history message: %v", err)
                continue
            }
            fmt.Printf("[%s] %s: %v\n", chatJID, msg.Info.Sender, msg.Message)
        }
    }
})`,
    },
    {
      title: 'Request more history',
      code: `reqMsg := whatsmeow.BuildHistorySyncRequest(oldestMessageInfo, 100)
cli.SendPeerMessage(ctx, reqMsg)`,
    },
    {
      title: 'Manual download mode',
      code: `cli.ManualHistorySyncDownload = true

cli.AddEventHandler(func(evt *events.HistorySync) {
    histSync, err := cli.DownloadHistorySync(ctx, notification, true)
    if err != nil {
        log.Printf("Failed to download: %v", err)
        return
    }
    for _, conv := range histSync.GetConversations() {
        // process conversations
    }
})`,
    },
  ],
}

export function getHistoryTopic(topic: string): Partial<HistoryReference> {
  switch (topic.toLowerCase()) {
    case 'download':
    case 'flow':
      return { downloadFlow: HISTORY_REFERENCE.downloadFlow }
    case 'request':
      return { requestFlow: HISTORY_REFERENCE.requestFlow }
    case 'parsing':
    case 'parse':
      return { parsing: HISTORY_REFERENCE.parsing }
    case 'pushnames':
    case 'names':
      return { pushNames: HISTORY_REFERENCE.pushNames }
    case 'types':
      return { historySyncTypes: HISTORY_REFERENCE.historySyncTypes }
    case 'events':
      return { events: HISTORY_REFERENCE.events }
    case 'manual':
      return { manualMode: HISTORY_REFERENCE.manualMode }
    case 'examples':
      return { codeExamples: HISTORY_REFERENCE.codeExamples }
    case 'all':
    default:
      return HISTORY_REFERENCE
  }
}
