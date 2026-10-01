using Hivemind.Clients;
using Hivemind.Tools;
using OpenApiUi;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpClient<OperationsApiClient>(client =>
{
    var operationsUrl = builder.Configuration["Services:OperationsUrl"] ?? "http://localhost:5183";
    client.BaseAddress = new Uri(operationsUrl);
});

// Add CORS for frontend browser access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register MCP Server with HTTP Transport and Tools
builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<OperationsMcpTools>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseOpenApiUi(config => config.OpenApiSpecPath = "/openapi/v1.json");
}

app.UseCors();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "Hivemind MCP" }));

// Map Modern Streamable HTTP MCP Endpoint at /mcp
app.MapMcp("/mcp");

app.MapControllers();

app.Run();
