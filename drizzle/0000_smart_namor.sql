CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`recipient` text NOT NULL,
	`channel` text DEFAULT 'unconfigured' NOT NULL,
	`status` text DEFAULT 'not_configured' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`delivery` text NOT NULL,
	`address` text NOT NULL,
	`comment` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment` text DEFAULT 'not_connected' NOT NULL,
	`created_at` text NOT NULL,
	`demo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_user_request_unique` ON `orders` (`user_id`,`request_key`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`refrigerant` text NOT NULL,
	`specification` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL,
	`image` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`demo` integer DEFAULT 1 NOT NULL,
	CONSTRAINT "nonnegative_stock" CHECK("products"."stock" >= 0),
	CONSTRAINT "nonnegative_price" CHECK("products"."price" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);

