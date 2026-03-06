FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y curl

RUN ARCH=$(if [ "$(uname -m)" = "x86_64" ]; then echo "amd64"; elif [ "$(uname -m)" = "aarch64" ]; then echo "arm64"; else echo "amd64"; fi) \
  && TRACER_VERSION=$(curl -s https://api.github.com/repos/DataDog/dd-trace-dotnet/releases/latest | grep tag_name | cut -d '"' -f 4 | cut -c2-) \
  && curl -Lo /tmp/datadog-dotnet-apm.deb https://github.com/DataDog/dd-trace-dotnet/releases/download/v${TRACER_VERSION}/datadog-dotnet-apm_${TRACER_VERSION}_${ARCH}.deb

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Multipay.Manual.Payment.Microservice.Api.App/Multipay.Manual.Payment.Microservice.Api.App.csproj", "src/Multipay.Manual.Payment.Microservice.Api.App/"]
COPY ["src/Multipay.Manual.Payment.Microservice.Api.Domain/Multipay.Manual.Payment.Microservice.Api.Domain.csproj", "src/Multipay.Manual.Payment.Microservice.Api.Domain/"]
COPY ["src/Multipay.Manual.Payment.Microservice.Api.Infra/Multipay.Manual.Payment.Microservice.Api.Infra.csproj", "src/Multipay.Manual.Payment.Microservice.Api.Infra/"]

RUN dotnet restore "src/Multipay.Manual.Payment.Microservice.Api.App/Multipay.Manual.Payment.Microservice.Api.App.csproj"
COPY . .
WORKDIR "/src/src/Multipay.Manual.Payment.Microservice.Api.App/"
RUN dotnet build "Multipay.Manual.Payment.Microservice.Api.App.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Multipay.Manual.Payment.Microservice.Api.App.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS runtime
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /etc/ssl/openssl.cnf
RUN mkdir -p /opt/datadog \
  && mkdir -p /var/log/datadog \
  && dpkg -i /tmp/datadog-dotnet-apm.deb \
  && rm /tmp/datadog-dotnet-apm.deb

ENV CORECLR_ENABLE_PROFILING=1
ENV CORECLR_PROFILER={846F5F1C-F9AE-4B07-969E-05C26BC060D8}
ENV CORECLR_PROFILER_PATH=/opt/datadog/Datadog.Trace.ClrProfiler.Native.so
ENV DD_DOTNET_TRACER_HOME=/opt/datadog
ENV DD_INTEGRATIONS=/opt/datadog/integrations.json
ENV DD_LOGS_INJECTION=true
ENV DD_RUNTIME_METRICS_ENABLED=true
ENTRYPOINT ["dotnet", "Multipay.Manual.Payment.Microservice.Api.App.dll"]