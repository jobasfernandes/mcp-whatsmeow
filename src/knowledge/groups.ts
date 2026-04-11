export interface GroupMethodInfo {
  name: string
  signature: string
  description: string
}

export interface GroupTypeInfo {
  name: string
  goType: string
  fields: { name: string; type: string; description: string }[]
}

export interface GroupEventInfo {
  name: string
  description: string
  fields: { name: string; type: string; description: string }[]
}

export interface GroupReference {
  overview: string
  methods: {
    creation: GroupMethodInfo[]
    info: GroupMethodInfo[]
    settings: GroupMethodInfo[]
    participants: GroupMethodInfo[]
    invites: GroupMethodInfo[]
    community: GroupMethodInfo[]
  }
  types: GroupTypeInfo[]
  participantChanges: { name: string; value: string; description: string }[]
  memberAddModes: { name: string; value: string; description: string }[]
  events: GroupEventInfo[]
  communityNotes: string[]
  codeExamples: { title: string; code: string }[]
}

export const GROUPS_REFERENCE: GroupReference = {
  overview: 'WhatsApp groups are identified by JIDs in the format <id>@g.us. Communities are parent groups (GroupParent.IsParent=true) with sub-groups linked via GroupLinkedParent. Groups support up to 1024 participants, multiple admins, and configurable permissions.',
  methods: {
    creation: [
      { name: 'CreateGroup', signature: 'func (cli *Client) CreateGroup(ctx context.Context, req ReqCreateGroup) (*types.GroupInfo, error)', description: 'Create a new group, community, or sub-group' },
    ],
    info: [
      { name: 'GetGroupInfo', signature: 'func (cli *Client) GetGroupInfo(ctx context.Context, jid types.JID) (*types.GroupInfo, error)', description: 'Get full group info and participant list' },
      { name: 'GetGroupInfoFromLink', signature: 'func (cli *Client) GetGroupInfoFromLink(ctx context.Context, code string) (*types.GroupInfo, error)', description: 'Get group info from invite link code' },
      { name: 'GetJoinedGroups', signature: 'func (cli *Client) GetJoinedGroups(ctx context.Context) ([]*types.GroupInfo, error)', description: 'Get all groups the user is a member of' },
      { name: 'GetGroupRequestParticipants', signature: 'func (cli *Client) GetGroupRequestParticipants(ctx context.Context, jid types.JID) ([]types.JID, error)', description: 'Get pending join requests for a group' },
    ],
    settings: [
      { name: 'SetGroupName', signature: 'func (cli *Client) SetGroupName(ctx context.Context, jid types.JID, name string) error', description: 'Change group name/subject' },
      { name: 'SetGroupTopic', signature: 'func (cli *Client) SetGroupTopic(ctx context.Context, jid types.JID, previousID, newID, topic string) error', description: 'Change group description/topic' },
      { name: 'SetGroupLocked', signature: 'func (cli *Client) SetGroupLocked(ctx context.Context, jid types.JID, locked bool) error', description: 'Lock group (only admins can edit info)' },
      { name: 'SetGroupAnnounce', signature: 'func (cli *Client) SetGroupAnnounce(ctx context.Context, jid types.JID, announce bool) error', description: 'Set announce mode (only admins can send messages)' },
      { name: 'SetGroupPhoto', signature: 'func (cli *Client) SetGroupPhoto(ctx context.Context, jid types.JID, avatar []byte) (*types.ProfilePictureInfo, error)', description: 'Set group profile picture' },
      { name: 'SetDisappearingTimer', signature: 'func (cli *Client) SetDisappearingTimer(ctx context.Context, jid types.JID, timer time.Duration) error', description: 'Set disappearing message timer for group' },
      { name: 'SetGroupMemberAddMode', signature: 'func (cli *Client) SetGroupMemberAddMode(ctx context.Context, jid types.JID, mode types.GroupMemberAddMode) error', description: 'Set who can add members (admin or all)' },
    ],
    participants: [
      { name: 'UpdateGroupParticipants', signature: 'func (cli *Client) UpdateGroupParticipants(ctx context.Context, jid types.JID, participantChanges []types.JID, action ParticipantChange) ([]types.GroupParticipant, error)', description: 'Add/remove/promote/demote participants' },
      { name: 'GetGroupRequestParticipants', signature: 'func (cli *Client) GetGroupRequestParticipants(ctx context.Context, jid types.JID) ([]types.JID, error)', description: 'List pending join requests' },
      { name: 'UpdateGroupRequestParticipants', signature: 'func (cli *Client) UpdateGroupRequestParticipants(ctx context.Context, jid types.JID, participantChanges []types.JID, action ParticipantRequestChange) ([]types.JID, error)', description: 'Approve or reject join requests' },
    ],
    invites: [
      { name: 'GetGroupInviteLink', signature: 'func (cli *Client) GetGroupInviteLink(ctx context.Context, jid types.JID, reset bool) (string, error)', description: 'Get group invite link (reset=true to revoke and generate new)' },
      { name: 'JoinGroupWithLink', signature: 'func (cli *Client) JoinGroupWithLink(ctx context.Context, code string) (types.JID, error)', description: 'Join a group using invite link code' },
      { name: 'JoinGroupWithInvite', signature: 'func (cli *Client) JoinGroupWithInvite(ctx context.Context, jid, inviterJID types.JID, code string, expiration int64) error', description: 'Accept a group invite from a specific inviter' },
      { name: 'LeaveGroup', signature: 'func (cli *Client) LeaveGroup(ctx context.Context, jid types.JID) error', description: 'Leave a group' },
    ],
    community: [
      { name: 'GetSubGroups', signature: 'func (cli *Client) GetSubGroups(ctx context.Context, community types.JID) ([]*types.GroupLinkTarget, error)', description: 'Get sub-groups of a community' },
      { name: 'GetLinkedGroupsParticipants', signature: 'func (cli *Client) GetLinkedGroupsParticipants(ctx context.Context, community types.JID) ([]types.JID, error)', description: 'Get all participants across community sub-groups' },
      { name: 'LinkGroup', signature: 'func (cli *Client) LinkGroup(ctx context.Context, community, child types.JID) error', description: 'Link an existing group to a community' },
      { name: 'UnlinkGroup', signature: 'func (cli *Client) UnlinkGroup(ctx context.Context, community, child types.JID) error', description: 'Unlink a group from a community' },
    ],
  },
  types: [
    {
      name: 'GroupInfo',
      goType: 'types.GroupInfo',
      fields: [
        { name: 'JID', type: 'types.JID', description: 'Group JID' },
        { name: 'OwnerJID', type: 'types.JID', description: 'Group creator JID' },
        { name: 'GroupName', type: 'types.GroupName', description: 'Group name with metadata' },
        { name: 'GroupTopic', type: 'types.GroupTopic', description: 'Group description/topic' },
        { name: 'GroupLocked', type: 'types.GroupLocked', description: 'Whether only admins can edit info' },
        { name: 'GroupAnnounce', type: 'types.GroupAnnounce', description: 'Whether only admins can send messages' },
        { name: 'GroupEphemeral', type: 'types.GroupEphemeral', description: 'Disappearing messages timer' },
        { name: 'GroupCreated', type: 'time.Time', description: 'Group creation timestamp' },
        { name: 'Participants', type: '[]types.GroupParticipant', description: 'List of participants' },
        { name: 'MemberAddMode', type: 'types.GroupMemberAddMode', description: 'Who can add members' },
        { name: 'GroupParent', type: 'types.GroupParent', description: 'Community parent info' },
        { name: 'GroupLinkedParent', type: 'types.GroupLinkedParent', description: 'Linked parent community JID' },
        { name: 'IsIncognito', type: 'bool', description: 'Whether group is in incognito mode' },
      ],
    },
    {
      name: 'GroupParticipant',
      goType: 'types.GroupParticipant',
      fields: [
        { name: 'JID', type: 'types.JID', description: 'Participant JID' },
        { name: 'LID', type: 'types.JID', description: 'Linked identity JID' },
        { name: 'IsAdmin', type: 'bool', description: 'Whether participant is admin' },
        { name: 'IsSuperAdmin', type: 'bool', description: 'Whether participant is superadmin (group creator)' },
        { name: 'DisplayName', type: 'string', description: 'Display name in group' },
        { name: 'Error', type: 'int', description: 'Error code for participant (e.g., 403=not in contacts)' },
        { name: 'AddRequest', type: '*GroupParticipantAddRequest', description: 'Pending add request info' },
      ],
    },
    {
      name: 'ReqCreateGroup',
      goType: 'whatsmeow.ReqCreateGroup',
      fields: [
        { name: 'Name', type: 'string', description: 'Group name (required)' },
        { name: 'Participants', type: '[]types.JID', description: 'Initial participants' },
        { name: 'GroupParent', type: 'types.GroupParent', description: 'Set IsParent=true for community' },
        { name: 'GroupLinkedParent', type: 'types.GroupLinkedParent', description: 'Link to community (for sub-groups)' },
        { name: 'CreateKey', type: 'types.MessageID', description: 'Custom create key (optional)' },
      ],
    },
    {
      name: 'GroupParent',
      goType: 'types.GroupParent',
      fields: [
        { name: 'IsParent', type: 'bool', description: 'Whether this is a community parent group' },
        { name: 'DefaultMembershipApprovalMode', type: 'string', description: 'Default approval mode for new members' },
      ],
    },
  ],
  participantChanges: [
    { name: 'ParticipantChangeAdd', value: '"add"', description: 'Add participant to group' },
    { name: 'ParticipantChangeRemove', value: '"remove"', description: 'Remove participant from group' },
    { name: 'ParticipantChangePromote', value: '"promote"', description: 'Promote participant to admin' },
    { name: 'ParticipantChangeDemote', value: '"demote"', description: 'Demote participant from admin' },
  ],
  memberAddModes: [
    { name: 'GroupMemberAddModeAdmin', value: '"admin_add"', description: 'Only admins can add members' },
    { name: 'GroupMemberAddModeAllMember', value: '"all_member_add"', description: 'All members can add others' },
  ],
  events: [
    {
      name: 'JoinedGroup',
      description: 'Dispatched when the user is added to a group',
      fields: [
        { name: 'Reason', type: 'string', description: 'How the user was added (invite, link, etc.)' },
        { name: 'GroupInfo', type: 'types.GroupInfo', description: 'Full group info' },
      ],
    },
    {
      name: 'GroupInfo',
      description: 'Dispatched when group metadata changes (name, topic, settings)',
      fields: [
        { name: 'JID', type: 'types.JID', description: 'Group JID' },
        { name: 'Notify', type: 'string', description: 'Change notification text' },
        { name: 'Sender', type: '*types.JID', description: 'Who made the change' },
        { name: 'Name', type: '*types.GroupName', description: 'New group name (if changed)' },
        { name: 'Topic', type: '*types.GroupTopic', description: 'New topic (if changed)' },
        { name: 'Locked', type: '*types.GroupLocked', description: 'New locked state (if changed)' },
        { name: 'Announce', type: '*types.GroupAnnounce', description: 'New announce state (if changed)' },
        { name: 'Ephemeral', type: '*types.GroupEphemeral', description: 'New ephemeral timer (if changed)' },
        { name: 'Join', type: '[]types.JID', description: 'JIDs that joined' },
        { name: 'Leave', type: '[]types.JID', description: 'JIDs that left' },
        { name: 'Promote', type: '[]types.JID', description: 'JIDs promoted to admin' },
        { name: 'Demote', type: '[]types.JID', description: 'JIDs demoted from admin' },
      ],
    },
  ],
  communityNotes: [
    'Community = parent group with GroupParent.IsParent = true',
    'Sub-groups reference parent via GroupLinkedParent.LinkedParentJID',
    'Default announcement group is auto-created with community',
    'GetSubGroups returns all linked sub-groups',
    'GetLinkedGroupsParticipants aggregates all participants across sub-groups',
    'LinkGroup/UnlinkGroup manage community-subgroup relationships',
  ],
  codeExamples: [
    {
      title: 'Create regular group',
      code: `info, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:         "My Group",
    Participants: []types.JID{user1JID, user2JID},
})`,
    },
    {
      title: 'Create community with sub-group',
      code: `community, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:        "My Community",
    Participants: []types.JID{user1JID},
    GroupParent:  types.GroupParent{IsParent: true},
})

sub, err := cli.CreateGroup(ctx, whatsmeow.ReqCreateGroup{
    Name:             "Sub Channel",
    GroupLinkedParent: types.GroupLinkedParent{LinkedParentJID: community.JID},
})`,
    },
    {
      title: 'Manage participants',
      code: `_, err := cli.UpdateGroupParticipants(ctx, groupJID,
    []types.JID{userJID},
    whatsmeow.ParticipantChangeAdd,
)

_, err := cli.UpdateGroupParticipants(ctx, groupJID,
    []types.JID{userJID},
    whatsmeow.ParticipantChangePromote,
)`,
    },
    {
      title: 'Invite links',
      code: `link, err := cli.GetGroupInviteLink(ctx, groupJID, false)
groupJID, err := cli.JoinGroupWithLink(ctx, "AbCdEfGhIjK")`,
    },
  ],
}

