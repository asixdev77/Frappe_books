// ipcRenderer.send(...)
export enum IPC_MESSAGES {
  OPEN_MENU = 'open-menu',
  OPEN_SETTINGS = 'open-settings',
  OPEN_EXTERNAL = 'open-external',
  SHOW_ITEM_IN_FOLDER = 'show-item-in-folder',
  RELOAD_MAIN_WINDOW = 'reload-main-window',
  CLOSE_CURRENT_WINDOW = 'close-current-window',
  MINIMIZE_CURRENT_WINDOW = 'minimize-current-window',
  DOWNLOAD_UPDATE = 'download-update',
  INSTALL_UPDATE = 'install-update',
}

// ipcRenderer.invoke(...)
export enum IPC_ACTIONS {
  TOGGLE_MAXIMIZE_CURRENT_WINDOW = 'toggle-maximize-current-window',
  GET_OPEN_FILEPATH = 'open-dialog',
  GET_SAVE_FILEPATH = 'save-dialog',
  GET_DIALOG_RESPONSE = 'show-message-box',
  GET_ENV = 'get-env',
  SAVE_HTML_AS_PDF = 'save-html-as-pdf',
  SAVE_DATA = 'save-data',
  SHOW_ERROR = 'show-error',
  SEND_ERROR = 'send-error',
  GET_LANGUAGE_MAP = 'get-language-map',
  CHECK_FOR_UPDATES = 'check-for-updates',
  GET_FILE = 'get-file',
  GET_CREDS = 'get-creds',
  GET_DB_LIST = 'get-db-list',
  DELETE_FILE = 'delete-file',
  // Database messages
  DB_CREATE = 'db-create',
  DB_CONNECT = 'db-connect',
  DB_CALL = 'db-call',
  DB_BESPOKE = 'db-bespoke',
  DB_SCHEMA = 'db-schema',
}

// ipcMain.send(...)
export enum IPC_CHANNELS {
  CHECKING_FOR_UPDATE = 'checking-for-update',
  UPDATE_AVAILABLE = 'update-available',
  UPDATE_NOT_AVAILABLE = 'update-not-available',
  UPDATE_DOWNLOADED = 'update-downloaded',
  UPDATE_ERROR = 'update-error',
  MAIN_PROCESS_ERROR = 'main-process-error',
  CONSOLE_LOG = 'console-log',
}

export enum DB_CONN_FAILURE {
  INVALID_FILE = 'invalid-file',
  CANT_OPEN = 'cant-open',
  CANT_CONNECT = 'cant-connect',
}
