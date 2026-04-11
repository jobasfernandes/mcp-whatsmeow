export interface QRFlowInfo {
  getQRChannel: {
    signature: string
    description: string
    timing: string
    channelEvents: { name: string; description: string }[]
  }
  qrChannelItem: {
    goStruct: string
    fields: { name: string; type: string; description: string }[]
  }
  codePattern: string
}

export interface PairPhoneInfo {
  signature: string
  description: string
  codeFormat: string
  timeout: string
  crypto: string[]
  clientTypes: { name: string; value: string; description: string }[]
}

export interface NoiseInfo {
  protocol: string
  description: string
  handshakeTimeout: string
  certKey: string
  steps: string[]
}

export interface ReconnectInfo {
  fields: { name: string; type: string; description: string }[]
  streamErrors: { code: string; action: string }[]
  backoffStrategy: string
}

export interface KeepaliveInfo {
  constants: { name: string; value: string; description: string }[]
  behavior: string[]
}

export interface ProxyInfo {
  methods: { name: string; signature: string; description: string }[]
  options: { name: string; type: string; description: string }[]
  httpClients: { name: string; signature: string; description: string }[]
}

export interface ConnectionReference {
  qrFlow: QRFlowInfo
  pairPhone: PairPhoneInfo
  noise: NoiseInfo
  reconnect: ReconnectInfo
  keepalive: KeepaliveInfo
  proxy: ProxyInfo
}

