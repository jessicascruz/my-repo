using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Response;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities.Filter;
using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.ErrorResult;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.ManualPayment.Entities.Dtos;
using Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;
using System.Net;

namespace Multipay.Manual.Payment.Microservice.Api.Test.Mocks
{
    public static class MockData
    {
        public static RequesterRequest GetMockRequesterRequest() => new RequesterRequest
        {
            Id = "req-123",
            Name = "João da Silva",
            Email = "joao.silva@exemplo.com"
        };

        public static Order GetMockOrder() => new Order
        {
            Id = Guid.NewGuid(),
            ParentId = Guid.NewGuid(),
            TypeId = "type-xyz",
            SystemId = 1,
            BusinessPartnerId = Guid.NewGuid(),
            DeliveryAddressId = Guid.NewGuid(),
            BillingAddressId = Guid.NewGuid(),
            StatusId = 2,
            CompanyId = 10,
            ReferenceId = "ref-001",
            SubReferenceId = "subref-001",
            ConditionId = "cond-001",
            Amount = 150.75,
            Discount = 10.50,
            ExpirationTime = 3600,
            CallbackUrl = "https://api.exemplo.com/callback",
            Link = "https://pagamento.exemplo.com/link",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        public static StatusRequest GetMockStatusRequest() => new StatusRequest
        {
            Event = "PAYMENT_UPDATE",
            SubEvent = "STATUS_CHANGED",
            AcquirerId = 101,
            MethodId = 1
        };

        public static ReceivableResponse GetMockReceivableResponse() => new ReceivableResponse
        {
            Id = Guid.NewGuid(),
            ReferenceId = "ref-123",
            Status = "APPROVED",
            Amount = 500.00,
            Discount = 25.00,
            Payments = new List<ReceivablePayment> { GetMockReceivablePayment() },
            Refunds = new List<ReceivableRefund> { GetMockReceivableRefund() }
        };

        public static ReceivableRefund GetMockReceivableRefund() => new ReceivableRefund
        {
            Id = Guid.NewGuid(),
            Amount = 50.00,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Requester = GetMockReceivableRefundRequester(),
            Acquirer = GetMockReceivableRefundAcquirer()
        };

        public static ReceivableRefundRequester GetMockReceivableRefundRequester() => new ReceivableRefundRequester
        {
            Id = Guid.NewGuid(),
            Name = "Maria Souza",
            Email = "maria.souza@exemplo.com"
        };

        public static ReceivableRefundAcquirer GetMockReceivableRefundAcquirer() => new ReceivableRefundAcquirer
        {
            Id = 1,
            Description = "Cielo",
            PaymentId = "pay-987",
            RefundId = "ref-987",
            Status = "SUCCESS",
            StatusDetail = "Refund processed successfully"
        };

        public static ReceivablePayment GetMockReceivablePayment() => new ReceivablePayment
        {
            Method = MethodEnum.CREDIT_CARD,
            Id = Guid.NewGuid(),
            Amount = 475.00,
            Status = PaymentStatusEnum.CONFIRMED,
            StatusDetail = "Transação Aprovada",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            AuthorizedAt = DateTime.UtcNow,
            ApprovedAt = DateTime.UtcNow,
            Pix = GetMockPaymentPix(),
            Ticket = GetMockPaymentTicket(),
            Acquirer = GetMockPaymentAcquirer()
        };

        public static PaymentPix GetMockPaymentPix() => new PaymentPix
        {
            QrCode = "00020126580014br.gov.bcb.pix...",
            Code = "pix-codigo-copia-e-cola"
        };

        public static PaymentTicket GetMockPaymentTicket() => new PaymentTicket
        {
            Url = "https://boleto.exemplo.com/123",
            BarCode = "34191.09008 63571.277308 71444.640008 5 8800000000000"
        };

        public static PaymentAcquirer GetMockPaymentAcquirer() => new PaymentAcquirer
        {
            Id = 10,
            Description = "Rede",
            PaymentId = "pay-acq-001",
            Nsu = "123456789",
            TransactionId = "txn-123456789"
        };

        public static ReceivableCompany GetMockReceivableCompany() => new ReceivableCompany
        {
            Id = 1,
            Code = "COMP-01",
            Description = "Empresa Matriz"
        };

        public static Item GetMockItem() => new Item
        {
            Id = Guid.NewGuid(),
            Quantity = 3,
            UnitPrice = 45.90f,
            Image = "https://img.exemplo.com/produto.png",
            Name = "Produto Teste"
        };

        public static BusinessPartner GetMockBusinessPartner() => new BusinessPartner
        {
            Id = Guid.NewGuid(),
            FirstName = "Carlos",
            LastName = "Andrade",
            Name = "Carlos Andrade",
            Email = "carlos.andrade@exemplo.com",
            DocumentType = DocumentTypeEnum.CPF,
            DocumentNumber = "12345678909",
            PhoneNumber = "+5511999999999",
            BillingEmail = "faturamento.carlos@exemplo.com",
            BillingPhoneNumber = "+5511888888888",
            DeliveryAddress = GetMockAddress()
        };

        public static Address GetMockAddress() => new Address
        {
            Street = "Avenida Paulista",
            Number = "1000",
            Complement = "Apto 42",
            Neighbourhood = "Bela Vista",
            City = "São Paulo",
            State = "SP",
            PostalCode = "01310-100"
        };

        public static ReceivableFilter GetMockReceivableFilter() => new ReceivableFilter
        {
            OrderId = Guid.NewGuid(),
            RetrievePayments = RetrievePaymentsEnum.All,
            RetrieveRefunds = RetrieveRefundsEnum.All
        };

        public static ManualPaymentResponse GetMockManualPaymentResponse() => new ManualPaymentResponse
        {
            Id = Guid.NewGuid(),
            OrderId = Guid.NewGuid(),
            Amount = 250.00,
            Reason = "Pagamento manual via depósito",
            ApprovedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Requester = GetMockRequesterResponse(),
            Status = GetMockPaymentStatusResponse(),
            Approvals = new List<PaymentApprovalResponse> { GetMockPaymentApprovalResponse() },
            Receipts = new List<PaymentReceiptResponse> { GetMockPaymentReceiptResponse() }
        };

        public static PaymentApprovalResponse GetMockPaymentApprovalResponse() => new PaymentApprovalResponse
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = Guid.NewGuid(),
            IsApproved = true,
            RequesterId = "req-app-001",
            RejectionReason = null,
            CreatedAt = DateTime.UtcNow,
            Requester = GetMockRequesterResponse()
        };

