using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Xinobi.Persistence;
using Xinobi.Persistence.Entities;

namespace Xinobi.Architecture.Tests;

public sealed class TransactionalAuditCaptureTests
{
    [Fact]
    public void RetryDoesNotDuplicatePendingBusinessAuditOrAuditRequestAttemptRows()
    {
        using var db = new XinobiDbContext(new DbContextOptionsBuilder<XinobiDbContext>()
            .UseSqlServer("Server=unused;Database=unused").Options);
        var previous = AuditExecution.Current;
        try
        {
            AuditExecution.Current = new AuditActor(Guid.NewGuid(), ["super_admin"], "test.change", "retry-test");
            db.Users.Add(new User { Id = Guid.NewGuid(), Email = "private@example.invalid",
                NormalizedEmail = "private@example.invalid", PasswordHash = "do-not-record",
                Kind = "staff", Status = "active" });
            var capture = typeof(TransactionalAudit).GetMethod("Capture", BindingFlags.NonPublic | BindingFlags.Static)!;
            capture.Invoke(null, [db]);
            capture.Invoke(null, [db]);
            var entry = Assert.Single(db.ChangeTracker.Entries<AuditLog>()).Entity;
            Assert.Contains("business-change", entry.SafeDiff);
            Assert.DoesNotContain("private@example.invalid", entry.SafeDiff);
            Assert.DoesNotContain("do-not-record", entry.SafeDiff);
            // The existing request logger writes AuditLog rows; those must never recursively audit.
            db.Users.Local.Clear();
            capture.Invoke(null, [db]);
            Assert.Single(db.ChangeTracker.Entries<AuditLog>());
        }
        finally { AuditExecution.Current = previous; }
    }
}
