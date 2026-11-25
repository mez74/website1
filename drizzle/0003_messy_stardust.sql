CREATE TABLE `email_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscriptions_email_unique` UNIQUE(`email`)
);
