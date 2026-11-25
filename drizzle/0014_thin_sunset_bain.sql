CREATE TABLE `contact_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `inquiry_email_idx` ON `contact_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `inquiry_status_idx` ON `contact_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `inquiry_createdAt_idx` ON `contact_inquiries` (`createdAt`);