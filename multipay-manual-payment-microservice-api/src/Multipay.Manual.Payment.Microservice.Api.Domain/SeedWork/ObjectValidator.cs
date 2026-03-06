using System.Collections;
using System.Reflection;

namespace Multipay.Manual.Payment.Microservice.Api.Domain.SeedWork;

public abstract class ObjectValidator
{
    protected virtual bool AllPropertiesAreFilled(object? obj) 
    {
        if (obj == null)
            return false;

        if (obj is IEnumerable enumerable && obj is not string)
        {
            var items = enumerable.Cast<object?>().ToList();

            // se é vazia ele vai invalidar
            if (items.Count == 0)
                return false;

            // validando os itens da coleção
            foreach (var item in items)
            {
                if (!AllPropertiesAreFilled(item))
                    return false;
            }
            return true;
        }

        PropertyInfo[] properties = obj.GetType().GetProperties();

        foreach (PropertyInfo property in properties)
        {
            if (property.PropertyType.IsClass && property.PropertyType != typeof(string))
            {
                object? value = property.GetValue(obj);

                if (!AllPropertiesAreFilled(value))
                    return false;
            }
            else
            {
                object? value = property.GetValue(obj);

                if (value == null || value is string && string.IsNullOrEmpty((string)value))
                    return false;
            }
        }

        return true;
    }
}
