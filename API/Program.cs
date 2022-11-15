using API.Data;
using API.Entities;
using API.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<StoreContext>(o =>
{
    o.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddIdentityCore<User>()
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<StoreContext>();
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
	var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
	var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    try
    {
		await context.Database.MigrateAsync();
		await DbInitializer.Initialize(context, userManager);
	}
	catch (Exception ex)
	{
		logger.LogError(ex, "problem migration data");
	}
}

app.UseMiddleware<ExceptionMiddleware>();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors(opt =>
{
	opt.AllowAnyHeader()
		.AllowAnyMethod()
		.AllowCredentials()
		.WithOrigins("http://localhost:3000");
});

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
