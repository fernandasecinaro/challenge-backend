-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
