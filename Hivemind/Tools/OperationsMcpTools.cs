using System.ComponentModel;
using Hivemind.Clients;
using ModelContextProtocol.Server;

namespace Hivemind.Tools;

[McpServerToolType]
public class OperationsMcpTools(OperationsApiClient operationsClient)
{
    [McpServerTool]
    [Description("Gets all current operations from the system")]
    public Task<string> GetAllOperationsAsync()
    {
        return operationsClient.GetAllOperationsAsync();
    }

    [McpServerTool]
    [Description("Creates a new operation in the system")]
    public Task<string> CreateOperationAsync(
        [Description("The title or name of the operation")] string name,
        [Description("Details describing what this operation performs")] string description)
    {
        return operationsClient.CreateOperationAsync(name, description);
    }
}
