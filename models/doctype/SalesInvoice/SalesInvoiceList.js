import { _ } from 'frappejs/utils';
import indicators from 'frappejs/ui/constants/indicators';

export default {
  doctype: 'SalesInvoice',
  title: _('Sales Invoices'),
  columns: [
    'customer',
    'name',
    {
      label: 'Status',
      fieldname: 'status',
      fieldtype: 'Select',
      size: 'small',
      options: ['Status..', 'Paid', 'Pending'],
      getValue(doc) {
        if (doc.submitted === 1 && doc.outstandingAmount === 0.0) {
          return 'Paid';
        }
        return 'Pending';
      },
      getIndicator(doc) {
        if (doc.submitted === 1 && doc.outstandingAmount === 0.0) {
          return indicators.GREEN;
        }
        return indicators.ORANGE;
      }
    },
    'date',
    'grandTotal',
    'outstandingAmount'
  ]
};
