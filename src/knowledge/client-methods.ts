export type ClientMethodCategory =
  | 'connection'
  | 'messaging'
  | 'groups'
  | 'newsletter'
  | 'user'
  | 'presence'
  | 'privacy'
  | 'media_download'
  | 'media_upload'
  | 'media_retry'
  | 'appstate'
  | 'calls'
  | 'broadcast'
  | 'push'

export interface ClientMethodInfo {
  name: string
  signature: string
  description: string
  category: ClientMethodCategory
}

export const CLIENT_METHODS: ClientMethodInfo[] = [
  { name: 'Connect', signature: 'func (cli *Client) Connect() error', description: 'Connect to WhatsApp servers (calls GetQRChannel or PairPhone first for new sessions)', category: 'connection' },
  { name: 'ConnectContext', signature: 'func (cli *Client) ConnectContext(ctx context.Context) error', description: 'Connect with a context for cancellation/timeout support', category: 'connection' },
  { name: 'Disconnect', signature: 'func (cli *Client) Disconnect()', description: 'Disconnect from WhatsApp servers and clean up', category: 'connection' },
  { name: 'IsConnected', signature: 'func (cli *Client) IsConnected() bool', description: 'Check if the websocket connection is established', category: 'connection' },
  { name: 'IsLoggedIn', signature: 'func (cli *Client) IsLoggedIn() bool', description: 'Check if the client is connected AND authenticated', category: 'connection' },
  { name: 'WaitForConnection', signature: 'func (cli *Client) WaitForConnection(timeout time.Duration) bool', description: 'Block until connected or timeout; returns true if connected', category: 'connection' },
  { name: 'Logout', signature: 'func (cli *Client) Logout(ctx context.Context) error', description: 'Log out from WhatsApp and delete device from server', category: 'connection' },
  { name: 'ResetConnection', signature: 'func (cli *Client) ResetConnection()', description: 'Force reconnect by closing current websocket', category: 'connection' },
  { name: 'GetQRChannel', signature: 'func (cli *Client) GetQRChannel(ctx context.Context) (<-chan QRChannelItem, error)', description: 'Get channel that receives QR code events for pairing (must call BEFORE Connect)', category: 'connection' },
  { name: 'PairPhone', signature: 'func (cli *Client) PairPhone(ctx context.Context, phone string, showPushNotification bool, clientType PairClientType, clientDisplayName string) (string, error)', description: 'Pair using phone number code (XXXX-XXXX format, 160s timeout)', category: 'connection' },
  { name: 'AddEventHandler', signature: 'func (cli *Client) AddEventHandler(handler EventHandler) uint32', description: 'Register an event handler function, returns handler ID for removal', category: 'connection' },
  { name: 'AddEventHandlerWithSuccessStatus', signature: 'func (cli *Client) AddEventHandlerWithSuccessStatus(handler EventHandlerWithSuccessStatus) uint32', description: 'Register event handler that returns a bool success status', category: 'connection' },
  { name: 'RemoveEventHandler', signature: 'func (cli *Client) RemoveEventHandler(id uint32) bool', description: 'Remove a specific event handler by ID', category: 'connection' },
  { name: 'RemoveEventHandlers', signature: 'func (cli *Client) RemoveEventHandlers()', description: 'Remove all registered event handlers', category: 'connection' },
  { name: 'SetForceActiveDeliveryReceipts', signature: 'func (cli *Client) SetForceActiveDeliveryReceipts(active bool)', description: 'Force sending delivery receipts (two gray ticks) even when not marked online', category: 'connection' },
  { name: 'DangerousInternals', signature: 'func (cli *Client) DangerousInternals() *DangerousInternalClient', description: 'Access unexported internal methods (deprecated, use with caution)', category: 'connection' },
  { name: 'SetProxy', signature: 'func (cli *Client) SetProxy(proxy Proxy, opts ...SetProxyOptions)', description: 'Set proxy for all connections using Proxy interface', category: 'connection' },
  { name: 'SetProxyAddress', signature: 'func (cli *Client) SetProxyAddress(addr string, opts ...SetProxyOptions) error', description: 'Set proxy by URL string (supports http/https/socks5)', category: 'connection' },
  { name: 'SetSOCKSProxy', signature: 'func (cli *Client) SetSOCKSProxy(px proxy.Dialer, opts ...SetProxyOptions)', description: 'Set SOCKS proxy using proxy.Dialer interface', category: 'connection' },
  { name: 'SetMediaHTTPClient', signature: 'func (cli *Client) SetMediaHTTPClient(h *http.Client)', description: 'Set HTTP client for media downloads (overwrites proxy settings)', category: 'connection' },
  { name: 'SetPreLoginHTTPClient', signature: 'func (cli *Client) SetPreLoginHTTPClient(h *http.Client)', description: 'Set HTTP client for websocket connection before login', category: 'connection' },
  { name: 'SetWebsocketHTTPClient', signature: 'func (cli *Client) SetWebsocketHTTPClient(h *http.Client)', description: 'Set HTTP client for websocket connection after login', category: 'connection' },

  { name: 'SendMessage', signature: 'func (cli *Client) SendMessage(ctx context.Context, to types.JID, message *waE2E.Message, extra ...SendRequestExtra) (resp SendResponse, err error)', description: 'Send a message and wait for server acknowledgment; returns timestamp', category: 'messaging' },
  { name: 'SendFBMessage', signature: 'func (cli *Client) SendFBMessage(ctx context.Context, to types.JID, message armadillo.RealMessageApplicationSub, metadata *waMsgApplication.MessageApplication_Metadata, extra ...SendRequestExtra) (resp SendResponse, err error)', description: 'Send a v3 (Armadillo) format message', category: 'messaging' },
  { name: 'SendPeerMessage', signature: 'func (cli *Client) SendPeerMessage(ctx context.Context, message *waE2E.Message) (SendResponse, error)', description: 'Send a message to own devices (peer-to-peer sync)', category: 'messaging' },
  { name: 'RevokeMessage', signature: 'func (cli *Client) RevokeMessage(ctx context.Context, chat types.JID, id types.MessageID) (SendResponse, error)', description: 'Delete a message from everyone in the chat', category: 'messaging' },
  { name: 'GenerateMessageID', signature: 'func (cli *Client) GenerateMessageID() types.MessageID', description: 'Generate a random message ID string for pre-setting message IDs', category: 'messaging' },
  { name: 'BuildMessageKey', signature: 'func (cli *Client) BuildMessageKey(chat, sender types.JID, id types.MessageID) *waCommon.MessageKey', description: 'Build a MessageKey for replies, revocations, and reactions', category: 'messaging' },
  { name: 'BuildEdit', signature: 'func (cli *Client) BuildEdit(chat types.JID, id types.MessageID, newContent *waE2E.Message) *waE2E.Message', description: 'Build an edit message to modify an existing message', category: 'messaging' },
  { name: 'BuildReaction', signature: 'func (cli *Client) BuildReaction(chat, sender types.JID, id types.MessageID, reaction string) *waE2E.Message', description: 'Build a reaction message (emoji or empty string to remove)', category: 'messaging' },
  { name: 'BuildRevoke', signature: 'func (cli *Client) BuildRevoke(chat, sender types.JID, id types.MessageID) *waE2E.Message', description: 'Build a revoke message for deleting via SendMessage', category: 'messaging' },
  { name: 'BuildPollCreation', signature: 'func (cli *Client) BuildPollCreation(name string, optionNames []string, selectableOptionCount int) *waE2E.Message', description: 'Build a poll creation message with options', category: 'messaging' },
  { name: 'BuildPollVote', signature: 'func (cli *Client) BuildPollVote(ctx context.Context, pollInfo *types.MessageInfo, optionNames []string) (*waE2E.Message, error)', description: 'Build an encrypted poll vote message', category: 'messaging' },
  { name: 'BuildHistorySyncRequest', signature: 'func (cli *Client) BuildHistorySyncRequest(lastKnownMessageInfo *types.MessageInfo, count int) *waE2E.Message', description: 'Build a request for history sync from primary device', category: 'messaging' },
  { name: 'BuildUnavailableMessageRequest', signature: 'func (cli *Client) BuildUnavailableMessageRequest(chat, sender types.JID, id string) *waE2E.Message', description: 'Build request to primary device for undecryptable message copy', category: 'messaging' },
  { name: 'ParseWebMessage', signature: 'func (cli *Client) ParseWebMessage(chatJID types.JID, webMsg *waWeb.WebMessageInfo) (*events.Message, error)', description: 'Parse a WebMessageInfo (from history sync) into events.Message', category: 'messaging' },
  { name: 'MarkRead', signature: 'func (cli *Client) MarkRead(ctx context.Context, ids []types.MessageID, timestamp time.Time, chat, sender types.JID, receiptTypeExtra ...types.ReceiptType) error', description: 'Send read receipt for message IDs (chat=chat JID, sender=sender in groups)', category: 'messaging' },
  { name: 'DecryptComment', signature: 'func (cli *Client) DecryptComment(ctx context.Context, comment *events.Message) (*waE2E.Message, error)', description: 'Decrypt a comment on a message', category: 'messaging' },
  { name: 'DecryptPollVote', signature: 'func (cli *Client) DecryptPollVote(ctx context.Context, vote *events.Message) (*waE2E.PollVoteMessage, error)', description: 'Decrypt a poll vote to see selected options', category: 'messaging' },
  { name: 'DecryptReaction', signature: 'func (cli *Client) DecryptReaction(ctx context.Context, reaction *events.Message) (*waE2E.ReactionMessage, error)', description: 'Decrypt an encrypted reaction message', category: 'messaging' },
  { name: 'DecryptSecretEncryptedMessage', signature: 'func (cli *Client) DecryptSecretEncryptedMessage(ctx context.Context, evt *events.Message) (*waE2E.Message, error)', description: 'Decrypt a secret-encrypted message (bot messages)', category: 'messaging' },
  { name: 'EncryptComment', signature: 'func (cli *Client) EncryptComment(ctx context.Context, rootMsgInfo *types.MessageInfo, comment *waE2E.Message) (*waE2E.Message, error)', description: 'Encrypt a comment before sending', category: 'messaging' },
  { name: 'EncryptPollVote', signature: 'func (cli *Client) EncryptPollVote(ctx context.Context, pollInfo *types.MessageInfo, vote *waE2E.PollVoteMessage) (*waE2E.PollUpdateMessage, error)', description: 'Encrypt a poll vote before sending', category: 'messaging' },
  { name: 'EncryptReaction', signature: 'func (cli *Client) EncryptReaction(ctx context.Context, rootMsgInfo *types.MessageInfo, reaction *waE2E.ReactionMessage) (*waE2E.EncReactionMessage, error)', description: 'Encrypt a reaction before sending', category: 'messaging' },

  { name: 'CreateGroup', signature: 'func (cli *Client) CreateGroup(ctx context.Context, req ReqCreateGroup) (*types.GroupInfo, error)', description: 'Create a group (see ReqCreateGroup for params including community support)', category: 'groups' },
  { name: 'LeaveGroup', signature: 'func (cli *Client) LeaveGroup(ctx context.Context, jid types.JID) error', description: 'Leave a group chat', category: 'groups' },
  { name: 'GetGroupInfo', signature: 'func (cli *Client) GetGroupInfo(ctx context.Context, jid types.JID) (*types.GroupInfo, error)', description: 'Get basic info about a group from the server', category: 'groups' },
  { name: 'GetGroupInfoFromInvite', signature: 'func (cli *Client) GetGroupInfoFromInvite(ctx context.Context, jid, inviter types.JID, code string, expiration int64) (*types.GroupInfo, error)', description: 'Get group info from an invite message (not invite link)', category: 'groups' },
  { name: 'GetGroupInfoFromLink', signature: 'func (cli *Client) GetGroupInfoFromLink(ctx context.Context, code string) (*types.GroupInfo, error)', description: 'Resolve a chat.whatsapp.com invite link and get group info', category: 'groups' },
  { name: 'GetJoinedGroups', signature: 'func (cli *Client) GetJoinedGroups(ctx context.Context) ([]*types.GroupInfo, error)', description: 'Get list of all groups the user participates in', category: 'groups' },
  { name: 'GetGroupInviteLink', signature: 'func (cli *Client) GetGroupInviteLink(ctx context.Context, jid types.JID, reset bool) (string, error)', description: 'Get or reset the group invite link', category: 'groups' },
  { name: 'JoinGroupWithInvite', signature: 'func (cli *Client) JoinGroupWithInvite(ctx context.Context, jid, inviter types.JID, code string, expiration int64) error', description: 'Join a group using an invite message', category: 'groups' },
  { name: 'JoinGroupWithLink', signature: 'func (cli *Client) JoinGroupWithLink(ctx context.Context, code string) (types.JID, error)', description: 'Join a group using an invite link', category: 'groups' },
  { name: 'GetGroupRequestParticipants', signature: 'func (cli *Client) GetGroupRequestParticipants(ctx context.Context, jid types.JID) ([]types.GroupParticipantRequest, error)', description: 'Get list of participants requesting to join the group', category: 'groups' },
  { name: 'UpdateGroupParticipants', signature: 'func (cli *Client) UpdateGroupParticipants(ctx context.Context, jid types.JID, participantChanges []types.JID, action ParticipantChange) ([]types.GroupParticipant, error)', description: 'Add, remove, promote or demote group members', category: 'groups' },
  { name: 'UpdateGroupRequestParticipants', signature: 'func (cli *Client) UpdateGroupRequestParticipants(ctx context.Context, jid types.JID, participantChanges []types.JID, action ParticipantRequestChange) ([]types.GroupParticipant, error)', description: 'Approve or reject requests to join the group', category: 'groups' },
  { name: 'SetGroupName', signature: 'func (cli *Client) SetGroupName(ctx context.Context, jid types.JID, name string) error', description: 'Update the group name (subject)', category: 'groups' },
  { name: 'SetGroupPhoto', signature: 'func (cli *Client) SetGroupPhoto(ctx context.Context, jid types.JID, avatar []byte) (string, error)', description: 'Update group picture (JPEG, nil to remove)', category: 'groups' },
  { name: 'SetGroupTopic', signature: 'func (cli *Client) SetGroupTopic(ctx context.Context, jid types.JID, previousID, newID, topic string) error', description: 'Update group topic/description with version tracking', category: 'groups' },
  { name: 'SetGroupDescription', signature: 'func (cli *Client) SetGroupDescription(ctx context.Context, jid types.JID, description string) error', description: 'Update the group description', category: 'groups' },
  { name: 'SetGroupAnnounce', signature: 'func (cli *Client) SetGroupAnnounce(ctx context.Context, jid types.JID, announce bool) error', description: 'Toggle announce mode (only admins can send messages)', category: 'groups' },
  { name: 'SetGroupLocked', signature: 'func (cli *Client) SetGroupLocked(ctx context.Context, jid types.JID, locked bool) error', description: 'Toggle locked mode (only admins can modify group info)', category: 'groups' },
  { name: 'SetGroupJoinApprovalMode', signature: 'func (cli *Client) SetGroupJoinApprovalMode(ctx context.Context, jid types.JID, mode bool) error', description: 'Enable or disable join approval requirement', category: 'groups' },
  { name: 'SetGroupMemberAddMode', signature: 'func (cli *Client) SetGroupMemberAddMode(ctx context.Context, jid types.JID, mode types.GroupMemberAddMode) error', description: 'Set who can add members (admin_add or all_member_add)', category: 'groups' },
  { name: 'GetSubGroups', signature: 'func (cli *Client) GetSubGroups(ctx context.Context, community types.JID) ([]*types.GroupLinkTarget, error)', description: 'Get subgroups of a community', category: 'groups' },
  { name: 'GetLinkedGroupsParticipants', signature: 'func (cli *Client) GetLinkedGroupsParticipants(ctx context.Context, community types.JID) ([]types.JID, error)', description: 'Get all participants across all groups in a community', category: 'groups' },
  { name: 'LinkGroup', signature: 'func (cli *Client) LinkGroup(ctx context.Context, parent, child types.JID) error', description: 'Add existing group as child of a community', category: 'groups' },
  { name: 'UnlinkGroup', signature: 'func (cli *Client) UnlinkGroup(ctx context.Context, parent, child types.JID) error', description: 'Remove a child group from a community', category: 'groups' },

  { name: 'CreateNewsletter', signature: 'func (cli *Client) CreateNewsletter(ctx context.Context, params CreateNewsletterParams) (*types.NewsletterMetadata, error)', description: 'Create a new WhatsApp channel', category: 'newsletter' },
  { name: 'FollowNewsletter', signature: 'func (cli *Client) FollowNewsletter(ctx context.Context, jid types.JID) error', description: 'Follow (join) a WhatsApp channel', category: 'newsletter' },
  { name: 'UnfollowNewsletter', signature: 'func (cli *Client) UnfollowNewsletter(ctx context.Context, jid types.JID) error', description: 'Unfollow (leave) a WhatsApp channel', category: 'newsletter' },
  { name: 'GetNewsletterInfo', signature: 'func (cli *Client) GetNewsletterInfo(ctx context.Context, jid types.JID) (*types.NewsletterMetadata, error)', description: 'Get info of a newsletter you are joined to', category: 'newsletter' },
  { name: 'GetNewsletterInfoWithInvite', signature: 'func (cli *Client) GetNewsletterInfoWithInvite(ctx context.Context, key string) (*types.NewsletterMetadata, error)', description: 'Get newsletter info via invite link', category: 'newsletter' },
  { name: 'GetSubscribedNewsletters', signature: 'func (cli *Client) GetSubscribedNewsletters(ctx context.Context) ([]*types.NewsletterMetadata, error)', description: 'Get info of all newsletters you are joined to', category: 'newsletter' },
  { name: 'GetNewsletterMessages', signature: 'func (cli *Client) GetNewsletterMessages(ctx context.Context, jid types.JID, params *GetNewsletterMessagesParams) ([]*types.NewsletterMessage, error)', description: 'Get messages in a WhatsApp channel', category: 'newsletter' },
  { name: 'GetNewsletterMessageUpdates', signature: 'func (cli *Client) GetNewsletterMessageUpdates(ctx context.Context, jid types.JID, params *GetNewsletterUpdatesParams) ([]*types.NewsletterMessage, error)', description: 'Get live updates (reaction and view counts) for a channel', category: 'newsletter' },
  { name: 'NewsletterMarkViewed', signature: 'func (cli *Client) NewsletterMarkViewed(ctx context.Context, jid types.JID, serverIDs []types.MessageServerID) error', description: 'Mark channel messages as viewed (increments view counter)', category: 'newsletter' },
  { name: 'NewsletterSendReaction', signature: 'func (cli *Client) NewsletterSendReaction(ctx context.Context, jid types.JID, serverID types.MessageServerID, reaction string, messageID types.MessageID) error', description: 'Send or remove a reaction on a channel message', category: 'newsletter' },
  { name: 'NewsletterToggleMute', signature: 'func (cli *Client) NewsletterToggleMute(ctx context.Context, jid types.JID, mute bool) error', description: 'Mute or unmute a newsletter', category: 'newsletter' },
  { name: 'NewsletterSubscribeLiveUpdates', signature: 'func (cli *Client) NewsletterSubscribeLiveUpdates(ctx context.Context, jid types.JID) (time.Duration, error)', description: 'Subscribe to temporary live updates from a channel', category: 'newsletter' },

  { name: 'GetUserInfo', signature: 'func (cli *Client) GetUserInfo(ctx context.Context, jids []types.JID) (map[types.JID]types.UserInfo, error)', description: 'Get user info (status, picture ID, devices) for multiple JIDs', category: 'user' },
  { name: 'GetUserDevices', signature: 'func (cli *Client) GetUserDevices(ctx context.Context, jids []types.JID) ([]types.JID, error)', description: 'Get all device JIDs for the given users', category: 'user' },
  { name: 'GetUserDevicesContext', signature: 'func (cli *Client) GetUserDevicesContext(ctx context.Context, jids []types.JID) ([]types.JID, error)', description: 'Get all device JIDs with context support', category: 'user' },
  { name: 'GetProfilePictureInfo', signature: 'func (cli *Client) GetProfilePictureInfo(ctx context.Context, jid types.JID, params *GetProfilePictureParams) (*types.ProfilePictureInfo, error)', description: 'Get profile picture URL and ID for a user or group', category: 'user' },
  { name: 'GetBusinessProfile', signature: 'func (cli *Client) GetBusinessProfile(ctx context.Context, jid types.JID) (*types.BusinessProfile, error)', description: 'Get WhatsApp Business profile info', category: 'user' },
  { name: 'GetContactQRLink', signature: 'func (cli *Client) GetContactQRLink(ctx context.Context, revoke bool) (string, error)', description: 'Get or revoke your contact share QR code link', category: 'user' },
  { name: 'ResolveContactQRLink', signature: 'func (cli *Client) ResolveContactQRLink(ctx context.Context, code string) (*types.ContactQRLinkTarget, error)', description: 'Resolve a wa.me/qr/<code> link to get target JID and push name', category: 'user' },
  { name: 'ResolveBusinessMessageLink', signature: 'func (cli *Client) ResolveBusinessMessageLink(ctx context.Context, code string) (*types.BusinessMessageLinkTarget, error)', description: 'Resolve a wa.me/message/<code> business link', category: 'user' },
  { name: 'SetStatusMessage', signature: 'func (cli *Client) SetStatusMessage(ctx context.Context, msg string) error', description: 'Update the "About" text in user profile (not status broadcasts)', category: 'user' },
  { name: 'StoreLIDPNMapping', signature: 'func (cli *Client) StoreLIDPNMapping(ctx context.Context, first, second types.JID)', description: 'Store a LID-to-phone-number mapping', category: 'user' },
  { name: 'GetBotListV2', signature: 'func (cli *Client) GetBotListV2(ctx context.Context) ([]types.BotListInfo, error)', description: 'Get list of available WhatsApp bots', category: 'user' },
  { name: 'GetBotProfiles', signature: 'func (cli *Client) GetBotProfiles(ctx context.Context, botInfo []types.BotListInfo) ([]types.BotProfileInfo, error)', description: 'Get profile information for bots', category: 'user' },
  { name: 'AcceptTOSNotice', signature: 'func (cli *Client) AcceptTOSNotice(ctx context.Context, noticeID, stage string) error', description: 'Accept a Terms of Service notice', category: 'user' },

  { name: 'SendPresence', signature: 'func (cli *Client) SendPresence(ctx context.Context, state types.Presence) error', description: 'Update online/offline presence (call after connecting to set pushname)', category: 'presence' },
  { name: 'SendChatPresence', signature: 'func (cli *Client) SendChatPresence(ctx context.Context, jid types.JID, state types.ChatPresence, media types.ChatPresenceMedia) error', description: 'Update typing/recording status in a specific chat', category: 'presence' },
  { name: 'SubscribePresence', signature: 'func (cli *Client) SubscribePresence(ctx context.Context, jid types.JID) error', description: 'Subscribe to receive presence updates for a user', category: 'presence' },

  { name: 'GetPrivacySettings', signature: 'func (cli *Client) GetPrivacySettings(ctx context.Context) (settings types.PrivacySettings)', description: 'Get privacy settings (logs errors internally, returns empty on failure)', category: 'privacy' },
  { name: 'SetPrivacySetting', signature: 'func (cli *Client) SetPrivacySetting(ctx context.Context, name types.PrivacySettingType, value types.PrivacySetting) (settings types.PrivacySettings, err error)', description: 'Set a specific privacy setting and return updated settings', category: 'privacy' },
  { name: 'TryFetchPrivacySettings', signature: 'func (cli *Client) TryFetchPrivacySettings(ctx context.Context, ignoreCache bool) (*types.PrivacySettings, error)', description: 'Fetch privacy settings from cache or server', category: 'privacy' },
  { name: 'GetBlocklist', signature: 'func (cli *Client) GetBlocklist(ctx context.Context) (*types.Blocklist, error)', description: 'Get list of blocked users', category: 'privacy' },
  { name: 'UpdateBlocklist', signature: 'func (cli *Client) UpdateBlocklist(ctx context.Context, jid types.JID, action events.BlocklistChangeAction) (*types.Blocklist, error)', description: 'Block or unblock a user', category: 'privacy' },

  { name: 'Download', signature: 'func (cli *Client) Download(ctx context.Context, msg DownloadableMessage) ([]byte, error)', description: 'Download and decrypt media from a DownloadableMessage', category: 'media_download' },
  { name: 'DownloadAny', signature: 'func (cli *Client) DownloadAny(ctx context.Context, msg *waE2E.Message) (data []byte, err error)', description: 'Download media from any message type (auto-detects media field)', category: 'media_download' },
  { name: 'DownloadToFile', signature: 'func (cli *Client) DownloadToFile(ctx context.Context, msg DownloadableMessage, file File) error', description: 'Download and decrypt media directly to a file', category: 'media_download' },
  { name: 'DownloadFB', signature: 'func (cli *Client) DownloadFB(ctx context.Context, transport *waMediaTransport.WAMediaTransport_Integral, mediaType MediaType) ([]byte, error)', description: 'Download media using v3 (Armadillo) transport format', category: 'media_download' },
  { name: 'DownloadFBToFile', signature: 'func (cli *Client) DownloadFBToFile(ctx context.Context, transport *waMediaTransport.WAMediaTransport_Integral, mediaType MediaType, file File) error', description: 'Download v3 transport media directly to a file', category: 'media_download' },
  { name: 'DownloadMediaWithPath', signature: 'func (cli *Client) DownloadMediaWithPath(ctx context.Context, directPath string, encFileHash, fileHash, mediaKey []byte, fileLength int, mediaType MediaType, mmsType string) ([]byte, error)', description: 'Download media by manually specifying path and encryption details', category: 'media_download' },
  { name: 'DownloadThumbnail', signature: 'func (cli *Client) DownloadThumbnail(ctx context.Context, msg DownloadableThumbnail) ([]byte, error)', description: 'Download a thumbnail from a DownloadableThumbnail', category: 'media_download' },
  { name: 'DownloadHistorySync', signature: 'func (cli *Client) DownloadHistorySync(ctx context.Context, notif *waE2E.HistorySyncNotification, synchronousStorage bool) (*waHistorySync.HistorySync, error)', description: 'Download and parse a history sync notification', category: 'media_download' },
  { name: 'DeleteMedia', signature: 'func (cli *Client) DeleteMedia(ctx context.Context, appInfo MediaType, directPath string, encFileHash []byte, encHandle string) error', description: 'Delete uploaded media from WhatsApp servers', category: 'media_download' },

  { name: 'Upload', signature: 'func (cli *Client) Upload(ctx context.Context, plaintext []byte, appInfo MediaType) (resp UploadResponse, err error)', description: 'Upload and encrypt media, returns UploadResponse with fields to copy to protobuf', category: 'media_upload' },
  { name: 'UploadReader', signature: 'func (cli *Client) UploadReader(ctx context.Context, plaintext io.Reader, tempFile io.ReadWriteSeeker, appInfo MediaType) (resp UploadResponse, err error)', description: 'Upload from io.Reader with temp file for encryption', category: 'media_upload' },
  { name: 'UploadNewsletter', signature: 'func (cli *Client) UploadNewsletter(ctx context.Context, data []byte, appInfo MediaType) (resp UploadResponse, err error)', description: 'Upload media for newsletters without client-side encryption', category: 'media_upload' },
  { name: 'UploadNewsletterReader', signature: 'func (cli *Client) UploadNewsletterReader(ctx context.Context, data io.ReadSeeker, appInfo MediaType) (resp UploadResponse, err error)', description: 'Upload newsletter media from io.ReadSeeker without encryption', category: 'media_upload' },

  { name: 'SendMediaRetryReceipt', signature: 'func (cli *Client) SendMediaRetryReceipt(ctx context.Context, message *types.MessageInfo, mediaKey []byte) error', description: 'Request phone to re-upload media (for history sync 404/410 errors)', category: 'media_retry' },

  { name: 'FetchAppState', signature: 'func (cli *Client) FetchAppState(ctx context.Context, name appstate.WAPatchName, fullSync, onlyIfNotSynced bool) error', description: 'Fetch and process app state patches (contacts, mutes, pins, etc.)', category: 'appstate' },
  { name: 'SendAppState', signature: 'func (cli *Client) SendAppState(ctx context.Context, patch appstate.PatchInfo) error', description: 'Send app state patch and trigger background resync', category: 'appstate' },
  { name: 'SetDisappearingTimer', signature: 'func (cli *Client) SetDisappearingTimer(ctx context.Context, chat types.JID, timer time.Duration, settingTS time.Time) (err error)', description: 'Set disappearing messages timer for a chat', category: 'appstate' },

  { name: 'RejectCall', signature: 'func (cli *Client) RejectCall(ctx context.Context, callFrom types.JID, callID string) error', description: 'Reject an incoming call', category: 'calls' },

  { name: 'GetStatusPrivacy', signature: 'func (cli *Client) GetStatusPrivacy(ctx context.Context) ([]types.StatusPrivacy, error)', description: 'Get status broadcast privacy settings (who sees your status)', category: 'broadcast' },

  { name: 'RegisterForPushNotifications', signature: 'func (cli *Client) RegisterForPushNotifications(ctx context.Context, pc PushConfig) error', description: 'Register FCM/APNs/WebPush token for push notifications', category: 'push' },
  { name: 'GetServerPushNotificationConfig', signature: 'func (cli *Client) GetServerPushNotificationConfig(ctx context.Context) (*waBinary.Node, error)', description: 'Get push notification configuration from server', category: 'push' },
]

export function getMethodsByCategory(category: ClientMethodCategory): ClientMethodInfo[] {
  return CLIENT_METHODS.filter((m) => m.category === category)
}

export function getMethodByName(name: string): ClientMethodInfo | undefined {
  return CLIENT_METHODS.find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  )
}

export function searchMethods(query: string): ClientMethodInfo[] {
  const q = query.toLowerCase()
  return CLIENT_METHODS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.signature.toLowerCase().includes(q),
  )
}

export function getMethodCategories(): { category: ClientMethodCategory; count: number }[] {
  const cats = new Map<ClientMethodCategory, number>()
  for (const m of CLIENT_METHODS) {
    cats.set(m.category, (cats.get(m.category) ?? 0) + 1)
  }
  return Array.from(cats.entries()).map(([category, count]) => ({ category, count }))
}
