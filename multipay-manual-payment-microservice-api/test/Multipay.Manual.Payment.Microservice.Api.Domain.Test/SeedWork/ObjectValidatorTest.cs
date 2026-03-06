using System;
using System.Collections.Generic;
using System.Text;
using Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.Test.SeedWork
{
    public class ObjectValidatorTest
    {
        public class TestObjectValidator : ObjectValidator
        {
            public new bool AllPropertiesAreFilled(object? obj) => base.AllPropertiesAreFilled(obj);
        }
        public class TestObject
        {
            public string Property1 { get; set; } = string.Empty;
            public int Property2 { get; set; }
            public SubObject? SubObjectProperty { get; set; } = new();
        }

        public class SubObject
        {
            public string? SubProperty1 { get; set; } = string.Empty;
        }

        [Fact]
        public void AllPropertiesAreFilled_AllPropertiesFilled_ReturnsTrue()
        {
            // Arrange
            var validator = new TestObjectValidator();

            // Act
            var testObject = new TestObject
            {
                Property1 = "value1",
                Property2 = 10,
                SubObjectProperty = new SubObject
                {
                    SubProperty1 = "subvalue1"
                }
            };

            // Assert
            Assert.True(validator.AllPropertiesAreFilled(testObject));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void AllPropertiesAreFilled_NullOrEmptyProperty_ReturnsFalse(string propertyValue)
        {
            // Arrange
            var validator = new TestObjectValidator();

            // Act
            var testObject = new TestObject
            {
                Property1 = propertyValue,
                Property2 = 10,
                SubObjectProperty = new SubObject
                {
                    SubProperty1 = "subvalue1"
                }
            };

            // Assert
            Assert.False(validator.AllPropertiesAreFilled(testObject));
        }

        [Fact]
        public void AllPropertiesAreFilled_NullSubObject_ReturnsFalse()
        {
            // Arrange
            var validator = new TestObjectValidator();

            // Act
            var testObject = new TestObject
            {
                Property1 = "value1",
                Property2 = 10,
                SubObjectProperty = null
            };

            // Assert
            Assert.False(validator.AllPropertiesAreFilled(testObject));
        }

        [Fact]
        public void AllPropertiesAreFilled_NullSubProperty_ReturnsFalse()
        {
            // Arrange
            var validator = new TestObjectValidator();

            // Act
            var testObject = new TestObject
            {
                Property1 = "value1",
                Property2 = 10,
                SubObjectProperty = new SubObject()
                {
                    SubProperty1 = null
                }
            };

            // Assert
            Assert.False(validator.AllPropertiesAreFilled(testObject));
        }
    }

}
