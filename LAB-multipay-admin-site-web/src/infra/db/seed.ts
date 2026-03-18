import db from './sqlite';

export function seed() {
  const rowCount = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
  if (rowCount.count > 1) return; // Se já tiver mais de uma ordem, não popula novamente

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, referenceId, subReferenceId, conditionId, systemId, adminLink, status,
      companyId, companyDescription, companyCode, amount, discount, expirationTime,
      callbackUrl, paymentLink, updatedAt, createdAt, requesterId, requesterName,
      requesterEmail, businessPartnerId, businessPartnerFirstName, businessPartnerLastName,
      businessPartnerName, businessPartnerEmail, businessPartnerDocumentType,
      businessPartnerDocumentNumber, businessPartnerPhoneNumber, businessPartnerAddress
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (id, orderId, name, image, quantity, unitPrice)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, orderId, method, amount, status, createdAt, updatedAt, authorizedAt, approvedAt,
      internalPaymentId, companyId, acquirerId, acquirerEc, acquirerDescription,
      acquirerStatus, acquirerStatusDetail, acquirerNsu, acquirerTransactionId,
      acquirerAuthorizationCode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const statuses = ['PENDING', 'AUTHORIZED', 'APPROVED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND'];
  const companies = [
    { id: 1, desc: 'SANTANDER', code: 'SAN' },
    { id: 2, desc: 'GETNET', code: 'GET' },
    { id: 3, desc: 'MERCADO PAGO', code: 'MPA' }
  ];

  for (let i = 1; i <= 50; i++) {
    const id = i.toString();
    const status = statuses[i % statuses.length];
    const company = companies[i % companies.length];
    const amount = Math.floor(Math.random() * 5000) + 100;
    const now = new Date().toISOString();

    insertOrder.run(
      id, `REF-${1000 + i}`, `SUB-${2000 + i}`, `COND-${i}`, 1, 'http://admin-link.com', status,
      company.id, company.desc, company.code, amount, 0, 3600,
      'http://callback.com', 'http://pay.com', now, now, 'req-1', 'Admin User', 'admin@example.com',
      `bp-${i}`, 'Cliente', `Teste ${i}`, `Cliente Teste ${i}`, `cliente${i}@email.com`, 'CPF', 
      '123.456.789-00', '(11) 99999-9999',
      JSON.stringify({ street: 'Rua das Flores', number: i, city: 'São Paulo', state: 'SP' })
    );

    // Itens da Ordem
    for (let j = 1; j <= 2; j++) {
      insertItem.run(`item-${id}-${j}`, id, `Produto ${j} da Ordem ${id}`, 'https://placehold.co/100x100', j, amount / 2);
    }

    // Pagamentos (apenas se não estiver pendente ou cancelado sem pagamento)
    if (status !== 'PENDING') {
      const paymentStatus = status === 'CANCELLED' ? 'CANCELLED' : 'AUTHORIZED';
      insertPayment.run(
        `pay-${id}`, id, 'CREDIT_CARD', amount, paymentStatus, now, now, now, now,
        `int-${id}`, company.id, 1, 'EC-123', 'ADQUIRENTE TESTE', 'SUCCESS', 'OK', 'NSU-123', 'TID-123', 'AUTH-123'
      );
    }
  }

  console.log('Database populated with 50 diverse orders!');
}
