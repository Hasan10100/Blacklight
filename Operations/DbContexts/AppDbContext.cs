using Microsoft.EntityFrameworkCore;
using Operations.Models;

namespace Operations.DbContexts;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Operation> Operations { get; set; }
}
