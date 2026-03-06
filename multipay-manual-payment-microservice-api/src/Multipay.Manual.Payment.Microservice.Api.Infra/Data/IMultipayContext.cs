using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;


namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data;

public interface IMultipayContext
{
    DbSet<OrderDto> Order { get; set; }
    DbSet<ManualPaymentDto> ManualPayments { get; set; }
    DbSet<PaymentApprovalDto> PaymentApprovals { get; set; }
    DbSet<PaymentReceiptDto> PaymentReceipts { get; set; }
    DbSet<PaymentStatusDto> PaymentStatus { get; set; }
    DbSet<RequesterDto> Requesters { get; set; }
    DatabaseFacade Database { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
    DbSet<TEntity> Set<TEntity>() where TEntity : class;
}
