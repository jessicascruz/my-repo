using Multipay.Manual.Payment.Microservice.Api.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.ManualPayment.Request
{
    public class PaymentApprovalRequest
    {
        //public Guid Id { get; set; }

        public Guid ManualPaymentId { get; set; }

        public bool IsApproved { get; set; }

        public string? RequesterId { get; set; }

        public string? RejectionReason { get; set; }

        public RequesterRequest? Requester { get; set; }

        public string Reference { get; set; } = string.Empty;

    }
}
