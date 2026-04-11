export interface MediaTypeInfo {
  constant: string
  hkdfInfo: string
  usage: string
}

export interface MediaEncryptionStep {
  step: number
  description: string
  detail: string
}

export interface MediaMethodInfo {
  name: string
  signature: string
  description: string
}

export interface MediaReference {
  overview: string
  mediaTypes: MediaTypeInfo[]
  encryption: {
    steps: MediaEncryptionStep[]
    downloadableInterface: { name: string; type: string; description: string }[]
  }
  download: {
    methods: MediaMethodInfo[]
    retryFlow: string
    errorCodes: { code: string; meaning: string; action: string }[]
  }
  upload: {
    methods: MediaMethodInfo[]
    responseFields: { name: string; type: string; description: string }[]
    newsletterDifferences: string[]
  }
  thumbnails: {
    generation: string
    methods: MediaMethodInfo[]
  }
  sticker: {
    format: string
    maxSizeStatic: string
    maxSizeAnimated: string
    dimensions: string
    mimeType: string
  }
  cdn: {
    hosts: string[]
    pathFormat: string
    authParams: string
  }
  codeExamples: { title: string; code: string }[]
}

export const MEDIA_REFERENCE: MediaReference = {
  overview: 'All WhatsApp media (images, videos, documents, audio) is end-to-end encrypted before upload using AES-256-CBC with HKDF-derived keys. Each media type has its own HKDF info string. Media is uploaded to WhatsApp CDN and referenced by URL + encryption keys in the message protobuf.',
  mediaTypes: [
    { constant: 'MediaImage', hkdfInfo: '"WhatsApp Image Keys"', usage: 'JPEG/PNG images and stickers' },
    { constant: 'MediaVideo', hkdfInfo: '"WhatsApp Video Keys"', usage: 'MP4 videos and PTV (push-to-talk video)' },
    { constant: 'MediaAudio', hkdfInfo: '"WhatsApp Audio Keys"', usage: 'OGG/Opus audio and voice notes' },
    { constant: 'MediaDocument', hkdfInfo: '"WhatsApp Document Keys"', usage: 'PDF, DOC, any file type' },
    { constant: 'MediaHistory', hkdfInfo: '"WhatsApp History Keys"', usage: 'History sync blobs' },
    { constant: 'MediaAppState', hkdfInfo: '"WhatsApp App State Keys"', usage: 'App state sync blobs' },
    { constant: 'MediaStickerPack', hkdfInfo: '"WhatsApp Sticker Pack Keys"', usage: 'Sticker pack data' },
    { constant: 'MediaLinkThumbnail', hkdfInfo: '"WhatsApp Link Thumbnail Keys"', usage: 'Link preview thumbnails' },
  ],
  encryption: {
    steps: [
      { step: 1, description: 'Key Generation', detail: '32-byte random mediaKey' },
      { step: 2, description: 'HKDF Expansion', detail: 'mediaKey expanded to 112 bytes via SHA-256 HKDF: IV (0-15), CipherKey (16-47), MACKey (48-79), RefKey (80-111)' },
      { step: 3, description: 'Encryption', detail: 'AES-256-CBC with PKCS7 padding using CipherKey and IV' },
      { step: 4, description: 'MAC', detail: 'HMAC-SHA256(MACKey, IV + CipherText), truncated to 10 bytes' },
      { step: 5, description: 'Final Blob', detail: 'CipherText + MAC (10 bytes) — uploaded to CDN' },
    ],
    downloadableInterface: [
      { name: 'GetDirectPath', type: '() string', description: 'CDN path for download' },
      { name: 'GetMediaKey', type: '() []byte', description: '32-byte media encryption key' },
      { name: 'GetFileSHA256', type: '() []byte', description: 'SHA-256 of decrypted file' },
      { name: 'GetFileEncSHA256', type: '() []byte', description: 'SHA-256 of encrypted blob' },
    ],
  },
  download: {
    methods: [
      { name: 'Download', signature: 'func (cli *Client) Download(ctx context.Context, msg DownloadableMessage) ([]byte, error)', description: 'Download and decrypt media from a message' },
      { name: 'DownloadAny', signature: 'func (cli *Client) DownloadAny(ctx context.Context, msg *waE2E.Message) ([]byte, error)', description: 'Auto-detect media type and download from any message' },
      { name: 'DownloadToFile', signature: 'func (cli *Client) DownloadToFile(ctx context.Context, msg DownloadableMessage, file *os.File) error', description: 'Download and decrypt media directly to file (streaming)' },
      { name: 'DownloadMediaWithPath', signature: 'func (cli *Client) DownloadMediaWithPath(ctx context.Context, directPath string, encFileHash, fileHash, mediaKey []byte, fileLength int, mediaType MediaType, mmsType string) ([]byte, error)', description: 'Download media with explicit parameters (no message required)' },
      { name: 'DownloadFull', signature: 'func (cli *Client) DownloadFull(ctx context.Context, url string, mediaKey []byte, appInfo MediaType, fileLength int, encFileHash, fileHash []byte) ([]byte, error)', description: 'Download from explicit URL with full parameters' },
    ],
    retryFlow: 'When download returns 404/410 (media expired on CDN), send a retry receipt to request re-upload:\ncli.SendMediaRetryReceipt(ctx, msg.Info, mediaKey)\nThen listen for events.MediaRetry event with re-encrypted URL.',
    errorCodes: [
      { code: '404', meaning: 'Media not found on CDN', action: 'Send media retry receipt' },
      { code: '410', meaning: 'Media expired/deleted from CDN', action: 'Send media retry receipt' },
      { code: 'HMAC mismatch', meaning: 'Integrity check failed', action: 'Re-download or request retry' },
      { code: 'SHA256 mismatch', meaning: 'File corrupted during transfer', action: 'Re-download' },
    ],
  },
  upload: {
    methods: [
      { name: 'Upload', signature: 'func (cli *Client) Upload(ctx context.Context, plaintext []byte, appInfo MediaType) (UploadResponse, error)', description: 'Encrypt and upload media bytes' },
      { name: 'UploadReader', signature: 'func (cli *Client) UploadReader(ctx context.Context, plaintext io.Reader, appInfo MediaType) (UploadResponse, error)', description: 'Encrypt and upload media from reader' },
      { name: 'UploadNewsletter', signature: 'func (cli *Client) UploadNewsletter(ctx context.Context, data []byte, appInfo MediaType) (UploadResponse, error)', description: 'Upload for newsletter (no client-side encryption)' },
      { name: 'UploadNewsletterReader', signature: 'func (cli *Client) UploadNewsletterReader(ctx context.Context, data io.Reader, appInfo MediaType) (UploadResponse, error)', description: 'Upload for newsletter from reader' },
    ],
    responseFields: [
      { name: 'URL', type: 'string', description: 'CDN URL for the uploaded file' },
      { name: 'DirectPath', type: 'string', description: 'Direct CDN path (preferred over URL)' },
      { name: 'MediaKey', type: '[]byte', description: 'Encryption key (needed for recipient to decrypt)' },
      { name: 'FileEncSHA256', type: '[]byte', description: 'SHA-256 of encrypted blob' },
      { name: 'FileSHA256', type: '[]byte', description: 'SHA-256 of original plaintext' },
      { name: 'FileLength', type: 'uint64', description: 'Original file length in bytes' },
      { name: 'Handle', type: 'string', description: 'Server handle for the upload' },
      { name: 'ObjectID', type: 'string', description: 'Object ID on CDN' },
      { name: 'ObjectKey', type: 'string', description: 'Object key on CDN' },
    ],
    newsletterDifferences: [
      'No client-side encryption (server handles storage)',
      'Uses different upload endpoint',
      'DirectPath handled by server, not returned to client',
      'Same MediaType constants apply',
    ],
  },
  thumbnails: {
    generation: 'Thumbnails are generated client-side and included inline in the protobuf message (not uploaded separately). For images: JPEG thumbnail ~150px. For videos: first-frame thumbnail. For stickers: PNG thumbnail.',
    methods: [
      { name: 'GenerateProfilePicture', signature: 'func (cli *Client) GenerateProfilePicture(ctx context.Context, imgBytes []byte) (*types.ProfilePictureInfo, error)', description: 'Generate profile picture from image bytes (crops and resizes)' },
    ],
  },
  sticker: {
    format: 'WebP image (static or animated)',
    maxSizeStatic: '100KB',
    maxSizeAnimated: '500KB',
    dimensions: '512x512 pixels recommended',
    mimeType: 'image/webp',
  },
  cdn: {
    hosts: ['mmg.whatsapp.net'],
    pathFormat: '/v/t62.7118-24/<hash>?...',
    authParams: 'ccb, oh, oe query parameters for CDN auth',
  },
  codeExamples: [
    {
      title: 'Upload and send image',
      code: `resp, err := cli.Upload(ctx, imageBytes, whatsmeow.MediaImage)

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
cli.SendMessage(ctx, recipient, msg)`,
    },
    {
      title: 'Download media from message',
      code: `data, err := cli.Download(ctx, msg.GetImageMessage())
data, err := cli.DownloadAny(ctx, msg.Message)`,
    },
    {
      title: 'Handle expired media (retry)',
      code: `if errors.Is(err, whatsmeow.ErrMediaDownloadFailedWith404) ||
   errors.Is(err, whatsmeow.ErrMediaDownloadFailedWith410) {
    err := cli.SendMediaRetryReceipt(ctx, msg.Info, msg.Message.GetImageMessage().GetMediaKey())
}`,
    },
  ],
}

export function getMediaTopic(topic: string): Partial<MediaReference> {
  switch (topic.toLowerCase()) {
    case 'types':
      return { mediaTypes: MEDIA_REFERENCE.mediaTypes }
    case 'encryption':
    case 'crypto':
      return { encryption: MEDIA_REFERENCE.encryption }
    case 'download':
      return { download: MEDIA_REFERENCE.download }
    case 'upload':
      return { upload: MEDIA_REFERENCE.upload }
    case 'sticker':
    case 'stickers':
      return { sticker: MEDIA_REFERENCE.sticker }
    case 'cdn':
      return { cdn: MEDIA_REFERENCE.cdn }
    case 'thumbnail':
    case 'thumbnails':
      return { thumbnails: MEDIA_REFERENCE.thumbnails }
    case 'examples':
      return { codeExamples: MEDIA_REFERENCE.codeExamples }
    case 'all':
    default:
      return MEDIA_REFERENCE
  }
}
