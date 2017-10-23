﻿using OnlineWallet.Web.Common;
using OnlineWallet.Web.DataLayer;
using OnlineWallet.Web.TestHelpers;

namespace OnlineWallet.Web.Modules.WalletModule
{
    public class WalletControllerTests : CrudControllerTests<Wallet>
    {
        protected WalletController Controller { get; }
        protected Wallet TestWallet { get; }

        public WalletControllerTests(DatabaseFixture fixture)
            : base(fixture)
        {
            Controller = new WalletController(Fixture.DbContext);
            TestWallet = new Wallet
            {
                Name = "Test"
            };
            fixture.DbContext.Add(TestWallet);
            fixture.DbContext.SaveChanges();
        }
    }
}