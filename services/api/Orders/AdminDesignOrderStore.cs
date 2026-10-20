using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;

namespace Xinobi.Api.Orders;

public record AdminDesignOrderReference(string Id, string Number, DateTimeOffset CreatedAt);
public record AdminDesignOrderPage(AdminDesignOrderReference[] Items, int Page, int PageSize, long Total, long TotalPages);

/// <summary>Read-only references, without customer/money/address data. One materialization per request, never AllOrders().</summary>
public static class AdminDesignOrderStore
{
    public static void Validate(string designId, int page, int pageSize)
    {
        if (string.IsNullOrWhiteSpace(designId) || designId.Length > 64 || designId.Any(char.IsControl) || page < 1 || pageSize is < 1 or > 100)
            throw new ProblemException("invalid_design_order_query", "Tasarım kimliği veya sayfalama geçersiz.");
    }

    public static async Task<AdminDesignOrderPage> List(XinobiDbContext db, string designId, int page, int pageSize, CancellationToken token = default)
    {
        Validate(designId, page, pageSize);
        if (!db.Database.IsSqlServer()) throw ProblemException.Unavailable("Sipariş referansları");
        var connection = db.Database.GetDbConnection();
        var opened = connection.State != ConnectionState.Open;
        try
        {
            if (opened) await db.Database.OpenConnectionAsync(token);
            await using var command = connection.CreateCommand();
            command.CommandTimeout = db.Database.GetCommandTimeout() ?? 30;
            // #Matches is scoped to this parameterized batch/connection. No permanent schema/data changes.
            // Both result sets use the same materialized reference snapshot, including duplicates/zero matches.
            command.CommandText = """
                SET NOCOUNT ON;
                CREATE TABLE #DesignOrderMatches(Id uniqueidentifier, Number nvarchar(64), CreatedAt datetimeoffset);
                INSERT #DesignOrderMatches
                SELECT o.Id,o.Number,o.CreatedAt FROM sales.Orders o
                JOIN (SELECT l.OrderId FROM sales.OrderLines l
                      WHERE JSON_VALUE(l.PersonalizationJson,'$.designId') COLLATE Latin1_General_100_BIN2 = @designId COLLATE Latin1_General_100_BIN2
                      GROUP BY l.OrderId) m ON m.OrderId=o.Id;
                SELECT COUNT_BIG(*) FROM #DesignOrderMatches;
                SELECT Id,Number,CreatedAt FROM #DesignOrderMatches
                ORDER BY CreatedAt DESC,Id ASC OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY;
                DROP TABLE #DesignOrderMatches;
                """;
            command.Parameters.Add(new SqlParameter("@designId", SqlDbType.NVarChar, 64) { Value = designId });
            command.Parameters.Add(new SqlParameter("@offset", SqlDbType.BigInt) { Value = ((long)page - 1) * pageSize });
            command.Parameters.Add(new SqlParameter("@size", SqlDbType.Int) { Value = pageSize });
            await using var reader = await command.ExecuteReaderAsync(token);
            if (!await reader.ReadAsync(token)) throw ProblemException.Unavailable("Sipariş referansları");
            var total = reader.GetInt64(0);
            if (!await reader.NextResultAsync(token)) throw ProblemException.Unavailable("Sipariş referansları");
            var rows = new List<AdminDesignOrderReference>();
            while (await reader.ReadAsync(token)) rows.Add(new(reader.GetGuid(0).ToString("N"), reader.GetString(1), reader.GetFieldValue<DateTimeOffset>(2)));
            // Finish the batch (including DROP), not just the first page rows.
            while (await reader.NextResultAsync(token)) { }
            return new(rows.ToArray(), page, pageSize, total, total / pageSize + (total % pageSize == 0 ? 0 : 1));
        }
        catch (Exception error) when (error is SqlException or InvalidOperationException { InnerException: SqlException })
        { throw ProblemException.Unavailable("Sipariş referansları"); }
        finally { if (opened) await db.Database.CloseConnectionAsync(); }
    }
}
