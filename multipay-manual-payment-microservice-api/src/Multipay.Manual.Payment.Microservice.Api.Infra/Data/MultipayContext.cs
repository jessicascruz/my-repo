using Microsoft.EntityFrameworkCore;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data;

public sealed class MultipayContext(EnvironmentKey environmentKey, DbContextOptions<MultipayContext> options, bool isTest = false) : DbContext(options), IMultipayContext
{
    public DbSet<OrderDto> Order { get; set; }
    public DbSet<ManualPaymentDto> ManualPayments { get; set; }
    public DbSet<PaymentApprovalDto> PaymentApprovals { get; set; }    
    public DbSet<PaymentReceiptDto> PaymentReceipts { get; set; }
    public DbSet<PaymentStatusDto> PaymentStatus { get; set; }
    public DbSet<RequesterDto> Requesters { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder dbContextOptionsBuilder)
    {
        if (!isTest)
        {
            dbContextOptionsBuilder
                .UseSqlServer(environmentKey.SqlServerInformation.ConnectionString)
                .EnableDetailedErrors()
                .EnableSensitiveDataLogging();
        }
        else
        {
            dbContextOptionsBuilder
                .UseInMemoryDatabase($"test_db_{Guid.NewGuid()}")
                .EnableDetailedErrors();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {      

        modelBuilder.Entity<ManualPaymentDto>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.OrderId)
                  .IsRequired();

            entity.HasOne(x => x.Requester)
                  .WithMany()
                  .HasForeignKey(x => x.RequesterId);

            entity.HasOne(x => x.Status)
                  .WithMany()
                  .HasForeignKey(x => x.StatusId);

            entity.HasMany(x => x.Approvals)
                 .WithOne(a => a.ManualPayment)
                 .HasForeignKey(a => a.ManualPaymentId);

            entity.HasMany(x => x.Receipts)
                  .WithOne(r => r.ManualPayment)
                  .HasForeignKey(r => r.ManualPaymentId);
        });

        modelBuilder.Entity<PaymentReceiptDto>(entity => {

            entity.HasKey(x => x.Id);

            entity.Property(x => x.DocumentName)
                .HasMaxLength(200)
                .IsRequired();

            //entity.Property(x => x.S3Key)
            //    .HasMaxLength(500);

            entity.Property(x => x.CreatedAt)
                .IsRequired();

            entity.HasIndex(x => x.ManualPaymentId);
        });

        modelBuilder.Entity<PaymentApprovalDto>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.RejectionReason)
                  .HasMaxLength(500)
                  .IsRequired(false);

            entity.HasOne(x => x.Requester)
                .WithMany()
                .HasForeignKey(x => x.RequesterId);
        });

    }

}
