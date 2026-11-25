CREATE TABLE `property_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`message` text,
	`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `property_inquiry_propertyId_idx` ON `property_inquiries` (`propertyId`);--> statement-breakpoint
CREATE INDEX `property_inquiry_email_idx` ON `property_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `property_inquiry_status_idx` ON `property_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `property_inquiry_createdAt_idx` ON `property_inquiries` (`createdAt`);