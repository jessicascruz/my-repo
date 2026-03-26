Multipay.Manual.Payment.Microservice.Api.App.Test
Multipay.Manual.Payment.Microservice.Api.Domain.Test
Multipay.Manual.Payment.Microservice.Api.Infra.Test
Multipay.Manual.Payment.Microservice.Api.Test.Mocks


---

# Referências de Projetos

##### App

```
  <ItemGroup>
    <ProjectReference Include="..\..\src\Multipay.Manual.Payment.Microservice.Api.App\Multipay.Manual.Payment.Microservice.Api.App.csproj" />
    <ProjectReference Include="..\..\src\Multipay.Manual.Payment.Microservice.Api.Domain\Multipay.Manual.Payment.Microservice.Api.Domain.csproj" />
  </ItemGroup>
```



##### Domain

```
  <ItemGroup>
    <ProjectReference Include="..\..\src\Multipay.Manual.Payment.Microservice.Api.Domain\Multipay.Manual.Payment.Microservice.Api.Domain.csproj" />
    <ProjectReference Include="..\Multipay.Manual.Payment.Microservice.Api.Test.Mocks\Multipay.Manual.Payment.Microservice.Api.Test.Mocks.csproj" />
  </ItemGroup>
```

##### Infra

```
  <ItemGroup>
    <ProjectReference Include="..\..\src\Multipay.Manual.Payment.Microservice.Api.Domain\Multipay.Manual.Payment.Microservice.Api.Domain.csproj" />
    <ProjectReference Include="..\..\src\Multipay.Manual.Payment.Microservice.Api.Infra\Multipay.Manual.Payment.Microservice.Api.Infra.csproj" />
    <ProjectReference Include="..\Multipay.Manual.Payment.Microservice.Api.Test.Mocks\Multipay.Manual.Payment.Microservice.Api.Test.Mocks.csproj" />
  </ItemGroup>
```

##### Mock

```
Inserir código
```


--- 

###### DEPENDÊNCIAS

###### APP

```
 <ItemGroup>
    <PackageReference Include="coverlet.collector" Version="8.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="coverlet.msbuild" Version="8.0.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="JunitXml.TestLogger" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Http.Abstractions" Version="2.3.9" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="18.3.0" />
    <PackageReference Include="NSubstitute" Version="5.3.0" />
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.1.5">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

```

###### DOMAIN

```
	<ItemGroup>
		<PackageReference Include="coverlet.collector" Version="8.0.0">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="coverlet.msbuild" Version="8.0.0">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="JunitXml.TestLogger" Version="8.0.0" />
		<PackageReference Include="Microsoft.AspNetCore.Http.Abstractions" Version="2.3.9" />
		<PackageReference Include="Microsoft.NET.Test.Sdk" Version="18.3.0" />
		<PackageReference Include="NSubstitute" Version="5.3.0" />
		<PackageReference Include="xunit" Version="2.9.3" />
		<PackageReference Include="xunit.runner.visualstudio" Version="3.1.5">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
	</ItemGroup>
```

###### INFRA

```
	<ItemGroup>
		<PackageReference Include="coverlet.collector" Version="8.0.0">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="coverlet.msbuild" Version="8.0.0">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
		<PackageReference Include="JunitXml.TestLogger" Version="8.0.0" />
		<PackageReference Include="Microsoft.AspNetCore.Http.Abstractions" Version="2.3.9" />
		<PackageReference Include="Microsoft.NET.Test.Sdk" Version="18.3.0" />
		<PackageReference Include="NSubstitute" Version="5.3.0" />
		<PackageReference Include="xunit" Version="2.9.3" />
		<PackageReference Include="xunit.runner.visualstudio" Version="3.1.5">
			<PrivateAssets>all</PrivateAssets>
			<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
		</PackageReference>
	</ItemGroup>
```

---


