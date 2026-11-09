namespace SchoolAdmission.Api.Models;

public class Class
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public int TotalSeats { get; set; }
}