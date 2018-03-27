using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OnlineWallet.Web.Common;
using OnlineWallet.Web.DataLayer;
using OnlineWallet.Web.Modules.TransactionModule.Commands;
using OnlineWallet.Web.Modules.TransactionModule.Models;
using OnlineWallet.Web.Modules.TransactionModule.Queries;
using OnlineWallet.Web.Modules.TransactionModule.Services;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace OnlineWallet.Web.Modules.TransactionModule
{
    [Route("api/v1/[controller]")]
    public class TransactionController : Controller
    {
        #region Fields

        private readonly ITransactionCommand batchSave;
        private readonly ITransactionQueries queries;

        #endregion

        #region  Constructors

        public TransactionController(ITransactionQueries queries, ITransactionCommand batchSave)
        {
            this.queries = queries;
            this.batchSave = batchSave;
        }

        #endregion

        #region  Public Methods

        [HttpPost("BatchSave")]
        [SwaggerResponse((int) HttpStatusCode.Created, typeof(List<Transaction>))]
        [SwaggerResponse((int) HttpStatusCode.OK, typeof(List<Transaction>))]
        [SwaggerResponse((int) HttpStatusCode.BadRequest, typeof(object))]
        public async Task<ActionResult> BatchSave(
            [FromBody, Required] TransactionOperationBatch model,
            CancellationToken token)
        {
            if (model == null || !ModelState.IsValid)
            {
                //Model can be null when there was a conversion exception in the incomming model.
                //for example TransactionId is int but the incomming data is null.
                return this.ValidationError();
            }

            model.Save = model.Save ?? new List<Transaction>();
            model.Delete = model.Delete ?? new List<long>();
            await batchSave.Execute(model, token);
            return new JsonResult(model.Save)
            {
                StatusCode = (int) HttpStatusCode.OK
            };
        }

        [HttpGet(nameof(FetchByArticle))]
        [SwaggerResponse((int) HttpStatusCode.OK, typeof(List<Transaction>))]
        public Task<List<Transaction>> FetchByArticle(string article, int limit = 20, int skip = 0,
            CancellationToken token = default(CancellationToken))
        {
            return queries.FetchByArticleAsync(article, limit, skip, token);
        }


        [HttpGet(nameof(FetchByDateRange))]
        [SwaggerResponse((int) HttpStatusCode.OK, typeof(List<Transaction>))]
        public Task<List<Transaction>> FetchByDateRange(DateTime start, DateTime end,
            CancellationToken token = default(CancellationToken))
        {
            return queries.FetchByDateRange(start, end, token);
        }

        #endregion
    }
}