        public static PaymentStatusResponse GetMockPaymentStatusResponse() => new PaymentStatusResponse
        {
            Id = 2,
            Description = "Aprovado"
        };

        public static RequesterResponse GetMockRequesterResponse() => new RequesterResponse
        {
            Id = "resp-123",
            Name = "Ana Costa",
            Email = "ana.costa@exemplo.com"
        };

        public static PaymentReceiptResponse GetMockPaymentReceiptResponse() => new PaymentReceiptResponse
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = Guid.NewGuid(),
            DocumentName = "comprovante_transferencia.pdf",
            CreatedAt = DateTime.UtcNow
        };

        public static ManualPaymentRequest GetMockManualPaymentRequest() => new ManualPaymentRequest
        {
            OrderId = Guid.NewGuid(),
            Reference = "ref-man-001",
            SubReference = "sub-man-001",
            Amount = 300.00,
            Reason = "Ajuste manual",
            Requester = GetMockRequesterRequest(),
            Approvals = new List<PaymentApprovalResponse> { GetMockPaymentApprovalResponse() }
        };

        public static PaymentApprovalRequest GetMockPaymentApprovalRequest() => new PaymentApprovalRequest
        {
            ManualPaymentId = Guid.NewGuid(),
            IsApproved = false,
            RequesterId = "req-app-002",
            RejectionReason = "Comprovante ilegível",
            Requester = GetMockRequesterRequest(),
            Reference = "ref-rej-001"
        };

