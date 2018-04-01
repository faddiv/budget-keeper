﻿using System;
using OnlineWallet.Web.TestHelpers;

namespace OnlineWallet.Web.Modules.GeneralDataModule.Queries
{
    public class ArticleQueriesTests : IDisposable
    {
        public ServicesFixture Fixture { get; }
        public IArticleQueries ArticleQueries { get; }
        protected const string ArticleName = "TestArticle";

        public ArticleQueriesTests(DatabaseFixture fixture)
        {
            Fixture = fixture.CreateServiceFixture();
            ArticleQueries = Fixture.GetService<IArticleQueries>();
        }

        public void Dispose()
        {
            Fixture?.Cleanup();
        }

    }
}