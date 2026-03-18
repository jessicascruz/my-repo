﻿using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Multipay.Manual.Payment.Microservice.Api.App.Extensions;
using Multipay.Manual.Payment.Microservice.Api.Domain.Aggregates.AWS;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;
using NSubstitute;

namespace Multipay.Manual.Payment.Microservice.Api.App.Test.Extensions
{
    public class AppBuilderTest : IDisposable
    {
        [Fact]
        public async Task Given_ValidConfigurationAndSecrets_When_FillEnvironmentVariablesIsCalled_Then_AllEnvironmentKeyPropertiesAreFilled()
        {
            // Arrange
            var applicationBuilder = Substitute.For<IApplicationBuilder>();
            var configuration = Substitute.For<IConfiguration>();
            var awsService = Substitute.For<IAwsService>();
            var serviceProvider = Substitute.For<IServiceProvider>();
            var serviceScope = Substitute.For<IServiceScope>();
            var serviceScopeFactory = Substitute.For<IServiceScopeFactory>();

            var environmentKey = new EnvironmentKey();

            Environment.SetEnvironmentVariable(Constant.APP_ENV, Constant.APP_ENV_QA);
            EnvironmentKey.TypeInformation = EnvironmentKey.Type.QA;
            Environment.SetEnvironmentVariable(Constant.AWS_SECRET_MANAGER_NAME, "test-secret-name");
            Environment.SetEnvironmentVariable(Constant.AWS_SECRET_MANAGER_REGION, "us-east-1");
            Environment.SetEnvironmentVariable(Constant.MULTILOG_REQUEST_ENDPOINT, "https://multilog.test.com");
            Environment.SetEnvironmentVariable(Constant.MICROSERVICE_RECEIVABLE_REQUEST_ENDPOINT, "https://receivable.test.com");
            Environment.SetEnvironmentVariable(Constant.VALID_STATUS_ORDER, "Paid,Pending");
            Environment.SetEnvironmentVariable(Constant.AWS_S3_BUCKET_NAME, "multipay-bucket-test");

            var mockSecrets = new Dictionary<string, string>
            {
                { Constant.AWS_SECRET_MANAGER_SQL_SERVER, "sql-server-test" },
                { Constant.AWS_SECRET_MANAGER_SQL_USER, "sql-user-test" },
                { Constant.AWS_SECRET_MANAGER_SQL_PASSWORD, "sql-password-test" },
                { Constant.AWS_SECRET_MANAGER_SQL_DATABASE, "sql-database-test" },
                { Constant.AWS_SECRET_MANAGER_MULTILOG_USERNAME, "multilog-user" },
                { Constant.AWS_SECRET_MANAGER_MULTILOG_PASSWORD, "multilog-pass" },
                { Constant.AWS_SECRET_MANAGER_RECEIVABLE_GATEWAY_TOKEN, "token-123-abc" }
            };

            serviceProvider.GetService(typeof(EnvironmentKey)).Returns(environmentKey);
            serviceProvider.GetService(typeof(IServiceScopeFactory)).Returns(serviceScopeFactory);
            serviceScopeFactory.CreateScope().Returns(serviceScope);
            serviceScope.ServiceProvider.GetService(typeof(IAwsService)).Returns(awsService);
            applicationBuilder.ApplicationServices.Returns(serviceProvider);

            awsService.SelectAsync("test-secret-name", "us-east-1").Returns(mockSecrets);

            // Act
            await applicationBuilder.FillEnvironmentVariables(configuration);

            // Assert

            Assert.Equal("test-secret-name", environmentKey.AWSInformation.SecretManagerInformation.SecretName);
            Assert.Equal("us-east-1", environmentKey.AWSInformation.SecretManagerInformation.Region);
            Assert.Equal("multipay-bucket-test", environmentKey.AWSInformation.S3Information.BucketName);

            Assert.Equal("sql-server-test", environmentKey.SqlServerInformation.Server);
            Assert.Equal("sql-user-test", environmentKey.SqlServerInformation.UserId);
            Assert.Equal("sql-password-test", environmentKey.SqlServerInformation.Password);
            Assert.Equal("sql-database-test", environmentKey.SqlServerInformation.DataBase);
            Assert.Contains("SERVER=sql-server-test", environmentKey.SqlServerInformation.ConnectionString);

            Assert.Equal("https://multilog.test.com", environmentKey.MultilogInformation.Endpoint);
            Assert.Equal("multilog-user", environmentKey.MultilogInformation.UserName);
            Assert.Equal("multilog-pass", environmentKey.MultilogInformation.Password);

            Assert.Equal("Paid,Pending", environmentKey.PersistenceInformation.ValidStatusOrder);

            Assert.Equal("token-123-abc", environmentKey.GatewayInformation.ReceivableToken);

            Assert.Equal("https://receivable.test.com", environmentKey.MicroserviceInformation.ReceivableEndpoint);

            Assert.True(environmentKey.IsValid());
        }

        [Fact]
        public async Task Given_InvalidConfiguration_When_FillEnvironmentVariablesIsCalled_Then_ShouldThrowException()
        {
            // Arrange
            var applicationBuilder = Substitute.For<IApplicationBuilder>();
            var configuration = Substitute.For<IConfiguration>();
            var serviceProvider = Substitute.For<IServiceProvider>();
            var environmentKey = new EnvironmentKey();

            Environment.SetEnvironmentVariable(Constant.APP_ENV, Constant.APP_ENV_DEV);
            EnvironmentKey.TypeInformation = EnvironmentKey.Type.DEV;

            serviceProvider.GetService(typeof(EnvironmentKey)).Returns(environmentKey);
            applicationBuilder.ApplicationServices.Returns(serviceProvider);

            // Act e Assert
            await Assert.ThrowsAsync<Exception>(() => applicationBuilder.FillEnvironmentVariables(configuration));
        }

        public void Dispose()
        {
            Environment.SetEnvironmentVariable(Constant.APP_ENV, null);
            Environment.SetEnvironmentVariable(Constant.AWS_SECRET_MANAGER_NAME, null);
            Environment.SetEnvironmentVariable(Constant.AWS_SECRET_MANAGER_REGION, null);
            Environment.SetEnvironmentVariable(Constant.MULTILOG_REQUEST_ENDPOINT, null);
            Environment.SetEnvironmentVariable(Constant.MICROSERVICE_RECEIVABLE_REQUEST_ENDPOINT, null);
            Environment.SetEnvironmentVariable(Constant.VALID_STATUS_ORDER, null);
            Environment.SetEnvironmentVariable(Constant.AWS_S3_BUCKET_NAME, null);
            
        }
    }
}
