<?php

use Illuminate\Support\Facades\Schedule;

// Housekeeping. The cPanel cron runs `php artisan schedule:run` every minute (ADR 0005).
Schedule::command('focuship:prune')->hourly()->withoutOverlapping();
