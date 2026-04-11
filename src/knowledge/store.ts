export interface StoreInterfaceInfo {
  name: string
  goType: string
  description: string
  methods: { name: string; signature: string; description: string }[]
}

export interface StoreAggregateInfo {
  name: string
  goType: string
  includes: string[]
  description: string
}

export interface DeviceFieldInfo {
  name: string
  type: string
  description: string
}

export interface StoreReference {
  overview: string
  interfaces: StoreInterfaceInfo[]
  aggregates: StoreAggregateInfo[]
  device: {
    goType: string
    fields: DeviceFieldInfo[]
  }
  sqlstore: {
    description: string
    constructor: string
    dialects: string[]
    upgradePattern: string
  }
  signalProtocol: {
    description: string
    stores: string[]
  }
  codeExamples: { title: string; code: string }[]
}

export const STORE_REFERENCE: StoreReference = {
  overview: 'The store layer provides persistence interfaces for all client state: Signal protocol keys, app state sync, contacts, chat settings, and privacy tokens. SQLStore is the default implementation using SQLite/Postgres.',
  interfaces: [
    {
      name: 'IdentityStore',
      goType: 'store.IdentityStore',
      description: 'Stores Signal identity keys for contacts (trust-on-first-use)',
      methods: [
        { name: 'PutIdentity', signature: 'PutIdentity(address string, key [32]byte) error', description: 'Store identity key for an address' },
        { name: 'IsTrustedIdentity', signature: 'IsTrustedIdentity(address string, key [32]byte) (bool, error)', description: 'Check if identity key is trusted' },
        { name: 'DeleteAllIdentities', signature: 'DeleteAllIdentities(phone string) error', description: 'Delete all identities for a phone number' },
        { name: 'DeleteIdentity', signature: 'DeleteIdentity(address string) error', description: 'Delete identity for specific address' },
      ],
    },
    {
      name: 'SessionStore',
      goType: 'store.SessionStore',
      description: 'Stores Signal protocol sessions (ratchet state)',
      methods: [
        { name: 'GetSession', signature: 'GetSession(address string) ([]byte, error)', description: 'Load session for an address' },
        { name: 'HasSession', signature: 'HasSession(address string) (bool, error)', description: 'Check if session exists' },
        { name: 'PutSession', signature: 'PutSession(address string, session []byte) error', description: 'Store session data' },
        { name: 'DeleteAllSessions', signature: 'DeleteAllSessions(phone string) error', description: 'Delete all sessions for a phone' },
        { name: 'DeleteSession', signature: 'DeleteSession(address string) error', description: 'Delete specific session' },
      ],
    },
    {
      name: 'PreKeyStore',
      goType: 'store.PreKeyStore',
      description: 'Stores Signal protocol pre-keys (one-time key bundles)',
      methods: [
        { name: 'GetOrGenPreKeys', signature: 'GetOrGenPreKeys(count uint32) ([]*keys.PreKey, error)', description: 'Get or generate pre-keys' },
        { name: 'GenOnePreKey', signature: 'GenOnePreKey() (*keys.PreKey, error)', description: 'Generate a single pre-key' },
        { name: 'GetPreKey', signature: 'GetPreKey(id uint32) (*keys.PreKey, error)', description: 'Get pre-key by ID' },
        { name: 'RemovePreKey', signature: 'RemovePreKey(id uint32) error', description: 'Remove used pre-key' },
        { name: 'MarkPreKeysAsUploaded', signature: 'MarkPreKeysAsUploaded(upToID uint32) error', description: 'Mark pre-keys as uploaded to server' },
        { name: 'UploadedPreKeyCount', signature: 'UploadedPreKeyCount() (int, error)', description: 'Count of uploaded pre-keys' },
      ],
    },
    {
      name: 'SenderKeyStore',
      goType: 'store.SenderKeyStore',
      description: 'Stores Signal sender keys for group messaging',
      methods: [
        { name: 'PutSenderKey', signature: 'PutSenderKey(group, user string, session []byte) error', description: 'Store sender key for group+user' },
        { name: 'GetSenderKey', signature: 'GetSenderKey(group, user string) ([]byte, error)', description: 'Get sender key for group+user' },
      ],
    },
    {
      name: 'AppStateSyncKeyStore',
      goType: 'store.AppStateSyncKeyStore',
      description: 'Stores keys used for app state sync encryption/decryption',
      methods: [
        { name: 'PutAppStateSyncKey', signature: 'PutAppStateSyncKey(id []byte, key store.AppStateSyncKey) error', description: 'Store app state sync key' },
        { name: 'GetAppStateSyncKey', signature: 'GetAppStateSyncKey(id []byte) (*store.AppStateSyncKey, error)', description: 'Get app state sync key by ID' },
        { name: 'GetLatestAppStateSyncKeyID', signature: 'GetLatestAppStateSyncKeyID() ([]byte, error)', description: 'Get the most recent key ID' },
      ],
    },
    {
      name: 'AppStateStore',
      goType: 'store.AppStateStore',
      description: 'Stores app state collection versions and hash states',
      methods: [
        { name: 'PutAppStateVersion', signature: 'PutAppStateVersion(name string, version uint64, hash [128]byte) error', description: 'Store version and LTHash for collection' },
        { name: 'GetAppStateVersion', signature: 'GetAppStateVersion(name string) (uint64, [128]byte, error)', description: 'Get version and LTHash for collection' },
        { name: 'DeleteAppStateVersion', signature: 'DeleteAppStateVersion(name string) error', description: 'Delete collection version (triggers full re-sync)' },
        { name: 'PutAppStateMutationMACs', signature: 'PutAppStateMutationMACs(name string, version uint64, mutations []store.AppStateMutationMAC) error', description: 'Store mutation MACs for conflict resolution' },
        { name: 'DeleteAppStateMutationMACs', signature: 'DeleteAppStateMutationMACs(name string, indexMACs [][]byte) error', description: 'Delete mutation MACs by index' },
        { name: 'GetAppStateMutationMAC', signature: 'GetAppStateMutationMAC(name string, indexMAC []byte) (valueMAC []byte, err error)', description: 'Get specific mutation MAC' },
      ],
    },
    {
      name: 'ContactStore',
      goType: 'store.ContactStore',
      description: 'Stores contact information (names, push names)',
      methods: [
        { name: 'PutContactName', signature: 'PutContactName(user types.JID, fullName, firstName string) error', description: 'Store contact name' },
        { name: 'PutPushName', signature: 'PutPushName(user types.JID, pushName string) (bool, string, error)', description: 'Store push name (returns changed, old name)' },
        { name: 'PutBusinessName', signature: 'PutBusinessName(user types.JID, businessName string) (bool, string, error)', description: 'Store business name' },
        { name: 'PutAllContactNames', signature: 'PutAllContactNames(contacts []store.ContactEntry) error', description: 'Bulk store contacts' },
        { name: 'GetContact', signature: 'GetContact(user types.JID) (types.ContactInfo, error)', description: 'Get contact info' },
        { name: 'GetAllContacts', signature: 'GetAllContacts() (map[types.JID]types.ContactInfo, error)', description: 'Get all contacts' },
      ],
    },
    {
      name: 'ChatSettingsStore',
      goType: 'store.ChatSettingsStore',
      description: 'Stores per-chat settings (mute, pin, archive state from app state sync)',
      methods: [
        { name: 'PutMutedUntil', signature: 'PutMutedUntil(chat types.JID, mutedUntil time.Time) error', description: 'Set mute expiration' },
        { name: 'PutPinned', signature: 'PutPinned(chat types.JID, pinned bool) error', description: 'Set pin state' },
        { name: 'PutArchived', signature: 'PutArchived(chat types.JID, archived bool) error', description: 'Set archive state' },
        { name: 'GetChatSettings', signature: 'GetChatSettings(chat types.JID) (types.LocalChatSettings, error)', description: 'Get all settings for a chat' },
      ],
    },
    {
      name: 'MsgSecretStore',
      goType: 'store.MsgSecretStore',
      description: 'Stores message secrets for media retry decryption',
      methods: [
        { name: 'PutMessageSecret', signature: 'PutMessageSecret(chat, sender types.JID, id types.MessageID, secret []byte) error', description: 'Store message secret' },
        { name: 'GetMessageSecret', signature: 'GetMessageSecret(chat, sender types.JID, id types.MessageID) ([]byte, error)', description: 'Get message secret for retry decryption' },
      ],
    },
    {
      name: 'PrivacyTokenStore',
      goType: 'store.PrivacyTokenStore',
      description: 'Stores privacy tokens for group membership privacy',
      methods: [
        { name: 'PutPrivacyTokens', signature: 'PutPrivacyTokens(tokens ...store.PrivacyToken) error', description: 'Store privacy tokens' },
        { name: 'GetPrivacyToken', signature: 'GetPrivacyToken(user types.JID) (*store.PrivacyToken, error)', description: 'Get privacy token for user' },
      ],
    },
    {
      name: 'LIDStore',
      goType: 'store.LIDStore',
      description: 'Maps between user JIDs and linked identity JIDs (LIDs)',
      methods: [
        { name: 'PutLIDs', signature: 'PutLIDs(lids []store.LIDEntry) error', description: 'Store LID mappings' },
        { name: 'GetLID', signature: 'GetLID(user types.JID) (types.JID, error)', description: 'Get LID for a user JID' },
      ],
    },
  ],
  aggregates: [
    {
      name: 'AllSessionSpecificStores',
      goType: 'store.AllSessionSpecificStores',
      includes: ['IdentityStore', 'SessionStore', 'PreKeyStore', 'SenderKeyStore'],
      description: 'All Signal protocol stores (session-specific, tied to a device)',
    },
    {
      name: 'AllGlobalStores',
      goType: 'store.AllGlobalStores',
      includes: ['AppStateSyncKeyStore', 'AppStateStore', 'ContactStore', 'ChatSettingsStore', 'MsgSecretStore', 'PrivacyTokenStore', 'LIDStore'],
      description: 'All global stores (shared across sessions)',
    },
    {
      name: 'AllStores',
      goType: 'store.AllStores',
      includes: ['AllSessionSpecificStores', 'AllGlobalStores'],
      description: 'Combined interface of all session-specific and global stores',
    },
  ],
  device: {
    goType: 'store.Device',
    fields: [
      { name: 'ID', type: '*types.JID', description: 'Device JID (nil before login)' },
      { name: 'Account', type: '*waProto.ADVSignedDeviceIdentity', description: 'Signed device identity from server' },
      { name: 'Platform', type: 'string', description: 'Platform name (whatsmeow)' },
      { name: 'BusinessName', type: 'string', description: 'Business name if WABiz account' },
      { name: 'PushName', type: 'string', description: 'User\'s display/push name' },
      { name: 'Initialized', type: 'bool', description: 'Whether device init is complete' },
      { name: 'IdentityKey', type: '*keys.KeyPair', description: 'Signal identity key pair' },
      { name: 'SignedPreKey', type: '*keys.PreKey', description: 'Current signed pre-key' },
      { name: 'RegistrationID', type: 'uint32', description: 'Signal registration ID' },
      { name: 'AdvSecretKey', type: '[]byte', description: 'ADV secret key' },
    ],
  },
  sqlstore: {
    description: 'SQLStore implements AllStores using SQL databases. Supports SQLite (go-sqlite3 or modernc) and PostgreSQL.',
    constructor: 'sqlstore.New(dialect, address, log) (*sqlstore.Container, error)',
    dialects: ['sqlite3 (CGo, go-sqlite3)', 'sqlite3 (pure Go, modernc.org/sqlite)', 'postgres (pgx)'],
    upgradePattern: 'Auto-migrations run on New(). Schema versioned with upgrade table. Each interface has its own table(s).',
  },
  signalProtocol: {
    description: 'WhatsApp uses the Signal Double Ratchet protocol for E2E encryption. The store layer provides persistence for all Signal state: identity keys, sessions, pre-keys, and sender keys.',
    stores: [
      'IdentityStore — long-term identity keys (TOFU trust model)',
      'SessionStore — Double Ratchet session state (chain keys, message keys)',
      'PreKeyStore — one-time pre-keys for initial key exchange',
      'SenderKeyStore — sender keys for group messaging (fan-out encryption)',
    ],
  },
  codeExamples: [
    {
      title: 'Initialize SQLStore',
      code: `container, err := sqlstore.New("sqlite3", "file:whatsmeow.db?_foreign_keys=on", nil)
if err != nil {
    log.Fatal(err)
}

device, err := container.GetFirstDevice()
if err != nil {
    log.Fatal(err)
}

cli := whatsmeow.NewClient(device, nil)`,
    },
    {
      title: 'Access contacts',
      code: `contacts, err := cli.Store.Contacts.GetAllContacts()
for jid, info := range contacts {
    fmt.Printf("%s: %s (%s)\n", jid, info.FullName, info.PushName)
}`,
    },
  ],
}

export function getStoreTopic(topic: string): Partial<StoreReference> {
  switch (topic.toLowerCase()) {
    case 'interfaces':
      return { interfaces: STORE_REFERENCE.interfaces }
    case 'aggregates':
      return { aggregates: STORE_REFERENCE.aggregates }
    case 'device':
      return { device: STORE_REFERENCE.device }
    case 'sqlstore':
    case 'sql':
      return { sqlstore: STORE_REFERENCE.sqlstore }
    case 'signal':
      return { signalProtocol: STORE_REFERENCE.signalProtocol }
    case 'examples':
      return { codeExamples: STORE_REFERENCE.codeExamples }
    case 'all':
    default:
      return STORE_REFERENCE
  }
}
