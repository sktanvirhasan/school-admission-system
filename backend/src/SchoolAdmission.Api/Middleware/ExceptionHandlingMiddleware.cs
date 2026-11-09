using System.Text.Json;

namespace SchoolAdmission.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            if (context.Response.HasStarted) throw;

            var (status, message) = ex switch
            {
                BadHttpRequestException => (StatusCodes.Status400BadRequest, "Invalid request."),
                JsonException => (StatusCodes.Status400BadRequest, "Invalid JSON body."),
                _ => (StatusCodes.Status500InternalServerError, "Something went wrong on the server.")
            };

            if (status >= 500)
                logger.LogError(ex, "Unhandled exception");

            context.Response.Clear();
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new { message });
        }
    }
}