export enum ResponseMessage {
  ACCEPTED = "Accepted",
  BAD_GATEWAY = "Bad Gateway",
  BAD_REQUEST = "Bad Request",
  CONFLICT = "Conflict",
  CONTINUE = "Continue",
  CREATED = "Created",
  EXPECTATION_FAILED = "Expectation Failed",
  FAILED_DEPENDENCY = "Failed Dependency",
  FORBIDDEN = "Forbidden",
  GATEWAY_TIMEOUT = "Gateway Timeout",
  GONE = "Gone",
  HTTP_VERSION_NOT_SUPPORTED = "HTTP Version Not Supported",
  IM_A_TEAPOT = "I'm a teapot",
  INSUFFICIENT_SPACE_ON_RESOURCE = "Insufficient Space on Resource",
  INSUFFICIENT_STORAGE = "Insufficient Storage",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  LENGTH_REQUIRED = "Length Required",
  LOCKED = "Locked",
  METHOD_FAILURE = "Method Failure",
  METHOD_NOT_ALLOWED = "Method Not Allowed",
  MOVED_PERMANENTLY = "Moved Permanently",
  MOVED_TEMPORARILY = "Moved Temporarily",
  MULTI_STATUS = "Multi-Status",
  MULTIPLE_CHOICES = "Multiple Choices",
  NETWORK_AUTHENTICATION_REQUIRED = "Network Authentication Required",
  NO_CONTENT = "No Content",
  NON_AUTHORITATIVE_INFORMATION = "Non Authoritative Information",
  NOT_ACCEPTABLE = "Not Acceptable",
  NOT_FOUND = "Not Found",
  NOT_IMPLEMENTED = "Not Implemented",
  NOT_MODIFIED = "Not Modified",
  OK = "OK",
  PARTIAL_CONTENT = "Partial Content",
  PAYMENT_REQUIRED = "Payment Required",
  PERMANENT_REDIRECT = "Permanent Redirect",
  PRECONDITION_FAILED = "Precondition Failed",
  PRECONDITION_REQUIRED = "Precondition Required",
  PROCESSING = "Processing",
  EARLY_HINTS = "Early Hints",
  UPGRADE_REQUIRED = "Upgrade Required",
  PROXY_AUTHENTICATION_REQUIRED = "Proxy Authentication Required",
  REQUEST_HEADER_FIELDS_TOO_LARGE = "Request Header Fields Too Large",
  REQUEST_TIMEOUT = "Request Timeout",
  REQUEST_TOO_LONG = "Request Entity Too Large",
  REQUEST_URI_TOO_LONG = "Request-URI Too Long",
  REQUESTED_RANGE_NOT_SATISFIABLE = "Requested Range Not Satisfiable",
  RESET_CONTENT = "Reset Content",
  SEE_OTHER = "See Other",
  SERVICE_UNAVAILABLE = "Service Unavailable",
  SWITCHING_PROTOCOLS = "Switching Protocols",
  TEMPORARY_REDIRECT = "Temporary Redirect",
  TOO_MANY_REQUESTS = "Too Many Requests",
  UNAUTHORIZED = "Unauthorized",
  UNAVAILABLE_FOR_LEGAL_REASONS = "Unavailable For Legal Reasons",
  UNPROCESSABLE_ENTITY = "Unprocessable Entity",
  UNSUPPORTED_MEDIA_TYPE = "Unsupported Media Type",
  USE_PROXY = "Use Proxy",
  MISDIRECTED_REQUEST = "Misdirected Request",

  /** Custom Enum */
  WRONG_PASSWORD = 'Wrong Password',
  INVALID_EMAIL = 'Invalid Email',
  LOGIN_INCORRECT_CREDENTIALS = 'Username or Password incorrect',
  ENV_NOT_FOUND = 'Environmental variables missing',
  INSURANCE_COMPANY_NOT_FOUND = 'Insurance company not found',
  INSURANCE_SERVICE_UDC_NOT_FOUND = 'Insurance service UDC not found',
  INSURANCE_SUB_SERVICE_UDC_NOT_FOUND = 'Insurance sub service UDC not found',
}

export const TIME_FORMAT = 'MMMM Do YYYY, h a'

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum UserRole {
    SUPERADMIN = 'SuperAdmin',
    ADMIN = 'Admin',
    USER = 'User',
}

export enum ResendOTPType {
  ACCOUNT_VERIFICATION = 'account verification',
  FORGOT_PASSWORD = 'forgot password',
}

export const EMPPLOYEES_TABLE = 'User'
export const COLLECTION_TABLE = 'Collection'
export const CLIENT_TABLE = 'Client'
export const SHOOTS_TABLE = 'Shoot'
export const SETTINGS_TABLE = 'Settings'
export const WATERMARK_DIRECTORY = 'Watermark'
export const SELECTED_PHOTOS_DIRECTORY = 'Selected_Photos'
export const BILLING_TABLE = 'Billing'
export const PAYMENT_TABLE = 'Payment'
export const TRANSACTION_TABLE = 'Transactions'
export const CLIENT_SELECTED_PHOTOS = 'ClientsSelectedPhotos'
export const EDITED_PHOTOS = 'Edited_Photos'
export const PORTFOLIO_TABLE = 'Portfolio'
export const CUSTOM_DOMAIN = 'CustomDomain'
export const PCOLLECTION_TABLE = 'PCollection'
export const BLOG_TABLE = 'Blog'
export const BLOG_DRAFT_TABLE = 'Blog_Draft'
export const SELECTED_PHOTOS = 'Selected_Names'
export const ADMIN_SETTINGS = 'AdminSettings'
export const ADMIN_NOTIFICATIONS = 'AdminNotifications'
export const PRICING_TABLE= 'Pricing'
export const DOWNLOAD_TABLE = 'Download'
export const NOTIFICATION_TABLE = 'Notification'
export const CONTACT_TABLE = 'Contact'
export const INVOICE_TABLE = 'Invoice'
export const ADMIN_MAIL = "info@fotolocker.io"
export const CURRENCY_TABLE = 'Currency'
export const REFERAL_TABLE = 'Referal'
export const REFERAL_POINT = 10 // 0.5 dollar equivalent
export const CARD_TABLE = 'Card'