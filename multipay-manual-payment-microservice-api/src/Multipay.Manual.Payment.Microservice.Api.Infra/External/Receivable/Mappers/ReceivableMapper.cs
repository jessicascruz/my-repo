using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Receivable.Entities;
using Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Entities.Dtos;
using System.Net;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.External.Receivable.Mappers;

public static class ReceivableMapper
{
    public static ReceivableResponse ToDomain(this ReceivableDto dto)
    {
        return new ReceivableResponse
        {
            Id = dto.Id,
            Status = dto.Status,
            Amount = dto.Amount,
        };
    }

    private static List<Item> ToDomain(this List<ItemDto> itemsDto)
    {
        List<Item> itemList = new();
        foreach (ItemDto item in itemsDto)
        {
            itemList.Add(new Item
            {
                Id = item.Id,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Image = item.Image,
                Name = item.Name
            });
        }
        return itemList;
    }

    private static List<ReceivablePayment> ToDomain(this List<PaymentDto> paymentListDto)
    {
        List<ReceivablePayment> paymentList = new();
        foreach (PaymentDto payment in paymentListDto)
        {
            paymentList.Add(new ReceivablePayment
            {
                Id = payment.Id,
                Amount = payment.Amount,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt,
                Status = payment.Status,
                Method = payment.Method,
                Pix = payment.Pix?.ToDomain(),
                StatusDetail = payment.StatusDetail,
                Ticket = payment.Ticket?.ToDomain(),
                Acquirer = new PaymentAcquirer
                {
                    Description = payment.Acquirer.Description,
                    Id = payment.Acquirer.Id,
                    Nsu = payment.Acquirer.Nsu,
                    PaymentId = payment.Acquirer.PaymentId,
                    TransactionId = payment.Acquirer.TransactionId,
                },
                AuthorizedAt = payment.AuthorizedAt,
                ApprovedAt = payment.ApprovedAt,
            });
        }
        return paymentList;
    }

    public static PaymentTicket ToDomain(this PaymentTicketDto ticketDto)
    {
        return new PaymentTicket
        {
            BarCode = ticketDto.BarCode,
            Url = ticketDto.Url
        };
    }

    public static PaymentPix ToDomain(this PaymentPixDto pixDto)
    {
        return new PaymentPix
        {
            QrCode = pixDto.QrCode,
            Code = pixDto.Code,
        };
    }

    public static ReceivableCompany ToDomain(this ReceivableCompanyDto companyDto) => new() { Id = companyDto.Id, Code = companyDto.Code, Description = companyDto.Description };

    public static List<ReceivableRefund> ToDomain(this List<ReceivableRefundDto> refundDtoList)
    {
        List<ReceivableRefund> refundList = new();

        foreach (var dto in refundDtoList)
        {
            var refund = new ReceivableRefund
            {
                Id = dto.Id,
                Amount = dto.Amount,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
                Requester = new ReceivableRefundRequester
                {
                    Id = dto.Requester.Id,
                    Name = dto.Requester.Name,
                    Email = dto.Requester.Email
                },
                Acquirer = new ReceivableRefundAcquirer
                {
                    Id = dto.Acquirer.Id,
                    Description = dto.Acquirer.Description,
                    PaymentId = dto.Acquirer.PaymentId,
                    RefundId = dto.Acquirer.RefundId,
                    Status = dto.Acquirer.Status,
                    StatusDetail = dto.Acquirer.StatusDetail
                }
            };

            refundList.Add(refund);
        }

        return refundList;
    }
}
