export interface JidServerInfo {
  name: string
  constant: string
  value: string
  description: string
}

export interface SpecialJidInfo {
  name: string
  constant: string
  user: string
  server: string
  description: string
}

export interface JidUtilityInfo {
  name: string
  signature: string
  description: string
  isMethod: boolean
}

export interface LidMigrationInfo {
  field: string
  type: string
  description: string
}

export interface JidInfo {
  struct: { name: string; fields: { name: string; type: string; description: string }[] }
  servers: JidServerInfo[]
  specialJids: SpecialJidInfo[]
  utilities: JidUtilityInfo[]
  domainTypes: { name: string; value: string; description: string }[]
  lidMigration: LidMigrationInfo[]
}

export const JID_REFERENCE: JidInfo = {
  struct: {
    name: 'types.JID',
    fields: [
      { name: 'User', type: 'string', description: 'The user part of the JID (phone number, group ID, etc.)' },
      { name: 'RawAgent', type: 'uint8', description: 'Domain type (0=WhatsApp, 1=LID, 128=Hosted, 129=HostedLID)' },
      { name: 'Device', type: 'uint16', description: 'Device ID for multi-device (0 = primary)' },
      { name: 'Integrator', type: 'uint16', description: 'Integrator ID for hosted/third-party integrations' },
      { name: 'Server', type: 'string', description: 'Server domain (s.whatsapp.net, g.us, lid, newsletter, etc.)' },
    ],
  },
  servers: [
    { name: 'DefaultUserServer', constant: 'types.DefaultUserServer', value: 's.whatsapp.net', description: 'Standard WhatsApp users — format: <phone>@s.whatsapp.net' },
    { name: 'GroupServer', constant: 'types.GroupServer', value: 'g.us', description: 'Group chats — format: <groupid>@g.us' },
    { name: 'LegacyUserServer', constant: 'types.LegacyUserServer', value: 'c.us', description: 'Legacy user server (deprecated, but still used by some special JIDs)' },
    { name: 'BroadcastServer', constant: 'types.BroadcastServer', value: 'broadcast', description: 'Broadcast lists and status broadcast — format: status@broadcast' },
    { name: 'HiddenUserServer', constant: 'types.HiddenUserServer', value: 'lid', description: 'Linked Identity (LID) — replaces phone-based addressing for privacy' },
    { name: 'MessengerServer', constant: 'types.MessengerServer', value: 'msgr', description: 'Meta Messenger interop users' },
    { name: 'InteropServer', constant: 'types.InteropServer', value: 'interop', description: 'Cross-platform interoperability (DMA compliance)' },
    { name: 'NewsletterServer', constant: 'types.NewsletterServer', value: 'newsletter', description: 'WhatsApp Channels/Newsletters — format: <id>@newsletter' },
    { name: 'HostedServer', constant: 'types.HostedServer', value: 'hosted', description: 'Hosted/third-party integration users' },
    { name: 'HostedLIDServer', constant: 'types.HostedLIDServer', value: 'hosted.lid', description: 'Hosted users with LID addressing' },
    { name: 'BotServer', constant: 'types.BotServer', value: 'bot', description: 'WhatsApp bots (AI assistants) — format: <id>@bot' },
  ],
  specialJids: [
    { name: 'EmptyJID', constant: 'types.EmptyJID', user: '', server: '', description: 'Zero-value JID, used for "no JID" checks' },
    { name: 'GroupServerJID', constant: 'types.GroupServerJID', user: '', server: 'g.us', description: 'Group server sentinel' },
    { name: 'ServerJID', constant: 'types.ServerJID', user: '', server: 's.whatsapp.net', description: 'User server sentinel' },
    { name: 'BroadcastServerJID', constant: 'types.BroadcastServerJID', user: '', server: 'broadcast', description: 'Broadcast server sentinel' },
    { name: 'StatusBroadcastJID', constant: 'types.StatusBroadcastJID', user: 'status', server: 'broadcast', description: 'Status/Stories broadcast address' },
    { name: 'PSAJID', constant: 'types.PSAJID', user: '0', server: 's.whatsapp.net', description: 'WhatsApp official PSA (Public Service Announcement)' },
    { name: 'LegacyPSAJID', constant: 'types.LegacyPSAJID', user: '0', server: 'c.us', description: 'Legacy PSA JID' },
    { name: 'OfficialBusinessJID', constant: 'types.OfficialBusinessJID', user: '16505361212', server: 'c.us', description: 'WhatsApp official business account' },
    { name: 'MetaAIJID', constant: 'types.MetaAIJID', user: '13135550002', server: 's.whatsapp.net', description: 'Meta AI assistant' },
    { name: 'NewMetaAIJID', constant: 'types.NewMetaAIJID', user: '867051314767696', server: 'bot', description: 'New Meta AI on bot server' },
  ],
  utilities: [
    { name: 'NewJID', signature: 'func NewJID(user string, server string) JID', description: 'Create a regular JID from user and server parts', isMethod: false },
    { name: 'NewADJID', signature: 'func NewADJID(user string, agent uint8, device uint8) JID', description: 'Create an AD (agent/device) JID for multi-device', isMethod: false },
    { name: 'ParseJID', signature: 'func ParseJID(jid string) (JID, error)', description: 'Parse a JID string like "user@server" or "user.agent:device@server" into JID struct', isMethod: false },
    { name: 'String', signature: 'func (jid JID) String() string', description: 'Format JID as "user@server" string', isMethod: true },
    { name: 'ADString', signature: 'func (jid JID) ADString() string', description: 'Format JID as full AD string with agent and device', isMethod: true },
    { name: 'ToNonAD', signature: 'func (jid JID) ToNonAD() JID', description: 'Return a copy of the JID without agent/device info', isMethod: true },
    { name: 'IsEmpty', signature: 'func (jid JID) IsEmpty() bool', description: 'Check if the JID has no server (i.e., is the zero-value)', isMethod: true },
    { name: 'IsBroadcastList', signature: 'func (jid JID) IsBroadcastList() bool', description: 'Check if this is a broadcast list (not status broadcast)', isMethod: true },
    { name: 'IsBot', signature: 'func (jid JID) IsBot() bool', description: 'Check if this JID belongs to a bot (regex or BotServer)', isMethod: true },
    { name: 'UserInt', signature: 'func (jid JID) UserInt() uint64', description: 'Parse User field as uint64 (for phone number JIDs)', isMethod: true },
    { name: 'ActualAgent', signature: 'func (jid JID) ActualAgent() uint8', description: 'Return domain type based on server (WhatsAppDomain, LIDDomain, etc.)', isMethod: true },
    { name: 'SignalAddress', signature: 'func (jid JID) SignalAddress() *signalProtocol.SignalAddress', description: 'Convert to Signal protocol address for E2E encryption', isMethod: true },
    { name: 'SignalAddressUser', signature: 'func (jid JID) SignalAddressUser() string', description: 'Return the user identifier for Signal protocol', isMethod: true },
    { name: 'MarshalText', signature: 'func (jid JID) MarshalText() ([]byte, error)', description: 'Implements encoding.TextMarshaler', isMethod: true },
    { name: 'UnmarshalText', signature: 'func (jid *JID) UnmarshalText(val []byte) error', description: 'Implements encoding.TextUnmarshaler', isMethod: true },
    { name: 'Scan', signature: 'func (jid *JID) Scan(src interface{}) error', description: 'Implements sql.Scanner for database reading', isMethod: true },
    { name: 'Value', signature: 'func (jid JID) Value() (driver.Value, error)', description: 'Implements driver.Valuer for database writing', isMethod: true },
  ],
  domainTypes: [
    { name: 'WhatsAppDomain', value: 'uint8(0)', description: 'Standard WhatsApp users (DefaultUserServer, GroupServer)' },
    { name: 'LIDDomain', value: 'uint8(1)', description: 'Linked Identity users (HiddenUserServer)' },
    { name: 'HostedDomain', value: 'uint8(128)', description: 'Hosted/third-party integration users' },
    { name: 'HostedLIDDomain', value: 'uint8(129)', description: 'Hosted users with LID addressing' },
  ],
  lidMigration: [
    { field: 'HiddenUserServer', type: 'string', description: 'Server constant "lid" — the @lid server replaces @s.whatsapp.net for privacy' },
    { field: 'LIDDomain', type: 'uint8(1)', description: 'Domain type for LID JIDs, returned by ActualAgent()' },
    { field: 'LIDStore interface', type: 'store.LIDStore', description: 'Interface for global LID↔PN (Phone Number) mapping with PutLIDMapping/GetLIDByPN/GetPNByLID' },
    { field: 'MigratePNToLID', type: 'sqlstore method', description: 'SQLStore method to migrate phone-number-based data to LID-based addressing' },
    { field: 'CachedLIDMap', type: 'sqlstore/lidmap.go', description: 'In-memory cached implementation of LIDStore with global LID↔PN mappings' },
    { field: 'GroupInfo.AddressingMode', type: 'types.AddressingMode', description: 'Groups may use LID addressing mode — check GroupInfo.AddressingMode' },
    { field: 'MessageSource.SenderAlt', type: 'types.JID', description: 'Alternative sender JID (LID when sender is PN, or vice-versa)' },
  ],
}

export function getJidTopic(topic: string): Partial<JidInfo> {
  switch (topic.toLowerCase()) {
    case 'formats':
    case 'struct':
      return { struct: JID_REFERENCE.struct, servers: JID_REFERENCE.servers, domainTypes: JID_REFERENCE.domainTypes }
    case 'utilities':
    case 'functions':
      return { utilities: JID_REFERENCE.utilities }
    case 'special':
      return { specialJids: JID_REFERENCE.specialJids }
    case 'lid':
    case 'migration':
      return { lidMigration: JID_REFERENCE.lidMigration, domainTypes: JID_REFERENCE.domainTypes }
    case 'all':
    default:
      return JID_REFERENCE
  }
}
