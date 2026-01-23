namespace WMS.Api.DTOs
{
    public class RegisterDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; }
    }

}
