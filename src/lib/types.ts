export interface OrderDraft {
  ivg_orderdraftid: string;
  ivg_orderdraftnumber: string;
  ivg_orderdate: string;
  ivg_status: OrderStatus;
  ivg_totalgross?: number;
  ivg_totalnetamount?: number;
  ivg_vatamount?: number;
  ivg_ponumber?: string;
  ivg_customernotes?: string;
  _ivg_account_value?: string;
  _ivg_contact_value?: string;
  ivg_deliverydate?: string;
}

export type OrderStatus =
  | 'Draft' | 'Submitted' | 'Confirmed'
  | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderDraftLine {
  ivg_orderdraftlineid: string;
  ivg_productname: string;
  ivg_quantity: number;
  ivg_unitprice: number;
  ivg_netamount: number;
  ivg_vatpercent: number;
  ivg_vatamount: number;
  ivg_grossamount: number;
  _ivg_product_value?: string;
  _ivg_orderdraft_value?: string;
}

export interface Product {
  productid: string;
  name: string;
  productnumber: string;
  ivg_productline?: string;
  ivg_flavour?: string;
  ivg_nicstrength?: string;
  price?: number;
  ivg_vatrate?: number;
  ivg_portalvisible?: boolean;
  image?: string;
}

export interface Account {
  accountid: string;
  name: string;
  ivg_customertier?: CustomerTier;
  ivg_creditlimit?: number;
  ivg_creditavailable?: number;
  ivg_customertype?: string;
}

export type CustomerTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface CustomerApplication {
  ivg_customerapplicationid?: string;
  ivg_companyname: string;
  ivg_email: string;
  ivg_contactnumber1: string;
  ivg_customergroup: number; // OptionSet value
  ivg_directoryname: string;
  ivg_vatnumber?: string;
  ivg_companieshouseno?: string;
  ivg_companystreet: string;
  ivg_companycity: string;
  ivg_companycounty?: string;
  ivg_companypostcode: string;
  ivg_deliverystreet: string;
  ivg_deliverycity: string;
  ivg_deliverucounty?: string;
  ivg_deliverypostcode: string;
  ivg_billingstreet: string;
  ivg_billingcity: string;
  ivg_billingcounty?: string;
  ivg_billingpostcode: string;
  ivg_bankaccountname: string;
  ivg_signatoryname: string;
  ivg_signedbehalfof: string;
  ivg_signatorytitle: string;
}

export interface Incident {
  incidentid: string;
  ticketnumber: string;
  title: string;
  statuscode: number;
  statecode: number;
  createdon: string;
  description?: string;
  casetypecode?: number;
}
