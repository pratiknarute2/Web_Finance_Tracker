const Utility = require('../Base/Utility');

class AppShellPage extends Utility {
    constructor(page) {
        super(page);
        this.page = page;
        this.profileMenuButton = page.getByRole('button', { name: /profile menu/i });
        this.addEntryButton = page.getByRole('button', { name: /\+ add entry/i });
    }

    async openModule(moduleName) {
        await this.clickElement(this.profileMenuButton, 'Profile Menu');
        await this.clickElement(
            this.page.getByRole('button', { name: new RegExp(moduleName, 'i') }).first(),
            `${moduleName} Menu`
        );
        await this.page.waitForLoadState('networkidle');
    }
}

module.exports = AppShellPage;
