using Xinobi.SharedKernel;

namespace Xinobi.Architecture.Tests;

public sealed class BootstrapTests
{
    [Fact]
    public void SharedKernelAssemblyCanBeLoaded()
    {
        Assert.Equal("Xinobi.SharedKernel", typeof(AssemblyMarker).Assembly.GetName().Name);
    }
}
