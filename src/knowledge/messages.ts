export type MessageCategory = 'basic' | 'media' | 'interactive' | 'advanced' | 'system'

export interface MessageTypeInfo {
  name: string
  waE2EStruct: string
  description: string
  category: MessageCategory
  protoFieldNumber: number
  goType: string
  requiredFields: string[]
  optionalFields: string[]
  notes: string[]
  sendPattern?: string
}

export const MESSAGE_TYPES: MessageTypeInfo[] = [
  {
    name: 'text',
    waE2EStruct: 'Message.Conversation',
    description: 'Plain text message (simple string, no formatting)',
    category: 'basic',
    protoFieldNumber: 1,
    goType: '*string',
    requiredFields: ['Conversation *string'],
    optionalFields: [],
    notes: [
      'Simplest message type — just a string pointer',
      'For rich text with mentions, links, or replies use ExtendedTextMessage instead',
    ],
    sendPattern: `&waE2E.Message{Conversation: proto.String("Hello")}`,
  },
  {
    name: 'extendedText',
    waE2EStruct: 'ExtendedTextMessage',
    description: 'Rich text message with mentions, links, formatting, and reply context',
    category: 'basic',
    protoFieldNumber: 6,
    goType: '*ExtendedTextMessage',
    requiredFields: ['Text *string'],
    optionalFields: [
      'MatchedText *string',
      'CanonicalURL *string',
      'Description *string',
      'Title *string',
      'TextArgb *uint32',
      'BackgroundArgb *uint32',
      'Font *ExtendedTextMessage_FontType',
      'PreviewType *ExtendedTextMessage_PreviewType',
      'JPEGThumbnail []byte',
      'ContextInfo *ContextInfo',
      'MentionedJID []string',
      'InviteLinkGroupType *ExtendedTextMessage_InviteLinkGroupType',
      'InviteLinkParentGroupSubjectV2 *string',
      'InviteLinkGroupTypeV2 *ExtendedTextMessage_InviteLinkGroupType',
    ],
    notes: [
      'Use ContextInfo.MentionedJID for @mentions',
      'Link previews require MatchedText, CanonicalURL, Title, Description',
      'For replies set ContextInfo.StanzaID and ContextInfo.Participant',
    ],
    sendPattern: `&waE2E.Message{ExtendedTextMessage: &waE2E.ExtendedTextMessage{
    Text: proto.String("Hello @user"),
    ContextInfo: &waE2E.ContextInfo{MentionedJID: []string{"user@s.whatsapp.net"}},
}}`,
  },
  {
    name: 'contact',
    waE2EStruct: 'ContactMessage',
    description: 'Single vCard contact share',
    category: 'basic',
    protoFieldNumber: 4,
    goType: '*ContactMessage',
    requiredFields: ['DisplayName *string', 'Vcard *string'],
    optionalFields: ['ContextInfo *ContextInfo'],
    notes: ['Vcard must be a valid vCard 3.0 string', 'Use ContactsArrayMessage for multiple contacts'],
    sendPattern: `&waE2E.Message{ContactMessage: &waE2E.ContactMessage{
    DisplayName: proto.String("John"),
    Vcard: proto.String("BEGIN:VCARD\\nVERSION:3.0\\nFN:John\\nTEL:+1234567890\\nEND:VCARD"),
}}`,
  },
  {
    name: 'contactArray',
    waE2EStruct: 'ContactsArrayMessage',
    description: 'Multiple vCard contacts in a single message',
    category: 'basic',
    protoFieldNumber: 13,
    goType: '*ContactsArrayMessage',
    requiredFields: ['DisplayName *string', 'Contacts []*ContactMessage'],
    optionalFields: ['ContextInfo *ContextInfo'],
    notes: ['Each contact in the array is a full ContactMessage'],
  },
  {
    name: 'location',
    waE2EStruct: 'LocationMessage',
    description: 'Static location pin with coordinates',
    category: 'basic',
    protoFieldNumber: 5,
    goType: '*LocationMessage',
    requiredFields: ['DegreesLatitude *float64', 'DegreesLongitude *float64'],
    optionalFields: [
      'Name *string',
      'Address *string',
      'URL *string',
      'IsLive *bool',
      'AccuracyInMeters *uint32',
      'SpeedInMps *float32',
      'DegreesClockwiseFromMagneticNorth *uint32',
      'Comment *string',
      'JPEGThumbnail []byte',
      'ContextInfo *ContextInfo',
    ],
    notes: ['For real-time location use LiveLocationMessage instead'],
    sendPattern: `&waE2E.Message{LocationMessage: &waE2E.LocationMessage{
    DegreesLatitude: proto.Float64(-23.5505),
    DegreesLongitude: proto.Float64(-46.6333),
    Name: proto.String("São Paulo"),
}}`,
  },
  {
    name: 'liveLocation',
    waE2EStruct: 'LiveLocationMessage',
    description: 'Real-time location sharing with movement tracking',
    category: 'basic',
    protoFieldNumber: 18,
    goType: '*LiveLocationMessage',
    requiredFields: ['DegreesLatitude *float64', 'DegreesLongitude *float64'],
    optionalFields: [
      'AccuracyInMeters *uint32',
      'SpeedInMps *float32',
      'DegreesClockwiseFromMagneticNorth *uint32',
      'Caption *string',
      'SequenceNumber *int64',
      'TimeOffset *uint32',
      'JPEGThumbnail []byte',
      'ContextInfo *ContextInfo',
    ],
    notes: ['Requires periodic updates to maintain live status'],
  },
  {
    name: 'image',
    waE2EStruct: 'ImageMessage',
    description: 'Image message with optional caption',
    category: 'media',
    protoFieldNumber: 3,
    goType: '*ImageMessage',
    requiredFields: [
      'URL *string',
      'Mimetype *string',
      'FileSHA256 []byte',
      'FileLength *uint64',
      'MediaKey []byte',
      'FileEncSHA256 []byte',
      'DirectPath *string',
    ],
    optionalFields: [
      'Caption *string',
      'Width *uint32',
      'Height *uint32',
      'JPEGThumbnail []byte',
      'ContextInfo *ContextInfo',
      'ViewOnce *bool',
    ],
    notes: [
      'Media fields are populated by cli.Upload() — do not set manually',
      'Use Upload(ctx, fileBytes, whatsmeow.MediaImage) to get upload response',
      'Then copy URL, DirectPath, MediaKey, FileSHA256, FileEncSHA256, FileLength from UploadResponse',
    ],
    sendPattern: `resp, _ := cli.Upload(ctx, imageBytes, whatsmeow.MediaImage)
msg := &waE2E.Message{ImageMessage: &waE2E.ImageMessage{
    URL:           &resp.URL,
    DirectPath:    &resp.DirectPath,
    MediaKey:      resp.MediaKey,
    Mimetype:      proto.String("image/jpeg"),
    Caption:       proto.String("caption"),
    FileEncSHA256: resp.FileEncSHA256,
    FileSHA256:    resp.FileSHA256,
    FileLength:    proto.Uint64(resp.FileLength),
    JPEGThumbnail: thumbnail,
}}`,
  },
  {
    name: 'video',
    waE2EStruct: 'VideoMessage',
    description: 'Video message with optional caption',
    category: 'media',
    protoFieldNumber: 9,
    goType: '*VideoMessage',
    requiredFields: [
      'URL *string',
      'Mimetype *string',
      'FileSHA256 []byte',
      'FileLength *uint64',
      'MediaKey []byte',
      'FileEncSHA256 []byte',
      'DirectPath *string',
    ],
    optionalFields: [
      'Caption *string',
      'Seconds *uint32',
      'Width *uint32',
      'Height *uint32',
      'GifPlayback *bool',
      'JPEGThumbnail []byte',
      'GifAttribution *VideoMessage_Attribution',
      'ContextInfo *ContextInfo',
      'ViewOnce *bool',
    ],
    notes: [
      'Upload with whatsmeow.MediaVideo',
      'Set GifPlayback=true for GIF-style videos',
      'PtvMessage (field 66) reuses VideoMessage for personal video messages',
    ],
  },
  {
    name: 'audio',
    waE2EStruct: 'AudioMessage',
    description: 'Audio message (voice note or audio file)',
    category: 'media',
    protoFieldNumber: 8,
    goType: '*AudioMessage',
    requiredFields: [
      'URL *string',
      'Mimetype *string',
      'FileSHA256 []byte',
      'FileLength *uint64',
      'MediaKey []byte',
      'FileEncSHA256 []byte',
      'DirectPath *string',
    ],
    optionalFields: [
      'Seconds *uint32',
      'PTT *bool',
      'Waveform []byte',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'Set PTT=true for voice notes (push-to-talk) — changes UI to voice bubble',
      'Upload with whatsmeow.MediaAudio',
      'Voice notes typically use audio/ogg; codecs=opus mimetype',
      'Waveform is a byte array of audio levels for the visual waveform',
    ],
    sendPattern: `resp, _ := cli.Upload(ctx, audioBytes, whatsmeow.MediaAudio)
msg := &waE2E.Message{AudioMessage: &waE2E.AudioMessage{
    URL:           &resp.URL,
    DirectPath:    &resp.DirectPath,
    MediaKey:      resp.MediaKey,
    Mimetype:      proto.String("audio/ogg; codecs=opus"),
    FileEncSHA256: resp.FileEncSHA256,
    FileSHA256:    resp.FileSHA256,
    FileLength:    proto.Uint64(resp.FileLength),
    Seconds:       proto.Uint32(duration),
    PTT:           proto.Bool(true),
}}`,
  },
  {
    name: 'document',
    waE2EStruct: 'DocumentMessage',
    description: 'Document/file attachment (PDF, DOCX, ZIP, etc.)',
    category: 'media',
    protoFieldNumber: 7,
    goType: '*DocumentMessage',
    requiredFields: [
      'URL *string',
      'Mimetype *string',
      'FileSHA256 []byte',
      'FileLength *uint64',
      'MediaKey []byte',
      'FileEncSHA256 []byte',
      'DirectPath *string',
    ],
    optionalFields: [
      'Title *string',
      'FileName *string',
      'PageCount *uint32',
      'JPEGThumbnail []byte',
      'Caption *string',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'Upload with whatsmeow.MediaDocument',
      'FileName sets the download filename',
      'For documents with caption use DocumentWithCaptionMessage (FutureProofMessage wrapper, field 53)',
    ],
  },
  {
    name: 'sticker',
    waE2EStruct: 'StickerMessage',
    description: 'Sticker message (static or animated WebP)',
    category: 'media',
    protoFieldNumber: 26,
    goType: '*StickerMessage',
    requiredFields: [
      'URL *string',
      'Mimetype *string',
      'FileSHA256 []byte',
      'FileLength *uint64',
      'MediaKey []byte',
      'FileEncSHA256 []byte',
      'DirectPath *string',
    ],
    optionalFields: [
      'Width *uint32',
      'Height *uint32',
      'IsAnimated *bool',
      'PngThumbnail []byte',
      'IsAvatar *bool',
      'IsAISticker *bool',
      'IsLottie *bool',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'IMPORTANT: Upload with whatsmeow.MediaImage — NOT a separate MediaSticker constant',
      'Stickers must be WebP format, 512x512 pixels',
      'Animated stickers must be under 500KB and 10 seconds',
      'FFmpeg pipeline: convert to WebP 512x512 + inject EXIF metadata',
    ],
    sendPattern: `resp, _ := cli.Upload(ctx, webpBytes, whatsmeow.MediaImage) // MediaImage, not MediaSticker!
msg := &waE2E.Message{StickerMessage: &waE2E.StickerMessage{
    URL:           &resp.URL,
    DirectPath:    &resp.DirectPath,
    MediaKey:      resp.MediaKey,
    Mimetype:      proto.String("image/webp"),
    FileEncSHA256: resp.FileEncSHA256,
    FileSHA256:    resp.FileSHA256,
    FileLength:    proto.Uint64(resp.FileLength),
    Width:         proto.Uint32(512),
    Height:        proto.Uint32(512),
}}`,
  },
  {
    name: 'buttons',
    waE2EStruct: 'ButtonsMessage',
    description: 'Message with clickable buttons (requires AdditionalNodes)',
    category: 'interactive',
    protoFieldNumber: 42,
    goType: '*ButtonsMessage',
    requiredFields: ['ContentText *string', 'Buttons []*ButtonsMessage_Button'],
    optionalFields: [
      'HeaderType *ButtonsMessage_HeaderType',
      'Header (oneof: Text, DocumentMessage, ImageMessage, VideoMessage, LocationMessage)',
      'FooterText *string',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'CRITICAL: Requires AdditionalNodes in SendRequestExtra — buttons silently fail without it',
      'AdditionalNodes must include a <biz> node with the message_version and native_flow_name',
      'Whatsmeow-specific pattern: pass &[]waBinary.Node{...} in SendRequestExtra.AdditionalNodes',
      'Button types: RESPONSE (quick reply) and NATIVE_FLOW',
    ],
    sendPattern: `msg := &waE2E.Message{ButtonsMessage: &waE2E.ButtonsMessage{
    ContentText: proto.String("Choose an option"),
    FooterText:  proto.String("footer"),
    HeaderType:  waE2E.ButtonsMessage_EMPTY.Enum(),
    Buttons: []*waE2E.ButtonsMessage_Button{
        {ButtonId: proto.String("1"), ButtonText: &waE2E.ButtonsMessage_Button_ButtonText{DisplayText: proto.String("Option 1")}, Type: waE2E.ButtonsMessage_Button_RESPONSE.Enum()},
        {ButtonId: proto.String("2"), ButtonText: &waE2E.ButtonsMessage_Button_ButtonText{DisplayText: proto.String("Option 2")}, Type: waE2E.ButtonsMessage_Button_RESPONSE.Enum()},
    },
}}
extra := whatsmeow.SendRequestExtra{AdditionalNodes: &[]waBinary.Node{/* biz node */}}
cli.SendMessage(ctx, recipient, msg, extra)`,
  },
  {
    name: 'list',
    waE2EStruct: 'ListMessage',
    description: 'Message with a list menu of selectable items (requires AdditionalNodes)',
    category: 'interactive',
    protoFieldNumber: 36,
    goType: '*ListMessage',
    requiredFields: ['Title *string', 'ButtonText *string', 'Sections []*ListMessage_Section'],
    optionalFields: [
      'Description *string',
      'ListType *ListMessage_ListType',
      'ProductListInfo *ListMessage_ProductListInfo',
      'FooterText *string',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'CRITICAL: Requires AdditionalNodes — same pattern as ButtonsMessage',
      'Sections contain Rows with Title, Description, and RowId',
      'ListType: UNKNOWN (0), SINGLE_SELECT (1), PRODUCT_LIST (2)',
    ],
    sendPattern: `msg := &waE2E.Message{ListMessage: &waE2E.ListMessage{
    Title:      proto.String("Menu"),
    ButtonText: proto.String("View Options"),
    ListType:   waE2E.ListMessage_SINGLE_SELECT.Enum(),
    Sections: []*waE2E.ListMessage_Section{{
        Title: proto.String("Section 1"),
        Rows: []*waE2E.ListMessage_Row{
            {RowId: proto.String("1"), Title: proto.String("Item 1"), Description: proto.String("Desc 1")},
            {RowId: proto.String("2"), Title: proto.String("Item 2"), Description: proto.String("Desc 2")},
        },
    }},
}}
extra := whatsmeow.SendRequestExtra{AdditionalNodes: &[]waBinary.Node{/* biz node */}}
cli.SendMessage(ctx, recipient, msg, extra)`,
  },
  {
    name: 'template',
    waE2EStruct: 'TemplateMessage',
    description: 'Template message with hydrated buttons (URL, call, quick reply)',
    category: 'interactive',
    protoFieldNumber: 25,
    goType: '*TemplateMessage',
    requiredFields: [
      'Format (oneof: FourRowTemplate, HydratedFourRowTemplate, InteractiveMessageTemplate)',
    ],
    optionalFields: ['ContextInfo *ContextInfo', 'HydratedTemplate *TemplateMessage_HydratedFourRowTemplate', 'TemplateID *string'],
    notes: [
      'HydratedFourRowTemplate supports URL buttons, call buttons, and quick reply buttons',
      'HydratedTemplateButton types: HydratedURLButton, HydratedCallButton, HydratedQuickReplyButton',
    ],
  },
  {
    name: 'interactiveMessage',
    waE2EStruct: 'InteractiveMessage',
    description: 'Advanced interactive message (native flow, carousel, shop, collection)',
    category: 'interactive',
    protoFieldNumber: 45,
    goType: '*InteractiveMessage',
    requiredFields: [
      'InteractiveMessage (oneof: ShopStorefrontMessage, CollectionMessage, NativeFlowMessage, CarouselMessage)',
    ],
    optionalFields: [
      'Header *InteractiveMessage_Header',
      'Body *InteractiveMessage_Body',
      'Footer *InteractiveMessage_Footer',
      'ContextInfo *ContextInfo',
    ],
    notes: [
      'CRITICAL: Must be wrapped in FutureProofMessage when viewed on older clients',
      'NativeFlowMessage is the most commonly used sub-type',
      'CarouselMessage contains Cards array with card content',
      'Header can contain DocumentMessage, ImageMessage, VideoMessage, LocationMessage, or ProductMessage',
    ],
  },
  {
    name: 'reaction',
    waE2EStruct: 'ReactionMessage',
    description: 'Emoji reaction to a message',
    category: 'advanced',
    protoFieldNumber: 46,
    goType: '*ReactionMessage',
    requiredFields: ['Key *waCommon.MessageKey', 'Text *string'],
    optionalFields: ['SenderTimestampMS *int64', 'GroupingKey *string'],
    notes: [
      'Use cli.BuildReaction(chat, sender, id, emoji) helper instead of building manually',
      'Empty Text string removes the reaction',
    ],
    sendPattern: `msg := cli.BuildReaction(chatJID, senderJID, messageID, "👍")
cli.SendMessage(ctx, chatJID, msg)`,
  },
  {
    name: 'poll',
    waE2EStruct: 'PollCreationMessage',
    description: 'Poll creation message with options',
    category: 'advanced',
    protoFieldNumber: 49,
    goType: '*PollCreationMessage',
    requiredFields: ['Name *string', 'Options []*PollCreationMessage_Option'],
    optionalFields: ['SelectableOptionsCount *uint32', 'ContextInfo *ContextInfo'],
    notes: [
      'Use cli.BuildPollCreation(name, options, selectableCount) helper',
      'SelectableOptionsCount=0 means unlimited selections',
      'PollUpdateMessage (field 50) handles vote submissions',
      'Poll votes are encrypted — use cli.BuildPollVote() to cast votes',
      'PollCreationMessageV2 (field 60), V3 (field 64), V4 (field 93), V5 (field 111), V6 (field 119) are newer versions',
    ],
    sendPattern: `msg := cli.BuildPollCreation("Favorite color?", []string{"Red", "Blue", "Green"}, 1)
cli.SendMessage(ctx, chatJID, msg)`,
  },
  {
    name: 'viewOnce',
    waE2EStruct: 'FutureProofMessage',
    description: 'View-once media message (disappears after viewing)',
    category: 'advanced',
    protoFieldNumber: 37,
    goType: '*FutureProofMessage',
    requiredFields: ['Message *Message'],
    optionalFields: [],
    notes: [
      'FutureProofMessage wraps the actual media message (image, video, etc.)',
      'ViewOnceMessage (field 37), ViewOnceMessageV2 (field 55), ViewOnceMessageV2Extension (field 59)',
      'The wrapped Message contains the actual ImageMessage/VideoMessage with ViewOnce=true',
    ],
    sendPattern: `msg := &waE2E.Message{ViewOnceMessage: &waE2E.FutureProofMessage{
    Message: &waE2E.Message{ImageMessage: &waE2E.ImageMessage{
        // ... media fields from Upload ...
        ViewOnce: proto.Bool(true),
    }},
}}`,
  },
  {
    name: 'edit',
    waE2EStruct: 'FutureProofMessage',
    description: 'Edit a previously sent message',
    category: 'advanced',
    protoFieldNumber: 58,
    goType: '*FutureProofMessage',
    requiredFields: ['Message *Message (wrapped edited content)'],
    optionalFields: [],
    notes: [
      'Use cli.BuildEdit(chat, messageID, newContent) helper instead of building manually',
      'Edit window is 20 minutes (EditWindow constant)',
      'EditedMessage (field 58) wraps FutureProofMessage',
    ],
    sendPattern: `newContent := &waE2E.Message{Conversation: proto.String("edited text")}
msg := cli.BuildEdit(chatJID, originalMessageID, newContent)
cli.SendMessage(ctx, chatJID, msg)`,
  },
  {
    name: 'delete',
    waE2EStruct: 'ProtocolMessage',
    description: 'Delete/revoke a message for everyone or self',
    category: 'advanced',
    protoFieldNumber: 12,
    goType: '*ProtocolMessage',
    requiredFields: ['Key *waCommon.MessageKey', 'Type *ProtocolMessage_Type'],
    optionalFields: ['Timestamp *uint64'],
    notes: [
      'Use cli.BuildRevoke(chat, sender, id) helper for revoking messages',
      'Type=REVOKE for delete-for-everyone, Type=MESSAGE_EDIT for edits',
      'ProtocolMessage is also used for ephemeral settings, history sync requests, and app state keys',
    ],
    sendPattern: `msg := cli.BuildRevoke(chatJID, senderJID, messageID)
cli.SendMessage(ctx, chatJID, msg)`,
  },
  {
    name: 'groupInvite',
    waE2EStruct: 'GroupInviteMessage',
    description: 'Group invite link message',
    category: 'basic',
    protoFieldNumber: 28,
    goType: '*GroupInviteMessage',
    requiredFields: ['GroupJID *string', 'InviteCode *string', 'GroupName *string'],
    optionalFields: [
      'InviteExpiration *int64',
      'Caption *string',
      'JPEGThumbnail []byte',
      'ContextInfo *ContextInfo',
    ],
    notes: ['Used to share group invite links as rich messages'],
  },
  {
    name: 'event',
    waE2EStruct: 'EventMessage',
    description: 'Calendar event message',
    category: 'advanced',
    protoFieldNumber: 75,
    goType: '*EventMessage',
    requiredFields: ['Name *string', 'StartTime *int64'],
    optionalFields: [
      'Description *string',
      'Location *LocationMessage',
      'JoinLink *string',
      'IsCanceled *bool',
      'ContextInfo *ContextInfo',
    ],
    notes: ['EventCoverImage (field 85) is a FutureProofMessage for event cover images'],
  },
  {
    name: 'productMessage',
    waE2EStruct: 'ProductMessage',
    description: 'Business product/catalog item',
    category: 'advanced',
    protoFieldNumber: 30,
    goType: '*ProductMessage',
    requiredFields: ['Product *ProductMessage_ProductSnapshot'],
    optionalFields: [
      'BusinessOwnerJID *string',
      'Catalog *ProductMessage_CatalogSnapshot',
      'Body *string',
      'Footer *string',
      'ContextInfo *ContextInfo',
    ],
    notes: ['Used by WhatsApp Business for sharing product listings'],
  },
]

export function getMessagesByCategory(category: MessageCategory): MessageTypeInfo[] {
  return MESSAGE_TYPES.filter((m) => m.category === category)
}

export function getMessageByName(name: string): MessageTypeInfo | undefined {
  return MESSAGE_TYPES.find((m) => m.name.toLowerCase() === name.toLowerCase())
}

export function searchMessages(query: string): MessageTypeInfo[] {
  const q = query.toLowerCase()
  return MESSAGE_TYPES.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.waE2EStruct.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.notes.some((n) => n.toLowerCase().includes(q)) ||
      m.goType.toLowerCase().includes(q),
  )
}
