using Microsoft.AspNetCore.Mvc;
using Operations.Models;
using Operations.Services.IServices;

namespace Operations.Controllers;

[ApiController]
[Route("[controller]")]
public class OperationsController(IOperationService operationService) : ControllerBase
{
    private readonly IOperationService _operationService = operationService;

    [HttpGet]
    public async Task<ActionResult<List<Operation>>> GetAllOperations()
    {
        var operations = await _operationService.GetAllOperationsAsync();
        return Ok(operations);
    }

    [HttpPost]
    public async Task<ActionResult<Operation>> CreateOperation([FromBody] Operation operation)
    {
        var createdOperation = await _operationService.CreateOperationAsync(operation);
        return CreatedAtAction(nameof(GetAllOperations), new { id = createdOperation.ID }, createdOperation);
    }
}
