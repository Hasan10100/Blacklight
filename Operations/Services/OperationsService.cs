using Microsoft.EntityFrameworkCore;
using Operations.DbContexts;
using Operations.Models;
using Operations.Services.IServices;

namespace Operations.Services;

public class OperationsService(AppDbContext context) : IOperationService
{
    public Task<List<Operation>> GetAllOperationsAsync()
    {
        return context.Operations.ToListAsync();
    }

    public async Task<Operation> CreateOperationAsync(Operation operation)
    {
        operation.CreatedAt = DateTime.UtcNow;
        context.Operations.Add(operation);
        await context.SaveChangesAsync();
        return operation;
    }
}
