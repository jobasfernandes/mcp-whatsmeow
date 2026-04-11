export interface PrivacySettingTypeInfo {
  name: string
  value: string
  description: string
}

export interface PrivacySettingValueInfo {
  name: string
  value: string
  description: string
}

export interface PrivacyMethodInfo {
  name: string
  signature: string
  description: string
}

export interface BlocklistInfo {
  methods: PrivacyMethodInfo[]
  actions: { name: string; value: string; description: string }[]
  events: { name: string; description: string; fields: { name: string; type: string; description: string }[] }[]
}

export interface PrivacyReference {
  overview: string
  settingTypes: PrivacySettingTypeInfo[]
  settingValues: PrivacySettingValueInfo[]
  methods: PrivacyMethodInfo[]
  blocklist: BlocklistInfo
  settingsStruct: {
    goType: string
    fields: { name: string; type: string; description: string }[]
  }
  codeExamples: { title: string; code: string }[]
}

export const PRIVACY_REFERENCE: PrivacyReference = {
  overview: 'WhatsApp privacy settings control visibility of last seen, profile picture, status, online presence, group add, and more. Settings are synced via app state and can be read/written via IQ queries.',
  settingTypes: [
    { name: 'PrivacySettingTypeGroupAdd', value: '"groupadd"', description: 'Who can add you to groups' },
    { name: 'PrivacySettingTypeLastSeen', value: '"last"', description: 'Who can see your last seen time' },
    { name: 'PrivacySettingTypeStatus', value: '"status"', description: 'Who can see your status/about' },
    { name: 'PrivacySettingTypeProfile', value: '"profile"', description: 'Who can see your profile picture' },
    { name: 'PrivacySettingTypeReadReceipts', value: '"readreceipts"', description: 'Whether read receipts are sent' },
    { name: 'PrivacySettingTypeOnline', value: '"online"', description: 'Online presence visibility' },
    { name: 'PrivacySettingTypeCallAdd', value: '"calladd"', description: 'Who can call you' },
    { name: 'PrivacySettingTypeDefense', value: '"defense"', description: 'Silence unknown callers defense mode' },
    { name: 'PrivacySettingTypeMessages', value: '"messages"', description: 'Who can send you messages' },
    { name: 'PrivacySettingTypeStickers', value: '"stickers"', description: 'Who can see your sticker favorites' },
  ],
  settingValues: [
    { name: 'PrivacySettingUndefined', value: '""', description: 'Not set / default' },
    { name: 'PrivacySettingAll', value: '"all"', description: 'Everyone' },
    { name: 'PrivacySettingContacts', value: '"contacts"', description: 'Only contacts' },
    { name: 'PrivacySettingContactAllowlist', value: '"contact_allowlist"', description: 'Contacts except those in deny list' },
    { name: 'PrivacySettingContactBlacklist', value: '"contact_blacklist"', description: 'Contacts except those in block list' },
    { name: 'PrivacySettingMatchLastSeen', value: '"match_last_seen"', description: 'Match last seen setting (for online)' },
    { name: 'PrivacySettingKnown', value: '"known"', description: 'Known contacts only' },
    { name: 'PrivacySettingNone', value: '"none"', description: 'Nobody' },
    { name: 'PrivacySettingOnStandard', value: '"on_standard"', description: 'Standard on (for defense)' },
    { name: 'PrivacySettingOff', value: '"off"', description: 'Off / disabled' },
  ],
  methods: [
    { name: 'GetPrivacySettings', signature: 'func (cli *Client) GetPrivacySettings(ctx context.Context) (types.PrivacySettings, error)', description: 'Get all current privacy settings' },
    { name: 'SetPrivacySetting', signature: 'func (cli *Client) SetPrivacySetting(ctx context.Context, name types.PrivacySettingType, value types.PrivacySetting) error', description: 'Set a specific privacy setting' },
    { name: 'TryFetchPrivacySettings', signature: 'func (cli *Client) TryFetchPrivacySettings(ctx context.Context, forceRequery bool) (*types.PrivacySettings, error)', description: 'Fetch privacy settings with caching (only re-fetches if needed or forceRequery=true)' },
  ],
  blocklist: {
    methods: [
      { name: 'GetBlocklist', signature: 'func (cli *Client) GetBlocklist(ctx context.Context) (*types.Blocklist, error)', description: 'Get the list of blocked contacts' },
      { name: 'UpdateBlocklist', signature: 'func (cli *Client) UpdateBlocklist(ctx context.Context, jid types.JID, action events.BlocklistChangeAction) (*types.Blocklist, error)', description: 'Block or unblock a contact' },
    ],
    actions: [
      { name: 'BlocklistChangeActionBlock', value: '"block"', description: 'Block a contact' },
      { name: 'BlocklistChangeActionUnblock', value: '"unblock"', description: 'Unblock a contact' },
    ],
    events: [
      {
        name: 'Blocklist',
        description: 'Dispatched when the blocklist changes (sync from another device)',
        fields: [
          { name: 'Action', type: 'events.BlocklistAction', description: 'Type of action (default/add/remove)' },
          { name: 'DHash', type: 'string', description: 'Hash of the blocklist' },
          { name: 'JIDs', type: '[]types.JID', description: 'Affected JIDs' },
        ],
      },
      {
        name: 'BlocklistChange',
        description: 'Dispatched when a specific contact is blocked/unblocked',
        fields: [
          { name: 'JID', type: 'types.JID', description: 'The blocked/unblocked contact' },
          { name: 'Action', type: 'BlocklistChangeAction', description: 'Block or unblock' },
        ],
      },
    ],
  },
  settingsStruct: {
    goType: 'types.PrivacySettings',
    fields: [
      { name: 'GroupAdd', type: 'PrivacySetting', description: 'Who can add you to groups' },
      { name: 'LastSeen', type: 'PrivacySetting', description: 'Who can see last seen' },
      { name: 'Status', type: 'PrivacySetting', description: 'Who can see status' },
      { name: 'Profile', type: 'PrivacySetting', description: 'Who can see profile pic' },
      { name: 'ReadReceipts', type: 'PrivacySetting', description: 'Read receipts on/off' },
      { name: 'Online', type: 'PrivacySetting', description: 'Online visibility' },
      { name: 'CallAdd', type: 'PrivacySetting', description: 'Who can call' },
      { name: 'Defense', type: 'PrivacySetting', description: 'Silence unknown callers' },
      { name: 'Messages', type: 'PrivacySetting', description: 'Who can message' },
      { name: 'Stickers', type: 'PrivacySetting', description: 'Sticker favorites visibility' },
    ],
  },
  codeExamples: [
    {
      title: 'Get and set privacy',
      code: `settings, err := cli.GetPrivacySettings(ctx)
fmt.Println("Last seen:", settings.LastSeen)
fmt.Println("Online:", settings.Online)

err := cli.SetPrivacySetting(ctx, types.PrivacySettingTypeLastSeen, types.PrivacySettingContacts)`,
    },
    {
      title: 'Manage blocklist',
      code: `blocklist, err := cli.GetBlocklist(ctx)
for _, jid := range blocklist.JIDs {
    fmt.Println("Blocked:", jid)
}

newList, err := cli.UpdateBlocklist(ctx, userJID, events.BlocklistChangeActionBlock)`,
    },
  ],
}

export function getPrivacyTopic(topic: string): Partial<PrivacyReference> {
  switch (topic.toLowerCase()) {
    case 'settings':
    case 'types':
      return { settingTypes: PRIVACY_REFERENCE.settingTypes, settingValues: PRIVACY_REFERENCE.settingValues, settingsStruct: PRIVACY_REFERENCE.settingsStruct }
    case 'methods':
      return { methods: PRIVACY_REFERENCE.methods }
    case 'blocklist':
    case 'block':
      return { blocklist: PRIVACY_REFERENCE.blocklist }
    case 'examples':
      return { codeExamples: PRIVACY_REFERENCE.codeExamples }
    case 'all':
    default:
      return PRIVACY_REFERENCE
  }
}
