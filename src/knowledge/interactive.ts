export interface InteractiveTypeInfo {
  name: string
  protoName: string
  description: string
  structure: string
  headerTypes?: string[]
  additionalNodesRequired: boolean
  futureProofWrapped: boolean
  sendingPattern: string
  notes: string[]
}

export const INTERACTIVE_TYPES: InteractiveTypeInfo[] = [
  {
    name: 'buttons',
    protoName: 'ButtonsMessage',
    description: 'Quick reply buttons with text content, optional header and footer',
    structure: `type ButtonsMessage struct {
    Header     isButtonsMessage_Header  // oneof: Text, DocumentMessage, ImageMessage, VideoMessage, LocationMessage
    ContentText *string
    FooterText  *string
    ContextInfo *ContextInfo
    Buttons     []*ButtonsMessage_Button
    HeaderType  *ButtonsMessage_HeaderType  // UNKNOWN(0), EMPTY(1), TEXT(2), DOCUMENT(3), IMAGE(4), VIDEO(5), LOCATION(6)
}

type ButtonsMessage_Button struct {
    ButtonId   *string
    ButtonText *ButtonsMessage_Button_ButtonText
    Type       *ButtonsMessage_Button_Type  // UNKNOWN(0), RESPONSE(1), NATIVE_FLOW(2)
    NativeFlowInfo *ButtonsMessage_Button_NativeFlowInfo
}

type ButtonsMessage_Button_ButtonText struct {
    DisplayText *string
}`,
    headerTypes: ['UNKNOWN', 'EMPTY', 'TEXT', 'DOCUMENT', 'IMAGE', 'VIDEO', 'LOCATION'],
    additionalNodesRequired: true,
    futureProofWrapped: false,
    sendingPattern: `msg := &waE2E.Message{ButtonsMessage: &waE2E.ButtonsMessage{
    ContentText: proto.String("Choose an option:"),
    FooterText:  proto.String("Powered by bot"),
    HeaderType:  waE2E.ButtonsMessage_EMPTY.Enum(),
    Buttons: []*waE2E.ButtonsMessage_Button{
        {
            ButtonId:   proto.String("btn1"),
            ButtonText: &waE2E.ButtonsMessage_Button_ButtonText{DisplayText: proto.String("Option 1")},
            Type:       waE2E.ButtonsMessage_Button_RESPONSE.Enum(),
        },
        {
            ButtonId:   proto.String("btn2"),
            ButtonText: &waE2E.ButtonsMessage_Button_ButtonText{DisplayText: proto.String("Option 2")},
            Type:       waE2E.ButtonsMessage_Button_RESPONSE.Enum(),
        },
    },
}}
extra := whatsmeow.SendRequestExtra{
    AdditionalNodes: &[]waBinary.Node{{
        Tag: "biz",
        Content: []waBinary.Node{{
            Tag:   "interactive",
            Attrs: waBinary.Attrs{"type": "buttons", "v": "2"},
        }},
    }},
}
cli.SendMessage(ctx, recipient, msg, extra)`,
    notes: [
      'CRITICAL: AdditionalNodes are REQUIRED — buttons silently fail without the <biz> XML node',
      'Maximum 3 buttons per message',
      'Button type RESPONSE is for quick reply, NATIVE_FLOW for advanced flows',
      'Response comes as ButtonsResponseMessage (field 43)',
    ],
  },
  {
    name: 'list',
    protoName: 'ListMessage',
    description: 'Expandable list menu with sections and selectable rows',
    structure: `type ListMessage struct {
    Title           *string
    Description     *string
    ButtonText      *string
    ListType        *ListMessage_ListType  // UNKNOWN(0), SINGLE_SELECT(1), PRODUCT_LIST(2)
    Sections        []*ListMessage_Section
    ProductListInfo *ListMessage_ProductListInfo
    FooterText      *string
    ContextInfo     *ContextInfo
}

type ListMessage_Section struct {
    Title *string
    Rows  []*ListMessage_Row
}

type ListMessage_Row struct {
    Title       *string
    Description *string
    RowId       *string
}

type ListMessage_ProductListInfo struct {
    ProductSections []*ListMessage_ProductSection
    HeaderImage     *ListMessage_ProductListHeaderImage
    BusinessOwnerJID *string
}`,
    additionalNodesRequired: true,
    futureProofWrapped: false,
    sendingPattern: `msg := &waE2E.Message{ListMessage: &waE2E.ListMessage{
    Title:      proto.String("Our Menu"),
    Description: proto.String("Select an item"),
    ButtonText: proto.String("View Options"),
    ListType:   waE2E.ListMessage_SINGLE_SELECT.Enum(),
    Sections: []*waE2E.ListMessage_Section{
        {
            Title: proto.String("Main Courses"),
            Rows: []*waE2E.ListMessage_Row{
                {RowId: proto.String("pasta"), Title: proto.String("Pasta"), Description: proto.String("$12.99")},
                {RowId: proto.String("pizza"), Title: proto.String("Pizza"), Description: proto.String("$14.99")},
            },
        },
        {
            Title: proto.String("Drinks"),
            Rows: []*waE2E.ListMessage_Row{
                {RowId: proto.String("water"), Title: proto.String("Water"), Description: proto.String("$2.99")},
            },
        },
    },
}}
extra := whatsmeow.SendRequestExtra{
    AdditionalNodes: &[]waBinary.Node{{
        Tag: "biz",
        Content: []waBinary.Node{{
            Tag:   "interactive",
            Attrs: waBinary.Attrs{"type": "list", "v": "2"},
        }},
    }},
}
cli.SendMessage(ctx, recipient, msg, extra)`,
    notes: [
      'CRITICAL: AdditionalNodes required — same pattern as ButtonsMessage',
      'Maximum 10 sections, 10 rows per section',
      'Response comes as ListResponseMessage (field 39)',
      'PRODUCT_LIST type is for WhatsApp Business catalog integration',
    ],
  },
  {
    name: 'template',
    protoName: 'TemplateMessage',
    description: 'Template message with hydrated buttons (URL, phone call, quick reply)',
    structure: `type TemplateMessage struct {
    Format    isTemplateMessage_Format  // oneof: FourRowTemplate, HydratedFourRowTemplate, InteractiveMessageTemplate
    ContextInfo      *ContextInfo
    HydratedTemplate *TemplateMessage_HydratedFourRowTemplate
    TemplateID       *string
}

type TemplateMessage_HydratedFourRowTemplate struct {
    HydratedContentText *string
    HydratedFooterText  *string
    HydratedButtons     []*HydratedTemplateButton
    TemplateID          *string
    Title               isTemplateMessage_HydratedFourRowTemplate_Title  // oneof: DocumentMessage, HydratedTitleText, ImageMessage, VideoMessage, LocationMessage
}

type HydratedTemplateButton struct {
    Index     *uint32
    Button    isHydratedTemplateButton_Button  // oneof: QuickReplyButton, URLButton, CallButton
}

type HydratedTemplateButton_HydratedQuickReplyButton struct {
    DisplayText *string
    Id          *string
}

type HydratedTemplateButton_HydratedURLButton struct {
    DisplayText  *string
    URL          *string
    ConsentedUsersUrl *string
}

type HydratedTemplateButton_HydratedCallButton struct {
    DisplayText *string
    PhoneNumber *string
}`,
    additionalNodesRequired: false,
    futureProofWrapped: false,
    sendingPattern: `msg := &waE2E.Message{TemplateMessage: &waE2E.TemplateMessage{
    HydratedTemplate: &waE2E.TemplateMessage_HydratedFourRowTemplate{
        HydratedContentText: proto.String("Visit our website"),
        HydratedFooterText:  proto.String("Click below"),
        HydratedButtons: []*waE2E.HydratedTemplateButton{
            {
                Index: proto.Uint32(0),
                Button: &waE2E.HydratedTemplateButton_UrlButton{
                    UrlButton: &waE2E.HydratedTemplateButton_HydratedURLButton{
                        DisplayText: proto.String("Open Website"),
                        URL:         proto.String("https://example.com"),
                    },
                },
            },
            {
                Index: proto.Uint32(1),
                Button: &waE2E.HydratedTemplateButton_CallButton{
                    CallButton: &waE2E.HydratedTemplateButton_HydratedCallButton{
                        DisplayText: proto.String("Call Us"),
                        PhoneNumber: proto.String("+1234567890"),
                    },
                },
            },
        },
    },
}}
cli.SendMessage(ctx, recipient, msg)`,
    notes: [
      'Three button types: URL (opens link), Call (dials number), QuickReply (sends text back)',
      'Template response comes as TemplateButtonReplyMessage (field 29)',
      'HighlyStructuredMessage (field 14) is the server-driven template format',
    ],
  },
  {
    name: 'nativeFlow',
    protoName: 'InteractiveMessage.NativeFlowMessage',
    description: 'Native flow interactive message for advanced multi-step interactions',
    structure: `type InteractiveMessage struct {
    InteractiveMessage isInteractiveMessage_InteractiveMessage
    // oneof: ShopStorefrontMessage, CollectionMessage, NativeFlowMessage, CarouselMessage
    Header      *InteractiveMessage_Header
    Body        *InteractiveMessage_Body
    Footer      *InteractiveMessage_Footer
    BloksWidget *InteractiveMessage_BloksWidget
    ContextInfo *ContextInfo
}

type InteractiveMessage_NativeFlowMessage struct {
    Buttons           []*InteractiveMessage_NativeFlowMessage_NativeFlowButton
    MessageParamsJSON *string
    MessageVersion    *int32
}

type InteractiveMessage_NativeFlowMessage_NativeFlowButton struct {
    Name             *string
    ButtonParamsJSON *string
}

type InteractiveMessage_CarouselMessage struct {
    Cards   []*InteractiveMessage
    MessageVersion *int32
}

type InteractiveMessage_Header struct {
    Title               isInteractiveMessage_Header_Media  // oneof: DocumentMessage, ImageMessage, JPEGThumbnail, VideoMessage, LocationMessage, ProductMessage
    Subtitle            *string
    HasMediaAttachment  *bool
}

type InteractiveMessage_Body struct {
    Text *string
}

type InteractiveMessage_Footer struct {
    Text *string
}`,
    additionalNodesRequired: true,
    futureProofWrapped: true,
    sendingPattern: `innerMsg := &waE2E.InteractiveMessage{
    InteractiveMessage: &waE2E.InteractiveMessage_NativeFlowMessage_{
        NativeFlowMessage: &waE2E.InteractiveMessage_NativeFlowMessage{
            Buttons: []*waE2E.InteractiveMessage_NativeFlowMessage_NativeFlowButton{
                {
                    Name:             proto.String("quick_reply"),
                    ButtonParamsJSON: proto.String(\`{"display_text":"Click me","id":"btn_1"}\`),
                },
            },
            MessageParamsJSON: proto.String(\`{}\`),
            MessageVersion:    proto.Int32(1),
        },
    },
    Body:   &waE2E.InteractiveMessage_Body{Text: proto.String("Interactive content")},
    Footer: &waE2E.InteractiveMessage_Footer{Text: proto.String("footer text")},
}

msg := &waE2E.Message{InteractiveMessage: innerMsg}

extra := whatsmeow.SendRequestExtra{
    AdditionalNodes: &[]waBinary.Node{{
        Tag: "biz",
        Content: []waBinary.Node{{
            Tag:   "interactive",
            Attrs: waBinary.Attrs{"type": "native_flow", "v": "2"},
        }},
    }},
}
cli.SendMessage(ctx, recipient, msg, extra)`,
    notes: [
      'CRITICAL: Requires both AdditionalNodes AND FutureProofMessage wrapping for older clients',
      'NativeFlowButton uses JSON params for flexibility',
      'CarouselMessage embeds multiple InteractiveMessages as cards',
      'InteractiveResponseMessage (field 48) / NativeFlowResponseMessage handles responses',
      'CollectionMessage and ShopStorefrontMessage are for WhatsApp Business catalog',
    ],
  },
]

export const ADDITIONAL_NODES_PATTERN = `extra := whatsmeow.SendRequestExtra{
    AdditionalNodes: &[]waBinary.Node{{
        Tag: "biz",
        Content: []waBinary.Node{{
            Tag:   "interactive",
            Attrs: waBinary.Attrs{
                "type": "<message_type>",  // "buttons", "list", "native_flow"
                "v":    "2",
            },
        }},
    }},
}
cli.SendMessage(ctx, recipient, msg, extra)`

export const FUTURE_PROOF_PATTERN = `type FutureProofMessage struct {
    Message *Message  // wraps the actual message for forward compatibility
}

// Usage: ViewOnceMessage, EditedMessage, EphemeralMessage, DocumentWithCaptionMessage,
// ViewOnceMessageV2, ViewOnceMessageV2Extension, GroupMentionedMessage, BotInvokeMessage,
// LottieStickerMessage, EventCoverImage, StatusMentionMessage, and many more`

export function getInteractiveByName(name: string): InteractiveTypeInfo | undefined {
  return INTERACTIVE_TYPES.find((t) => t.name.toLowerCase() === name.toLowerCase())
}
