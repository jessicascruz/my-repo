namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork.Paging;

public class Paging : IPaging
{
    public int Total { get; set; }
    public int CurrentPage { get; set; }
    public int PerPage { get; set; }
    public int Pages { get; set; }
}