export function getGroupsTopic(topic: string): Partial<GroupReference> {
  switch (topic.toLowerCase()) {
    case 'methods':
    case 'creation':
      return { methods: GROUPS_REFERENCE.methods }
    case 'types':
      return { types: GROUPS_REFERENCE.types, participantChanges: GROUPS_REFERENCE.participantChanges, memberAddModes: GROUPS_REFERENCE.memberAddModes }
    case 'events':
      return { events: GROUPS_REFERENCE.events }
    case 'community':
    case 'communities':
      return { methods: { creation: GROUPS_REFERENCE.methods.creation, info: [], settings: [], participants: [], invites: [], community: GROUPS_REFERENCE.methods.community }, communityNotes: GROUPS_REFERENCE.communityNotes }
    case 'participants':
      return { methods: { creation: [], info: [], settings: [], participants: GROUPS_REFERENCE.methods.participants, invites: [], community: [] }, participantChanges: GROUPS_REFERENCE.participantChanges }
    case 'invites':
      return { methods: { creation: [], info: [], settings: [], participants: [], invites: GROUPS_REFERENCE.methods.invites, community: [] } }
    case 'examples':
      return { codeExamples: GROUPS_REFERENCE.codeExamples }
    case 'all':
    default:
      return GROUPS_REFERENCE
  }
}
