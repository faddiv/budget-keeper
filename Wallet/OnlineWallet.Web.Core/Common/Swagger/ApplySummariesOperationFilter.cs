using Microsoft.AspNetCore.Mvc.Controllers;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace OnlineWallet.Web.Common.Swagger
{
    public class ApplySummariesOperationFilter : IOperationFilter
    {
        #region  Public Methods

        public void Apply(Operation operation, OperationFilterContext context)
        {
            var controllerActionDescriptor = context.ApiDescription.ActionDescriptor as ControllerActionDescriptor;
            if (controllerActionDescriptor == null) return;

            var actionName = controllerActionDescriptor.ActionName;
            var resourceName = controllerActionDescriptor.ControllerName.TrimEnd('s');

            if (actionName == "Post")
            {
                operation.Summary = $"Creates a {resourceName}";
                operation.Parameters[0].Description = $"a {resourceName} representation";
            }
            else if (actionName == "GetAll")
            {
                operation.Summary = $"Returns all {resourceName}s";
            }
            else if (actionName == "GetById")
            {
                operation.Summary = $"Retrieves a {resourceName} by unique id";
            }
            else if (actionName == "Put")
            {
                operation.Summary = $"Updates a {resourceName} by unique id";
                operation.Parameters[0].Description = $"a unique id for the {resourceName}";
                operation.Parameters[1].Description = $"a {resourceName} representation";
            }
            else if (actionName == "Delete")
            {
                operation.Summary = $"Deletes a {resourceName} by unique id";
                operation.Parameters[0].Description = $"a unique id for the {resourceName}";
            }
        }

        #endregion
    }
}