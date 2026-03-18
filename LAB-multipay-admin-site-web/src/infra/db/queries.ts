import db from '@/infra/db/sqlite';
import { IReceivableResponse } from '@/domain/aggregates/order';

export function getOrderById(orderId: string): IReceivableResponse | null {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) return null;

  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(orderId) as any[];
  const payments = db.prepare('SELECT * FROM payments WHERE orderId = ?').all(orderId) as any[];
  const discounts = db.prepare('SELECT * FROM discounts WHERE orderId = ?').all(orderId) as any[];
  const refunds = db.prepare('SELECT * FROM refunds WHERE orderId = ?').all(orderId) as any[];
  const manualPayments = db.prepare('SELECT * FROM manual_payments WHERE orderId = ?').all(orderId) as any[];

  return {
    id: order.id,
    referenceId: order.referenceId,
    subReferenceId: order.subReferenceId,
    conditionId: order.conditionId,
    systemId: order.systemId,
    adminLink: order.adminLink,
    status: order.status,
    company: {
      id: order.companyId,
      description: order.companyDescription,
      code: order.companyCode,
    },
    amount: order.amount,
    discount: order.discount,
    expirationTime: order.expirationTime,
    callbackUrl: order.callbackUrl,
    paymentLink: order.paymentLink,
    updatedAt: order.updatedAt,
    createdAt: order.createdAt,
    paymentMethods: ['CREDIT_CARD', 'PIX', 'TICKET'], // Mocked
    requester: {
      id: order.requesterId,
      name: order.requesterName,
      email: order.requesterEmail,
    },
    businessPartner: {
      id: order.businessPartnerId,
      firstName: order.businessPartnerFirstName,
      lastName: order.businessPartnerLastName,
      name: order.businessPartnerName,
      email: order.businessPartnerEmail,
      documentType: order.businessPartnerDocumentType,
      documentNumber: order.businessPartnerDocumentNumber,
      phoneNumber: order.businessPartnerPhoneNumber,
      address: JSON.parse(order.businessPartnerAddress),
    },
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    payments: payments.map(p => ({
      id: p.id,
      method: p.method,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorizedAt: p.authorizedAt,
      approvedAt: p.approvedAt,
      internalPaymentId: p.internalPaymentId,
      companyId: p.companyId,
      acquirer: {
        id: p.acquirerId,
        ec: p.acquirerEc,
        description: p.acquirerDescription,
        paymentId: p.id,
        status: p.acquirerStatus,
        statusDetail: p.acquirerStatusDetail,
        nsu: p.acquirerNsu,
        transactionId: p.acquirerTransactionId,
        internalPaymentId: p.internalPaymentId,
        authorizationCode: p.acquirerAuthorizationCode,
      },
    })),
    discounts: discounts.map(d => ({
      id: d.id,
      systemId: d.systemId,
      requestAmount: d.requestAmount,
      requestDiscount: d.requestDiscount,
      oldAmount: d.oldAmount,
      oldDiscount: d.oldDiscount,
      createdAt: d.createdAt,
      requester: {
        id: d.requesterId,
        name: d.requesterName,
        email: d.requesterEmail,
      },
    })),
    refunds: refunds.map(r => ({
      id: r.id,
      amount: r.amount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      requester: {
        id: r.requesterId,
        name: r.requesterName,
        email: r.requesterEmail,
      },
      acquirer: {
        id: r.acquirerId,
        description: r.acquirerDescription,
        paymentId: r.paymentId,
        status: r.acquirerStatus,
        statusDetail: r.acquirerStatusDetail,
        ec: r.acquirerEc,
        refundId: r.id,
      },
    })),
    manualPayments: manualPayments.map(mp => ({
      id: mp.id,
      amount: mp.amount,
      reason: mp.reason,
      approvedAt: mp.approvedAt,
      attachments: JSON.parse(mp.attachments || '[]'),
      receipts: [],
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt,
      status: mp.status || 'pending',
      approvals: [],
      requester: {
        id: mp.requesterId,
        name: mp.requesterName,
        email: mp.requesterEmail,
      },
      acquirer: {
        id: 1,
        ec: 'MANUAL',
        description: 'Manual Payment',
        paymentId: mp.id,
        status: 'pending',
        statusDetail: 'Waiting',
        nsu: 'N/A',
        transactionId: 'N/A',
        internalPaymentId: 'N/A',
        authorizationCode: 'N/A'
      },
    })),
  };
}

export function getAllOrders(limit = 10, offset = 0): { data: IReceivableResponse[], total: number } {
  const total = (db.prepare('SELECT count(*) as count FROM orders').get() as any).count;
  const orders = db.prepare('SELECT id FROM orders LIMIT ? OFFSET ?').all(limit, offset) as { id: string }[];
  
  return {
    data: orders.map(o => getOrderById(o.id)!).filter(Boolean),
    total,
  };
}
