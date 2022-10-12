export type InvoiceStatus = 'Draft' | 'Saved' | 'Unpaid' | 'Cancelled' | 'Paid';
export enum ModelNameEnum {
  Account = 'Account',
  AccountingLedgerEntry = 'AccountingLedgerEntry',
  AccountingSettings = 'AccountingSettings',
  Address = 'Address',
  Color = 'Color',
  CompanySettings = 'CompanySettings',
  Currency = 'Currency',
  GetStarted = 'GetStarted',
  Defaults = 'Defaults',
  Item = 'Item',
  UOM = 'UOM',
  JournalEntry = 'JournalEntry',
  JournalEntryAccount = 'JournalEntryAccount',
  Misc = 'Misc',
  NumberSeries = 'NumberSeries',
  Party = 'Party',
  Payment = 'Payment',
  PaymentFor = 'PaymentFor',
  PrintSettings = 'PrintSettings',
  PurchaseInvoice = 'PurchaseInvoice',
  PurchaseInvoiceItem = 'PurchaseInvoiceItem',
  SalesInvoice = 'SalesInvoice',
  SalesInvoiceItem = 'SalesInvoiceItem',
  SetupWizard = 'SetupWizard',
  Tax = 'Tax',
  TaxDetail = 'TaxDetail',
  TaxSummary = 'TaxSummary',
  PatchRun = 'PatchRun',
  SingleValue = 'SingleValue',
  SystemSettings = 'SystemSettings',
}

export type ModelName = keyof typeof ModelNameEnum;
