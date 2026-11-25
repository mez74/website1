CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(15,2),
	`location` varchar(255),
	`type` enum('house','apartment','villa','penthouse','land','commercial') NOT NULL DEFAULT 'house',
	`bedrooms` int,
	`bathrooms` int,
	`status` enum('available','under_offer','sold','draft') NOT NULL DEFAULT 'available',
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(512) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_images_id` PRIMARY KEY(`id`)
);
