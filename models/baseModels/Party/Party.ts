import { Fyo } from 'fyo';
import { Doc } from 'fyo/model/doc';
import {
  Action,
  FiltersMap,
  FormulaMap,
  ListViewSettings,
  ValidationMap,
} from 'fyo/model/types';
import {
  validateEmail,
  validatePhoneNumber,
} from 'fyo/model/validationFunction';
import { PartyRole } from './types';

export class Party extends Doc {
  async updateOutstandingAmount() {
    const role = this.role as PartyRole;
    switch (role) {
      case 'Customer':
        await this._updateOutstandingAmount('SalesInvoice');
        break;
      case 'Supplier':
        await this._updateOutstandingAmount('PurchaseInvoice');
        break;
      case 'Both':
        await this._updateOutstandingAmount('SalesInvoice');
        await this._updateOutstandingAmount('PurchaseInvoice');
        break;
    }
  }

  async _updateOutstandingAmount(
    schemaName: 'SalesInvoice' | 'PurchaseInvoice'
  ) {
    const outstandingAmounts = (
      await this.fyo.db.getAllRaw(schemaName, {
        fields: ['outstandingAmount', 'party'],
        filters: { submitted: true },
      })
    ).filter(({ party }) => party === this.name);

    const totalOutstanding = outstandingAmounts
      .map(({ outstandingAmount }) =>
        this.fyo.pesa(outstandingAmount as number)
      )
      .reduce((a, b) => a.add(b), this.fyo.pesa(0));

    await this.set('outstandingAmount', totalOutstanding);
    await this.sync();
  }

  formulas: FormulaMap = {
    defaultAccount: {
      formula: async () => {
        const role = this.role as PartyRole;
        if (role === 'Both') {
          return '';
        }

        let accountName = 'Debtors';
        if (role === 'Supplier') {
          accountName = 'Creditors';
        }

        const accountExists = await this.fyo.db.exists('Account', accountName);
        return accountExists ? accountName : '';
      },
      dependsOn: ['role'],
    },
    currency: {
      formula: async () =>
        this.fyo.singles.AccountingSettings!.currency as string,
    },
    address: {
      formula: async () => {
        const address = this.address as string | undefined;
        if (address) {
          return this.getFrom('Address', address, 'addressDisplay') as string;
        }
        return '';
      },
    },
  };

  validations: ValidationMap = {
    email: validateEmail,
    phone: validatePhoneNumber,
  };

  static filters: FiltersMap = {
    defaultAccount: (doc: Doc) => {
      const role = doc.role as PartyRole;
      if (role === 'Both') {
        return {
          isGroup: false,
          accountType: ['in', ['Payable', 'Receivable']],
        };
      }

      return {
        isGroup: false,
        accountType: role === 'Customer' ? 'Receivable' : 'Payable',
      };
    },
  };

  static getListViewSettings(): ListViewSettings {
    return {
      columns: ['name', 'phone', 'outstandingAmount'],
    };
  }

  static getActions(fyo: Fyo): Action[] {
    return [
      {
        label: fyo.t`Create Purchase`,
        condition: (doc: Doc) =>
          !doc.notInserted && (doc.role as PartyRole) !== 'Customer',
        action: async (partyDoc, router) => {
          const doc = await fyo.doc.getNewDoc('PurchaseInvoice');
          router.push({
            path: `/edit/PurchaseInvoice/${doc.name}`,
            query: {
              schemaName: 'PurchaseInvoice',
              values: {
                // @ts-ignore
                party: partyDoc.name!,
              },
            },
          });
        },
      },
      {
        label: fyo.t`View Purchases`,
        condition: (doc: Doc) =>
          !doc.notInserted && (doc.role as PartyRole) !== 'Customer',
        action: async (partyDoc, router) => {
          router.push({
            name: 'ListView',
            params: {
              schemaName: 'PurchaseInvoice',
              filters: {
                // @ts-ignore
                party: partyDoc.name!,
              },
            },
          });
        },
      },
      {
        label: fyo.t`Create Sale`,
        condition: (doc: Doc) =>
          !doc.notInserted && (doc.role as PartyRole) !== 'Supplier',
        action: async (partyDoc, router) => {
          const doc = await fyo.doc.getNewDoc('SalesInvoice');
          router.push({
            path: `/edit/SalesInvoice/${doc.name}`,
            query: {
              schemaName: 'SalesInvoice',
              values: {
                // @ts-ignore
                party: partyDoc.name!,
              },
            },
          });
        },
      },
      {
        label: fyo.t`View Sales`,
        condition: (doc: Doc) =>
          !doc.notInserted && (doc.role as PartyRole) !== 'Supplier',
        action: async (partyDoc, router) => {
          router.push({
            name: 'ListView',
            params: {
              schemaName: 'SalesInvoice',
              filters: {
                // @ts-ignore
                party: partyDoc.name!,
              },
            },
          });
        },
      },
    ];
  }
}
