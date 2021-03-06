﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using OnlineWallet.ExportImport;
using OnlineWallet.Web.DataLayer;
using OnlineWallet.Web.TestHelpers;
using Xunit;
using MoneyDirection = OnlineWallet.ExportImport.MoneyDirection;

namespace OnlineWallet.Web.Modules.TransactionModule
{
    [Trait(nameof(ImportController), nameof(ImportController.ProcessTransactions))]
    public class ImportControllerProcessTransactionsTests : ServiceTestBase
    {
        #region Fields

        private const string ImportCsvFilePath = "expectedExpenses.csv";
        
        #endregion
        
        #region  Public Methods
        
        [Fact(DisplayName = nameof(Detects_if_amount_changes_while_name_and_direction_remain_same))]
        public async Task Detects_if_amount_changes_while_name_and_direction_remain_same()
        {
            using (var stream = new FileStream(ImportCsvFilePath, FileMode.Open))
            {
                //Arrange
                var dbContext = Fixture.DbContext;
                var transaction = new Transaction
                {
                    Name = "expense 1",
                    Value = 111,
                    WalletId = 2,
                    Direction = MoneyDirection.Expense,
                    Category = "Category 1",
                    CreatedAt = DateTime.Parse("2017-08-26")
                };
                dbContext.Transactions.Add(transaction);
                dbContext.SaveChanges();
                var controller = Fixture.GetService<ImportController>();
                var formFile = new Mock<IFormFile>();
                formFile.SetupAllProperties();
                formFile.Setup(e => e.OpenReadStream()).Returns(stream);

                //Act
                var result = await controller.ProcessTransactions(formFile.Object);

                //Assert
                var value = result.FirstOrDefault(e => e.Name == "expense 1");
                value.Should().NotBeNull();
                value?.MatchingId.Should().Be(transaction.TransactionId);
            }
        }

        [Fact(DisplayName = nameof(Detects_if_name_changes_while_wallet_and_Amount_remain_same))]
        public async Task Detects_if_name_changes_while_wallet_and_Amount_remain_same()
        {
            using (var stream = new FileStream(ImportCsvFilePath, FileMode.Open))
            {
                //Arrange
                var dbContext = Fixture.DbContext;
                var transaction = new Transaction
                {
                    Name = "Original Name",
                    Value = 123,
                    WalletId = 2,
                    Direction = MoneyDirection.Expense,
                    Category = "Category 1",
                    CreatedAt = DateTime.Parse("2017-08-26")
                };
                dbContext.Transactions.Add(transaction);
                dbContext.SaveChanges();
                var controller = Fixture.GetService<ImportController>();
                var formFile = new Mock<IFormFile>();
                formFile.SetupAllProperties();
                formFile.Setup(e => e.OpenReadStream()).Returns(stream);

                //Act
                var result = await controller.ProcessTransactions(formFile.Object);

                //Assert
                var value = result.FirstOrDefault(e => e.Name == "expense 1");
                value.Should().NotBeNull();
                value?.MatchingId.Should().Be(transaction.TransactionId);
            }
        }

        [Fact(DisplayName = nameof(Reads_valid_import_file))]
        public async Task Reads_valid_import_file()
        {
            using (var stream = new FileStream(ImportCsvFilePath, FileMode.Open))
            {
                //Arrange
                var controller = Fixture.GetService<ImportController>();
                var formFile = new Mock<IFormFile>();
                formFile.SetupAllProperties();
                formFile.Setup(e => e.OpenReadStream()).Returns(stream);

                //Act
                var result = await controller.ProcessTransactions(formFile.Object);

                //Assert
                result.Should().NotBeNullOrEmpty("it reads the file");
                result.ShouldAllBeEquivalentTo(GetSampleData(), "It reads the exact data from file");
            }
        }

        #endregion

        #region  Nonpublic Methods

        private static List<ExportImportRow> GetSampleData()
        {
            return new List<ExportImportRow>
            {
                new ExportImportRow
                {
                    Name = "expense 1",
                    Amount = 123,
                    Category = "category 1",
                    Comment = "comment 1",
                    Created = DateTime.Parse("2017.08.26"),
                    Source = MoneySource.BankAccount.ToString(),
                    Direction = MoneyDirection.Expense
                },
                new ExportImportRow
                {
                    Name = "Salary by Cash",
                    Amount = 123,
                    Created = DateTime.Parse("2017.08.01"),
                    Source = MoneySource.Cash.ToString(),
                    Category = "xxx",
                    Comment = "comment 1",
                    Direction = MoneyDirection.Income
                }
            };
        }

        #endregion
    }
}