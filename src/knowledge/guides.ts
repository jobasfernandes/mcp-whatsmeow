export interface GuideSection {
  title: string
  content: string
}

export interface Guide {
  name: string
  title: string
  description: string
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    name: 'media',
    title: 'Media Handling Guide',
    description: 'Media types, encryption, download/upload flows, and sticker pipeline for whatsmeow',
    sections: [
      {
        title: 'Media Types',
        content: `8 MediaType constants (defined in download.go):

| Constant | HKDF Info String | Usage |
|----------|-----------------|-------|
| MediaImage | "WhatsApp Image Keys" | JPEG/PNG images |
| MediaVideo | "WhatsApp Video Keys" | MP4 videos |
| MediaAudio | "WhatsApp Audio Keys" | OGG/Opus audio, voice notes |
| MediaDocument | "WhatsApp Document Keys" | PDF, DOC, any file type |
| MediaHistory | "WhatsApp History Keys" | History sync blobs |
| MediaAppState | "WhatsApp App State Keys" | App state sync blobs |
| MediaStickerPack | "WhatsApp Sticker Pack Keys" | Sticker pack data |
| MediaLinkThumbnail | "WhatsApp Link Thumbnail Keys" | Link preview thumbnails |`,
      },
      {
        title: 'Media Encryption (E2E)',
        content: `All media is E2E encrypted BEFORE upload using these steps:

1. **Key Generation**: 32-byte random mediaKey
2. **HKDF Expansion**: mediaKey → 112 bytes using SHA-256 HKDF
   - Bytes 0-15: IV (AES initialization vector)
   - Bytes 16-47: CipherKey (AES-256-CBC key)
   - Bytes 48-79: MACKey (HMAC-SHA256 key)
   - Bytes 80-111: RefKey (reference key, unused in download)
3. **Encryption**: AES-256-CBC with PKCS7 padding
4. **MAC**: HMAC-SHA256(IV + CipherText), truncated to 10 bytes
5. **Final blob**: CipherText + MAC (10 bytes)

\`\`\`go
type DownloadableMessage interface {
    GetDirectPath() string
    GetMediaKey() []byte
    GetFileSHA256() []byte
    GetFileEncSHA256() []byte
}
\`\`\``,
      },
      {
        title: 'Download Flow',
        content: `\`\`\`go
data, err := cli.Download(ctx, msg.GetImageMessage())

data, err := cli.DownloadAny(ctx, msg.Message)

err := cli.DownloadToFile(ctx, msg.GetImageMessage(), file)
\`\`\`

For history sync media that returns 404/410:
\`\`\`go
err := cli.SendMediaRetryReceipt(ctx, msg.Info, msg.Message.GetImageMessage().GetMediaKey())
\`\`\``,
      },
      {
        title: 'Upload Flow',
        content: `\`\`\`go
resp, err := cli.Upload(ctx, imageBytes, whatsmeow.MediaImage)

msg := &waE2E.Message{
    ImageMessage: &waE2E.ImageMessage{
        Caption:       proto.String("Hello"),
        Mimetype:      proto.String("image/jpeg"),
        URL:           &resp.URL,
        DirectPath:    &resp.DirectPath,
        MediaKey:      resp.MediaKey,
        FileEncSHA256: resp.FileEncSHA256,
        FileSHA256:    resp.FileSHA256,
        FileLength:    proto.Uint64(resp.FileLength),
    },
}
cli.SendMessage(ctx, recipient, msg)
\`\`\`

UploadResponse fields: URL, DirectPath, MediaKey, FileEncSHA256, FileSHA256, FileLength, Handle, ObjectID, ObjectKey`,
      },
      {
        title: 'Sticker Pipeline',
        content: `Stickers require specific format:
- Format: WebP image
- Animated stickers: WebP animation
- Max size: 100KB (static), 500KB (animated)
- Dimensions: 512x512 pixels recommended

\`\`\`go
resp, err := cli.Upload(ctx, webpBytes, whatsmeow.MediaImage)
msg := &waE2E.Message{
    StickerMessage: &waE2E.StickerMessage{
        Mimetype:      proto.String("image/webp"),
        URL:           &resp.URL,
        DirectPath:    &resp.DirectPath,
        MediaKey:      resp.MediaKey,
        FileEncSHA256: resp.FileEncSHA256,
        FileSHA256:    resp.FileSHA256,
        FileLength:    proto.Uint64(resp.FileLength),
        PngThumbnail:  thumbnailBytes,
        IsAnimated:    proto.Bool(false),
    },
}
\`\`\``,
      },
      {
        title: 'Newsletter Media',
        content: `Newsletter media is NOT encrypted client-side (server handles it):

\`\`\`go
resp, err := cli.UploadNewsletter(ctx, imageBytes, whatsmeow.MediaImage)
\`\`\`

Key differences from normal media:
- No client-side encryption (server stores plaintext)
- Uses different upload endpoint
- DirectPath added by server, not returned
- Same MediaType constants apply`,
      },
    ],
  },
  {
    name: 'groups',
    title: 'Groups & Communities Guide',
    description: 'Group creation, management, communities, and participant operations',
    sections: [
      {
        title: 'Creating Groups',
        content: `\`\`\`go
type ReqCreateGroup struct {
    Name              string
    Participants      []types.JID
    GroupParent       types.GroupParent
    GroupLinkedParent  types.GroupLinkedParent
    CreateKey         types.MessageID
}

type GroupParent struct {
    IsParent                   bool
    DefaultMembershipApprovalMode string
}

type GroupLinkedParent struct {
    LinkedParentJID types.JID
}
\`\`\`

Regular group:
\`\`\`go
info, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:         "My Group",
    Participants: []types.JID{user1JID, user2JID},
})
\`\`\`

Community (parent group):
\`\`\`go
info, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:         "My Community",
    Participants: []types.JID{user1JID},
    GroupParent:   types.GroupParent{IsParent: true},
})
\`\`\`

Sub-group within community:
\`\`\`go
info, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:              "Sub Channel",
    Participants:      []types.JID{},
    GroupLinkedParent:  types.GroupLinkedParent{LinkedParentJID: communityJID},
})
\`\`\``,
      },
      {
        title: 'Participant Management',
        content: `\`\`\`go
type ParticipantChange string
const (
    ParticipantChangeAdd     ParticipantChange = "add"
    ParticipantChangeRemove  ParticipantChange = "remove"
    ParticipantChangePromote ParticipantChange = "promote"
    ParticipantChangeDemote  ParticipantChange = "demote"
)

participants, err := cli.UpdateGroupParticipants(ctx, groupJID,
    []types.JID{userJID},
    whatsmeow.ParticipantChangeAdd,
)

type ParticipantRequestChange string
const (
    ParticipantRequestChangeApprove ParticipantRequestChange = "approve"
    ParticipantRequestChangeReject  ParticipantRequestChange = "reject"
)
\`\`\``,
      },
      {
        title: 'Group Info & Settings',
        content: `\`\`\`go
type GroupInfo struct {
    JID              types.JID
    OwnerJID         types.JID
    GroupName        types.GroupName
    GroupTopic       types.GroupTopic
    GroupLocked      types.GroupLocked
    GroupAnnounce    types.GroupAnnounce
    GroupEphemeral   types.GroupEphemeral
    GroupCreated     time.Time
    ParticipantVersionID string
    Participants     []types.GroupParticipant
    MemberAddMode    types.GroupMemberAddMode
    AddressingMode   types.AddressingMode
    GroupParent      types.GroupParent
    GroupLinkedParent types.GroupLinkedParent
    IsIncognito      bool
}

type GroupParticipant struct {
    JID          types.JID
    LID          types.JID
    IsAdmin      bool
    IsSuperAdmin bool
    DisplayName  string
    Error        int
    AddRequest   *GroupParticipantAddRequest
}

type GroupMemberAddMode string
const (
    GroupMemberAddModeAdmin     GroupMemberAddMode = "admin_add"
    GroupMemberAddModeAllMember GroupMemberAddMode = "all_member_add"
)
\`\`\``,
      },
      {
        title: 'Community Operations',
        content: `\`\`\`go
subGroups, err := cli.GetSubGroups(ctx, communityJID)

allParticipants, err := cli.GetLinkedGroupsParticipants(ctx, communityJID)

err := cli.LinkGroup(ctx, communityJID, existingGroupJID)

err := cli.UnlinkGroup(ctx, communityJID, childGroupJID)
\`\`\`

Communities use GroupParent.IsParent=true and sub-groups reference the parent via GroupLinkedParent.LinkedParentJID.`,
      },
      {
        title: 'Invite Links',
        content: `\`\`\`go
link, err := cli.GetGroupInviteLink(ctx, groupJID, false)

link, err := cli.GetGroupInviteLink(ctx, groupJID, true)

info, err := cli.GetGroupInfoFromLink(ctx, "AbCdEfGhIjK")

groupJID, err := cli.JoinGroupWithLink(ctx, "AbCdEfGhIjK")
\`\`\``,
      },
    ],
  },
  {
    name: 'calls',
    title: 'Calls Guide',
    description: 'Call handling, events, and the RejectCall method',
    sections: [
      {
        title: 'Call Events',
        content: `whatsmeow dispatches 9 call-related events via handleCallEvent:

| XML Tag | Event Type | Description |
|---------|-----------|-------------|
| offer | events.CallOffer | Incoming call offer with metadata |
| accept | events.CallAccept | Call accepted by recipient |
| preaccept | events.CallPreAccept | Pre-accept signal before full accept |
| transport | events.CallTransport | ICE/DTLS transport negotiation data |
| terminate | events.CallTerminate | Call ended (with reason) |
| reject | events.CallReject | Call rejected by recipient |
| relaylatency | events.CallRelayLatency | Relay server latency measurement |

All call events include:
- CallCreator (types.JID) — who initiated the call
- CallID (string) — unique call identifier
- Timestamp (time.Time) — when the event occurred
- Data (*waBinary.Node) — raw XML node with call data`,
      },
      {
        title: 'Rejecting Calls',
        content: `The only public call method is RejectCall:

\`\`\`go
func (cli *Client) RejectCall(ctx context.Context, callFrom types.JID, callID string) error

cli.AddEventHandler(func(evt *events.CallOffer) {
    err := cli.RejectCall(ctx, evt.CallCreator, evt.CallID)
    if err != nil {
        log.Printf("Failed to reject call: %v", err)
    }
})
\`\`\`

whatsmeow does NOT support:
- Answering/accepting calls
- Making outgoing calls
- Call audio/video streaming
- Call hold/transfer

These operations require WebRTC integration not available in the library.`,
      },
      {
        title: 'CallOffer Event Details',
        content: `\`\`\`go
type CallOffer struct {
    BasicCallMeta
    CallRemoteMeta
    Data *waBinary.Node
}

type BasicCallMeta struct {
    From      types.JID
    Timestamp time.Time
    CallCreator types.JID
    CallID      string
}

type CallRemoteMeta struct {
    RemotePlatform string
    RemoteVersion  string
}
\`\`\`

The Data node contains call-specific parameters (codec info, relay endpoints, etc.) but whatsmeow doesn't parse these further since call handling is not implemented.`,
      },
    ],
  },
  {
    name: 'mappings',
    title: 'Utility Mappings & Error Sentinels',
    description: 'Message type detection, button mapping, and comprehensive error constants',
    sections: [
      {
        title: 'getMediaTypeFromMessage',
        content: `Internal function that maps waE2E.Message fields to MediaType strings. Used by DownloadAny to auto-detect media type.

| Message Field | Returns |
|--------------|---------|
| ImageMessage | "WhatsApp Image Keys" |
| VideoMessage | "WhatsApp Video Keys" |
| AudioMessage | "WhatsApp Audio Keys" |
| DocumentMessage | "WhatsApp Document Keys" |
| StickerMessage | "WhatsApp Image Keys" |
| StickerPackMessage | "WhatsApp Sticker Pack Keys" |
| PtvMessage | "WhatsApp Video Keys" |

Recursive unwrapping for wrapper types:
- ViewOnceMessage → inner Message
- ViewOnceMessageV2 → inner Message
- ViewOnceMessageV2Extension → inner Message
- EditedMessage → inner Message
- EphemeralMessage → inner Message
- DocumentWithCaptionMessage → inner Message
- GroupMentionedMessage → inner Message
- BotInvokeMessage → inner Message
- LottieStickerMessage → inner Message
- StatusMentionMessage → inner Message
- EventCoverImage → inner Message`,
      },
      {
        title: 'getButtonTypeFromMessage',
        content: `Maps message types to their interactive button variant for AdditionalNodes:

| Message Field | Button Type |
|--------------|-------------|
| ListMessage | "list" |
| ListResponseMessage | "list" |
| ButtonsMessage | "buttons" |
| ButtonsResponseMessage | "buttons" |
| InteractiveMessage | "native_flow" |
| InteractiveResponseMessage | "native_flow" |
| TemplateMessage | "template" |
| TemplateButtonReplyMessage | "template" |`,
      },
      {
        title: 'Error Sentinels — Connection',
        content: `\`\`\`go
ErrNotConnected         = errors.New("websocket not connected")
ErrNotLoggedIn          = errors.New("not logged in")
ErrAlreadyConnected     = errors.New("already connected")
ErrQRStoreContainsID    = errors.New("GetQRChannel only when not logged in")
ErrQRAlreadyConnected   = errors.New("GetQRChannel already running")
\`\`\``,
      },
      {
        title: 'Error Sentinels — Messaging',
        content: `\`\`\`go
ErrNoSession            = errors.New("no Signal session for recipient")
ErrMessageTimedOut      = errors.New("timed out waiting for server")
ErrBroadcastListNotFound = errors.New("broadcast list not found")
ErrUnknownServer        = errors.New("unknown server for JID")
ErrRecipientADJID       = errors.New("recipient must be non-AD JID")
ErrServerReturnedError  = errors.New("server returned error")
ErrNothingEphemeral     = errors.New("nothing to encrypt for ephemeral")
\`\`\``,
      },
      {
        title: 'Error Sentinels — Media',
        content: `\`\`\`go
ErrMediaDownloadFailedWith404 = errors.New("download failed with 404")
ErrMediaDownloadFailedWith410 = errors.New("download failed with 410")
ErrNoURLPresent               = errors.New("no URL in message")
ErrFileLengthMismatch         = errors.New("file length mismatch")
ErrTooShortFile               = errors.New("file too short")
ErrInvalidMediaHMAC           = errors.New("invalid media HMAC")
ErrInvalidMediaEncSHA256      = errors.New("invalid enc SHA256")
ErrInvalidMediaSHA256         = errors.New("invalid file SHA256")
ErrUnknownMediaType           = errors.New("unknown media type")
ErrInvalidImageFormat         = errors.New("invalid image format")
ErrMediaUploadFailed          = errors.New("media upload failed")
\`\`\``,
      },
      {
        title: 'Error Sentinels — Groups',
        content: `\`\`\`go
ErrGroupNotFound        = errors.New("group not found")
ErrNotInGroup           = errors.New("not in group")
ErrOwnerJIDNotFound     = errors.New("owner JID not found")
ErrInvalidInviteCode    = errors.New("invalid invite code")
\`\`\``,
      },
      {
        title: 'Error Sentinels — Other',
        content: `\`\`\`go
ErrIQTimedOut           = errors.New("IQ request timed out")
ErrIQBadRequest         = errors.New("server returned bad request")
ErrIQForbidden          = errors.New("server returned forbidden")
ErrIQNotFound           = errors.New("server returned not found")
ErrIQNotAuthorized      = errors.New("server returned not authorized")
ErrIQGone               = errors.New("server returned gone")
ErrProfilePictureNotSet = errors.New("profile picture not set")
ErrBusinessNameNotSet   = errors.New("business name not set")
ErrPairInvalidDeviceIdentityHMAC = errors.New("invalid device identity HMAC")
ErrPairInvalidDeviceSignature    = errors.New("invalid device signature")
\`\`\``,
      },
    ],
  },
]

export function getGuide(name: string): Guide | undefined {
  return GUIDES.find((g) => g.name.toLowerCase() === name.toLowerCase())
}

export function getGuideNames(): string[] {
  return GUIDES.map((g) => g.name)
}
