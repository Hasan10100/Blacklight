using Operations.Models;

namespace Operations.Services.IServices;

public interface IOperationService
{
    Task<List<Operation>> GetAllOperationsAsync();
    Task<Operation> CreateOperationAsync(Operation operation);
}
