﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using OnlineWallet.ExportImport;
using OnlineWallet.Web.DataLayer;
using OnlineWallet.Web.Modules.TransactionModule.Models;
using OnlineWallet.Web.TestHelpers;
using OnlineWallet.Web.TestHelpers.Builders;
using TestStack.Dossier.Lists;
using Xunit;

namespace OnlineWallet.Web.Modules.TransactionModule
{
    [Trait(nameof(TransactionController), nameof(TransactionController.BatchSave))]
    public class TransactionControllerBatchSaveTests : TransactionControllerTests
    {
        #region Fields

        private const string ExampleCategoryName = "cat";
        private const string FirstArticleName = "first";
        private const string SecondArticleName = "second";

        private readonly Transaction _transaction1;
        private readonly Transaction _transaction2;

        #endregion

        #region  Constructors

        public TransactionControllerBatchSaveTests()
        {
            _transaction1 = new Transaction
            {
                Name = FirstArticleName,
                Category = ExampleCategoryName,
                Comment = "comment",
                CreatedAt = DateTime.Parse("2017-09-16"),
                Direction = MoneyDirection.Expense,
                Value = 101,
                WalletId = Fixture.WalletCash.MoneyWalletId
            };
            _transaction2 = new Transaction
            {
                Name = SecondArticleName,
                Category = ExampleCategoryName,
                Comment = "comment",
                CreatedAt = DateTime.Parse("2017-09-16"),
                Direction = MoneyDirection.Expense,
                Value = 102,
                WalletId = Fixture.WalletBankAccount.MoneyWalletId
            };
            Fixture.DbContext.Transactions.AddRange(_transaction1, _transaction2);
            var article1 = new Article
            {
                Name = FirstArticleName,
                Category = ExampleCategoryName,
                LastPrice = 101,
                LastUpdate = DateTime.Parse("2017-09-16"),
                LastWalletId = Fixture.WalletCash.MoneyWalletId,
                Occurence = 1
            };
            Fixture.DbContext.Article.Add(article1);
            var article2 = new Article
            {
                Name = SecondArticleName,
                Category = ExampleCategoryName,
                LastPrice = 102,
                LastUpdate = DateTime.Parse("2017-09-16"),
                LastWalletId = Fixture.WalletBankAccount.MoneyWalletId,
                Occurence = 1
            };
            Fixture.DbContext.Article.Add(article2);
            Fixture.DbContext.SaveChanges();
        }

        #endregion

        #region  Public Methods

        [Fact(DisplayName = nameof(Can_delete_transactions_by_id))]
        public async Task Can_delete_transactions_by_id()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.DeleteBatch(
                new List<long> {_transaction1.TransactionId});
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert

            ControllerTestHelpers.ValidateJsonResult<List<Transaction>>(actionResult);
            Fixture.DbContext.Transactions.Should()
                .NotContain(e => e.TransactionId == _transaction1.TransactionId, "it is deleted");
        }


