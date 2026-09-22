CREATE TABLE `owner_login_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`attempts` integer NOT NULL,
	`next_allowed_at` integer NOT NULL,
	CONSTRAINT "owner_login_attempts_nonnegative" CHECK("owner_login_limits"."attempts" >= 0)
);
--> statement-breakpoint
CREATE INDEX `owner_login_limits_window_idx` ON `owner_login_limits` (`window_start`);