using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.Multipay.Entities.Request;
using System.ComponentModel.DataAnnotations.Schema;

namespace Multipay.Manual.Payment.Microservice.Api.Infra.Data.Multipay.Entities.Dtos;

[Table("Requester", Schema = "Multipay")]
public class RequesterDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

}
