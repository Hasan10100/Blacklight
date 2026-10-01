using System.Net.Http.Json;

namespace Hivemind.Clients;

public class OperationsApiClient(HttpClient httpClient)
{
    public async Task<string> GetAllOperationsAsync()
    {
        var response = await httpClient.GetAsync("/operations");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> CreateOperationAsync(string name, string description)
    {
        var payload = new { Name = name, Description = description };
        var response = await httpClient.PostAsJsonAsync("/operations", payload);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}
