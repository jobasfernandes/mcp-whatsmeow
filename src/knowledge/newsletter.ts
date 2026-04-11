export interface NewsletterMethodInfo {
  name: string
  signature: string
  description: string
}

export interface NewsletterTypeInfo {
  name: string
  goType: string
  fields: { name: string; type: string; description: string }[]
}

export interface NewsletterEnumInfo {
  name: string
  goType: string
  values: { name: string; value: string; description: string }[]
}

export interface NewsletterEventInfo {
  name: string
  description: string
  fields: { name: string; type: string; description: string }[]
}

export interface NewsletterReference {
  overview: string
  linkPrefix: string
  methods: NewsletterMethodInfo[]
  paramStructs: NewsletterTypeInfo[]
  types: NewsletterTypeInfo[]
  enums: NewsletterEnumInfo[]
  events: NewsletterEventInfo[]
  codeExamples: { title: string; code: string }[]
}

export const NEWSLETTER_REFERENCE: NewsletterReference = {
  overview: 'WhatsApp Channels/Newsletters are broadcast-only groups identified by newsletter JIDs (..@newsletter). They use GraphQL-based queries internally and support follow/unfollow, reactions, mute, and live updates.',
  linkPrefix: 'https://whatsapp.com/channel/',
  methods: [
    { name: 'CreateNewsletter', signature: 'func (cli *Client) CreateNewsletter(ctx context.Context, params CreateNewsletterParams) (*types.NewsletterMetadata, error)', description: 'Create a new newsletter/channel' },
    { name: 'GetNewsletterInfo', signature: 'func (cli *Client) GetNewsletterInfo(ctx context.Context, jid types.JID) (*types.NewsletterMetadata, error)', description: 'Get newsletter metadata by JID' },
    { name: 'GetNewsletterInfoWithInvite', signature: 'func (cli *Client) GetNewsletterInfoWithInvite(ctx context.Context, key string) (*types.NewsletterMetadata, error)', description: 'Get newsletter info using invite link key' },
    { name: 'GetSubscribedNewsletters', signature: 'func (cli *Client) GetSubscribedNewsletters(ctx context.Context) ([]*types.NewsletterMetadata, error)', description: 'List all newsletters the user is subscribed to' },
    { name: 'FollowNewsletter', signature: 'func (cli *Client) FollowNewsletter(ctx context.Context, jid types.JID) error', description: 'Subscribe/follow a newsletter' },
    { name: 'UnfollowNewsletter', signature: 'func (cli *Client) UnfollowNewsletter(ctx context.Context, jid types.JID) error', description: 'Unsubscribe/unfollow a newsletter' },
    { name: 'GetNewsletterMessages', signature: 'func (cli *Client) GetNewsletterMessages(ctx context.Context, jid types.JID, params *GetNewsletterMessagesParams) ([]*types.NewsletterMessage, error)', description: 'Fetch messages from a newsletter' },
    { name: 'GetNewsletterMessageUpdates', signature: 'func (cli *Client) GetNewsletterMessageUpdates(ctx context.Context, jid types.JID, params *GetNewsletterUpdatesParams) ([]*types.NewsletterMessage, error)', description: 'Fetch message updates (edits/deletes) from a newsletter' },
    { name: 'NewsletterMarkViewed', signature: 'func (cli *Client) NewsletterMarkViewed(ctx context.Context, jid types.JID, serverIDs []types.MessageServerID) error', description: 'Mark newsletter messages as viewed' },
    { name: 'NewsletterSendReaction', signature: 'func (cli *Client) NewsletterSendReaction(ctx context.Context, jid types.JID, serverID types.MessageServerID, reaction string, senderJID types.JID) error', description: 'Send reaction to a newsletter message' },
    { name: 'NewsletterToggleMute', signature: 'func (cli *Client) NewsletterToggleMute(ctx context.Context, jid types.JID, mute bool) error', description: 'Mute or unmute a newsletter' },
    { name: 'NewsletterSubscribeLiveUpdates', signature: 'func (cli *Client) NewsletterSubscribeLiveUpdates(ctx context.Context, jid types.JID) (time.Duration, error)', description: 'Subscribe to live updates for a newsletter (returns TTL duration)' },
    { name: 'UploadNewsletter', signature: 'func (cli *Client) UploadNewsletter(ctx context.Context, data []byte, appInfo MediaType) (UploadResponse, error)', description: 'Upload media for newsletter (NOT E2E encrypted, server handles it)' },
    { name: 'UploadNewsletterReader', signature: 'func (cli *Client) UploadNewsletterReader(ctx context.Context, data io.Reader, appInfo MediaType) (UploadResponse, error)', description: 'Upload media for newsletter from io.Reader' },
  ],
  paramStructs: [
    {
      name: 'CreateNewsletterParams',
      goType: 'whatsmeow.CreateNewsletterParams',
      fields: [
        { name: 'Name', type: 'string', description: 'Newsletter name (required)' },
        { name: 'Description', type: 'string', description: 'Newsletter description' },
        { name: 'Picture', type: '[]byte', description: 'Newsletter picture (JPEG bytes)' },
      ],
    },
    {
      name: 'GetNewsletterMessagesParams',
      goType: 'whatsmeow.GetNewsletterMessagesParams',
      fields: [
        { name: 'Count', type: 'int', description: 'Number of messages to fetch' },
        { name: 'Before', type: 'types.MessageServerID', description: 'Fetch messages before this server ID (pagination)' },
      ],
    },
    {
      name: 'GetNewsletterUpdatesParams',
      goType: 'whatsmeow.GetNewsletterUpdatesParams',
      fields: [
        { name: 'Count', type: 'int', description: 'Number of updates to fetch' },
        { name: 'Since', type: 'time.Time', description: 'Fetch updates since this time' },
        { name: 'After', type: 'types.MessageServerID', description: 'Fetch updates after this server ID' },
      ],
    },
  ],
  types: [
    {
      name: 'NewsletterMetadata',
      goType: 'types.NewsletterMetadata',
      fields: [
        { name: 'ID', type: 'types.JID', description: 'Newsletter JID' },
        { name: 'State', type: 'WrappedNewsletterState', description: 'Current state (active/suspended/geosuspended)' },
        { name: 'ThreadMeta', type: 'NewsletterThreadMetadata', description: 'Thread metadata (creation, invite, name, description, subscribers, etc.)' },
        { name: 'ViewerMeta', type: '*NewsletterViewerMetadata', description: 'Viewer metadata (mute, role, etc.) — nil if not subscribed' },
      ],
    },
    {
      name: 'NewsletterThreadMetadata',
      goType: 'types.NewsletterThreadMetadata',
      fields: [
        { name: 'CreationTime', type: 'time.Time', description: 'When the newsletter was created' },
        { name: 'InviteCode', type: 'string', description: 'Invite code for newsletter link' },
        { name: 'Name', type: 'NewsletterText', description: 'Newsletter name' },
        { name: 'Description', type: 'NewsletterText', description: 'Newsletter description' },
        { name: 'SubscriberCount', type: 'int', description: 'Number of subscribers' },
        { name: 'VerificationStatus', type: 'string', description: 'Verification status' },
        { name: 'Picture', type: '*types.ProfilePictureInfo', description: 'Newsletter picture info' },
        { name: 'Preview', type: 'ProfilePictureInfo', description: 'Newsletter preview picture' },
        { name: 'Settings', type: 'NewsletterSettings', description: 'Newsletter settings' },
      ],
    },
    {
      name: 'NewsletterViewerMetadata',
      goType: 'types.NewsletterViewerMetadata',
      fields: [
        { name: 'Mute', type: 'NewsletterMuted', description: 'Whether newsletter is muted' },
        { name: 'Role', type: 'NewsletterRole', description: 'Viewer role (subscriber, guest, admin, owner)' },
      ],
    },
    {
      name: 'NewsletterMessage',
      goType: 'types.NewsletterMessage',
      fields: [
        { name: 'MessageServerID', type: 'types.MessageServerID', description: 'Server-side message ID' },
        { name: 'ViewsCount', type: 'int', description: 'Number of views' },
        { name: 'ReactionCounts', type: 'map[string]int', description: 'Reaction counts by emoji' },
        { name: 'Message', type: '*waE2E.Message', description: 'Message content (protobuf)' },
      ],
    },
    {
      name: 'NewsletterSettings',
      goType: 'types.NewsletterSettings',
      fields: [
        { name: 'ReactionCodes', type: 'NewsletterReactionSettings', description: 'Reaction settings (which reactions allowed)' },
      ],
    },
  ],
  enums: [
    {
      name: 'NewsletterRole',
      goType: 'types.NewsletterRole',
      values: [
        { name: 'NewsletterRoleSubscriber', value: '"SUBSCRIBER"', description: 'Regular subscriber' },
        { name: 'NewsletterRoleGuest', value: '"GUEST"', description: 'Guest viewer (not subscribed)' },
        { name: 'NewsletterRoleAdmin', value: '"ADMIN"', description: 'Channel administrator' },
        { name: 'NewsletterRoleOwner', value: '"OWNER"', description: 'Channel owner' },
      ],
    },
    {
      name: 'NewsletterMuteState',
      goType: 'types.NewsletterMuted',
      values: [
        { name: 'NewsletterMuteOn', value: '"ON"', description: 'Newsletter is muted' },
        { name: 'NewsletterMuteOff', value: '"OFF"', description: 'Newsletter is not muted' },
        { name: 'NewsletterMuteUndefined', value: '""', description: 'Mute state not set' },
      ],
    },
    {
      name: 'NewsletterState',
      goType: 'types.NewsletterState',
      values: [
        { name: 'NewsletterStateActive', value: '"ACTIVE"', description: 'Newsletter is active' },
        { name: 'NewsletterStateSuspended', value: '"SUSPENDED"', description: 'Newsletter is suspended' },
        { name: 'NewsletterStateGeoSuspended', value: '"GEOSUSPENDED"', description: 'Newsletter suspended in specific regions' },
      ],
    },
    {
      name: 'NewsletterReactionSettings',
      goType: 'types.NewsletterReactionSettings',
      values: [
        { name: 'NewsletterReactionsAll', value: '"ALL"', description: 'All reactions allowed' },
        { name: 'NewsletterReactionsBasic', value: '"BASIC"', description: 'Only basic reactions allowed' },
        { name: 'NewsletterReactionsNone', value: '"NONE"', description: 'No reactions allowed' },
        { name: 'NewsletterReactionsBlocklist', value: '"BLOCKLIST"', description: 'All except blocklisted' },
      ],
    },
  ],
  events: [
    {
      name: 'NewsletterJoin',
      description: 'Dispatched when the user joins/follows a newsletter',
      fields: [
        { name: 'ID', type: 'types.JID', description: 'Newsletter JID' },
      ],
    },
    {
      name: 'NewsletterLeave',
      description: 'Dispatched when the user leaves/unfollows a newsletter',
      fields: [
        { name: 'ID', type: 'types.JID', description: 'Newsletter JID' },
        { name: 'Role', type: 'NewsletterRole', description: 'Role before leaving' },
      ],
    },
    {
      name: 'NewsletterMuteChange',
      description: 'Dispatched when a newsletter mute state changes',
      fields: [
        { name: 'ID', type: 'types.JID', description: 'Newsletter JID' },
        { name: 'Mute', type: 'NewsletterMuted', description: 'New mute state' },
      ],
    },
    {
      name: 'NewsletterLiveUpdate',
      description: 'Dispatched for live updates in a subscribed newsletter',
      fields: [
        { name: 'JID', type: 'types.JID', description: 'Newsletter JID' },
        { name: 'Time', type: 'time.Time', description: 'Update timestamp' },
        { name: 'Messages', type: '[]NewsletterMessage', description: 'Updated messages' },
      ],
    },
  ],
  codeExamples: [
    {
      title: 'Create and manage newsletter',
      code: `meta, err := cli.CreateNewsletter(ctx, whatsmeow.CreateNewsletterParams{
    Name:        "My Channel",
    Description: "Channel description",
})

subs, err := cli.GetSubscribedNewsletters(ctx)

err := cli.FollowNewsletter(ctx, newsletterJID)
err := cli.UnfollowNewsletter(ctx, newsletterJID)
err := cli.NewsletterToggleMute(ctx, newsletterJID, true)`,
    },
    {
      title: 'Fetch and react to messages',
      code: `msgs, err := cli.GetNewsletterMessages(ctx, jid, &whatsmeow.GetNewsletterMessagesParams{
    Count: 50,
})

err := cli.NewsletterSendReaction(ctx, jid, serverID, "\u{1F44D}", senderJID)
err := cli.NewsletterMarkViewed(ctx, jid, []types.MessageServerID{serverID})`,
    },
    {
      title: 'Live updates subscription',
      code: `ttl, err := cli.NewsletterSubscribeLiveUpdates(ctx, newsletterJID)

cli.AddEventHandler(func(evt *events.NewsletterLiveUpdate) {
    for _, msg := range evt.Messages {
        fmt.Printf("Update in %s: %v\n", evt.JID, msg.MessageServerID)
    }
})`,
    },
  ],
}

export function getNewsletterTopic(topic: string): Partial<NewsletterReference> {
  switch (topic.toLowerCase()) {
    case 'methods':
      return { methods: NEWSLETTER_REFERENCE.methods, paramStructs: NEWSLETTER_REFERENCE.paramStructs }
    case 'types':
      return { types: NEWSLETTER_REFERENCE.types, enums: NEWSLETTER_REFERENCE.enums }
    case 'events':
      return { events: NEWSLETTER_REFERENCE.events }
    case 'examples':
      return { codeExamples: NEWSLETTER_REFERENCE.codeExamples }
    case 'all':
    default:
      return NEWSLETTER_REFERENCE
  }
}
