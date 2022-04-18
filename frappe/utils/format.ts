import { Frappe } from 'frappe';
import { DocValue } from 'frappe/core/types';
import Doc from 'frappe/model/doc';
import { DateTime } from 'luxon';
import Money from 'pesa/dist/types/src/money';
import { Field, FieldType, FieldTypeEnum } from 'schemas/types';
import { getIsNullOrUndef } from 'utils';
import {
  DEFAULT_CURRENCY,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DISPLAY_PRECISION,
  DEFAULT_LOCALE,
} from './consts';

export function format(
  value: DocValue,
  df: string | Field | null,
  doc: Doc | null,
  frappe: Frappe
): string {
  if (!df) {
    return String(value);
  }

  const field: Field = getField(df);

  if (field.fieldtype === FieldTypeEnum.Currency) {
    return formatCurrency(value, field, doc, frappe);
  }

  if (field.fieldtype === FieldTypeEnum.Date) {
    return formatDate(value, frappe);
  }

  if (field.fieldtype === FieldTypeEnum.Check) {
    return Boolean(value).toString();
  }

  if (getIsNullOrUndef(value)) {
    return '';
  }

  return String(value);
}

function formatDate(value: DocValue, frappe: Frappe): string {
  const dateFormat =
    (frappe.singles.SystemSettings?.dateFormat as string) ??
    DEFAULT_DATE_FORMAT;

  let dateValue: DateTime;
  if (typeof value === 'string') {
    dateValue = DateTime.fromISO(value);
  } else if (value instanceof Date) {
    dateValue = DateTime.fromJSDate(value);
  } else {
    dateValue = DateTime.fromSeconds(value as number);
  }

  const formattedDate = dateValue.toFormat(dateFormat);
  if (value === 'Invalid DateTime') {
    return '';
  }

  return formattedDate;
}

function formatCurrency(
  value: DocValue,
  field: Field,
  doc: Doc | null,
  frappe: Frappe
): string {
  const currency = getCurrency(field, doc, frappe);

  let valueString;
  try {
    valueString = formatNumber(value, frappe);
  } catch (err) {
    (err as Error).message += ` value: '${value}', type: ${typeof value}`;
    throw err;
  }

  const currencySymbol = frappe.currencySymbols[currency];
  if (currencySymbol !== undefined) {
    return currencySymbol + ' ' + valueString;
  }

  return valueString;
}

function formatNumber(value: DocValue, frappe: Frappe): string {
  const numberFormatter = getNumberFormatter(frappe);
  if (typeof value === 'number') {
    return numberFormatter.format(value);
  }

  if ((value as Money).round) {
    const floatValue = parseFloat((value as Money).round());
    return numberFormatter.format(floatValue);
  }

  const floatValue = parseFloat(value as string);
  const formattedNumber = numberFormatter.format(floatValue);

  if (formattedNumber === 'NaN') {
    throw Error(
      `invalid value passed to formatNumber: '${value}' of type ${typeof value}`
    );
  }

  return formattedNumber;
}

function getNumberFormatter(frappe: Frappe) {
  if (frappe.currencyFormatter) {
    return frappe.currencyFormatter;
  }

  const locale =
    (frappe.singles.SystemSettings?.locale as string) ?? DEFAULT_LOCALE;
  const display =
    (frappe.singles.SystemSettings?.displayPrecision as number) ??
    DEFAULT_DISPLAY_PRECISION;

  return (frappe.currencyFormatter = Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: display,
  }));
}

function getCurrency(field: Field, doc: Doc | null, frappe: Frappe): string {
  if (doc && doc.getCurrencies[field.fieldname]) {
    return doc.getCurrencies[field.fieldname]();
  }

  if (doc && doc.parentdoc?.getCurrencies[field.fieldname]) {
    return doc.parentdoc.getCurrencies[field.fieldname]();
  }

  return (
    (frappe.singles.SystemSettings?.currency as string) ?? DEFAULT_CURRENCY
  );
}

function getField(df: string | Field): Field {
  if (typeof df === 'string') {
    return {
      label: '',
      fieldname: '',
      fieldtype: df as FieldType,
    };
  }

  return df;
}
