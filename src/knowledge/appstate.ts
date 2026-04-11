export interface AppStateCollectionInfo {
  name: string
  constant: string
  value: string
  description: string
}

export interface AppStateBuilderInfo {
  name: string
  signature: string
  description: string
}

export interface AppStateIndexInfo {
  name: string
  value: string
}

export interface AppStateReference {
  overview: string
  collections: AppStateCollectionInfo[]
  allPatchNamesOrder: string[]
  hkdf: {
    integrity: string
    ltHashSize: number
    description: string
  }
  encoding: {
    encodePatch: string
    patchInfoStruct: { name: string; type: string; description: string }[]
    patchListStruct: { name: string; type: string; description: string }[]
  }
  decoding: {
    parsePatchList: string
    decodePatches: string
    description: string
  }
  builders: AppStateBuilderInfo[]
  indices: AppStateIndexInfo[]
  errors: { name: string; description: string }[]
  conflictHandling: string
  codeExamples: { title: string; code: string }[]
}

export const APPSTATE_REFERENCE: AppStateReference = {
  overview: 'App State is WhatsApp\'s mechanism for syncing settings across devices using patch-based updates. Each collection is a key-value store with LTHash integrity verification. Changes are encoded as patches and broadcast to all devices.',
  collections: [
    { name: 'Critical Block', constant: 'WAPatchCriticalBlock', value: '"critical_block"', description: 'Critical patches that block other operations (contact actions, pin, etc.)' },
    { name: 'Critical Unblock Low', constant: 'WAPatchCriticalUnblockLow', value: '"critical_unblock_low"', description: 'Low-priority critical patches (star, archive, etc.)' },
    { name: 'Regular', constant: 'WAPatchRegular', value: '"regular"', description: 'Regular priority patches (settings, mute, etc.)' },
    { name: 'Regular High', constant: 'WAPatchRegularHigh', value: '"regular_high"', description: 'High-priority regular patches' },
    { name: 'Regular Low', constant: 'WAPatchRegularLow', value: '"regular_low"', description: 'Low-priority regular patches (labels, read markers, etc.)' },
  ],
  allPatchNamesOrder: ['critical_block', 'critical_unblock_low', 'regular_high', 'regular', 'regular_low'],
  hkdf: {
    integrity: 'WAPatchIntegrity = LTHash{[]byte("WhatsApp Patch Integrity"), 128}',
    ltHashSize: 128,
    description: 'LTHash is a homomorphic hash that allows incremental updates. The 128-byte hash is updated by XOR-ing in/out individual entry hashes, enabling O(1) integrity verification per patch without rehashing the entire collection.',
  },
  encoding: {
    encodePatch: 'func (proc *Processor) EncodePatch(ctx context.Context, keyID []byte, state HashState, patchInfo PatchInfo) ([]byte, error)',
    patchInfoStruct: [
      { name: 'Timestamp', type: 'time.Time', description: 'Patch timestamp' },
      { name: 'Type', type: 'WAPatchName', description: 'Collection name' },
      { name: 'MutationInfos', type: '[]MutationInfo', description: 'List of mutations (set/remove)' },
    ],
    patchListStruct: [
      { name: 'Name', type: 'WAPatchName', description: 'Collection name' },
      { name: 'HasMorePatches', type: 'bool', description: 'Whether more patches are available' },
      { name: 'Patches', type: '[]*waServerSync.SyncdPatch', description: 'List of patches' },
      { name: 'Snapshot', type: '*waServerSync.SyncdSnapshot', description: 'Full snapshot if available' },
    ],
  },
  decoding: {
    parsePatchList: 'func (proc *Processor) ParsePatchList(ctx context.Context, pl *PatchList, downloadExternal DownloadExternalFunc) ([]MutationInfo, error)',
    decodePatches: 'func (proc *Processor) DecodePatches(ctx context.Context, list *PatchList, initialState HashState, validateMACs bool) ([]MutationInfo, HashState, error)',
    description: 'ParsePatchList handles downloading external blobs and decoding. DecodePatches verifies MAC integrity and returns mutations with new state.',
  },
  builders: [
    { name: 'BuildMute', signature: 'func BuildMute(target types.JID, mute bool, muteExpiration time.Time) PatchInfo', description: 'Mute/unmute a chat with optional expiration' },
    { name: 'BuildMuteAbs', signature: 'func BuildMuteAbs(target types.JID, mute bool, muteExpiration time.Duration) PatchInfo', description: 'Mute/unmute with absolute duration' },
    { name: 'BuildPin', signature: 'func BuildPin(target types.JID, pin bool) PatchInfo', description: 'Pin or unpin a chat' },
    { name: 'BuildArchive', signature: 'func BuildArchive(target types.JID, archive bool, lastMessageTimestamp time.Time, lastMessageKey *waCommon.MessageKey) PatchInfo', description: 'Archive or unarchive a chat' },
    { name: 'BuildStar', signature: 'func BuildStar(target types.JID, senderJID types.JID, messageID types.MessageID, starred bool) PatchInfo', description: 'Star or unstar a message' },
    { name: 'BuildLabelEdit', signature: 'func BuildLabelEdit(labelID string, labelName string, labelColor int32, deleted bool) PatchInfo', description: 'Create, edit, or delete a label' },
    { name: 'BuildLabelChat', signature: 'func BuildLabelChat(labelID string, target types.JID, labeled bool) PatchInfo', description: 'Associate or dissociate a label with a chat' },
    { name: 'BuildLabelMessage', signature: 'func BuildLabelMessage(labelID string, target types.JID, messageID types.MessageID, labeled bool) PatchInfo', description: 'Associate or dissociate a label with a message' },
    { name: 'BuildMarkChatAsRead', signature: 'func BuildMarkChatAsRead(target types.JID, lastMessageID types.MessageID, read bool) PatchInfo', description: 'Mark a chat as read or unread' },
    { name: 'BuildSettingPushName', signature: 'func BuildSettingPushName(name string) PatchInfo', description: 'Set the user\'s push name (display name)' },
    { name: 'BuildDeleteChat', signature: 'func BuildDeleteChat(target types.JID, lastMessageTimestamp time.Time, lastMessageKey *waCommon.MessageKey) PatchInfo', description: 'Delete a chat' },
  ],
  indices: [
    { name: 'IndexMute', value: '"mute"' },
    { name: 'IndexPin_v1', value: '"pin_v1"' },
    { name: 'IndexArchive', value: '"archive"' },
    { name: 'IndexContact', value: '"contact"' },
    { name: 'IndexClearChat', value: '"clearedChat"' },
    { name: 'IndexDeleteChat', value: '"deleteChat"' },
    { name: 'IndexStar', value: '"star"' },
    { name: 'IndexDeleteMessageForMe', value: '"deleteMessageForMe"' },
    { name: 'IndexMarkChatAsRead', value: '"markChatAsRead"' },
    { name: 'IndexSettingPushName', value: '"setting_pushName"' },
    { name: 'IndexSettingDefaultDisappearingMode', value: '"setting_defaultDisappearingMode"' },
    { name: 'IndexLabelEdit', value: '"label_edit"' },
    { name: 'IndexLabelAssociationChat', value: '"label_jid"' },
    { name: 'IndexLabelAssociationMessage', value: '"label_message"' },
    { name: 'IndexLocale', value: '"setting_locale"' },
    { name: 'IndexPrimaryFeature', value: '"primaryFeature"' },
    { name: 'IndexPinForSecondary', value: '"pinForSecondary"' },
  ],
  errors: [
    { name: 'ErrMissingPreviousSetValueOperation', description: 'Missing previous set value operation in patch chain' },
    { name: 'ErrMismatchingLTHash', description: 'LTHash mismatch — collection integrity compromised' },
    { name: 'ErrMismatchingPatchMAC', description: 'Patch MAC verification failed' },
    { name: 'ErrMismatchingContentMAC', description: 'Content MAC verification failed' },
    { name: 'ErrMismatchingIndexMAC', description: 'Index MAC verification failed' },
    { name: 'ErrKeyNotFound', description: 'AppState sync key not found in store' },
  ],
  conflictHandling: 'When a conflict is detected (error 409), the client must re-fetch the collection snapshot from the server, re-apply local changes on top, and re-submit. The sync processor handles this automatically via FetchAppState with full re-sync.',
  codeExamples: [
    {
      title: 'Mute and pin a chat',
      code: `err := cli.DoPatch(ctx, appstate.BuildMute(
    chatJID, true, time.Now().Add(8*time.Hour),
))

err := cli.DoPatch(ctx, appstate.BuildPin(chatJID, true))`,
    },
    {
      title: 'Set push name',
      code: `err := cli.DoPatch(ctx, appstate.BuildSettingPushName("My Name"))`,
    },
    {
      title: 'Star a message',
      code: `err := cli.DoPatch(ctx, appstate.BuildStar(
    chatJID, senderJID, messageID, true,
))`,
    },
  ],
}

export function getAppStateTopic(topic: string): Partial<AppStateReference> {
  switch (topic.toLowerCase()) {
    case 'collections':
      return { collections: APPSTATE_REFERENCE.collections, allPatchNamesOrder: APPSTATE_REFERENCE.allPatchNamesOrder }
    case 'hkdf':
    case 'lthash':
    case 'integrity':
      return { hkdf: APPSTATE_REFERENCE.hkdf }
    case 'builders':
      return { builders: APPSTATE_REFERENCE.builders }
    case 'indices':
    case 'index':
      return { indices: APPSTATE_REFERENCE.indices }
    case 'encoding':
      return { encoding: APPSTATE_REFERENCE.encoding }
    case 'decoding':
      return { decoding: APPSTATE_REFERENCE.decoding }
    case 'errors':
      return { errors: APPSTATE_REFERENCE.errors, conflictHandling: APPSTATE_REFERENCE.conflictHandling }
    case 'examples':
      return { codeExamples: APPSTATE_REFERENCE.codeExamples }
    case 'all':
    default:
      return APPSTATE_REFERENCE
  }
}