export const CONNECTION_REFERENCE: ConnectionReference = {
  qrFlow: {
    getQRChannel: {
      signature: 'func (cli *Client) GetQRChannel(ctx context.Context) (<-chan QRChannelItem, error)',
      description: 'Returns a channel that receives QR code events for pairing. MUST be called BEFORE Connect().',
      timing: 'First QR: 60s timeout. Subsequent QRs: 20s each. Total ~160s before giving up.',
      channelEvents: [
        { name: 'QRChannelSuccess', description: 'Pairing successful — QR was scanned and accepted' },
        { name: 'QRChannelTimeout', description: 'QR expired without being scanned' },
        { name: 'QRChannelErrUnexpectedEvent', description: 'Unexpected event received during QR flow' },
        { name: 'QRChannelClientOutdated', description: 'Client version too old, needs update' },
        { name: 'QRChannelScannedWithoutMultidevice', description: 'QR scanned but phone does not support multi-device' },
      ],
    },
    qrChannelItem: {
      goStruct: 'QRChannelItem',
      fields: [
        { name: 'Event', type: 'string', description: 'Event type (QRChannelSuccess, QRChannelTimeout, etc.)' },
        { name: 'Code', type: 'string', description: 'QR code string data (only when Event is "code")' },
        { name: 'Error', type: 'error', description: 'Error details when applicable' },
      ],
    },
    codePattern: `qrChan, err := cli.GetQRChannel(ctx)
if err != nil {
    if !errors.Is(err, whatsmeow.ErrQRStoreContainsID) {
        log.Fatal("Failed to get QR channel:", err)
    }
} else {
    go func() {
        for evt := range qrChan {
            if evt.Event == "code" {
                qrterminal.GenerateHalfBlock(evt.Code, qrterminal.L, os.Stdout)
            } else {
                log.Println("QR event:", evt.Event)
            }
        }
    }()
}
err = cli.Connect()`,
  },
  pairPhone: {
    signature: 'func (cli *Client) PairPhone(ctx context.Context, phone string, showPushNotification bool, clientType PairClientType, clientDisplayName string) (string, error)',
    description: 'Pair by entering a code on the phone instead of scanning QR. Returns "XXXX-XXXX" format code.',
    codeFormat: '"XXXX-XXXX" — 8-digit code split into two groups',
    timeout: '160 seconds before the code expires',
    crypto: [
      'X25519 ephemeral key exchange',
      'PBKDF2 with 131072 iterations for key derivation',
      'AES-CTR encryption for the pairing payload',
    ],
    clientTypes: [
      { name: 'PairClientChrome', value: '0', description: 'Chrome browser client' },
      { name: 'PairClientEdge', value: '1', description: 'Edge browser client' },
      { name: 'PairClientFirefox', value: '2', description: 'Firefox browser client' },
      { name: 'PairClientIE', value: '3', description: 'Internet Explorer client' },
      { name: 'PairClientOpera', value: '4', description: 'Opera browser client' },
      { name: 'PairClientSafari', value: '5', description: 'Safari browser client' },
      { name: 'PairClientElectron', value: '6', description: 'Electron desktop app' },
      { name: 'PairClientUWP', value: '7', description: 'Universal Windows Platform' },
      { name: 'PairClientOtherWebClient', value: '8', description: 'Other web-based client' },
      { name: 'PairClientUnknown', value: '9', description: 'Unknown client type' },
    ],
  },
  noise: {
    protocol: 'Noise_XX_25519_AESGCM_SHA256',
    description: 'WhatsApp uses the Noise Protocol Framework for the initial TLS-like handshake over WebSocket.',
    handshakeTimeout: '20 seconds (NoiseHandshakeResponseTimeout)',
    certKey: 'WACertPubKey — Ed25519 static key used to verify WhatsApp server identity',
    steps: [
      '1. Client generates ephemeral X25519 keypair',
      '2. Client sends ClientHello with ephemeral public key',
      '3. Server responds with ServerHello (ephemeral + static keys + certificate)',
      '4. Client verifies server certificate against WACertPubKey',
      '5. Client sends ClientFinish with static key + payload (noise encrypted)',
      '6. Symmetric session keys derived — all further frames are Noise-encrypted',
    ],
  },
  reconnect: {
    fields: [
      { name: 'EnableAutoReconnect', type: 'bool', description: 'Enable automatic reconnection after disconnection (default: false)' },
      { name: 'AutoReconnectHook', type: 'func(error) bool', description: 'Hook called before auto-reconnect, return false to prevent reconnect' },
    ],
    streamErrors: [
      { code: '515', action: 'Reconnect — server requested restart' },
      { code: '401', action: 'Logged out — device removed, clear session and re-pair' },
      { code: 'replaced', action: 'StreamReplaced — another client connected with same session' },
      { code: 'conflict', action: 'Stream conflict — device conflict detected' },
    ],
    backoffStrategy: 'Linear backoff: delay = errorCount * 2 seconds. Resets on successful connection.',
  },
  keepalive: {
    constants: [
      { name: 'KeepAliveIntervalMin', value: '20 * time.Second', description: 'Minimum interval between keepalive pings' },
      { name: 'KeepAliveIntervalMax', value: '30 * time.Second', description: 'Maximum interval between keepalive pings' },
      { name: 'KeepAliveResponseDeadline', value: '10 * time.Second', description: 'Maximum time to wait for keepalive response' },
      { name: 'KeepAliveMaxFailTime', value: '3 * time.Minute', description: 'Maximum cumulative failure time before force reconnect' },
    ],
    behavior: [
      'Random interval between 20-30s for each ping',
      'Sends <iq type="get" xmlns="w:p"> keepalive ping',
      'If no response within 10s, failure time accumulates',
      'If cumulative failure exceeds 3min, connection is force-closed',
      'On success, failure timer resets to zero',
    ],
  },
  proxy: {
    methods: [
      { name: 'SetProxyAddress', signature: 'func (cli *Client) SetProxyAddress(addr string, opts ...SetProxyOptions) error', description: 'Set proxy by URL string (http, https, socks5 schemes)' },
      { name: 'SetProxy', signature: 'func (cli *Client) SetProxy(proxy Proxy, opts ...SetProxyOptions)', description: 'Set proxy using Proxy interface implementation' },
      { name: 'SetSOCKSProxy', signature: 'func (cli *Client) SetSOCKSProxy(px proxy.Dialer, opts ...SetProxyOptions)', description: 'Set SOCKS proxy using proxy.Dialer' },
    ],
    options: [
      { name: 'NoWebsocket', type: 'bool', description: 'Do not proxy WebSocket connections' },
      { name: 'OnlyLogin', type: 'bool', description: 'Only use proxy during login/pairing' },
      { name: 'NoMedia', type: 'bool', description: 'Do not proxy media upload/download' },
    ],
    httpClients: [
      { name: 'SetMediaHTTPClient', signature: 'func (cli *Client) SetMediaHTTPClient(h *http.Client)', description: 'Override HTTP client for media (overwrites proxy)' },
      { name: 'SetPreLoginHTTPClient', signature: 'func (cli *Client) SetPreLoginHTTPClient(h *http.Client)', description: 'Override HTTP client for pre-login websocket' },
      { name: 'SetWebsocketHTTPClient', signature: 'func (cli *Client) SetWebsocketHTTPClient(h *http.Client)', description: 'Override HTTP client for logged-in websocket' },
    ],
  },
}

export function getConnectionTopic(topic: string): Partial<ConnectionReference> {
  switch (topic.toLowerCase()) {
    case 'qr':
    case 'qrcode':
      return { qrFlow: CONNECTION_REFERENCE.qrFlow }
    case 'pairphone':
    case 'pair':
    case 'phone':
      return { pairPhone: CONNECTION_REFERENCE.pairPhone }
    case 'noise':
    case 'handshake':
      return { noise: CONNECTION_REFERENCE.noise }
    case 'reconnect':
    case 'auto':
      return { reconnect: CONNECTION_REFERENCE.reconnect }
    case 'keepalive':
    case 'ping':
      return { keepalive: CONNECTION_REFERENCE.keepalive }
    case 'proxy':
      return { proxy: CONNECTION_REFERENCE.proxy }
    case 'all':
    default:
      return CONNECTION_REFERENCE
  }
}
