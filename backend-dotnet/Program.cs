using backend_dotnet.Data;
using backend_dotnet.Services;   // ✅ REQUIRED for GeminiService & MongoService
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// 🔹 Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 PostgreSQL (EF Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// 🔹 MongoDB
builder.Services.AddSingleton<MongoService>();

// 🔹 Gemini API
builder.Services.AddSingleton<GeminiService>();

// 🔹 CORS (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// 🔹 Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthorization();

app.MapControllers();

app.Run();