        public static PaymentReceiptRequest GetMockPaymentReceiptRequest() => new PaymentReceiptRequest
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = Guid.NewGuid(),
            DocumentName = "nota_fiscal.pdf",
            CreatedAt = DateTime.UtcNow
        };

        public static EnvironmentKey.Gateway GetMockEnvironmentKeyGateway() => new EnvironmentKey.Gateway
        {
            ReceivableToken = "gw-token-12345"
        };

        public static EnvironmentKey.Microservice GetMockEnvironmentKeyMicroservice() => new EnvironmentKey.Microservice
        {
            ReceivableEndpoint = "https://microservico.exemplo.com/receivable"
        };

        public static EnvironmentKey.Persistence GetMockEnvironmentKeyPersistence() => new EnvironmentKey.Persistence
        {
            ValidStatusOrder = "1,2,5"
        };

        public static EnvironmentKey.AWS.SecretManager GetMockEnvironmentKeyAWSSecretManager() => new EnvironmentKey.AWS.SecretManager
        {
            SecretName = "prod/multipay/secrets",
            Region = "us-east-1"
        };

        public static EnvironmentKey.AWS.AmazonS3 GetMockEnvironmentKeyAWSAmazonS3() => new EnvironmentKey.AWS.AmazonS3
        {
            BucketName = "multipay-comprovantes-bucket"
        };

        public static EnvironmentKey.AWS GetMockEnvironmentKeyAWS() => new EnvironmentKey.AWS
        {
            SecretManagerInformation = GetMockEnvironmentKeyAWSSecretManager(),
            S3Information = GetMockEnvironmentKeyAWSAmazonS3()
        };

        public static EnvironmentKey.SqlServer GetMockEnvironmentKeySqlServer() => new EnvironmentKey.SqlServer
        {
            Server = "db.exemplo.com",
            UserId = "admin_sql",
            Password = "senha_super_secreta",
            DataBase = "MultipayDB"
        };

        public static EnvironmentKey.Multilog GetMockEnvironmentKeyMultilog() => new EnvironmentKey.Multilog
        {
            Endpoint = "https://logs.exemplo.com/api",
            UserName = "multilog_user",
            Password = "multilog_password"
        };

        public static EnvironmentKey GetMockEnvironmentKey() => new EnvironmentKey
        {
            AWSInformation = GetMockEnvironmentKeyAWS(),
            SqlServerInformation = GetMockEnvironmentKeySqlServer(),
            MultilogInformation = GetMockEnvironmentKeyMultilog(),
            PersistenceInformation = GetMockEnvironmentKeyPersistence()
        };

        public static IFormFileCollection GetMockIFormFileCollection()
        {
            var content = "Conteúdo fake do comprovante de pagamento";
            var fileName = "comprovante_pagamento.pdf";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            var file = new FormFile(ms, 0, ms.Length, "files", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new FormFileCollection { file };
        }

        public static IFormFile GetMockIFormFile(string fileName = "file.pdf")
        {
            var content = "Fake file content";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            return new FormFile(ms, 0, ms.Length, "files", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };
        }


        public static byte[] GetMockFileBytes() =>
        System.Text.Encoding.UTF8.GetBytes("Conteúdo fake do arquivo para teste de upload");

        public static S3UploadResult GetMockS3UploadResult() => new()
        {
            Key = "manual-payment/recibo.pdf",
        };

        //public static ManualPaymentDto GetMockManualPaymentDto() 
        //{
        //    var manualPaymentId = Guid.NewGuid();
        //    var requesterId = Guid.NewGuid().ToString();

        //    return new ManualPaymentDto
        //    {
        //        // Propriedades Próprias
        //        Id = manualPaymentId,
        //        OrderId = Guid.NewGuid(),
        //        Amount = 1250.75,
        //        Reason = "Pagamento de fornecedor externo",
        //        CreatedAt = DateTime.UtcNow.AddDays(-1),
        //        UpdatedAt = DateTime.UtcNow,
        //        ApprovedAt = DateTime.UtcNow,

        //        // Relacionamento: Status
        //        StatusId = (int)ManualPaymentStatusEnum.APPROVED,
        //        Status = new PaymentStatusDto
        //        {
        //            Id = (int)ManualPaymentStatusEnum.APPROVED,
        //            Description = "APPROVED"
        //        },

        //        // Relacionamento: Requester
        //        RequesterId = requesterId,
        //        Requester = new RequesterDto
        //        {
        //            Id = requesterId,
        //            Name = "Sistema Automatizado",
        //            Email = "sistema@multipay.com"
        //        },

        //        // Relacionamento: Receipts (Lista)
        //        Receipts = new List<PaymentReceiptDto>
        //    {
        //        new()
        //        {
        //            Id = Guid.NewGuid(),
        //            ManualPaymentId = manualPaymentId,
        //            DocumentName = "nota_fiscal_001.pdf",
        //            CreatedAt = DateTime.UtcNow
        //        }
        //    },

        //        // Relacionamento: Approvals (Lista)
        //        Approvals = new List<PaymentApprovalDto>
        //    {
        //        new()
        //        {
        //            Id = Guid.NewGuid(),
        //            ManualPaymentId = manualPaymentId,
        //            IsApproved = true,
        //            RequesterId = requesterId,
        //            RejectionReason = null
        //        }
        //    }
        //    };
        //}

        public static ManualPaymentDto GetMockManualPaymentDto(Guid? orderId = null)
        {
            var manualPaymentId = Guid.NewGuid();
            return new ManualPaymentDto
            {
                Id = manualPaymentId,
                OrderId = orderId ?? Guid.NewGuid(),
                Amount = 1500.50,
                Reason = "Pagamento referente a serviço de consultoria",
                ApprovedAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow,
                StatusId = 1,
                RequesterId = "user-123",
                Requester = new RequesterDto
                {
                    Id = "user-123",
                    Name = "John Doe",
                    Email = "john.doe@multipay.com"
                },
                Status = new PaymentStatusDto
                {
                    Id = 1,
                    Description = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                Receipts = new List<PaymentReceiptDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ManualPaymentId = manualPaymentId,
                    DocumentName = "receipt_01.pdf",
                    CreatedAt = DateTime.UtcNow
                }
            },
                Approvals = new List<PaymentApprovalDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ManualPaymentId = manualPaymentId,
                    IsApproved = true,
                    RequesterId = "approver-456",
                    RejectionReason = string.Empty
                }
            }
            };
        }

        public static ManualPaymentDto GetMockManualPaymentDto(Guid? id = null, Guid? orderId = null)
        {
            var manualPaymentId = id ?? Guid.NewGuid();
            return new ManualPaymentDto
            {
                Id = manualPaymentId,
                OrderId = orderId ?? Guid.NewGuid(),
                Amount = 2500.75,
                Reason = "Pagamento de bônus por performance",
                ApprovedAt = DateTime.UtcNow.AddHours(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow,
                RequesterId = "USER-001",
                StatusId = 2,
                Requester = new RequesterDto
                {
                    Id = "USER-001",
                    Name = "Desenvolvedor Sênior",
                    Email = "senior@multipay.com"
                },
                Status = new PaymentStatusDto
                {
                    Id = 2,
                    Description = "Approved",
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow
                },
                Receipts = new List<PaymentReceiptDto>
            {
                new() {
                    Id = Guid.NewGuid(),
                    ManualPaymentId = manualPaymentId,
                    DocumentName = "comprovante_fiscal.pdf",
                    CreatedAt = DateTime.UtcNow
                }
            },
                Approvals = new List<PaymentApprovalDto>
            {
                new() {
                    Id = Guid.NewGuid(),
                    ManualPaymentId = manualPaymentId,
                    IsApproved = true,
                    RequesterId = "APPROVER-99",
                    RejectionReason = string.Empty
                }
            }
            };
        }

        public static PaymentReceiptDto GetMockPaymentReceiptDto() => new()
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = Guid.NewGuid(),
            DocumentName = "recibo_teste.png",
            CreatedAt = DateTime.UtcNow
        };

        public static PaymentApprovalDto GetMockPaymentApprovalDto() => new()
        {
            Id = Guid.NewGuid(),
            ManualPaymentId = Guid.NewGuid(),
            IsApproved = false,
            RejectionReason = "Documentação incompleta",
            RequesterId = "ADMIN-01"
        };

        public static ErrorResult GetMockErrorResult(bool isError = false) => new()
        {
            Error = isError,
            Message = isError ? "Internal Server Error" : string.Empty,
            StatusCode = isError ? ErrorCode.InternalServerError : ErrorCode.NotFound,
            Id = isError ? Guid.NewGuid().ToString() : string.Empty
        };

    }
}