        [Fact(DisplayName = nameof(Empty_text_fields_saved_as_null))]
        public async Task Empty_text_fields_saved_as_null()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(new TransactionBuilder()
                .WithCategory("")
                .WithComment("")
                .Build());
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            var result = Fixture.DbContext.Transactions.Find(ControllerTestHelpers
                .ValidateJsonResult<IEnumerable<Transaction>>(actionResult).FirstOrDefault()?.TransactionId);
            result.Category.Should().BeNull("it saves empty string as null");
            result.Comment.Should().BeNull("it saves empty string as null");
        }

        [Fact(DisplayName = nameof(Only_saves_date_not_time))]
        public async Task Only_saves_date_not_time()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(new TransactionBuilder()
                .WithCreatedAt("2017-09-16 13:12"));
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            var result = ControllerTestHelpers.ValidateJsonResult<IList<Transaction>>(actionResult);
            var dateTime = DateTime.Parse("2017-09-16 00:00");
            result[0].CreatedAt.Should().Be(dateTime, "it removes time part in the result");
            var entity = Fixture.DbContext.Transactions.Find(result[0].TransactionId);
            entity.CreatedAt.Should().Be(dateTime, "it removes time part in the database");
        }

        [Fact(DisplayName = nameof(Returns_BadRequest_if_input_invalid))]
        public async Task Returns_BadRequest_if_input_invalid()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(
                TransactionBuilder.CreateListOfSize(1).BuildList().ToList());
            controller.ModelState.AddModelError("Name", "Invalid");
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            ControllerTestHelpers.ResultShouldBeBadRequest(actionResult);
        }

        [Fact(DisplayName = nameof(Saves_new_Transactions))]
        public async Task Saves_new_Transactions()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(new List<Transaction>
            {
                new Transaction
                {
                    Name = "third",
                    Category = ExampleCategoryName,
                    Comment = "comment",
                    CreatedAt = DateTime.Parse("2017-09-16"),
                    Direction = MoneyDirection.Expense,
                    Value = 101,
                    WalletId = Fixture.WalletCash.MoneyWalletId
                },
                new Transaction
                {
                    Name = "fourth",
                    Category = ExampleCategoryName,
                    Comment = "comment",
                    CreatedAt = DateTime.Parse("2017-09-16"),
                    Direction = MoneyDirection.Expense,
                    Value = 102,
                    WalletId = Fixture.WalletBankAccount.MoneyWalletId
                }
            });
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            Fixture.DbContext.Transactions.Count().Should().Be(4);
            Fixture.DbContext.Transactions.Should().Contain(e => e.Name == "third");
            Fixture.DbContext.Transactions.Should().Contain(e => e.Name == "fourth");

            var result = ControllerTestHelpers.ValidateJsonResult<List<Transaction>>(actionResult);
            result.Should().NotBeNullOrEmpty();
            result.Should().OnlyContain(e => e.TransactionId > 0, "all element got an id");
        }

        [Fact(DisplayName = nameof(Trims_text_fields_before_save))]
        public async Task Trims_text_fields_before_save()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(new TransactionBuilder()
                .WithName(" text ")
                .WithCategory(" text ")
                .WithComment(" text ")
                .Build());
            //act
            var actionResult = await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            var result = Fixture.DbContext.Transactions.Find(ControllerTestHelpers
                .ValidateJsonResult<IEnumerable<Transaction>>(actionResult).FirstOrDefault()?.TransactionId);
            result.Name.Should().Be("text", "it removes trailing spaces");
            result.Category.Should().Be("text", "it removes trailing spaces");
            result.Comment.Should().Be("text", "it removes trailing spaces");
        }

        [Fact(DisplayName = nameof(Updates_article_table))]
        public async Task Updates_article_table()
        {
            //arrange
            var newCategory = "cat2";
            var controller = Fixture.GetService<TransactionController>();
            DateTime newDate = DateTime.Parse("2017-10-17");
            var transactions = new TransactionOperationBatch(new List<Transaction>
            {
                new Transaction
                {
                    TransactionId = _transaction1.TransactionId,
                    Name = FirstArticleName,
                    Category = newCategory,
                    Comment = "comment",
                    CreatedAt = newDate,
                    Direction = MoneyDirection.Expense,
                    Value = 105,
                    WalletId = Fixture.WalletBankAccount.MoneyWalletId
                },
                new Transaction
                {
                    Name = FirstArticleName,
                    Category = newCategory,
                    Comment = "comment",
                    CreatedAt = newDate,
                    Direction = MoneyDirection.Expense,
                    Value = 105,
                    WalletId = Fixture.WalletBankAccount.MoneyWalletId
                }
            }, new List<long> {_transaction2.TransactionId});
            //act
            await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            var articles = Fixture.DbContext.Article.ToList();

            articles.Where(e => e.Name == FirstArticleName).Should().HaveCount(1);
            var articleEntity = articles.Should().Contain(e => e.Name == FirstArticleName).Which;
            articleEntity.Should().NotBeNull();
            articleEntity.Category.Should().Be(newCategory);
            articleEntity.LastPrice.Should().Be(105);
            articleEntity.LastUpdate.Should().Be(newDate);
            articleEntity.LastWalletId.Should().Be(Fixture.WalletBankAccount.MoneyWalletId);
            articleEntity.Occurence.Should().Be(2);

            articles.Where(e => e.Name == SecondArticleName).Should().HaveCount(0);
        }

        [Fact(DisplayName = nameof(Updates_existing_Transactions))]
        public async Task Updates_existing_Transactions()
        {
            //arrange
            var controller = Fixture.GetService<TransactionController>();
            var transactions = TransactionOperationBatch.SaveBatch(TransactionBuilder.CreateListOfSize(2)
                .TheFirst(1)
                .WithTransactionId(_transaction1.TransactionId)
                .WithName("third")
                .TheNext(1)
                .WithTransactionId(_transaction2.TransactionId)
                .WithName("fourth")
                .BuildList());
            //act
            await controller.BatchSave(transactions, CancellationToken.None);

            //assert
            Fixture.DbContext.Transactions.Count().Should().Be(2);
            Fixture.DbContext.Transactions.Should().Contain(e => e.Name == "third");
            Fixture.DbContext.Transactions.Should().Contain(e => e.Name == "fourth");
        }

        #endregion
    }
}