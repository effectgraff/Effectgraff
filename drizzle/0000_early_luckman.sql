CREATE TABLE `leadNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`authorId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`dueAt` timestamp,
	`status` enum('open','done') NOT NULL DEFAULT 'open',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leadTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city` varchar(160) NOT NULL,
	`contact` varchar(320) NOT NULL,
	`wallSize` varchar(160) NOT NULL,
	`budget` varchar(160) NOT NULL,
	`projectType` varchar(160),
	`timing` varchar(160),
	`details` text,
	`language` varchar(8) NOT NULL DEFAULT 'ru',
	`source` varchar(80) NOT NULL DEFAULT 'website_brief',
	`status` enum('new','qualified','proposal','won','lost') NOT NULL DEFAULT 'new',
	`assignedTo` int,
	`nextFollowUpAt` timestamp,
	`consentAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
