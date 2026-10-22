<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * A preset the listener starred: a built-in preset id, or one of their own preset UUIDs.
 *
 * @property int $user_id
 * @property string $preset_ref
 */
#[Fillable(['user_id', 'preset_ref'])]
class Favorite extends Model {}
