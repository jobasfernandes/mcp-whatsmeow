export interface CodeExample {
  id: string
  title: string
  description: string
  category: 'senders' | 'sessions' | 'events' | 'media' | 'groups' | 'connection' | 'advanced'
  code: string
  sourceFile: string
  tags: string[]
}

export const EXAMPLES: CodeExample[] = [
  {
    id: 'send-text',
    title: 'Send text message with link preview',
    description: 'Send an ExtendedTextMessage with optional link preview, quoting, and mentions',
    category: 'senders',
    code: `msg := &waE2E.Message{
    ExtendedTextMessage: &waE2E.ExtendedTextMessage{
        Text:          proto.String(body),
        MatchedText:   proto.String(lpURL),
        Title:         proto.String(lpTitle),
        Description:   proto.String(lpDesc),
        JPEGThumbnail: lpImageData,
    },
}

msg.ExtendedTextMessage.ContextInfo = &waE2E.ContextInfo{
    StanzaID:      proto.String(stanzaID),
    Participant:   proto.String(participant),
    QuotedMessage: quotedMsg,
    MentionedJID:  mentionedJIDs,
    IsForwarded:   proto.Bool(true),
}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['text', 'link-preview', 'quote', 'mention', 'forward', 'ExtendedTextMessage'],
  },
  {
    id: 'send-image',
    title: 'Upload and send image',
    description: 'Upload image to CDN and send ImageMessage with thumbnail',
    category: 'senders',
    code: `uploaded, err := client.Upload(ctx, filedata, whatsmeow.MediaImage)

msg := &waE2E.Message{ImageMessage: &waE2E.ImageMessage{
    Caption:       proto.String(caption),
    URL:           proto.String(uploaded.URL),
    DirectPath:    proto.String(uploaded.DirectPath),
    MediaKey:      uploaded.MediaKey,
    Mimetype:      proto.String(mimeType),
    FileEncSHA256: uploaded.FileEncSHA256,
    FileSHA256:    uploaded.FileSHA256,
    FileLength:    proto.Uint64(uint64(len(filedata))),
    JPEGThumbnail: thumbnailBytes,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['image', 'upload', 'media', 'thumbnail', 'ImageMessage'],
  },
  {
    id: 'send-video',
    title: 'Upload and send video',
    description: 'Upload video to CDN and send VideoMessage with thumbnail',
    category: 'senders',
    code: `uploaded, err := client.Upload(ctx, filedata, whatsmeow.MediaVideo)

msg := &waE2E.Message{VideoMessage: &waE2E.VideoMessage{
    Caption:       proto.String(caption),
    URL:           proto.String(uploaded.URL),
    DirectPath:    proto.String(uploaded.DirectPath),
    MediaKey:      uploaded.MediaKey,
    Mimetype:      proto.String(mimeType),
    FileEncSHA256: uploaded.FileEncSHA256,
    FileSHA256:    uploaded.FileSHA256,
    FileLength:    proto.Uint64(uint64(len(filedata))),
    JPEGThumbnail: jpegThumbnail,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['video', 'upload', 'media', 'thumbnail', 'VideoMessage'],
  },
  {
    id: 'send-audio',
    title: 'Send audio/voice note (PTT)',
    description: 'Upload and send AudioMessage with PTT flag for voice notes',
    category: 'senders',
    code: `uploaded, err := client.Upload(ctx, filedata, whatsmeow.MediaAudio)

ptt := true
mime := "audio/ogg; codecs=opus"

msg := &waE2E.Message{AudioMessage: &waE2E.AudioMessage{
    URL:           proto.String(uploaded.URL),
    DirectPath:    proto.String(uploaded.DirectPath),
    MediaKey:      uploaded.MediaKey,
    Mimetype:      &mime,
    FileEncSHA256: uploaded.FileEncSHA256,
    FileSHA256:    uploaded.FileSHA256,
    FileLength:    proto.Uint64(uint64(len(filedata))),
    PTT:           &ptt,
    Seconds:       proto.Uint32(seconds),
    Waveform:      waveformBytes,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['audio', 'voice', 'ptt', 'upload', 'AudioMessage', 'waveform'],
  },
  {
    id: 'send-document',
    title: 'Upload and send document',
    description: 'Upload file and send DocumentMessage with filename',
    category: 'senders',
    code: `uploaded, err := client.Upload(ctx, filedata, whatsmeow.MediaDocument)

msg := &waE2E.Message{DocumentMessage: &waE2E.DocumentMessage{
    URL:           proto.String(uploaded.URL),
    FileName:      &fileName,
    DirectPath:    proto.String(uploaded.DirectPath),
    MediaKey:      uploaded.MediaKey,
    Mimetype:      proto.String(mimeType),
    FileEncSHA256: uploaded.FileEncSHA256,
    FileSHA256:    uploaded.FileSHA256,
    FileLength:    proto.Uint64(uint64(len(filedata))),
    Caption:       proto.String(caption),
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['document', 'file', 'upload', 'DocumentMessage'],
  },
  {
    id: 'send-sticker',
    title: 'Send sticker (uses MediaImage)',
    description: 'Upload WebP sticker using MediaImage constant (NOT MediaSticker)',
    category: 'senders',
    code: `uploaded, err := client.Upload(ctx, processedData, whatsmeow.MediaImage)

msg := &waE2E.Message{StickerMessage: &waE2E.StickerMessage{
    URL:           proto.String(uploaded.URL),
    DirectPath:    proto.String(uploaded.DirectPath),
    MediaKey:      uploaded.MediaKey,
    Mimetype:      proto.String(detectedMimeType),
    FileEncSHA256: uploaded.FileEncSHA256,
    FileSHA256:    uploaded.FileSHA256,
    FileLength:    proto.Uint64(uint64(len(processedData))),
    PngThumbnail:  pngThumbnail,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['sticker', 'webp', 'MediaImage', 'StickerMessage', 'gotcha'],
  },
  {
    id: 'send-contact',
    title: 'Send contact card',
    description: 'Send a ContactMessage with vCard data',
    category: 'senders',
    code: `msg := &waE2E.Message{ContactMessage: &waE2E.ContactMessage{
    DisplayName: &name,
    Vcard:       &vcard,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['contact', 'vcard', 'ContactMessage'],
  },
  {
    id: 'send-location',
    title: 'Send location',
    description: 'Send a LocationMessage with coordinates',
    category: 'senders',
    code: `msg := &waE2E.Message{LocationMessage: &waE2E.LocationMessage{
    DegreesLatitude:  &latitude,
    DegreesLongitude: &longitude,
    Name:             &name,
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['location', 'gps', 'LocationMessage'],
  },
  {
    id: 'send-buttons',
    title: 'Send NativeFlow interactive buttons',
    description: 'Build interactive buttons (reply, URL, call, copy) with required AdditionalNodes and biz XML',
    category: 'senders',
    code: `nativeButtons := []*waE2E.InteractiveMessage_NativeFlowMessage_NativeFlowButton{}

paramsJSON, _ := json.Marshal(map[string]string{"display_text": text, "id": btnID})
nativeButtons = append(nativeButtons, &waE2E.InteractiveMessage_NativeFlowMessage_NativeFlowButton{
    Name:             proto.String("quick_reply"),
    ButtonParamsJSON: proto.String(string(paramsJSON)),
})

paramsJSON, _ = json.Marshal(map[string]string{"display_text": text, "url": url, "merchant_url": url})
nativeButtons = append(nativeButtons, &waE2E.InteractiveMessage_NativeFlowMessage_NativeFlowButton{
    Name:             proto.String("cta_url"),
    ButtonParamsJSON: proto.String(string(paramsJSON)),
})

interactiveMsg := &waE2E.InteractiveMessage{
    Body:   &waE2E.InteractiveMessage_Body{Text: proto.String(bodyText)},
    Footer: &waE2E.InteractiveMessage_Footer{Text: proto.String(footer)},
    InteractiveMessage: &waE2E.InteractiveMessage_NativeFlowMessage_{
        NativeFlowMessage: &waE2E.InteractiveMessage_NativeFlowMessage{
            MessageVersion: proto.Int32(1),
            Buttons:        nativeButtons,
        },
    },
}

msg := &waE2E.Message{InteractiveMessage: interactiveMsg}

extraNodes := []waBinary.Node{{
    Tag: "biz",
    Content: []waBinary.Node{{
        Tag:   "interactive",
        Attrs: waBinary.Attrs{"type": "native_flow", "v": "1"},
        Content: []waBinary.Node{{
            Tag:   "native_flow",
            Attrs: waBinary.Attrs{"v": "9", "name": "mixed"},
        }},
    }},
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{
    AdditionalNodes: &extraNodes,
})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['buttons', 'interactive', 'native-flow', 'AdditionalNodes', 'cta_url', 'quick_reply', 'cta_call', 'cta_copy'],
  },
  {
    id: 'send-list',
    title: 'Send list message with FutureProofMessage',
    description: 'Build list message wrapped in DocumentWithCaptionMessage (FutureProofMessage) with required biz nodes',
    category: 'senders',
    code: `sections := []*waE2E.ListMessage_Section{}
for _, sec := range reqSections {
    rows := []*waE2E.ListMessage_Row{}
    for _, item := range sec.Rows {
        rows = append(rows, &waE2E.ListMessage_Row{
            RowID:       proto.String(rowId),
            Title:       proto.String(item.Title),
            Description: proto.String(item.Desc),
        })
    }
    sections = append(sections, &waE2E.ListMessage_Section{
        Title: proto.String(sec.Title),
        Rows:  rows,
    })
}

listMsg := &waE2E.ListMessage{
    Title:       proto.String(topText),
    Description: proto.String(desc),
    ButtonText:  proto.String(buttonText),
    ListType:    waE2E.ListMessage_SINGLE_SELECT.Enum(),
    Sections:    sections,
    FooterText:  proto.String(footerText),
}

msg := &waE2E.Message{
    DocumentWithCaptionMessage: &waE2E.FutureProofMessage{
        Message: &waE2E.Message{ListMessage: listMsg},
    },
}

extraNodes := []waBinary.Node{{
    Tag: "biz",
    Content: []waBinary.Node{{
        Tag:   "list",
        Attrs: waBinary.Attrs{"type": "product_list", "v": "2"},
    }},
}}

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{
    AdditionalNodes: &extraNodes,
})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['list', 'interactive', 'FutureProofMessage', 'AdditionalNodes', 'ListMessage', 'sections'],
  },
  {
    id: 'send-poll',
    title: 'Create and send poll',
    description: 'Use BuildPollCreation helper to create a poll message',
    category: 'senders',
    code: `pollMessage := client.BuildPollCreation(header, options, 1)

resp, err := client.SendMessage(ctx, recipient, pollMessage, whatsmeow.SendRequestExtra{ID: msgid})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['poll', 'BuildPollCreation', 'PollCreationMessage'],
  },
  {
    id: 'send-reaction',
    title: 'Send reaction to a message',
    description: 'Build ReactionMessage with message key and emoji',
    category: 'senders',
    code: `key := &waCommon.MessageKey{
    RemoteJID: proto.String(recipient.String()),
    FromMe:    proto.Bool(fromMe),
    ID:        proto.String(msgid),
}
if !fromMe && participantJID.String() != "" {
    key.Participant = proto.String(participantJID.String())
}

msg := &waE2E.Message{
    ReactionMessage: &waE2E.ReactionMessage{
        Key:               key,
        Text:              proto.String(reaction),
        GroupingKey:        proto.String(reaction),
        SenderTimestampMS: proto.Int64(time.Now().UnixMilli()),
    },
}

resp, err := client.SendMessage(ctx, recipient, msg)`,
    sourceFile: 'internal/handler/chatother/service.go',
    tags: ['reaction', 'emoji', 'ReactionMessage'],
  },
  {
    id: 'delete-message',
    title: 'Delete (revoke) a message',
    description: 'Use BuildRevoke to create a message deletion/revocation',
    category: 'senders',
    code: `revokeMsg := client.BuildRevoke(recipient, types.EmptyJID, msgid)

resp, err := client.SendMessage(ctx, recipient, revokeMsg)`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['delete', 'revoke', 'BuildRevoke', 'ProtocolMessage'],
  },
  {
    id: 'edit-message',
    title: 'Edit a sent message',
    description: 'Use BuildEdit to modify an existing message',
    category: 'senders',
    code: `msg := &waE2E.Message{
    ExtendedTextMessage: &waE2E.ExtendedTextMessage{
        Text: &newBody,
    },
}

editMsg := client.BuildEdit(recipient, msgid, msg)

resp, err := client.SendMessage(ctx, recipient, editMsg)`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['edit', 'BuildEdit', 'ProtocolMessage'],
  },
  {
    id: 'send-status',
    title: 'Set status message',
    description: 'Set the user profile status/about text',
    category: 'senders',
    code: `err = client.SetStatusMessage(ctx, body)`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['status', 'about', 'SetStatusMessage'],
  },
  {
    id: 'session-init',
    title: 'Initialize client with SQLStore',
    description: 'Create SQLStore container, get/create device, set properties, create client',
    category: 'sessions',
    code: `import (
    meow "go.mau.fi/whatsmeow"
    "go.mau.fi/whatsmeow/store"
    "go.mau.fi/whatsmeow/store/sqlstore"
    "go.mau.fi/whatsmeow/proto/waCompanionReg"
)

waContainer, err := sqlstore.New(ctx, "postgres", dsn, waDbLog)

deviceStore, err := container.GetDevice(ctx, jid)
if err != nil || deviceStore == nil {
    deviceStore = container.NewDevice()
}

store.DeviceProps.PlatformType = waCompanionReg.DeviceProps_DESKTOP.Enum()
store.DeviceProps.Os = &osName

client := meow.NewClient(deviceStore, clientLog)
client.SetProxyAddress(proxyURL, meow.SetProxyOptions{})`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['init', 'sqlstore', 'device', 'client', 'NewClient', 'DeviceProps'],
  },
  {
    id: 'session-qr',
    title: 'QR code pairing flow',
    description: 'Pair a new device via QR code with event channel handling',
    category: 'sessions',
    code: `if client.Store.ID == nil {
    qrChan, err := client.GetQRChannel(ctx)
    if err != nil && !errors.Is(err, meow.ErrQRStoreContainsID) {
        return err
    }

    if err = client.Connect(); err != nil {
        return err
    }

    for evt := range qrChan {
        switch evt.Event {
        case "code":
            // Display QR code: evt.Code
        case "timeout":
            // QR expired, cleanup
        case "success":
            // Paired successfully
        }
    }
}`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['qr', 'pairing', 'GetQRChannel', 'Connect'],
  },
  {
    id: 'session-reconnect',
    title: 'Connection with retry logic',
    description: 'Reconnect client with linear backoff and max retries',
    category: 'sessions',
    code: `const (
    maxConnectionRetries    = 3
    connectionRetryBaseWait = 5 * time.Second
)

var lastErr error
for attempt := 0; attempt < maxConnectionRetries; attempt++ {
    if attempt > 0 {
        waitTime := time.Duration(attempt) * connectionRetryBaseWait
        time.Sleep(waitTime)
    }
    if err = client.Connect(); err == nil {
        break
    }
    lastErr = err
}`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['reconnect', 'retry', 'backoff', 'Connect'],
  },
  {
    id: 'session-keepalive',
    title: 'Keep-always-online presence',
    description: 'Periodically send available presence to stay online',
    category: 'sessions',
    code: `func keepAlwaysOnline(ctx context.Context, client *meow.Client) {
    ticker := time.NewTicker(4 * time.Minute)
    defer ticker.Stop()
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            _ = client.SendPresence(ctx, types.PresenceAvailable)
        }
    }
}`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['keepalive', 'presence', 'online', 'SendPresence'],
  },
  {
    id: 'session-shutdown',
    title: 'Graceful shutdown',
    description: 'Signal-based graceful shutdown with client disconnect',
    category: 'sessions',
    code: `quit := make(chan os.Signal, 1)
signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
<-quit

ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(ctx)

for _, mc := range clients {
    mc.WAClient.Disconnect()
}`,
    sourceFile: 'cmd/api/main.go',
    tags: ['shutdown', 'graceful', 'Disconnect', 'signal'],
  },
  {
    id: 'events-dispatcher',
    title: 'Reflect-based event dispatcher',
    description: 'Type-safe event routing using reflect.Type map',
    category: 'events',
    code: `type HandlerFunc func(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult

type Dispatcher struct {
    handlers map[reflect.Type]HandlerFunc
}

func (d *Dispatcher) Register(eventPtr interface{}, handler HandlerFunc) {
    t := reflect.TypeOf(eventPtr)
    d.handlers[t] = handler
}

func (d *Dispatcher) Dispatch(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult {
    t := reflect.TypeOf(rawEvt)
    handler, ok := d.handlers[t]
    if !ok { return nil }
    return handler(ctx, ec, rawEvt)
}

d.Register((*events.Connected)(nil), handleConnected)
d.Register((*events.Message)(nil), HandleMessage)
d.Register((*events.Receipt)(nil), handleReceipt)
d.Register((*events.LoggedOut)(nil), handleLoggedOut)
d.Register((*events.HistorySync)(nil), HandleHistorySync)`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['dispatcher', 'reflect', 'routing', 'pattern', 'EventHandler'],
  },
  {
    id: 'events-handler-register',
    title: 'Register event handler on client',
    description: 'Attach event handler function to whatsmeow client',
    category: 'events',
    code: `eventHandlerID := client.AddEventHandler(func(rawEvt interface{}) {
    result := dispatcher.Dispatch(ctx, ec, rawEvt)
    if result == nil { return }
    // Route to SSE, WebSocket, Webhook, RabbitMQ...
})`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['AddEventHandler', 'register', 'handler'],
  },
  {
    id: 'events-message',
    title: 'Handle incoming message with media download',
    description: 'Process incoming messages, auto-download media, mark as read',
    category: 'events',
    code: `func HandleMessage(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult {
    evt := rawEvt.(*events.Message)

    if media := firstMedia(evt.Message); media != nil {
        data, err := ec.WAClient.Download(ctx, media.msg)
        // encode as base64 or upload to S3
    }

    if !evt.Info.IsFromMe {
        go func() {
            time.Sleep(time.Second)
            _ = ec.WAClient.MarkRead(ctx, []types.MessageID{evt.Info.ID},
                evt.Info.Timestamp, evt.Info.Chat, evt.Info.Sender)
        }()
    }
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['message', 'download', 'MarkRead', 'auto-read'],
  },
  {
    id: 'events-media-detect',
    title: 'Detect media type from message',
    description: 'Helper to identify which media type a message contains',
    category: 'events',
    code: `func firstMedia(msg *waE2E.Message) *downloadable {
    if img := msg.GetImageMessage(); img != nil {
        return &downloadable{img, img.GetMimetype(), ".jpg", "image", false}
    }
    if audio := msg.GetAudioMessage(); audio != nil {
        return &downloadable{audio, audio.GetMimetype(), ".ogg", "audio", false}
    }
    if doc := msg.GetDocumentMessage(); doc != nil {
        return &downloadable{doc, doc.GetMimetype(), ".bin", "document", false}
    }
    if video := msg.GetVideoMessage(); video != nil {
        return &downloadable{video, video.GetMimetype(), ".mp4", "video", false}
    }
    if sticker := msg.GetStickerMessage(); sticker != nil {
        return &downloadable{sticker, sticker.GetMimetype(), ".webp", "sticker", sticker.GetIsAnimated()}
    }
    return nil
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['media', 'detect', 'type-switch', 'GetImageMessage', 'GetAudioMessage'],
  },
  {
    id: 'events-receipt',
    title: 'Handle read/delivered receipts',
    description: 'Process receipt events for delivery and read confirmations',
    category: 'events',
    code: `func handleReceipt(_ context.Context, _ *EventContext, rawEvt interface{}) *EventResult {
    evt := rawEvt.(*events.Receipt)
    switch evt.Type {
    case types.ReceiptTypeRead:
        // Message read by recipient
    case types.ReceiptTypeReadSelf:
        // We read the message on another device
    case types.ReceiptTypeDelivered:
        // Message delivered
    default:
        return nil
    }
    return &EventResult{Type: "Receipt", Payload: evt}
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['receipt', 'read', 'delivered', 'ReceiptType'],
  },
  {
    id: 'events-call-reject',
    title: 'Auto-reject calls with message',
    description: 'Reject incoming calls and optionally send a text message',
    category: 'events',
    code: `func handleCallOffer(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult {
    evt := rawEvt.(*events.CallOffer)

    ec.WAClient.RejectCall(ctx, evt.CallCreator, evt.CallID)

    msg := &waE2E.Message{
        ExtendedTextMessage: &waE2E.ExtendedTextMessage{Text: &rejectionText},
    }
    ec.WAClient.SendMessage(ctx, evt.CallCreator, msg)

    return &EventResult{Type: "CallRejected"}
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['call', 'reject', 'RejectCall', 'CallOffer', 'auto-reject'],
  },
  {
    id: 'events-loggedout',
    title: 'Handle logout event',
    description: 'Clean up session when device is logged out',
    category: 'events',
    code: `func handleLoggedOut(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult {
    evt := rawEvt.(*events.LoggedOut)
    ec.ClientMgr.SendKill(ec.UserID)
    ec.UserRepo.SetConnected(ctx, ec.UserID, false)
    return &EventResult{Type: "LoggedOut", Payload: evt}
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['logout', 'cleanup', 'LoggedOut', 'session'],
  },
  {
    id: 'events-appstate',
    title: 'Send presence after AppStateSyncComplete',
    description: 'Send available presence after critical block app state sync completes',
    category: 'events',
    code: `func handleAppStateSyncComplete(ctx context.Context, ec *EventContext, rawEvt interface{}) *EventResult {
    evt := rawEvt.(*events.AppStateSyncComplete)
    if len(ec.WAClient.Store.PushName) > 0 && evt.Name == appstate.WAPatchCriticalBlock {
        _ = ec.WAClient.SendPresence(ctx, types.PresenceAvailable)
    }
    return nil
}`,
    sourceFile: 'internal/whatsapp/events/',
    tags: ['appstate', 'sync', 'presence', 'AppStateSyncComplete', 'CriticalBlock'],
  },
  {
    id: 'media-download',
    title: 'Download incoming media',
    description: 'Download and decrypt media from a received message',
    category: 'media',
    code: `data, err := client.Download(ctx, msg.GetImageMessage())

ext := SafeExtension(mimeType, ".jpg")`,
    sourceFile: 'internal/whatsapp/media.go',
    tags: ['download', 'decrypt', 'Download'],
  },
  {
    id: 'media-upload',
    title: 'Upload media for sending',
    description: 'Encrypt and upload media to WhatsApp CDN',
    category: 'media',
    code: `resp, err := client.Upload(ctx, data, mediaType)
// resp contains: URL, DirectPath, MediaKey, FileEncSHA256, FileSHA256, FileLength`,
    sourceFile: 'internal/whatsapp/media.go',
    tags: ['upload', 'encrypt', 'Upload', 'CDN'],
  },
  {
    id: 'media-type-mapping',
    title: 'Map domain types to whatsmeow MediaType',
    description: 'Convert string media types to whatsmeow constants (note: sticker uses MediaImage)',
    category: 'media',
    code: `func WAMediaType(domainType string) whatsmeow.MediaType {
    switch domainType {
    case "image":    return whatsmeow.MediaImage
    case "audio":    return whatsmeow.MediaAudio
    case "video":    return whatsmeow.MediaVideo
    case "document": return whatsmeow.MediaDocument
    case "sticker":  return whatsmeow.MediaImage // stickers use MediaImage!
    default:         return whatsmeow.MediaDocument
    }
}`,
    sourceFile: 'internal/whatsapp/media.go',
    tags: ['MediaType', 'mapping', 'sticker', 'MediaImage', 'gotcha'],
  },
  {
    id: 'media-reconstruct',
    title: 'Download media by providing encryption metadata',
    description: 'Reconstruct a message struct for downloading media when you only have the encryption metadata',
    category: 'media',
    code: `msg := &waE2E.ImageMessage{
    URL:           proto.String(url),
    DirectPath:    proto.String(directPath),
    MediaKey:      mediaKey,
    Mimetype:      proto.String(mimetype),
    FileEncSHA256: fileEncSHA256,
    FileSHA256:    fileSHA256,
    FileLength:    &fileLength,
}
data, err = client.Download(ctx, msg)`,
    sourceFile: 'internal/handler/chatdownload/service.go',
    tags: ['download', 'reconstruct', 'metadata', 'encryption'],
  },
  {
    id: 'groups-crud',
    title: 'Group CRUD operations',
    description: 'Create group, get info, list joined, set properties',
    category: 'groups',
    code: `groups, err := client.GetJoinedGroups(ctx)

info, err := client.GetGroupInfo(ctx, groupJID)

newGroup, err := client.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:         name,
    Participants: participantJIDs,
})

err = client.SetGroupName(ctx, groupJID, name)
err = client.SetGroupTopic(ctx, groupJID, "", "", topic)
_, err = client.SetGroupPhoto(ctx, groupJID, jpegData)
err = client.SetGroupLocked(ctx, groupJID, locked)
err = client.SetGroupAnnounce(ctx, groupJID, announce)`,
    sourceFile: 'internal/handler/group/service.go',
    tags: ['group', 'create', 'info', 'settings', 'GetGroupInfo', 'CreateGroup'],
  },
  {
    id: 'groups-participants',
    title: 'Manage group participants',
    description: 'Add, remove, promote, demote group members',
    category: 'groups',
    code: `_, err = client.UpdateGroupParticipants(ctx, groupJID, phoneJIDs, whatsmeow.ParticipantChange("add"))
_, err = client.UpdateGroupParticipants(ctx, groupJID, phoneJIDs, whatsmeow.ParticipantChange("remove"))
_, err = client.UpdateGroupParticipants(ctx, groupJID, phoneJIDs, whatsmeow.ParticipantChange("promote"))
_, err = client.UpdateGroupParticipants(ctx, groupJID, phoneJIDs, whatsmeow.ParticipantChange("demote"))`,
    sourceFile: 'internal/handler/group/service.go',
    tags: ['group', 'participants', 'add', 'remove', 'promote', 'demote', 'UpdateGroupParticipants'],
  },
  {
    id: 'groups-invite',
    title: 'Group invite links',
    description: 'Get invite link, join via link, join via invite code',
    category: 'groups',
    code: `link, err := client.GetGroupInviteLink(ctx, groupJID, false)

groupInfo, err := client.GetGroupInfoFromLink(ctx, code)

_, err = client.JoinGroupWithLink(ctx, code)`,
    sourceFile: 'internal/handler/group/service.go',
    tags: ['group', 'invite', 'link', 'join', 'GetGroupInviteLink', 'JoinGroupWithLink'],
  },
  {
    id: 'connection-auto-reconnect',
    title: 'Auto-reconnect previously connected sessions',
    description: 'On startup, reconnect all users that were connected before shutdown',
    category: 'connection',
    code: `if users, err := userRepo.GetConnectedUsers(ctx); err == nil && len(users) > 0 {
    for _, u := range users {
        if !clientMgr.TryStartConnect(u.ID) {
            continue
        }
        go startClient(deps, u.ID, u.Jid, u.Token, subs)
    }
}`,
    sourceFile: 'cmd/api/main.go',
    tags: ['reconnect', 'startup', 'multi-session', 'concurrent'],
  },
  {
    id: 'connection-kill-signal',
    title: 'Session kill signal pattern',
    description: 'Channel-based session lifecycle management with kill signals',
    category: 'connection',
    code: `killCh := clientMgr.RegisterKill(userID)
defer clientMgr.CleanupKill(userID)

// Block until kill signal
<-killCh
client.Disconnect()`,
    sourceFile: 'cmd/api/startup.go',
    tags: ['kill', 'lifecycle', 'channel', 'Disconnect'],
  },
  {
    id: 'advanced-mark-read',
    title: 'Mark messages as read',
    description: 'Send read receipts for specific messages',
    category: 'advanced',
    code: `err := client.MarkRead(ctx, messageIDs, time.Now(), chatJID, senderJID)`,
    sourceFile: 'internal/handler/chatother/service.go',
    tags: ['read', 'receipt', 'MarkRead'],
  },
  {
    id: 'advanced-archive',
    title: 'Archive/unarchive chat via AppState',
    description: 'Use SendAppState with BuildArchive to archive or unarchive chats',
    category: 'advanced',
    code: `import "go.mau.fi/whatsmeow/appstate"

err = client.SendAppState(ctx, appstate.BuildArchive(chatJID, true, time.Time{}, nil))
err = client.SendAppState(ctx, appstate.BuildArchive(chatJID, false, time.Time{}, nil))`,
    sourceFile: 'internal/handler/chatother/service.go',
    tags: ['archive', 'appstate', 'SendAppState', 'BuildArchive'],
  },
  {
    id: 'advanced-jid-parse',
    title: 'Parse and validate JID',
    description: 'Parse phone number or full JID string into types.JID',
    category: 'advanced',
    code: `func parseJID(arg string) (types.JID, bool) {
    if arg[0] == '+' { arg = arg[1:] }
    if !strings.ContainsRune(arg, '@') {
        return types.NewJID(arg, types.DefaultUserServer), true
    }
    recipient, err := types.ParseJID(arg)
    if err != nil || recipient.User == "" { return recipient, false }
    return recipient, true
}`,
    sourceFile: 'internal/handler/',
    tags: ['jid', 'parse', 'NewJID', 'ParseJID', 'phone'],
  },
  {
    id: 'advanced-context-info',
    title: 'Build ContextInfo for quoting/mentions/forwarding',
    description: 'Construct ContextInfo for message quoting, mentions, and forwarding',
    category: 'advanced',
    code: `contextInfo := &waE2E.ContextInfo{}

contextInfo.StanzaID = proto.String(quotedMsgID)
contextInfo.Participant = proto.String(quotedSenderJID)
contextInfo.QuotedMessage = &waE2E.Message{Conversation: proto.String("")}

contextInfo.MentionedJID = mentionedJIDs

contextInfo.IsForwarded = proto.Bool(true)`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['context', 'quote', 'mention', 'forward', 'ContextInfo', 'StanzaID'],
  },
  {
    id: 'advanced-msgid',
    title: 'Generate message ID and SendRequestExtra',
    description: 'Generate unique message ID and configure send options',
    category: 'advanced',
    code: `msgid := client.GenerateMessageID()

resp, err := client.SendMessage(ctx, recipient, msg, whatsmeow.SendRequestExtra{
    ID:              msgid,
    AdditionalNodes: &extraNodes,
    Peer:            true,
})`,
    sourceFile: 'internal/handler/chatsend/service.go',
    tags: ['msgid', 'GenerateMessageID', 'SendRequestExtra', 'AdditionalNodes', 'Peer'],
  },
]

export type ExampleCategory = CodeExample['category']

export const EXAMPLE_CATEGORIES: ExampleCategory[] = ['senders', 'sessions', 'events', 'media', 'groups', 'connection', 'advanced']

export function getExamplesByCategory(category: ExampleCategory): CodeExample[] {
  return EXAMPLES.filter((e) => e.category === category)
}

export function getExampleById(id: string): CodeExample | undefined {
  return EXAMPLES.find((e) => e.id === id)
}

export function searchExamples(query: string): CodeExample[] {
  const q = query.toLowerCase()
  return EXAMPLES.filter((e) =>
    e.title.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    e.tags.some((t) => t.toLowerCase().includes(q)) ||
    e.id.toLowerCase().includes(q),
  )
}
